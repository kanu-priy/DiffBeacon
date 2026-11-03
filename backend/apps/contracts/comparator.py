from typing import Any, Dict, List, Tuple


class ContractComparator:
    """
    Compares Base and Head contracts deterministically.
    Produces ContractDelta and BehaviorDelta objects with line citations.
    """

    def compare_serializers(
        self,
        base_serializers: List[Dict[str, Any]],
        head_serializers: List[Dict[str, Any]],
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        contract_deltas = []
        behavior_deltas = []

        base_map = {s["class_name"]: s for s in base_serializers}
        head_map = {s["class_name"]: s for s in head_serializers}

        for class_name, head_s in head_map.items():
            base_s = base_map.get(class_name)
            if not base_s:
                contract_deltas.append(
                    {
                        "contract_type": "drf_serializer",
                        "identifier": class_name,
                        "change_nature": "added",
                        "before_spec": {},
                        "after_spec": head_s,
                        "is_breaking": False,
                        "compatibility_assessment": f"New serializer {class_name} added.",
                        "unresolved_assumptions": [],
                    }
                )
                continue

            base_fields = base_s["fields"]
            head_fields = head_s["fields"]
            all_field_names = set(base_fields) | set(head_fields)

            for f_name in sorted(all_field_names):
                base_f = base_fields.get(f_name)
                head_f = head_fields.get(f_name)

                if base_f is None and head_f is not None:
                    is_breaking = head_f.get("required", True)
                    contract_deltas.append(
                        {
                            "contract_type": "drf_serializer",
                            "identifier": f"{class_name}.{f_name}",
                            "change_nature": "added",
                            "before_spec": {},
                            "after_spec": head_f,
                            "is_breaking": is_breaking,
                            "compatibility_assessment": "Required field added without default; breaking for existing clients."
                            if is_breaking
                            else "Optional field added; backward-compatible.",
                            "unresolved_assumptions": [],
                        }
                    )
                    behavior_deltas.append(
                        {
                            "category": "api_contract",
                            "title": f"Added {f_name} in {class_name}",
                            "summary": f"{class_name} now includes '{f_name}' in request payloads.",
                            "before_behavior": f"Field '{f_name}' was not present in requests.",
                            "after_behavior": f"Field '{f_name}' is now present and required={head_f.get('required', True)}.",
                            "affected_symbol": f"{class_name}.{f_name}",
                            "file_path": head_s["file_path"],
                            "base_line_range": [1, 1],
                            "head_line_range": [head_f["line"], head_f["line"] + 5],
                            "confidence": "statically_established",
                        }
                    )
                    continue

                if base_f is not None and head_f is None:
                    contract_deltas.append(
                        {
                            "contract_type": "drf_serializer",
                            "identifier": f"{class_name}.{f_name}",
                            "change_nature": "removed",
                            "before_spec": base_f,
                            "after_spec": {},
                            "is_breaking": True,
                            "compatibility_assessment": f"Field '{f_name}' was removed from {class_name}; clients must stop sending it.",
                            "unresolved_assumptions": [
                                "Downstream payloads and callers may still include the removed field."
                            ],
                        }
                    )
                    behavior_deltas.append(
                        {
                            "category": "api_contract",
                            "title": f"Removed {f_name} from {class_name}",
                            "summary": f"Field '{f_name}' is no longer accepted or returned by {class_name}.",
                            "before_behavior": f"Field '{f_name}' was present and validated on input.",
                            "after_behavior": f"Field '{f_name}' is no longer recognized by the serializer.",
                            "affected_symbol": f"{class_name}.{f_name}",
                            "file_path": head_s["file_path"],
                            "base_line_range": [base_f["line"], base_f["line"] + 5],
                            "head_line_range": [1, 1],
                            "confidence": "statically_established",
                        }
                    )
                    continue

                if base_f is not None and head_f is not None:
                    b_req = base_f.get("required", True)
                    h_req = head_f.get("required", True)
                    if b_req and not h_req:
                        contract_deltas.append(
                            {
                                "contract_type": "drf_serializer",
                                "identifier": f"{class_name}.{f_name}",
                                "change_nature": "modified_optional",
                                "before_spec": base_f,
                                "after_spec": head_f,
                                "is_breaking": False,
                                "compatibility_assessment": "Field made optional; backward-compatible schema expansion.",
                                "unresolved_assumptions": [
                                    "Downstream service must handle omitted key or null value gracefully."
                                ],
                            }
                        )
                        behavior_deltas.append(
                            {
                                "category": "api_contract",
                                "title": f"Optional {f_name} in {class_name}",
                                "summary": f"{class_name} now allows '{f_name}' to be omitted in request payloads.",
                                "before_behavior": f"Field '{f_name}' was required. Missing field raised HTTP 400 ValidationError.",
                                "after_behavior": f"Field '{f_name}' is optional (required=False, allow_null=True). Downstream services handle fallback.",
                                "affected_symbol": f"{class_name}.{f_name}",
                                "file_path": head_s["file_path"],
                                "base_line_range": [base_f["line"], base_f["line"] + 5],
                                "head_line_range": [head_f["line"], head_f["line"] + 5],
                                "confidence": "statically_established",
                            }
                        )
                    elif not b_req and h_req:
                        contract_deltas.append(
                            {
                                "contract_type": "drf_serializer",
                                "identifier": f"{class_name}.{f_name}",
                                "change_nature": "modified_required",
                                "before_spec": base_f,
                                "after_spec": head_f,
                                "is_breaking": True,
                                "compatibility_assessment": "Field made required; existing clients that omit it will now fail validation.",
                                "unresolved_assumptions": [
                                    "Callers must include the field in all requests after this change."
                                ],
                            }
                        )
                        behavior_deltas.append(
                            {
                                "category": "api_contract",
                                "title": f"Required {f_name} in {class_name}",
                                "summary": f"{class_name} now requires '{f_name}' for valid request payloads.",
                                "before_behavior": f"Field '{f_name}' was optional and could be omitted.",
                                "after_behavior": f"Field '{f_name}' is now required and missing values produce validation failure.",
                                "affected_symbol": f"{class_name}.{f_name}",
                                "file_path": head_s["file_path"],
                                "base_line_range": [base_f["line"], base_f["line"] + 5],
                                "head_line_range": [head_f["line"], head_f["line"] + 5],
                                "confidence": "statically_established",
                            }
                        )

            b_val_map = {v["method_name"]: v for v in base_s["validations"]}
            h_val_map = {v["method_name"]: v for v in head_s["validations"]}

            for m_name, h_val in h_val_map.items():
                b_val = b_val_map.get(m_name)
                if b_val and b_val["body_source"] != h_val["body_source"]:
                    behavior_deltas.append(
                        {
                            "category": "validation",
                            "title": f"Updated Validation in {class_name}.{m_name}",
                            "summary": f"Validation logic for field '{h_val['field']}' has changed.",
                            "before_behavior": f"Original validation logic:\n{b_val['body_source']}",
                            "after_behavior": f"Updated validation logic:\n{h_val['body_source']}",
                            "affected_symbol": f"{class_name}.{m_name}",
                            "file_path": head_s["file_path"],
                            "base_line_range": [b_val["start_line"], b_val["end_line"]],
                            "head_line_range": [h_val["start_line"], h_val["end_line"]],
                            "confidence": "statically_established",
                        }
                    )

        return contract_deltas, behavior_deltas

    def compare_models(
        self,
        base_models: List[Dict[str, Any]],
        head_models: List[Dict[str, Any]],
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        contract_deltas = []
        behavior_deltas = []

        base_map = {m["class_name"]: m for m in base_models}
        head_map = {m["class_name"]: m for m in head_models}

        for class_name, head_m in head_map.items():
            base_m = base_map.get(class_name)
            if not base_m:
                continue

            for f_name, head_f in head_m["fields"].items():
                base_f = base_m["fields"].get(f_name)
                if base_f:
                    b_default = base_f.get("default")
                    h_default = head_f.get("default")
                    if b_default != h_default:
                        contract_deltas.append(
                            {
                                "contract_type": "django_model",
                                "identifier": f"{class_name}.{f_name}",
                                "change_nature": "type_change",
                                "before_spec": base_f,
                                "after_spec": head_f,
                                "is_breaking": False,
                                "compatibility_assessment": f"Default changed from '{b_default}' to '{h_default}'. New database records will receive new default value.",
                                "unresolved_assumptions": [
                                    "Requires database migration to alter table column default."
                                ],
                            }
                        )
                        behavior_deltas.append(
                            {
                                "category": "data_model",
                                "title": f"Model Field Default Change: {class_name}.{f_name}",
                                "summary": f"Field '{f_name}' default value changed from '{b_default}' to '{h_default}'.",
                                "before_behavior": f"New records created without '{f_name}' defaulted to '{b_default}'.",
                                "after_behavior": f"New records created without '{f_name}' default to '{h_default}'.",
                                "affected_symbol": f"{class_name}.{f_name}",
                                "file_path": head_m["file_path"],
                                "base_line_range": [base_f["line"], base_f["line"]],
                                "head_line_range": [head_f["line"], head_f["line"]],
                                "confidence": "statically_established",
                            }
                        )

        return contract_deltas, behavior_deltas
