import ast
import hashlib
from typing import Any, Dict, List, Optional, Tuple


class ParsedCall:
    def __init__(
        self,
        target_name: str,
        line_number: int,
        is_dynamic: bool = False,
        args_repr: str = "",
    ):
        self.target_name = target_name
        self.line_number = line_number
        self.is_dynamic = is_dynamic
        self.args_repr = args_repr

    def to_dict(self) -> Dict[str, Any]:
        return {
            "target_name": self.target_name,
            "line_number": self.line_number,
            "is_dynamic": self.is_dynamic,
            "args_repr": self.args_repr,
        }


class ParsedSymbol:
    def __init__(
        self,
        name: str,
        qualified_name: str,
        symbol_type: str,
        start_line: int,
        end_line: int,
        file_path: str,
        signature: str = "",
        docstring: str = "",
        fingerprint: str = "",
        metadata: Optional[Dict[str, Any]] = None,
    ):
        self.name = name
        self.qualified_name = qualified_name
        self.symbol_type = symbol_type
        self.start_line = start_line
        self.end_line = end_line
        self.file_path = file_path
        self.signature = signature
        self.docstring = docstring
        self.fingerprint = fingerprint
        self.metadata = metadata or {}
        self.calls: List[ParsedCall] = []

    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "qualified_name": self.qualified_name,
            "symbol_type": self.symbol_type,
            "start_line": self.start_line,
            "end_line": self.end_line,
            "file_path": self.file_path,
            "signature": self.signature,
            "docstring": self.docstring,
            "fingerprint": self.fingerprint,
            "metadata": self.metadata,
            "calls": [c.to_dict() for c in self.calls],
        }


class PythonASTParser:
    """
    Deterministic AST parser extracting symbols, calls, imports,
    signatures, and structural fingerprints.
    """

    def __init__(self):
        pass

    def compute_ast_fingerprint(self, node: ast.AST) -> str:
        """
        Computes a normalized SHA-256 hash of the node's AST structure,
        ignoring docstrings and comments.
        """
        dump = ast.dump(node, annotate_fields=False, include_attributes=False)
        return hashlib.sha256(dump.encode("utf-8")).hexdigest()

    def _get_call_target(self, node: ast.Call) -> Tuple[str, bool]:
        """
        Resolves call target name and whether it is a dynamic dispatch.
        """
        func = node.func
        if isinstance(func, ast.Name):
            if func.id in ("getattr", "eval", "exec", "__import__"):
                return func.id, True
            return func.id, False
        elif isinstance(func, ast.Attribute):
            base_repr = self._get_attr_chain(func.value)
            # Check for dynamic expressions
            is_dynamic = isinstance(func.value, (ast.Call, ast.Subscript))
            return f"{base_repr}.{func.attr}", is_dynamic
        else:
            return "<dynamic_call>", True

    def _get_attr_chain(self, node: ast.AST) -> str:
        if isinstance(node, ast.Name):
            return node.id
        elif isinstance(node, ast.Attribute):
            return f"{self._get_attr_chain(node.value)}.{node.attr}"
        elif isinstance(node, ast.Call):
            target, _ = self._get_call_target(node)
            return f"{target}()"
        return "<expr>"

    def _extract_signature(self, node: ast.FunctionDef) -> str:
        args = []
        pos_args = node.args.posonlyargs + node.args.args
        num_defaults = len(node.args.defaults)
        defaults_start = len(pos_args) - num_defaults

        for idx, arg in enumerate(pos_args):
            arg_str = arg.arg
            if arg.annotation:
                arg_str += f": {ast.unparse(arg.annotation)}"
            if idx >= defaults_start:
                default_node = node.args.defaults[idx - defaults_start]
                arg_str += f" = {ast.unparse(default_node)}"
            args.append(arg_str)

        if node.args.vararg:
            v = f"*{node.args.vararg.arg}"
            if node.args.vararg.annotation:
                v += f": {ast.unparse(node.args.vararg.annotation)}"
            args.append(v)

        for idx, kwarg in enumerate(node.args.kwonlyargs):
            k = kwarg.arg
            if kwarg.annotation:
                k += f": {ast.unparse(kwarg.annotation)}"
            default_node = node.args.kw_defaults[idx]
            if default_node:
                k += f" = {ast.unparse(default_node)}"
            args.append(k)

        if node.args.kwarg:
            kw = f"**{node.args.kwarg.arg}"
            if node.args.kwarg.annotation:
                kw += f": {ast.unparse(node.args.kwarg.annotation)}"
            args.append(kw)

        sig = f"def {node.name}({', '.join(args)})"
        if node.returns:
            sig += f" -> {ast.unparse(node.returns)}"
        return sig

    def parse_source(
        self, source_code: str, file_path: str
    ) -> Tuple[List[ParsedSymbol], List[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Parses source code and returns (symbols, imports, raw_unknowns).
        """
        symbols: List[ParsedSymbol] = []
        imports: List[Dict[str, Any]] = []
        unknowns: List[Dict[str, Any]] = []

        if not file_path.endswith((".py", ".pyw", ".pyi")):
            from .multi_parser import MultiLanguageParserService
            try:
                symbols = MultiLanguageParserService.parse_source(file_path, source_code)
                return symbols, imports, unknowns
            except Exception as e:
                return symbols, imports, [
                    {
                        "title": f"Structural Parse Limitation in {file_path}",
                        "reason": "unsupported_parse",
                        "file_path": file_path,
                        "line_number": 1,
                        "code_snippet": "",
                        "explanation": str(e),
                        "resolution_strategy": "Structural inspection fallback used.",
                    }
                ]

        try:
            tree = ast.parse(source_code, filename=file_path)
        except SyntaxError as e:
            return symbols, imports, [
                {
                    "title": f"Syntax Error in {file_path}",
                    "reason": "syntax_error",
                    "file_path": file_path,
                    "line_number": e.lineno,
                    "code_snippet": e.text or "",
                    "explanation": str(e),
                    "resolution_strategy": "Fix Python syntax error.",
                }
            ]

        # Extract Module Level Symbol
        mod_name = file_path.replace(".py", "").replace("/", ".").replace("\\", ".")
        mod_symbol = ParsedSymbol(
            name=mod_name.split(".")[-1],
            qualified_name=mod_name,
            symbol_type="module",
            start_line=1,
            end_line=len(source_code.splitlines()) or 1,
            file_path=file_path,
            docstring=ast.get_docstring(tree) or "",
            fingerprint=self.compute_ast_fingerprint(tree),
        )
        symbols.append(mod_symbol)

        # Walk AST for Classes, Functions, Imports, Calls
        for node in tree.body:
            # Imports
            if isinstance(node, ast.Import):
                for alias in node.names:
                    imports.append(
                        {
                            "module": alias.name,
                            "alias": alias.asname or alias.name,
                            "line": node.lineno,
                            "type": "direct",
                        }
                    )
            elif isinstance(node, ast.ImportFrom):
                for alias in node.names:
                    imports.append(
                        {
                            "module": node.module or "",
                            "name": alias.name,
                            "alias": alias.asname or alias.name,
                            "line": node.lineno,
                            "type": "from",
                        }
                    )

            # Class definitions
            elif isinstance(node, ast.ClassDef):
                bases = [ast.unparse(b) for b in node.bases]
                decorators = [ast.unparse(d) for d in node.decorator_list]
                class_qname = f"{mod_name}.{node.name}"

                class_sym = ParsedSymbol(
                    name=node.name,
                    qualified_name=class_qname,
                    symbol_type="class",
                    start_line=node.lineno,
                    end_line=getattr(node, "end_lineno", node.lineno),
                    file_path=file_path,
                    signature=f"class {node.name}({', '.join(bases)})",
                    docstring=ast.get_docstring(node) or "",
                    fingerprint=self.compute_ast_fingerprint(node),
                    metadata={
                        "bases": bases,
                        "decorators": decorators,
                    },
                )
                symbols.append(class_sym)

                # Class methods and attributes
                for item in node.body:
                    if isinstance(item, (ast.FunctionDef, ast.AsyncFunctionDef)):
                        method_qname = f"{class_qname}.{item.name}"
                        method_sym = ParsedSymbol(
                            name=item.name,
                            qualified_name=method_qname,
                            symbol_type="method",
                            start_line=item.lineno,
                            end_line=getattr(item, "end_lineno", item.lineno),
                            file_path=file_path,
                            signature=self._extract_signature(item),
                            docstring=ast.get_docstring(item) or "",
                            fingerprint=self.compute_ast_fingerprint(item),
                            metadata={
                                "parent_class": class_qname,
                                "decorators": [ast.unparse(d) for d in item.decorator_list],
                            },
                        )

                        # Check for calls inside method
                        for subnode in ast.walk(item):
                            if isinstance(subnode, ast.Call):
                                target, is_dynamic = self._get_call_target(subnode)
                                method_sym.calls.append(
                                    ParsedCall(
                                        target_name=target,
                                        line_number=subnode.lineno,
                                        is_dynamic=is_dynamic,
                                        args_repr=f"({len(subnode.args)} args)",
                                    )
                                )
                                if is_dynamic:
                                    snippet = ast.unparse(subnode)
                                    unknowns.append(
                                        {
                                            "title": f"Dynamic Call: {snippet[:40]}",
                                            "reason": "dynamic_dispatch",
                                            "file_path": file_path,
                                            "line_number": subnode.lineno,
                                            "code_snippet": snippet,
                                            "explanation": f"Dynamic invocation in {method_qname} cannot be resolved statically.",
                                            "resolution_strategy": "Instrument with runtime trace or replace with explicit dispatch.",
                                        }
                                    )

                        symbols.append(method_sym)

            # Top-level Functions
            elif isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                func_qname = f"{mod_name}.{node.name}"
                func_sym = ParsedSymbol(
                    name=node.name,
                    qualified_name=func_qname,
                    symbol_type="function",
                    start_line=node.lineno,
                    end_line=getattr(node, "end_lineno", node.lineno),
                    file_path=file_path,
                    signature=self._extract_signature(node),
                    docstring=ast.get_docstring(node) or "",
                    fingerprint=self.compute_ast_fingerprint(node),
                    metadata={
                        "decorators": [ast.unparse(d) for d in node.decorator_list],
                    },
                )

                for subnode in ast.walk(node):
                    if isinstance(subnode, ast.Call):
                        target, is_dynamic = self._get_call_target(subnode)
                        func_sym.calls.append(
                            ParsedCall(
                                target_name=target,
                                line_number=subnode.lineno,
                                is_dynamic=is_dynamic,
                                args_repr=f"({len(subnode.args)} args)",
                            )
                        )
                        if is_dynamic:
                            snippet = ast.unparse(subnode)
                            unknowns.append(
                                {
                                    "title": f"Dynamic Call: {snippet[:40]}",
                                    "reason": "dynamic_dispatch",
                                    "file_path": file_path,
                                    "line_number": subnode.lineno,
                                    "code_snippet": snippet,
                                    "explanation": f"Dynamic invocation in {func_qname} cannot be resolved statically.",
                                    "resolution_strategy": "Instrument with runtime trace or replace with explicit dispatch.",
                                }
                            )

                symbols.append(func_sym)

        return symbols, imports, unknowns
