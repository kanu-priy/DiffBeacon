import ast
from typing import Any, Dict, List, Optional


class DjangoContractAdapter:
    """
    Framework-aware static analyzer for Django and DRF constructs.
    Extracts structured contracts for Serializers, Models, Views, and URL Routes.
    """

    def extract_serializer_contracts(
        self, tree: ast.AST, file_path: str
    ) -> List[Dict[str, Any]]:
        contracts = []
        for node in ast.walk(tree):
            if isinstance(node, ast.ClassDef):
                # Check if inherits from Serializer or ModelSerializer
                base_names = [ast.unparse(b) for b in node.bases]
                if any("Serializer" in b for b in base_names):
                    fields = {}
                    validations = []

                    for item in node.body:
                        # Field assignments: field_name = serializers.XField(...)
                        if isinstance(item, ast.Assign):
                            for target in item.targets:
                                if isinstance(target, ast.Name):
                                    field_name = target.id
                                    val = item.value
                                    if isinstance(val, ast.Call):
                                        field_type = ast.unparse(val.func)
                                        kwargs = {}
                                        for kw in val.keywords:
                                            try:
                                                kwargs[kw.arg] = ast.literal_eval(kw.value)
                                            except Exception:
                                                kwargs[kw.arg] = ast.unparse(kw.value)

                                        fields[field_name] = {
                                            "type": field_type,
                                            "required": kwargs.get("required", True),
                                            "allow_null": kwargs.get("allow_null", False),
                                            "default": kwargs.get("default", None),
                                            "kwargs": kwargs,
                                            "line": item.lineno,
                                        }

                        # Custom validation methods: def validate_<field>(self, value)
                        elif isinstance(item, ast.FunctionDef) and item.name.startswith("validate_"):
                            validations.append(
                                {
                                    "method_name": item.name,
                                    "field": item.name.replace("validate_", ""),
                                    "start_line": item.lineno,
                                    "end_line": getattr(item, "end_lineno", item.lineno),
                                    "body_source": ast.unparse(item),
                                }
                            )

                    contracts.append(
                        {
                            "contract_type": "drf_serializer",
                            "class_name": node.name,
                            "file_path": file_path,
                            "start_line": node.lineno,
                            "end_line": getattr(node, "end_lineno", node.lineno),
                            "bases": base_names,
                            "fields": fields,
                            "validations": validations,
                        }
                    )
        return contracts

    def extract_model_contracts(
        self, tree: ast.AST, file_path: str
    ) -> List[Dict[str, Any]]:
        contracts = []
        for node in ast.walk(tree):
            if isinstance(node, ast.ClassDef):
                base_names = [ast.unparse(b) for b in node.bases]
                if any("models.Model" in b or "Model" in b for b in base_names):
                    fields = {}
                    for item in node.body:
                        if isinstance(item, ast.Assign):
                            for target in item.targets:
                                if isinstance(target, ast.Name):
                                    field_name = target.id
                                    val = item.value
                                    if isinstance(val, ast.Call):
                                        field_type = ast.unparse(val.func)
                                        kwargs = {}
                                        for kw in val.keywords:
                                            try:
                                                kwargs[kw.arg] = ast.literal_eval(kw.value)
                                            except Exception:
                                                kwargs[kw.arg] = ast.unparse(kw.value)

                                        fields[field_name] = {
                                            "type": field_type,
                                            "default": kwargs.get("default", None),
                                            "null": kwargs.get("null", False),
                                            "blank": kwargs.get("blank", False),
                                            "kwargs": kwargs,
                                            "line": item.lineno,
                                        }

                    contracts.append(
                        {
                            "contract_type": "django_model",
                            "class_name": node.name,
                            "file_path": file_path,
                            "start_line": node.lineno,
                            "end_line": getattr(node, "end_lineno", node.lineno),
                            "fields": fields,
                        }
                    )
        return contracts

    def extract_url_routes(
        self, tree: ast.AST, file_path: str
    ) -> List[Dict[str, Any]]:
        routes = []
        for node in ast.walk(tree):
            if isinstance(node, ast.Call):
                call_name = ""
                if isinstance(node.func, ast.Attribute):
                    call_name = f"{ast.unparse(node.func.value)}.{node.func.attr}"
                elif isinstance(node.func, ast.Name):
                    call_name = node.func.id

                # router.register(r'employees', EmployeeViewSet, ...)
                if "register" in call_name and len(node.args) >= 2:
                    prefix = ast.unparse(node.args[0]).strip("'\"r ")
                    view_name = ast.unparse(node.args[1])
                    routes.append(
                        {
                            "contract_type": "api_route",
                            "prefix": f"/{prefix}/",
                            "view_target": view_name,
                            "file_path": file_path,
                            "line": node.lineno,
                        }
                    )
        return routes
