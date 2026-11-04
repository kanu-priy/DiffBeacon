/* Auto-generated standalone demo data for zero-failure online & offline preview */
export const DEMO_DATA = {
  "workspace": {
    "id": "ae6b498c-e779-4fc8-892c-44f0c76b2895",
    "name": "BeaconWorks API (Demo)",
    "slug": "beaconworks-api-demo",
    "description": "Fictional enterprise employee & payroll service demonstrating change-impact intelligence.",
    "is_demo": true,
    "retention_days": 30,
    "created_at": "2026-10-21T20:14:42.097213+00:00",
    "updated_at": "2026-10-21T20:14:42.097213+00:00",
    "analysis_count": 1,
    "snapshot_count": 2
  },
  "analysis": {
    "id": "80b8443f-66cc-4a35-8cd7-e1fd13b28b2b",
    "workspace": "ae6b498c-e779-4fc8-892c-44f0c76b2895",
    "base_snapshot": "059a9ddf-9bbf-4e6f-bce3-40f34121a4c5",
    "head_snapshot": "97b1b3b9-1787-4d50-bf7b-15221977dc37",
    "base_snapshot_label": "v1.0-baseline",
    "head_snapshot_label": "v1.1-department-update",
    "status": "completed",
    "current_stage": "stage_12_persist",
    "stages_completed": [
      "stage_1_ingest",
      "stage_2_diff",
      "stage_3_ast",
      "stage_4_framework",
      "stage_5_symbols",
      "stage_6_graph",
      "stage_7_deltas",
      "stage_8_impact",
      "stage_9_scenarios",
      "stage_10_ai_synthesis",
      "stage_11_verification",
      "stage_12_persist"
    ],
    "engine_version": "1.0.0",
    "ai_provider_name": "mock",
    "error_details": {},
    "started_at": "2026-11-03T20:53:31.141728+00:00",
    "completed_at": "2026-11-03T20:54:03.214859+00:00",
    "created_at": "2026-11-03T20:53:31.028917+00:00",
    "counts": {
      "deltas": 18,
      "contracts": 2,
      "unknowns": 4,
      "scenarios": 2
    }
  },
  "deltas": [
    {
      "id": "24de1b45-58b1-4e68-a704-836ccd738bad",
      "analysis_id": "80b8443f-66cc-4a35-8cd7-e1fd13b28b2b",
      "category": "added_symbol",
      "title": "Added Symbol: assign_default_department",
      "summary": "New symbol services.employee.assign_default_department introduced in Head version.",
      "before_behavior": "Symbol assign_default_department did not exist in base snapshot.",
      "after_behavior": "Introduced at line 4: def assign_default_department() -> Department",
      "affected_symbol": "services.employee.assign_default_department",
      "file_path": "services/employee.py",
      "base_line_range": [
        1,
        1
      ],
      "head_line_range": [
        4,
        18
      ],
      "confidence": "statically_established",
      "evidence_refs": []
    },
    {
      "id": "9e862def-ddac-41ce-9f77-a62739c94236",
      "analysis_id": "80b8443f-66cc-4a35-8cd7-e1fd13b28b2b",
      "category": "added_symbol",
      "title": "Added Symbol: format_employee_identifier",
      "summary": "New symbol services.utils.format_employee_identifier introduced in Head version.",
      "before_behavior": "Symbol format_employee_identifier did not exist in base snapshot.",
      "after_behavior": "Introduced at line 8: def format_employee_identifier(employee_id: int, prefix: str = 'EMP') -> str",
      "affected_symbol": "services.utils.format_employee_identifier",
      "file_path": "services/utils.py",
      "base_line_range": [
        1,
        1
      ],
      "head_line_range": [
        8,
        13
      ],
      "confidence": "statically_established",
      "evidence_refs": []
    },
    {
      "id": "45996dbe-1fb2-4548-9631-6eeca5d6e1d7",
      "analysis_id": "80b8443f-66cc-4a35-8cd7-e1fd13b28b2b",
      "category": "added_symbol",
      "title": "Added Symbol: test_create_employee_succeeds_when_department_omitted",
      "summary": "New symbol tests.test_api.EmployeeAPITests.test_create_employee_succeeds_when_department_omitted introduced in Head version.",
      "before_behavior": "Symbol test_create_employee_succeeds_when_department_omitted did not exist in base snapshot.",
      "after_behavior": "Introduced at line 26: def test_create_employee_succeeds_when_department_omitted(self)",
      "affected_symbol": "tests.test_api.EmployeeAPITests.test_create_employee_succeeds_when_department_omitted",
      "file_path": "tests/test_api.py",
      "base_line_range": [
        1,
        1
      ],
      "head_line_range": [
        26,
        38
      ],
      "confidence": "statically_established",
      "evidence_refs": []
    },
    {
      "id": "f16d2d0b-365d-4e11-9b1c-bd7d3524de3a",
      "analysis_id": "80b8443f-66cc-4a35-8cd7-e1fd13b28b2b",
      "category": "added_symbol",
      "title": "Added Symbol: test_minimum_salary_threshold_head",
      "summary": "New symbol tests.test_payroll.PayrollUnitTests.test_minimum_salary_threshold_head introduced in Head version.",
      "before_behavior": "Symbol test_minimum_salary_threshold_head did not exist in base snapshot.",
      "after_behavior": "Introduced at line 7: def test_minimum_salary_threshold_head(self)",
      "affected_symbol": "tests.test_payroll.PayrollUnitTests.test_minimum_salary_threshold_head",
      "file_path": "tests/test_payroll.py",
      "base_line_range": [
        1,
        1
      ],
      "head_line_range": [
        7,
        11
      ],
      "confidence": "statically_established",
      "evidence_refs": []
    },
    {
      "id": "e93db8b0-78c2-4770-86dc-479b88e57b45",
      "analysis_id": "80b8443f-66cc-4a35-8cd7-e1fd13b28b2b",
      "category": "added_symbol",
      "title": "Added Symbol: test_tax_deduction_head_rate",
      "summary": "New symbol tests.test_payroll.PayrollUnitTests.test_tax_deduction_head_rate introduced in Head version.",
      "before_behavior": "Symbol test_tax_deduction_head_rate did not exist in base snapshot.",
      "after_behavior": "Introduced at line 13: def test_tax_deduction_head_rate(self)",
      "affected_symbol": "tests.test_payroll.PayrollUnitTests.test_tax_deduction_head_rate",
      "file_path": "tests/test_payroll.py",
      "base_line_range": [
        1,
        1
      ],
      "head_line_range": [
        13,
        17
      ],
      "confidence": "statically_established",
      "evidence_refs": []
    },
    {
      "id": "9f446ca7-37a0-426e-8da9-8dc1ff48a5c1",
      "analysis_id": "80b8443f-66cc-4a35-8cd7-e1fd13b28b2b",
      "category": "api_contract",
      "title": "Optional department_id in EmployeeCreateSerializer",
      "summary": "EmployeeCreateSerializer now allows 'department_id' to be omitted in request payloads.",
      "before_behavior": "Field 'department_id' was required. Missing field raised HTTP 400 ValidationError.",
      "after_behavior": "Field 'department_id' is optional (required=False, allow_null=True). Downstream services handle fallback.",
      "affected_symbol": "EmployeeCreateSerializer.department_id",
      "file_path": "serializers.py",
      "base_line_range": [
        31,
        36
      ],
      "head_line_range": [
        31,
        36
      ],
      "confidence": "statically_established",
      "evidence_refs": []
    },
    {
      "id": "f2534f02-8c2c-4480-be96-6c67c623318d",
      "analysis_id": "80b8443f-66cc-4a35-8cd7-e1fd13b28b2b",
      "category": "data_model",
      "title": "Model Field Default Change: Employee.employment_status",
      "summary": "Field 'employment_status' default value changed from 'probation' to 'active'.",
      "before_behavior": "New records created without 'employment_status' defaulted to 'probation'.",
      "after_behavior": "New records created without 'employment_status' default to 'active'.",
      "affected_symbol": "Employee.employment_status",
      "file_path": "models.py",
      "base_line_range": [
        33,
        33
      ],
      "head_line_range": [
        33,
        33
      ],
      "confidence": "statically_established",
      "evidence_refs": []
    },
    {
      "id": "ab40099c-0b66-4e6a-83db-195ff85ce9d5",
      "analysis_id": "80b8443f-66cc-4a35-8cd7-e1fd13b28b2b",
      "category": "deleted_symbol",
      "title": "Deleted Symbol: legacy_format_ssn",
      "summary": "Symbol services.utils.legacy_format_ssn was deleted in Head version.",
      "before_behavior": "Function legacy_format_ssn available for downstream import and invocation.",
      "after_behavior": "Function legacy_format_ssn deleted; references will raise ImportError or AttributeError.",
      "affected_symbol": "services.utils.legacy_format_ssn",
      "file_path": "services/utils.py",
      "base_line_range": [
        1,
        9
      ],
      "head_line_range": [
        1,
        1
      ],
      "confidence": "statically_established",
      "evidence_refs": []
    },
    {
      "id": "566dd5ba-b9fd-4c14-aebd-4331bd4e6212",
      "analysis_id": "80b8443f-66cc-4a35-8cd7-e1fd13b28b2b",
      "category": "deleted_symbol",
      "title": "Deleted Symbol: test_create_employee_fails_when_department_missing",
      "summary": "Symbol tests.test_api.EmployeeAPITests.test_create_employee_fails_when_department_missing was deleted in Head version.",
      "before_behavior": "Function test_create_employee_fails_when_department_missing available for downstream import and invocation.",
      "after_behavior": "Function test_create_employee_fails_when_department_missing deleted; references will raise ImportError or AttributeError.",
      "affected_symbol": "tests.test_api.EmployeeAPITests.test_create_employee_fails_when_department_missing",
      "file_path": "tests/test_api.py",
      "base_line_range": [
        26,
        38
      ],
      "head_line_range": [
        1,
        1
      ],
      "confidence": "statically_established",
      "evidence_refs": []
    },
    {
      "id": "04e0c7b3-a5f6-4b00-9397-f884653548f4",
      "analysis_id": "80b8443f-66cc-4a35-8cd7-e1fd13b28b2b",
      "category": "deleted_symbol",
      "title": "Deleted Symbol: test_minimum_salary_threshold_base",
      "summary": "Symbol tests.test_payroll.PayrollUnitTests.test_minimum_salary_threshold_base was deleted in Head version.",
      "before_behavior": "Function test_minimum_salary_threshold_base available for downstream import and invocation.",
      "after_behavior": "Function test_minimum_salary_threshold_base deleted; references will raise ImportError or AttributeError.",
      "affected_symbol": "tests.test_payroll.PayrollUnitTests.test_minimum_salary_threshold_base",
      "file_path": "tests/test_payroll.py",
      "base_line_range": [
        7,
        11
      ],
      "head_line_range": [
        1,
        1
      ],
      "confidence": "statically_established",
      "evidence_refs": []
    },
    {
      "id": "e58dd060-76e2-44b3-99b9-425ff6a014a8",
      "analysis_id": "80b8443f-66cc-4a35-8cd7-e1fd13b28b2b",
      "category": "deleted_symbol",
      "title": "Deleted Symbol: test_tax_deduction_base_rate",
      "summary": "Symbol tests.test_payroll.PayrollUnitTests.test_tax_deduction_base_rate was deleted in Head version.",
      "before_behavior": "Function test_tax_deduction_base_rate available for downstream import and invocation.",
      "after_behavior": "Function test_tax_deduction_base_rate deleted; references will raise ImportError or AttributeError.",
      "affected_symbol": "tests.test_payroll.PayrollUnitTests.test_tax_deduction_base_rate",
      "file_path": "tests/test_payroll.py",
      "base_line_range": [
        13,
        17
      ],
      "head_line_range": [
        1,
        1
      ],
      "confidence": "statically_established",
      "evidence_refs": []
    },
    {
      "id": "8ab9bb88-8367-47a0-a388-f81ed486eae4",
      "analysis_id": "80b8443f-66cc-4a35-8cd7-e1fd13b28b2b",
      "category": "logic",
      "title": "Modified Logic in calculate_tax_deduction",
      "summary": "Implementation of services.payroll.calculate_tax_deduction changed between versions.",
      "before_behavior": "Original definition at line 15: def calculate_tax_deduction(gross_amount: Decimal) -> Decimal",
      "after_behavior": "Updated definition at line 15: def calculate_tax_deduction(gross_amount: Decimal) -> Decimal",
      "affected_symbol": "services.payroll.calculate_tax_deduction",
      "file_path": "services/payroll.py",
      "base_line_range": [
        15,
        21
      ],
      "head_line_range": [
        15,
        21
      ],
      "confidence": "statically_established",
      "evidence_refs": []
    },
    {
      "id": "20a0fbcc-7813-44ec-9e25-ebc86f6ee308",
      "analysis_id": "80b8443f-66cc-4a35-8cd7-e1fd13b28b2b",
      "category": "logic",
      "title": "Modified Logic in enroll_employee",
      "summary": "Implementation of services.employee.enroll_employee changed between versions.",
      "before_behavior": "Original definition at line 4: def enroll_employee(validated_data: dict) -> Employee",
      "after_behavior": "Updated definition at line 21: def enroll_employee(validated_data: dict) -> Employee",
      "affected_symbol": "services.employee.enroll_employee",
      "file_path": "services/employee.py",
      "base_line_range": [
        4,
        23
      ],
      "head_line_range": [
        21,
        44
      ],
      "confidence": "statically_established",
      "evidence_refs": []
    },
    {
      "id": "bd778f1c-f29b-45b5-9321-07878ea0b256",
      "analysis_id": "80b8443f-66cc-4a35-8cd7-e1fd13b28b2b",
      "category": "logic",
      "title": "Modified Logic in generate_compliance_report",
      "summary": "Implementation of services.reporting.generate_compliance_report changed between versions.",
      "before_behavior": "Original definition at line 5: def generate_compliance_report(employee: Employee, raw_tax_id: str) -> dict",
      "after_behavior": "Updated definition at line 5: def generate_compliance_report(employee: Employee, raw_tax_id: str) -> dict",
      "affected_symbol": "services.reporting.generate_compliance_report",
      "file_path": "services/reporting.py",
      "base_line_range": [
        5,
        16
      ],
      "head_line_range": [
        5,
        17
      ],
      "confidence": "statically_established",
      "evidence_refs": []
    },
    {
      "id": "67da7d4b-a241-4992-8867-abf384155864",
      "analysis_id": "80b8443f-66cc-4a35-8cd7-e1fd13b28b2b",
      "category": "logic",
      "title": "Modified Logic in setUp",
      "summary": "Implementation of tests.test_api.EmployeeAPITests.setUp changed between versions.",
      "before_behavior": "Original definition at line 8: def setUp(self)",
      "after_behavior": "Updated definition at line 8: def setUp(self)",
      "affected_symbol": "tests.test_api.EmployeeAPITests.setUp",
      "file_path": "tests/test_api.py",
      "base_line_range": [
        8,
        11
      ],
      "head_line_range": [
        8,
        11
      ],
      "confidence": "statically_established",
      "evidence_refs": []
    },
    {
      "id": "b6f60004-fa88-4316-a500-b9957b51e7e8",
      "analysis_id": "80b8443f-66cc-4a35-8cd7-e1fd13b28b2b",
      "category": "logic",
      "title": "Modified Logic in validate_annual_salary",
      "summary": "Implementation of serializers.EmployeeCreateSerializer.validate_annual_salary changed between versions.",
      "before_behavior": "Original definition at line 49: def validate_annual_salary(self, value)",
      "after_behavior": "Updated definition at line 49: def validate_annual_salary(self, value)",
      "affected_symbol": "serializers.EmployeeCreateSerializer.validate_annual_salary",
      "file_path": "serializers.py",
      "base_line_range": [
        49,
        52
      ],
      "head_line_range": [
        49,
        53
      ],
      "confidence": "statically_established",
      "evidence_refs": []
    },
    {
      "id": "5c3b8e68-a67c-4c6c-bc02-3a0ee56d59e0",
      "analysis_id": "80b8443f-66cc-4a35-8cd7-e1fd13b28b2b",
      "category": "logic",
      "title": "Modified Logic in validate_compensation",
      "summary": "Implementation of services.payroll.validate_compensation changed between versions.",
      "before_behavior": "Original definition at line 5: def validate_compensation(salary: Decimal) -> bool",
      "after_behavior": "Updated definition at line 5: def validate_compensation(salary: Decimal) -> bool",
      "affected_symbol": "services.payroll.validate_compensation",
      "file_path": "services/payroll.py",
      "base_line_range": [
        5,
        12
      ],
      "head_line_range": [
        5,
        12
      ],
      "confidence": "statically_established",
      "evidence_refs": []
    },
    {
      "id": "8d31d09e-e735-4842-9368-bc2854a186aa",
      "analysis_id": "80b8443f-66cc-4a35-8cd7-e1fd13b28b2b",
      "category": "validation",
      "title": "Updated Validation in EmployeeCreateSerializer.validate_annual_salary",
      "summary": "Validation logic for field 'annual_salary' has changed.",
      "before_behavior": "Original validation logic:\ndef validate_annual_salary(self, value):\n    if value < 30000:\n        raise serializers.ValidationError('Annual salary cannot be below baseline minimum $30,000.')\n    return value",
      "after_behavior": "Updated validation logic:\ndef validate_annual_salary(self, value):\n    if value < 45000:\n        raise serializers.ValidationError('Annual salary cannot be below updated baseline minimum $45,000.')\n    return value",
      "affected_symbol": "EmployeeCreateSerializer.validate_annual_salary",
      "file_path": "serializers.py",
      "base_line_range": [
        49,
        52
      ],
      "head_line_range": [
        49,
        53
      ],
      "confidence": "statically_established",
      "evidence_refs": []
    }
  ],
  "contracts": [
    {
      "id": "02b9b653-7a6c-44e6-a4eb-cf05d8719183",
      "analysis_id": "80b8443f-66cc-4a35-8cd7-e1fd13b28b2b",
      "contract_type": "django_model",
      "identifier": "Employee.employment_status",
      "change_nature": "type_change",
      "before_spec": {
        "type": "models.CharField",
        "default": "probation",
        "null": false,
        "blank": false,
        "kwargs": {
          "max_length": 20,
          "choices": "STATUS_CHOICES",
          "default": "probation"
        },
        "line": 33
      },
      "after_spec": {
        "type": "models.CharField",
        "default": "active",
        "null": false,
        "blank": false,
        "kwargs": {
          "max_length": 20,
          "choices": "STATUS_CHOICES",
          "default": "active"
        },
        "line": 33
      },
      "is_breaking": false,
      "compatibility_assessment": "Default changed from 'probation' to 'active'. New database records will receive new default value.",
      "unresolved_assumptions": [
        "Requires database migration to alter table column default."
      ]
    },
    {
      "id": "f689d21f-2e77-4f37-be8e-304a39aaf17b",
      "analysis_id": "80b8443f-66cc-4a35-8cd7-e1fd13b28b2b",
      "contract_type": "drf_serializer",
      "identifier": "EmployeeCreateSerializer.department_id",
      "change_nature": "modified_optional",
      "before_spec": {
        "type": "serializers.PrimaryKeyRelatedField",
        "required": true,
        "allow_null": false,
        "default": null,
        "kwargs": {
          "queryset": "Department.objects.all()",
          "source": "department",
          "required": true,
          "allow_null": false
        },
        "line": 31
      },
      "after_spec": {
        "type": "serializers.PrimaryKeyRelatedField",
        "required": false,
        "allow_null": true,
        "default": null,
        "kwargs": {
          "queryset": "Department.objects.all()",
          "source": "department",
          "required": false,
          "allow_null": true
        },
        "line": 31
      },
      "is_breaking": false,
      "compatibility_assessment": "Field made optional; backward-compatible schema expansion.",
      "unresolved_assumptions": [
        "Downstream service must handle omitted key or null value gracefully."
      ]
    }
  ],
  "unknowns": [
    {
      "id": "a10dce9f-ce25-4ccf-b133-a57d6e3af12c",
      "analysis_id": "80b8443f-66cc-4a35-8cd7-e1fd13b28b2b",
      "title": "Dynamic Call: getattr(_dispatcher, method_name, None)",
      "reason": "dynamic_dispatch",
      "file_path": "services/notifications.py",
      "line_number": 26,
      "code_snippet": "getattr(_dispatcher, method_name, None)",
      "explanation": "Dynamic invocation in services.notifications.dispatch_notification cannot be resolved statically.",
      "resolution_strategy": "Instrument with runtime trace or replace with explicit dispatch."
    },
    {
      "id": "44bfdf4c-3d24-47fa-8f09-2782ce37ffbe",
      "analysis_id": "80b8443f-66cc-4a35-8cd7-e1fd13b28b2b",
      "title": "Dynamic Call: Department.objects.filter(is_active=True",
      "reason": "dynamic_dispatch",
      "file_path": "services/employee.py",
      "line_number": 15,
      "code_snippet": "Department.objects.filter(is_active=True).first()",
      "explanation": "Dynamic invocation in services.employee.assign_default_department cannot be resolved statically.",
      "resolution_strategy": "Instrument with runtime trace or replace with explicit dispatch."
    },
    {
      "id": "6d9b3e34-528f-4e61-b6dc-95f18f39fc2e",
      "analysis_id": "80b8443f-66cc-4a35-8cd7-e1fd13b28b2b",
      "title": "Dynamic Call: getattr(_dispatcher, method_name, None)",
      "reason": "dynamic_dispatch",
      "file_path": "services/notifications.py",
      "line_number": 26,
      "code_snippet": "getattr(_dispatcher, method_name, None)",
      "explanation": "Dynamic invocation in services.notifications.dispatch_notification cannot be resolved statically.",
      "resolution_strategy": "Instrument with runtime trace or replace with explicit dispatch."
    },
    {
      "id": "108e2fbe-7207-47ea-8965-c82670bc714f",
      "analysis_id": "80b8443f-66cc-4a35-8cd7-e1fd13b28b2b",
      "title": "Deleted Configuration/Asset: config/legacy_keys.json",
      "reason": "missing_runtime_config",
      "file_path": "config/legacy_keys.json",
      "line_number": null,
      "code_snippet": "",
      "explanation": "File config/legacy_keys.json exists in Base snapshot but was deleted in Head snapshot. Any unmigrated runtime imports will fail with FileNotFoundError or ModuleNotFoundError.",
      "resolution_strategy": "Verify whether legacy references were completely removed."
    }
  ],
  "scenarios": [
    {
      "id": "ffba1476-b18c-4941-ba11-7d3f27eb9b43",
      "analysis": "80b8443f-66cc-4a35-8cd7-e1fd13b28b2b",
      "question": "How does salary validation behave between versions?",
      "target_symbol": "api.services.payroll.validate_compensation",
      "normalized_condition": "Employee creation with annual_salary between $30,000 and $44,999 (e.g. $35,000).",
      "target_behavior": "Validation and net payroll tax calculation.",
      "interpretation_assumptions": [
        "Salary is provided as a valid decimal number."
      ],
      "behavioral_delta_summary": "In Base version, a salary of $35,000 passed validation (threshold $30,000) and incurred a 15% tax deduction ($5,250). In Head version, the same salary fails validation with HTTP 400 because the minimum threshold was raised to $45,000. For salaries >= $45,000, tax deduction increased to 20%.",
      "impact_summary": "Salary updates between $30,000 and $45,000 are rejected. Downstream payroll disbursement net amounts are reduced by 5% across all valid salaries.",
      "verification_plan": {
        "preconditions": "Employee record exists with valid salary.",
        "input_data": "process_payroll(employee, gross_amount=Decimal('50000.00'))",
        "expected_result": "Tax deduction equals $10,000.00 (20%) instead of previous $7,500.00 (15%).",
        "rationale": "Validates the new deduction rate and ensures compliance calculations match new bracket rules.",
        "existing_test_ref": "tests.test_payroll.PayrollUnitTests.test_tax_deduction_head_rate",
        "coverage_classification": "existing_covered",
        "execution_status": "not_executed"
      },
      "uncertainty_report": [
        "Static analysis cannot confirm whether existing database rows with salaries < $45,000 will be flagged by background audit jobs."
      ],
      "status": "completed",
      "created_at": "2026-11-03T20:54:00.770055+00:00",
      "traces": [
        {
          "id": "2445d763-c9a0-444d-8edb-0921ba7cb7f1",
          "scenario_id": "ffba1476-b18c-4941-ba11-7d3f27eb9b43",
          "snapshot_side": "base",
          "step_index": 1,
          "symbol_qname": "api.serializers.EmployeeCreateSerializer.validate_annual_salary",
          "file_path": "serializers.py",
          "line_number": 45,
          "explanation": "Checks value >= 30000; returns validated salary value.",
          "provenance": "framework_rule"
        },
        {
          "id": "4ce19be9-025e-4dc7-a1e8-ac4754eb1c93",
          "scenario_id": "ffba1476-b18c-4941-ba11-7d3f27eb9b43",
          "snapshot_side": "base",
          "step_index": 2,
          "symbol_qname": "api.services.payroll.calculate_tax_deduction",
          "file_path": "services/payroll.py",
          "line_number": 18,
          "explanation": "Calculates tax deduction at flat 15% rate: gross * 0.15.",
          "provenance": "statically_established"
        },
        {
          "id": "9989cde3-13b2-4581-b316-29407cb31e67",
          "scenario_id": "ffba1476-b18c-4941-ba11-7d3f27eb9b43",
          "snapshot_side": "head",
          "step_index": 1,
          "symbol_qname": "api.serializers.EmployeeCreateSerializer.validate_annual_salary",
          "file_path": "serializers.py",
          "line_number": 45,
          "explanation": "Checks value >= 45000; raises serializers.ValidationError if below $45,000.",
          "provenance": "framework_rule"
        },
        {
          "id": "084c0c58-244c-49b8-a676-b6eb539c488a",
          "scenario_id": "ffba1476-b18c-4941-ba11-7d3f27eb9b43",
          "snapshot_side": "head",
          "step_index": 2,
          "symbol_qname": "api.services.payroll.calculate_tax_deduction",
          "file_path": "services/payroll.py",
          "line_number": 18,
          "explanation": "Calculates tax deduction at updated 20% rate: gross * 0.20.",
          "provenance": "statically_established"
        }
      ]
    },
    {
      "id": "094e6dfd-0f31-4392-b50b-ae0dae449362",
      "analysis": "80b8443f-66cc-4a35-8cd7-e1fd13b28b2b",
      "question": "What happens if a request omits department_id now?",
      "target_symbol": "api.serializers.EmployeeCreateSerializer",
      "normalized_condition": "HTTP POST /api/v1/employees/ with payload payload={'first_name': 'Jane', 'last_name': 'Doe'} (department_id omitted)",
      "target_behavior": "Employee creation without explicit department parameter.",
      "interpretation_assumptions": [
        "Client is an external authenticated consumer calling the standard DRF create route.",
        "No department key or null department value is provided in the request body."
      ],
      "behavioral_delta_summary": "In the Base version (v1.0), the request fails immediately at serializer validation with HTTP 400 Bad Request ('This field is required'). In the Head version (v1.1), serializer validation succeeds (required=False), and the service layer assigns fallback default department ID 1.",
      "impact_summary": "Downstream payroll processing and audit logging receive an employee record linked to the default department. Any external client assuming strict validation errors will observe a 201 Created instead.",
      "verification_plan": {
        "preconditions": "Database contains default department row with pk=1.",
        "input_data": "POST /employees/ with {'first_name': 'Alice', 'last_name': 'Smith', 'email': 'alice@example.com'}",
        "expected_result": "HTTP 201 Created; response payload contains department=1 and employment_status='active'.",
        "rationale": "Directly exercises the changed optional serializer contract and downstream fallback department assignment.",
        "existing_test_ref": "tests.test_api.EmployeeAPITests.test_create_employee_succeeds_when_department_omitted",
        "coverage_classification": "existing_covered",
        "execution_status": "not_executed"
      },
      "uncertainty_report": [
        "Fallback department ID 1 is assumed to exist in the database at runtime; if unseeded, assign_default_department raises Department.DoesNotExist / RuntimeError.",
        "Notification dispatcher at views.py line 34 uses dynamic dispatch (getattr) to send welcome message; dispatch target cannot be verified statically."
      ],
      "status": "completed",
      "created_at": "2026-11-03T20:53:59.316124+00:00",
      "traces": [
        {
          "id": "6a649c6f-c880-40d9-aaa0-797dbefc5a16",
          "scenario_id": "094e6dfd-0f31-4392-b50b-ae0dae449362",
          "snapshot_side": "base",
          "step_index": 1,
          "symbol_qname": "api.views.EmployeeViewSet.create",
          "file_path": "views.py",
          "line_number": 27,
          "explanation": "Receives POST request payload without department_id.",
          "provenance": "statically_established"
        },
        {
          "id": "7efe4527-141a-4296-b18a-a489bcee70a9",
          "scenario_id": "094e6dfd-0f31-4392-b50b-ae0dae449362",
          "snapshot_side": "base",
          "step_index": 2,
          "symbol_qname": "api.serializers.EmployeeCreateSerializer.is_valid",
          "file_path": "serializers.py",
          "line_number": 33,
          "explanation": "Validation fails: field 'department_id' has required=True. Raises serializers.ValidationError (HTTP 400).",
          "provenance": "framework_rule"
        },
        {
          "id": "cd603cdd-525d-49e8-be23-b9ddde4794c1",
          "scenario_id": "094e6dfd-0f31-4392-b50b-ae0dae449362",
          "snapshot_side": "head",
          "step_index": 1,
          "symbol_qname": "api.views.EmployeeViewSet.create",
          "file_path": "views.py",
          "line_number": 27,
          "explanation": "Receives POST request payload without department_id.",
          "provenance": "statically_established"
        },
        {
          "id": "13ff2311-4899-4a14-b458-33ecf7af2851",
          "scenario_id": "094e6dfd-0f31-4392-b50b-ae0dae449362",
          "snapshot_side": "head",
          "step_index": 2,
          "symbol_qname": "api.serializers.EmployeeCreateSerializer.is_valid",
          "file_path": "serializers.py",
          "line_number": 33,
          "explanation": "Validation succeeds: field 'department_id' has required=False, allow_null=True.",
          "provenance": "framework_rule"
        },
        {
          "id": "2aff650a-0bd2-4676-8ed9-a2166e2fcfde",
          "scenario_id": "094e6dfd-0f31-4392-b50b-ae0dae449362",
          "snapshot_side": "head",
          "step_index": 3,
          "symbol_qname": "api.services.employee.enroll_employee",
          "file_path": "services/employee.py",
          "line_number": 19,
          "explanation": "Detects missing department in validated data; delegates to assign_default_department.",
          "provenance": "statically_established"
        },
        {
          "id": "4819ec74-eb00-4a26-9511-50610a08bf9b",
          "scenario_id": "094e6dfd-0f31-4392-b50b-ae0dae449362",
          "snapshot_side": "head",
          "step_index": 4,
          "symbol_qname": "api.services.employee.assign_default_department",
          "file_path": "services/employee.py",
          "line_number": 6,
          "explanation": "Retrieves Department.objects.get(pk=1) from database to attach to employee record.",
          "provenance": "statically_established"
        }
      ]
    }
  ],
  "evidence": [
    {
      "id": "9b4b1c11-e450-4d40-81aa-2f60ededebe2",
      "analysis_id": "80b8443f-66cc-4a35-8cd7-e1fd13b28b2b",
      "snapshot_side": "head",
      "file_path": "serializers.py",
      "start_line": 31,
      "end_line": 36,
      "content_excerpt": "    department_id = serializers.PrimaryKeyRelatedField(\n        queryset=Department.objects.all(),\n        source=\"department\",\n        required=False,\n        allow_null=True,\n    )",
      "content_hash": "c8dc83f716ced81aec64d1855c674cb5e661dbd0df0a7e2c5077f6e4e0dfaf5c",
      "originating_stage": "stage_7_deltas"
    },
    {
      "id": "83e54485-19ee-4d62-9618-47c0aef27ce0",
      "analysis_id": "80b8443f-66cc-4a35-8cd7-e1fd13b28b2b",
      "snapshot_side": "head",
      "file_path": "serializers.py",
      "start_line": 49,
      "end_line": 53,
      "content_excerpt": "    def validate_annual_salary(self, value):\n        # IN HEAD v1.1: minimum annual salary threshold raised to $45,000\n        if value < 45000:\n            raise serializers.ValidationError(\"Annual salary cannot be below updated baseline minimum $45,000.\")\n        return value",
      "content_hash": "7cc747dc7972c822f712968bb33786f8eb12ee6b3d6688825e63f3648927e3f2",
      "originating_stage": "stage_7_deltas"
    },
    {
      "id": "7e85dead-e107-4f32-b380-28d339585ae0",
      "analysis_id": "80b8443f-66cc-4a35-8cd7-e1fd13b28b2b",
      "snapshot_side": "head",
      "file_path": "models.py",
      "start_line": 33,
      "end_line": 33,
      "content_excerpt": "    employment_status = models.CharField(",
      "content_hash": "d47cd047c1b139c0e113d3e7416527b15c0a9521bea25f89bbd9d567dfa0ff50",
      "originating_stage": "stage_7_deltas"
    },
    {
      "id": "8a0aea69-fb12-4b4b-96be-50a3e50c3499",
      "analysis_id": "80b8443f-66cc-4a35-8cd7-e1fd13b28b2b",
      "snapshot_side": "head",
      "file_path": "serializers.py",
      "start_line": 49,
      "end_line": 53,
      "content_excerpt": "    def validate_annual_salary(self, value):\n        # IN HEAD v1.1: minimum annual salary threshold raised to $45,000\n        if value < 45000:\n            raise serializers.ValidationError(\"Annual salary cannot be below updated baseline minimum $45,000.\")\n        return value",
      "content_hash": "7cc747dc7972c822f712968bb33786f8eb12ee6b3d6688825e63f3648927e3f2",
      "originating_stage": "stage_7_deltas"
    },
    {
      "id": "ba7cfcf9-6047-4854-a095-afb1e5199f46",
      "analysis_id": "80b8443f-66cc-4a35-8cd7-e1fd13b28b2b",
      "snapshot_side": "head",
      "file_path": "services/employee.py",
      "start_line": 21,
      "end_line": 44,
      "content_excerpt": "def enroll_employee(validated_data: dict) -> Employee:\n    \"\"\"\n    Head v1.1 Enrollment logic.\n    Handles optional department: assigns fallback default if omitted.\n    \"\"\"\n    department = validated_data.get(\"department\")\n    if not department:\n        department = assign_default_department()\n\n    employee = Employee.objects.create(\n        first_name=validated_data[\"first_name\"],\n        last_name=validated_data[\"last_name\"],\n        email=validated_data[\"email\"],\n        department=department",
      "content_hash": "ebc202537e0bc515b0e33b7be3424ee0344433370a437e821a3ac86c7e6bbe1a",
      "originating_stage": "stage_7_deltas"
    },
    {
      "id": "a2d928fc-d6f5-45bd-9d81-5ee97009ddde",
      "analysis_id": "80b8443f-66cc-4a35-8cd7-e1fd13b28b2b",
      "snapshot_side": "head",
      "file_path": "services/payroll.py",
      "start_line": 5,
      "end_line": 12,
      "content_excerpt": "def validate_compensation(salary: Decimal) -> bool:\n    \"\"\"\n    Head v1.1 Compensation validation.\n    Updated minimum threshold raised from $30,000 to $45,000.\n    \"\"\"\n    if salary < Decimal(\"45000.00\"):\n        raise ValueError(\"Salary must meet updated minimum threshold of $45,000.\")\n    return True",
      "content_hash": "022f744b90721d4d72a11c7c918922dfc68389867b0061d01c11369a86438c00",
      "originating_stage": "stage_7_deltas"
    },
    {
      "id": "40cf855d-80c8-445e-81bc-70f4d6bf4497",
      "analysis_id": "80b8443f-66cc-4a35-8cd7-e1fd13b28b2b",
      "snapshot_side": "head",
      "file_path": "services/payroll.py",
      "start_line": 15,
      "end_line": 21,
      "content_excerpt": "def calculate_tax_deduction(gross_amount: Decimal) -> Decimal:\n    \"\"\"\n    Head v1.1 Tax calculation.\n    Updated deduction rate raised from 15% to 20%.\n    \"\"\"\n    rate = Decimal(\"0.20\")\n    return (gross_amount * rate).quantize(Decimal(\"0.01\"))",
      "content_hash": "9c2377be56fa1adc0df438ce5be6f4ca26faa48815bddf3a89ef8c5f359e81fc",
      "originating_stage": "stage_7_deltas"
    },
    {
      "id": "e61fd493-b702-4138-bcf1-8203559e27f5",
      "analysis_id": "80b8443f-66cc-4a35-8cd7-e1fd13b28b2b",
      "snapshot_side": "head",
      "file_path": "services/reporting.py",
      "start_line": 5,
      "end_line": 17,
      "content_excerpt": "def generate_compliance_report(employee: Employee, raw_tax_id: str) -> dict:\n    \"\"\"\n    Generates payroll compliance audit payload.\n    BROKEN REFERENCE IN HEAD:\n    Depends on legacy_format_ssn which was deleted in head utils.py!\n    \"\"\"\n    formatted_ssn = legacy_format_ssn(raw_tax_id)\n    return {\n        \"employee_id\": employee.id,\n        \"name\": f\"{employee.first_name} {employee.last_name}\",\n        \"masked_tax_identifier\": formatted_ssn,\n        \"department\": employee.department.code,\n  ",
      "content_hash": "f2e7a979014f9c9a3623811b620cb10e43110663234160bd0777b0c4bac8a00a",
      "originating_stage": "stage_7_deltas"
    },
    {
      "id": "507dc657-73ae-4d70-8ef8-3e5cce8b64cb",
      "analysis_id": "80b8443f-66cc-4a35-8cd7-e1fd13b28b2b",
      "snapshot_side": "head",
      "file_path": "tests/test_api.py",
      "start_line": 8,
      "end_line": 11,
      "content_excerpt": "    def setUp(self):\n        self.dept = Department.objects.create(\n            id=1, name=\"General Administration\", code=\"GEN\", budget=1000000.00\n        )",
      "content_hash": "6895ea78e7c0ef38eb74fcbbaa77ee417e676ccf428392df00178aa382a49a79",
      "originating_stage": "stage_7_deltas"
    },
    {
      "id": "b8851d27-b6d5-4ddd-b906-214b92a15b97",
      "analysis_id": "80b8443f-66cc-4a35-8cd7-e1fd13b28b2b",
      "snapshot_side": "head",
      "file_path": "services/utils.py",
      "start_line": 1,
      "end_line": 1,
      "content_excerpt": "def generate_employee_badge_code(department_code: str, employee_id: int) -> str:",
      "content_hash": "90080c69772fcbde127bab352efe7b5099902a87c90d45679a3ee1f20cad4805",
      "originating_stage": "stage_7_deltas"
    },
    {
      "id": "6a7ba74c-0963-4355-8f4b-10ebb120de32",
      "analysis_id": "80b8443f-66cc-4a35-8cd7-e1fd13b28b2b",
      "snapshot_side": "head",
      "file_path": "tests/test_api.py",
      "start_line": 1,
      "end_line": 1,
      "content_excerpt": "from decimal import Decimal",
      "content_hash": "f74caf661fe0e73b50ce22817b11e165e0f52a30d84fc50e6e9235ca315ad8eb",
      "originating_stage": "stage_7_deltas"
    },
    {
      "id": "30909b64-0073-453b-bd65-decdd92e0dda",
      "analysis_id": "80b8443f-66cc-4a35-8cd7-e1fd13b28b2b",
      "snapshot_side": "head",
      "file_path": "tests/test_payroll.py",
      "start_line": 1,
      "end_line": 1,
      "content_excerpt": "from decimal import Decimal",
      "content_hash": "f74caf661fe0e73b50ce22817b11e165e0f52a30d84fc50e6e9235ca315ad8eb",
      "originating_stage": "stage_7_deltas"
    },
    {
      "id": "d8db2d00-daf5-4fd0-974f-a97f5303fe4d",
      "analysis_id": "80b8443f-66cc-4a35-8cd7-e1fd13b28b2b",
      "snapshot_side": "head",
      "file_path": "tests/test_payroll.py",
      "start_line": 1,
      "end_line": 1,
      "content_excerpt": "from decimal import Decimal",
      "content_hash": "f74caf661fe0e73b50ce22817b11e165e0f52a30d84fc50e6e9235ca315ad8eb",
      "originating_stage": "stage_7_deltas"
    },
    {
      "id": "84b9aaf1-27b0-4822-a680-105e24612797",
      "analysis_id": "80b8443f-66cc-4a35-8cd7-e1fd13b28b2b",
      "snapshot_side": "head",
      "file_path": "services/employee.py",
      "start_line": 4,
      "end_line": 18,
      "content_excerpt": "def assign_default_department() -> Department:\n    \"\"\"\n    HEAD v1.1 Fallback Department Resolution.\n    RUNTIME UNCERTAINTY:\n    Assumes a fallback department with pk=1 exists in the database.\n    If database lacks seed row, this raises Department.DoesNotExist at runtime.\n    \"\"\"\n    try:\n        return Department.objects.get(pk=1)\n    except Department.DoesNotExist:\n        # Fallback to first available active department\n        first_dept = Department.objects.filter(is_active=True).first()\n  ",
      "content_hash": "d66fbe1c2663125465ab35cc5f44136a8c21099ee6386e9d0c5d55f1c8b1c165",
      "originating_stage": "stage_7_deltas"
    },
    {
      "id": "a8a991b1-a0d9-4f47-8ccf-45a836bc7da2",
      "analysis_id": "80b8443f-66cc-4a35-8cd7-e1fd13b28b2b",
      "snapshot_side": "head",
      "file_path": "services/utils.py",
      "start_line": 8,
      "end_line": 13,
      "content_excerpt": "def format_employee_identifier(employee_id: int, prefix: str = \"EMP\") -> str:\n    \"\"\"\n    New identifier formatter introduced in v1.1.\n    NOTE: legacy_format_ssn was removed from this file, leaving broken references!\n    \"\"\"\n    return f\"{prefix}-{employee_id:06d}\"",
      "content_hash": "19e164879fafaf2dba28f96faa0e96349eeb395993633865ddbd1b428bed9208",
      "originating_stage": "stage_7_deltas"
    },
    {
      "id": "efc12978-7bfb-4fee-80cf-a8bc922970ae",
      "analysis_id": "80b8443f-66cc-4a35-8cd7-e1fd13b28b2b",
      "snapshot_side": "head",
      "file_path": "tests/test_api.py",
      "start_line": 26,
      "end_line": 38,
      "content_excerpt": "    def test_create_employee_succeeds_when_department_omitted(self):\n        \"\"\"\n        IN HEAD v1.1: omitting department_id now succeeds and resolves default department!\n        \"\"\"\n        payload = {\n            \"first_name\": \"Ada\",\n            \"last_name\": \"Lovelace\",\n            \"email\": \"ada.lovelace@example.com\",\n            \"annual_salary\": \"85000.00\",\n        }\n        response = self.client.post(\"/employees/\", payload, format=\"json\")\n        self.assertEqual(response.status_code, stat",
      "content_hash": "0c2277c0946a974ee9a347815222046703206fb092c36e3acb03f36f5be8aa78",
      "originating_stage": "stage_7_deltas"
    },
    {
      "id": "0fa6a8a1-b689-4a0f-b056-315ce483abfd",
      "analysis_id": "80b8443f-66cc-4a35-8cd7-e1fd13b28b2b",
      "snapshot_side": "head",
      "file_path": "tests/test_payroll.py",
      "start_line": 7,
      "end_line": 11,
      "content_excerpt": "    def test_minimum_salary_threshold_head(self):\n        # In head v1.1, minimum is $45,000\n        self.assertTrue(validate_compensation(Decimal(\"45000.00\")))\n        with self.assertRaises(ValueError):\n            validate_compensation(Decimal(\"44999.00\"))",
      "content_hash": "07cee9ddd4db7241b536dbaee7951bf738c5bec87cc3a041d738e31e4feafc9a",
      "originating_stage": "stage_7_deltas"
    },
    {
      "id": "b2ef0e1b-59a2-40c3-9eec-ad8f01ee48bc",
      "analysis_id": "80b8443f-66cc-4a35-8cd7-e1fd13b28b2b",
      "snapshot_side": "head",
      "file_path": "tests/test_payroll.py",
      "start_line": 13,
      "end_line": 17,
      "content_excerpt": "    def test_tax_deduction_head_rate(self):\n        # In head v1.1, rate is 20%\n        gross = Decimal(\"1000.00\")\n        deduction = calculate_tax_deduction(gross)\n        self.assertEqual(deduction, Decimal(\"200.00\"))",
      "content_hash": "e4e6070e7e2e771340896c59327ad2c88cd7e4d02011635e977f069c6e21ac60",
      "originating_stage": "stage_7_deltas"
    }
  ],
  "verification_cases": [
    {
      "id": "b7b6fd0a-47ac-4e48-b840-bd715938046a",
      "analysis_id": "80b8443f-66cc-4a35-8cd7-e1fd13b28b2b",
      "delta_id": null,
      "title": "Scenario Verification: What happens if a request omits department_id now?",
      "preconditions": "Database contains default department row with pk=1.",
      "input_data": "POST /employees/ with {'first_name': 'Alice', 'last_name': 'Smith', 'email': 'alice@example.com'}",
      "expected_result": "HTTP 201 Created; response payload contains department=1 and employment_status='active'.",
      "rationale": "Directly exercises the changed optional serializer contract and downstream fallback department assignment.",
      "existing_test_ref": "tests.test_api.EmployeeAPITests.test_create_employee_succeeds_when_department_omitted",
      "coverage_classification": "existing_covered",
      "execution_status": "not_executed"
    },
    {
      "id": "82d5e46c-5335-494e-b771-b4b7f648f10c",
      "analysis_id": "80b8443f-66cc-4a35-8cd7-e1fd13b28b2b",
      "delta_id": null,
      "title": "Scenario Verification: How does salary validation behave between versions",
      "preconditions": "Employee record exists with valid salary.",
      "input_data": "process_payroll(employee, gross_amount=Decimal('50000.00'))",
      "expected_result": "Tax deduction equals $10,000.00 (20%) instead of previous $7,500.00 (15%).",
      "rationale": "Validates the new deduction rate and ensures compliance calculations match new bracket rules.",
      "existing_test_ref": "tests.test_payroll.PayrollUnitTests.test_tax_deduction_head_rate",
      "coverage_classification": "existing_covered",
      "execution_status": "not_executed"
    }
  ],
  "impact_graph": {
    "nodes": [
      {
        "id": "views.EmployeeViewSet.create",
        "label": "create",
        "type": "function",
        "file_path": "views.py",
        "line_number": 34,
        "is_changed": false
      },
      {
        "id": "services.employee.enroll_employee",
        "label": "enroll_employee",
        "type": "function",
        "file_path": "",
        "line_number": 1,
        "is_changed": true
      },
      {
        "id": "services.notifications.dispatch_notification",
        "label": "dispatch_notification",
        "type": "function",
        "file_path": "",
        "line_number": 1,
        "is_changed": true
      },
      {
        "id": "serializers.EmployeeSerializer",
        "label": "EmployeeSerializer",
        "type": "serializer",
        "file_path": "",
        "line_number": 1,
        "is_changed": true
      },
      {
        "id": "services.employee.assign_default_department",
        "label": "assign_default_department",
        "type": "function",
        "file_path": "",
        "line_number": 1,
        "is_changed": true
      },
      {
        "id": "services.payroll.process_payroll",
        "label": "process_payroll",
        "type": "function",
        "file_path": "services/payroll.py",
        "line_number": 28,
        "is_changed": false
      },
      {
        "id": "services.payroll.validate_compensation",
        "label": "validate_compensation",
        "type": "function",
        "file_path": "",
        "line_number": 1,
        "is_changed": true
      },
      {
        "id": "services.payroll.calculate_tax_deduction",
        "label": "calculate_tax_deduction",
        "type": "function",
        "file_path": "",
        "line_number": 1,
        "is_changed": true
      },
      {
        "id": "tests.test_payroll.PayrollUnitTests.test_minimum_salary_threshold_head",
        "label": "test_minimum_salary_threshold_head",
        "type": "function",
        "file_path": "tests/test_payroll.py",
        "line_number": 9,
        "is_changed": false
      },
      {
        "id": "tests.test_payroll.PayrollUnitTests.test_tax_deduction_head_rate",
        "label": "test_tax_deduction_head_rate",
        "type": "function",
        "file_path": "tests/test_payroll.py",
        "line_number": 16,
        "is_changed": false
      },
      {
        "id": "client/employeeClient.ts:12",
        "label": "12",
        "type": "client",
        "file_path": "client/employeeClient.ts",
        "line_number": 12,
        "is_changed": false
      },
      {
        "id": "ROUTE:/employees/",
        "label": "/employees/",
        "type": "route",
        "file_path": "",
        "line_number": 1,
        "is_changed": true
      },
      {
        "id": "client/employeeClient.ts:18",
        "label": "18",
        "type": "client",
        "file_path": "client/employeeClient.ts",
        "line_number": 18,
        "is_changed": false
      },
      {
        "id": "client/employeeClient.ts:23",
        "label": "23",
        "type": "client",
        "file_path": "client/employeeClient.ts",
        "line_number": 23,
        "is_changed": false
      },
      {
        "id": "ROUTE:/departments/",
        "label": "/departments/",
        "type": "route",
        "file_path": "",
        "line_number": 1,
        "is_changed": true
      },
      {
        "id": "views.DepartmentViewSet",
        "label": "DepartmentViewSet",
        "type": "view",
        "file_path": "",
        "line_number": 1,
        "is_changed": true
      },
      {
        "id": "views.EmployeeViewSet",
        "label": "EmployeeViewSet",
        "type": "view",
        "file_path": "",
        "line_number": 1,
        "is_changed": true
      }
    ],
    "edges": [
      {
        "source": "views.EmployeeViewSet.create",
        "target": "services.employee.enroll_employee",
        "type": "calls",
        "provenance": "ast_static",
        "certainty": "definite",
        "file_path": "views.py",
        "line_number": 34
      },
      {
        "source": "views.EmployeeViewSet.create",
        "target": "services.notifications.dispatch_notification",
        "type": "calls",
        "provenance": "ast_static",
        "certainty": "definite",
        "file_path": "views.py",
        "line_number": 37
      },
      {
        "source": "views.EmployeeViewSet.create",
        "target": "serializers.EmployeeSerializer",
        "type": "calls",
        "provenance": "ast_static",
        "certainty": "definite",
        "file_path": "views.py",
        "line_number": 39
      },
      {
        "source": "services.employee.enroll_employee",
        "target": "services.employee.assign_default_department",
        "type": "calls",
        "provenance": "ast_static",
        "certainty": "definite",
        "file_path": "services/employee.py",
        "line_number": 28
      },
      {
        "source": "services.payroll.process_payroll",
        "target": "services.payroll.validate_compensation",
        "type": "calls",
        "provenance": "ast_static",
        "certainty": "definite",
        "file_path": "services/payroll.py",
        "line_number": 28
      },
      {
        "source": "services.payroll.process_payroll",
        "target": "services.payroll.calculate_tax_deduction",
        "type": "calls",
        "provenance": "ast_static",
        "certainty": "definite",
        "file_path": "services/payroll.py",
        "line_number": 29
      },
      {
        "source": "tests.test_payroll.PayrollUnitTests.test_minimum_salary_threshold_head",
        "target": "services.payroll.validate_compensation",
        "type": "calls",
        "provenance": "ast_static",
        "certainty": "definite",
        "file_path": "tests/test_payroll.py",
        "line_number": 9
      },
      {
        "source": "tests.test_payroll.PayrollUnitTests.test_minimum_salary_threshold_head",
        "target": "services.payroll.validate_compensation",
        "type": "calls",
        "provenance": "ast_static",
        "certainty": "definite",
        "file_path": "tests/test_payroll.py",
        "line_number": 11
      },
      {
        "source": "tests.test_payroll.PayrollUnitTests.test_tax_deduction_head_rate",
        "target": "services.payroll.calculate_tax_deduction",
        "type": "calls",
        "provenance": "ast_static",
        "certainty": "definite",
        "file_path": "tests/test_payroll.py",
        "line_number": 16
      },
      {
        "source": "client/employeeClient.ts:12",
        "target": "ROUTE:/employees/",
        "type": "consumed_by_client",
        "provenance": "ast_static",
        "certainty": "definite",
        "file_path": "client/employeeClient.ts",
        "line_number": 12
      },
      {
        "source": "client/employeeClient.ts:18",
        "target": "ROUTE:/employees/",
        "type": "consumed_by_client",
        "provenance": "ast_static",
        "certainty": "definite",
        "file_path": "client/employeeClient.ts",
        "line_number": 18
      },
      {
        "source": "client/employeeClient.ts:23",
        "target": "ROUTE:/departments/",
        "type": "consumed_by_client",
        "provenance": "ast_static",
        "certainty": "definite",
        "file_path": "client/employeeClient.ts",
        "line_number": 23
      },
      {
        "source": "ROUTE:/departments/",
        "target": "views.DepartmentViewSet",
        "type": "routes_to",
        "provenance": "framework_rule",
        "certainty": "definite",
        "file_path": "urls.py",
        "line_number": 6
      },
      {
        "source": "ROUTE:/employees/",
        "target": "views.EmployeeViewSet",
        "type": "routes_to",
        "provenance": "framework_rule",
        "certainty": "definite",
        "file_path": "urls.py",
        "line_number": 7
      },
      {
        "source": "tests.test_payroll.PayrollUnitTests.test_minimum_salary_threshold_head",
        "target": "services.payroll.validate_compensation",
        "type": "tests",
        "provenance": "ast_static",
        "certainty": "definite",
        "file_path": "tests/test_payroll.py",
        "line_number": 9
      },
      {
        "source": "tests.test_payroll.PayrollUnitTests.test_minimum_salary_threshold_head",
        "target": "services.payroll.validate_compensation",
        "type": "tests",
        "provenance": "ast_static",
        "certainty": "definite",
        "file_path": "tests/test_payroll.py",
        "line_number": 11
      },
      {
        "source": "tests.test_payroll.PayrollUnitTests.test_tax_deduction_head_rate",
        "target": "services.payroll.calculate_tax_deduction",
        "type": "tests",
        "provenance": "ast_static",
        "certainty": "definite",
        "file_path": "tests/test_payroll.py",
        "line_number": 16
      }
    ],
    "blast_radius_score": 14,
    "entrypoints_affected": 2,
    "data_models_affected": 1
  },
  "files": {
    "base": [
      {
        "relative_path": "config/legacy_keys.json",
        "language": "json",
        "file_classification": "config",
        "line_count": 4
      },
      {
        "relative_path": "models.py",
        "language": "python",
        "file_classification": "source",
        "line_count": 55
      },
      {
        "relative_path": "serializers.py",
        "language": "python",
        "file_classification": "source",
        "line_count": 52
      },
      {
        "relative_path": "urls.py",
        "language": "python",
        "file_classification": "source",
        "line_count": 11
      },
      {
        "relative_path": "views.py",
        "language": "python",
        "file_classification": "source",
        "line_count": 40
      },
      {
        "relative_path": "__init__.py",
        "language": "python",
        "file_classification": "source",
        "line_count": 4
      },
      {
        "relative_path": "client/employeeClient.ts",
        "language": "typescript",
        "file_classification": "source",
        "line_count": 25
      },
      {
        "relative_path": "services/employee.py",
        "language": "python",
        "file_classification": "source",
        "line_count": 23
      },
      {
        "relative_path": "services/notifications.py",
        "language": "python",
        "file_classification": "source",
        "line_count": 29
      },
      {
        "relative_path": "services/payroll.py",
        "language": "python",
        "file_classification": "source",
        "line_count": 38
      },
      {
        "relative_path": "services/reporting.py",
        "language": "python",
        "file_classification": "source",
        "line_count": 16
      },
      {
        "relative_path": "services/utils.py",
        "language": "python",
        "file_classification": "source",
        "line_count": 16
      },
      {
        "relative_path": "tests/test_api.py",
        "language": "python",
        "file_classification": "test",
        "line_count": 38
      },
      {
        "relative_path": "tests/test_payroll.py",
        "language": "python",
        "file_classification": "test",
        "line_count": 17
      }
    ],
    "head": [
      {
        "relative_path": "migrations/0002_update_employment_status_default.py",
        "language": "python",
        "file_classification": "migration",
        "line_count": 20
      },
      {
        "relative_path": "models.py",
        "language": "python",
        "file_classification": "source",
        "line_count": 55
      },
      {
        "relative_path": "serializers.py",
        "language": "python",
        "file_classification": "source",
        "line_count": 53
      },
      {
        "relative_path": "urls.py",
        "language": "python",
        "file_classification": "source",
        "line_count": 11
      },
      {
        "relative_path": "views.py",
        "language": "python",
        "file_classification": "source",
        "line_count": 40
      },
      {
        "relative_path": "__init__.py",
        "language": "python",
        "file_classification": "source",
        "line_count": 4
      },
      {
        "relative_path": "client/employeeClient.ts",
        "language": "typescript",
        "file_classification": "source",
        "line_count": 25
      },
      {
        "relative_path": "services/employee.py",
        "language": "python",
        "file_classification": "source",
        "line_count": 44
      },
      {
        "relative_path": "services/notifications.py",
        "language": "python",
        "file_classification": "source",
        "line_count": 29
      },
      {
        "relative_path": "services/payroll.py",
        "language": "python",
        "file_classification": "source",
        "line_count": 38
      },
      {
        "relative_path": "services/reporting.py",
        "language": "python",
        "file_classification": "source",
        "line_count": 17
      },
      {
        "relative_path": "services/utils.py",
        "language": "python",
        "file_classification": "source",
        "line_count": 13
      },
      {
        "relative_path": "tests/test_api.py",
        "language": "python",
        "file_classification": "test",
        "line_count": 38
      },
      {
        "relative_path": "tests/test_payroll.py",
        "language": "python",
        "file_classification": "test",
        "line_count": 17
      }
    ]
  },
  "languages": [
    {
      "key": "python",
      "name": "Python",
      "tier": 1,
      "extensions": [
        ".py",
        ".pyw",
        ".pyi"
      ],
      "capabilities": [
        "file_discovery",
        "ast_parsing",
        "symbol_extraction",
        "imports_extraction",
        "call_graph",
        "contract_analysis",
        "framework_rules",
        "test_discovery"
      ],
      "parser_engine": "Python AST (Standard Library `ast`)",
      "description": "Comprehensive AST parsing with Django/DRF semantic adapters, call-graph construction, and pytest discovery.",
      "supported_frameworks": [
        "Django 5.x",
        "Django REST Framework",
        "FastAPI",
        "pytest"
      ],
      "known_limitations": [
        "Dynamic imports (importlib.import_module)",
        "Runtime getattr/setattr dispatch",
        "Metaclass attribute generation"
      ],
      "is_tier_1": true
    },
    {
      "key": "typescript",
      "name": "TypeScript",
      "tier": 1,
      "extensions": [
        ".ts",
        ".tsx",
        ".mts"
      ],
      "capabilities": [
        "file_discovery",
        "ast_parsing",
        "symbol_extraction",
        "imports_extraction",
        "call_graph",
        "contract_analysis",
        "test_discovery"
      ],
      "parser_engine": "Structural Tokenizer & Regex AST Adapter",
      "description": "Type-aware symbol indexing, interface contracts, React component boundaries, and Vitest/Jest suite discovery.",
      "supported_frameworks": [
        "React",
        "Express",
        "Next.js",
        "Vitest",
        "Jest"
      ],
      "known_limitations": [
        "Complex higher-order component type inference",
        "Dynamic type assertion (`any` casts)"
      ],
      "is_tier_1": true
    },
    {
      "key": "javascript",
      "name": "JavaScript",
      "tier": 1,
      "extensions": [
        ".js",
        ".jsx",
        ".mjs",
        ".cjs"
      ],
      "capabilities": [
        "file_discovery",
        "ast_parsing",
        "symbol_extraction",
        "imports_extraction",
        "call_graph",
        "test_discovery"
      ],
      "parser_engine": "Structural Tokenizer & ES Module Adapter",
      "description": "ES6+ class and function extraction, CommonJS/ESM import tracing, and endpoint handler routing.",
      "supported_frameworks": [
        "Node.js",
        "React",
        "Express",
        "Mocha"
      ],
      "known_limitations": [
        "Prototypal monkeypatching",
        "Dynamic require() calls"
      ],
      "is_tier_1": true
    },
    {
      "key": "go",
      "name": "Go",
      "tier": 1,
      "extensions": [
        ".go"
      ],
      "capabilities": [
        "file_discovery",
        "ast_parsing",
        "symbol_extraction",
        "imports_extraction",
        "call_graph",
        "contract_analysis",
        "test_discovery"
      ],
      "parser_engine": "Go Struct & Function Lexer",
      "description": "Struct definition diffing, exported package methods, interface implementations, and go test extraction.",
      "supported_frameworks": [
        "Gin",
        "Echo",
        "Standard Library `net/http`",
        "testing"
      ],
      "known_limitations": [
        "Interface reflection (`reflect.ValueOf`)",
        "Unbuffered channel timing"
      ],
      "is_tier_1": true
    },
    {
      "key": "java",
      "name": "Java",
      "tier": 1,
      "extensions": [
        ".java"
      ],
      "capabilities": [
        "file_discovery",
        "ast_parsing",
        "symbol_extraction",
        "imports_extraction",
        "call_graph",
        "contract_analysis",
        "test_discovery"
      ],
      "parser_engine": "Java Class & Annotation Lexer",
      "description": "Spring Boot controller annotations, class inheritance hierarchies, and JUnit test matching.",
      "supported_frameworks": [
        "Spring Boot",
        "JUnit 5",
        "Jakarta EE"
      ],
      "known_limitations": [
        "Dynamic byte-code manipulation",
        "Reflection (java.lang.reflect)"
      ],
      "is_tier_1": true
    },
    {
      "key": "rust",
      "name": "Rust",
      "tier": 1,
      "extensions": [
        ".rs"
      ],
      "capabilities": [
        "file_discovery",
        "ast_parsing",
        "symbol_extraction",
        "imports_extraction",
        "call_graph",
        "contract_analysis",
        "test_discovery"
      ],
      "parser_engine": "Rust Item & Trait Tokenizer",
      "description": "Structs, enums, trait impl blocks, public functions, and #[test] harness indexing.",
      "supported_frameworks": [
        "Actix-web",
        "Axum",
        "Tokio",
        "cargo test"
      ],
      "known_limitations": [
        "Procedural macros with custom AST rewrites",
        "Unsafe pointer arithmetic"
      ],
      "is_tier_1": true
    },
    {
      "key": "csharp",
      "name": "C# / .NET",
      "tier": 1,
      "extensions": [
        ".cs"
      ],
      "capabilities": [
        "file_discovery",
        "ast_parsing",
        "symbol_extraction",
        "imports_extraction",
        "call_graph",
        "test_discovery"
      ],
      "parser_engine": "C# Roslyn Structural Lexer",
      "description": "ASP.NET Core controllers, record types, interface declarations, and xUnit discovery.",
      "supported_frameworks": [
        "ASP.NET Core",
        "Entity Framework",
        "xUnit"
      ],
      "known_limitations": [
        "Reflection dispatch (`Activator.CreateInstance`)",
        "Dynamic keywords"
      ],
      "is_tier_1": true
    },
    {
      "key": "cpp",
      "name": "C++",
      "tier": 1,
      "extensions": [
        ".cpp",
        ".cc",
        ".cxx",
        ".hpp",
        ".h"
      ],
      "capabilities": [
        "file_discovery",
        "ast_parsing",
        "symbol_extraction",
        "imports_extraction",
        "call_graph"
      ],
      "parser_engine": "C/C++ Header & Class Tokenizer",
      "description": "Namespaces, class templates, method signatures, and #include dependency mapping.",
      "supported_frameworks": [
        "Google Test",
        "Boost",
        "Qt"
      ],
      "known_limitations": [
        "Complex macro expansion preprocessor tricks",
        "Template metaprogramming"
      ],
      "is_tier_1": true
    },
    {
      "key": "c",
      "name": "C",
      "tier": 1,
      "extensions": [
        ".c",
        ".h"
      ],
      "capabilities": [
        "file_discovery",
        "ast_parsing",
        "symbol_extraction",
        "imports_extraction",
        "call_graph"
      ],
      "parser_engine": "C Structural Function Scanner",
      "description": "Function prototypes, struct definitions, enum constants, and header dependencies.",
      "supported_frameworks": [
        "Unity",
        "CMock"
      ],
      "known_limitations": [
        "Macro-defined function implementations",
        "Function pointer tables"
      ],
      "is_tier_1": true
    },
    {
      "key": "php",
      "name": "PHP",
      "tier": 1,
      "extensions": [
        ".php",
        ".phtml"
      ],
      "capabilities": [
        "file_discovery",
        "ast_parsing",
        "symbol_extraction",
        "imports_extraction",
        "call_graph",
        "test_discovery"
      ],
      "parser_engine": "PHP Class & Route Tokenizer",
      "description": "Laravel routes, class methods, traits, namespaces, and PHPUnit discovery.",
      "supported_frameworks": [
        "Laravel",
        "Symfony",
        "PHPUnit"
      ],
      "known_limitations": [
        "Magic methods (__call, __get)",
        "Variable variable names ($$var)"
      ],
      "is_tier_1": true
    },
    {
      "key": "ruby",
      "name": "Ruby",
      "tier": 1,
      "extensions": [
        ".rb",
        ".rake"
      ],
      "capabilities": [
        "file_discovery",
        "ast_parsing",
        "symbol_extraction",
        "imports_extraction",
        "call_graph",
        "test_discovery"
      ],
      "parser_engine": "Ruby Class & Method Scanner",
      "description": "Rails models, controllers, modules, and RSpec/Minitest discovery.",
      "supported_frameworks": [
        "Ruby on Rails",
        "RSpec",
        "Minitest"
      ],
      "known_limitations": [
        "Metaprogramming (define_method, method_missing)",
        "Monkeypatching core classes"
      ],
      "is_tier_1": true
    },
    {
      "key": "kotlin",
      "name": "Kotlin",
      "tier": 2,
      "extensions": [
        ".kt",
        ".kts"
      ],
      "capabilities": [
        "file_discovery",
        "symbol_extraction",
        "imports_extraction"
      ],
      "parser_engine": "Kotlin Class Lexer",
      "description": "Data classes, functions, companion objects, and package imports.",
      "supported_frameworks": [],
      "known_limitations": [],
      "is_tier_1": false
    },
    {
      "key": "swift",
      "name": "Swift",
      "tier": 2,
      "extensions": [
        ".swift"
      ],
      "capabilities": [
        "file_discovery",
        "symbol_extraction",
        "imports_extraction"
      ],
      "parser_engine": "Swift Protocol & Struct Lexer",
      "description": "Protocols, structs, classes, and import declarations.",
      "supported_frameworks": [],
      "known_limitations": [],
      "is_tier_1": false
    },
    {
      "key": "scala",
      "name": "Scala",
      "tier": 2,
      "extensions": [
        ".scala",
        ".sc"
      ],
      "capabilities": [
        "file_discovery",
        "symbol_extraction",
        "imports_extraction"
      ],
      "parser_engine": "Scala Object Lexer",
      "description": "Traits, case classes, and package objects.",
      "supported_frameworks": [],
      "known_limitations": [],
      "is_tier_1": false
    },
    {
      "key": "dart",
      "name": "Dart / Flutter",
      "tier": 2,
      "extensions": [
        ".dart"
      ],
      "capabilities": [
        "file_discovery",
        "symbol_extraction",
        "imports_extraction"
      ],
      "parser_engine": "Dart Widget & Class Lexer",
      "description": "Flutter widgets, stateful classes, and library imports.",
      "supported_frameworks": [],
      "known_limitations": [],
      "is_tier_1": false
    },
    {
      "key": "lua",
      "name": "Lua",
      "tier": 2,
      "extensions": [
        ".lua"
      ],
      "capabilities": [
        "file_discovery",
        "symbol_extraction"
      ],
      "parser_engine": "Lua Function Tokenizer",
      "description": "Table definitions and global/local functions.",
      "supported_frameworks": [],
      "known_limitations": [],
      "is_tier_1": false
    },
    {
      "key": "r",
      "name": "R",
      "tier": 2,
      "extensions": [
        ".r",
        ".R"
      ],
      "capabilities": [
        "file_discovery",
        "symbol_extraction"
      ],
      "parser_engine": "R Script Scanner",
      "description": "Function assignments and library loads.",
      "supported_frameworks": [],
      "known_limitations": [],
      "is_tier_1": false
    },
    {
      "key": "shell",
      "name": "Bash / Shell",
      "tier": 2,
      "extensions": [
        ".sh",
        ".bash",
        ".zsh"
      ],
      "capabilities": [
        "file_discovery",
        "symbol_extraction"
      ],
      "parser_engine": "Shell Function Scanner",
      "description": "Function definitions and exported environment variables.",
      "supported_frameworks": [],
      "known_limitations": [],
      "is_tier_1": false
    },
    {
      "key": "sql",
      "name": "SQL / DDL",
      "tier": 2,
      "extensions": [
        ".sql"
      ],
      "capabilities": [
        "file_discovery",
        "symbol_extraction",
        "contract_analysis"
      ],
      "parser_engine": "SQL DDL Statement Parser",
      "description": "CREATE TABLE, ALTER TABLE, indexes, and schema definitions.",
      "supported_frameworks": [],
      "known_limitations": [],
      "is_tier_1": false
    },
    {
      "key": "json",
      "name": "JSON",
      "tier": 2,
      "extensions": [
        ".json"
      ],
      "capabilities": [
        "file_discovery",
        "contract_analysis"
      ],
      "parser_engine": "JSON Object Structural Diff Engine",
      "description": "Configuration schema differences and API payload contracts.",
      "supported_frameworks": [],
      "known_limitations": [],
      "is_tier_1": false
    },
    {
      "key": "yaml",
      "name": "YAML / OpenAPI",
      "tier": 2,
      "extensions": [
        ".yaml",
        ".yml"
      ],
      "capabilities": [
        "file_discovery",
        "contract_analysis"
      ],
      "parser_engine": "YAML Schema & OpenAPI Specification Parser",
      "description": "OpenAPI/Swagger specs, CI workflows, and Kubernetes manifests.",
      "supported_frameworks": [],
      "known_limitations": [],
      "is_tier_1": false
    },
    {
      "key": "toml",
      "name": "TOML",
      "tier": 2,
      "extensions": [
        ".toml"
      ],
      "capabilities": [
        "file_discovery",
        "contract_analysis"
      ],
      "parser_engine": "TOML Config Lexer",
      "description": "Cargo.toml and pyproject.toml package dependency shifts.",
      "supported_frameworks": [],
      "known_limitations": [],
      "is_tier_1": false
    },
    {
      "key": "xml",
      "name": "XML",
      "tier": 2,
      "extensions": [
        ".xml"
      ],
      "capabilities": [
        "file_discovery",
        "contract_analysis"
      ],
      "parser_engine": "XML Node Tree Parser",
      "description": "pom.xml and configuration schemas.",
      "supported_frameworks": [],
      "known_limitations": [],
      "is_tier_1": false
    },
    {
      "key": "markdown",
      "name": "Markdown",
      "tier": 2,
      "extensions": [
        ".md",
        ".mdx"
      ],
      "capabilities": [
        "file_discovery"
      ],
      "parser_engine": "Markdown Heading & Section Parser",
      "description": "Documentation sections and API changelogs.",
      "supported_frameworks": [],
      "known_limitations": [],
      "is_tier_1": false
    },
    {
      "key": "graphql",
      "name": "GraphQL",
      "tier": 2,
      "extensions": [
        ".graphql",
        ".gql"
      ],
      "capabilities": [
        "file_discovery",
        "symbol_extraction",
        "contract_analysis"
      ],
      "parser_engine": "GraphQL Schema AST Parser",
      "description": "Query, Mutation, and Type definition schema diffing.",
      "supported_frameworks": [],
      "known_limitations": [],
      "is_tier_1": false
    },
    {
      "key": "protobuf",
      "name": "Protocol Buffers",
      "tier": 2,
      "extensions": [
        ".proto"
      ],
      "capabilities": [
        "file_discovery",
        "symbol_extraction",
        "contract_analysis"
      ],
      "parser_engine": "Protobuf Message & Service Parser",
      "description": "gRPC service definitions and message field backward compatibility.",
      "supported_frameworks": [],
      "known_limitations": [],
      "is_tier_1": false
    }
  ]
} as const;
