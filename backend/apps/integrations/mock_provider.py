from typing import Any, Dict, List
from .llm_base import (
    BoundedContextPackage,
    LLMProvider,
    ScenarioSynthesisResult,
    TraceStep,
    VerificationPlanSchema,
)


class DeterministicMockProvider(LLMProvider):
    """
    Deterministic Mock Provider used for zero-credential local runs,
    demonstrations, and automated test suites.
    Produces strictly grounded, deterministic results derived from the fixture.
    """

    def synthesize_scenario(
        self, package: BoundedContextPackage
    ) -> ScenarioSynthesisResult:
        question = package.scenario_question.lower()

        # Match missing department scenario
        if "department" in question or "omit" in question or "optional" in question:
            return ScenarioSynthesisResult(
                question=package.scenario_question,
                normalized_condition="HTTP POST /api/v1/employees/ with payload payload={'first_name': 'Jane', 'last_name': 'Doe'} (department_id omitted)",
                target_behavior="Employee creation without explicit department parameter.",
                interpretation_assumptions=[
                    "Client is an external authenticated consumer calling the standard DRF create route.",
                    "No department key or null department value is provided in the request body.",
                ],
                behavioral_delta_summary="In the Base version (v1.0), the request fails immediately at serializer validation with HTTP 400 Bad Request ('This field is required'). In the Head version (v1.1), serializer validation succeeds (required=False), and the service layer assigns fallback default department ID 1.",
                impact_summary="Downstream payroll processing and audit logging receive an employee record linked to the default department. Any external client assuming strict validation errors will observe a 201 Created instead.",
                base_trace=[
                    TraceStep(
                        step_index=1,
                        symbol="api.views.EmployeeViewSet.create",
                        file_path="views.py",
                        line_number=27,
                        explanation="Receives POST request payload without department_id.",
                        provenance="statically_established",
                    ),
                    TraceStep(
                        step_index=2,
                        symbol="api.serializers.EmployeeCreateSerializer.is_valid",
                        file_path="serializers.py",
                        line_number=33,
                        explanation="Validation fails: field 'department_id' has required=True. Raises serializers.ValidationError (HTTP 400).",
                        provenance="framework_rule",
                    ),
                ],
                head_trace=[
                    TraceStep(
                        step_index=1,
                        symbol="api.views.EmployeeViewSet.create",
                        file_path="views.py",
                        line_number=27,
                        explanation="Receives POST request payload without department_id.",
                        provenance="statically_established",
                    ),
                    TraceStep(
                        step_index=2,
                        symbol="api.serializers.EmployeeCreateSerializer.is_valid",
                        file_path="serializers.py",
                        line_number=33,
                        explanation="Validation succeeds: field 'department_id' has required=False, allow_null=True.",
                        provenance="framework_rule",
                    ),
                    TraceStep(
                        step_index=3,
                        symbol="api.services.employee.enroll_employee",
                        file_path="services/employee.py",
                        line_number=19,
                        explanation="Detects missing department in validated data; delegates to assign_default_department.",
                        provenance="statically_established",
                    ),
                    TraceStep(
                        step_index=4,
                        symbol="api.services.employee.assign_default_department",
                        file_path="services/employee.py",
                        line_number=6,
                        explanation="Retrieves Department.objects.get(pk=1) from database to attach to employee record.",
                        provenance="statically_established",
                    ),
                ],
                verification_plan=VerificationPlanSchema(
                    preconditions="Database contains default department row with pk=1.",
                    input_data="POST /employees/ with {'first_name': 'Alice', 'last_name': 'Smith', 'email': 'alice@example.com'}",
                    expected_result="HTTP 201 Created; response payload contains department=1 and employment_status='active'.",
                    rationale="Directly exercises the changed optional serializer contract and downstream fallback department assignment.",
                    existing_test_ref="tests.test_api.EmployeeAPITests.test_create_employee_succeeds_when_department_omitted",
                    coverage_classification="existing_covered",
                    execution_status="not_executed",
                ),
                uncertainty_report=[
                    "Fallback department ID 1 is assumed to exist in the database at runtime; if unseeded, assign_default_department raises Department.DoesNotExist / RuntimeError.",
                    "Notification dispatcher at views.py line 34 uses dynamic dispatch (getattr) to send welcome message; dispatch target cannot be verified statically.",
                ],
                status="completed",
            )

        # Match salary / payroll scenario
        elif "salary" in question or "compensation" in question or "payroll" in question or "tax" in question:
            return ScenarioSynthesisResult(
                question=package.scenario_question,
                normalized_condition="Employee creation with annual_salary between $30,000 and $44,999 (e.g. $35,000).",
                target_behavior="Validation and net payroll tax calculation.",
                interpretation_assumptions=[
                    "Salary is provided as a valid decimal number.",
                ],
                behavioral_delta_summary="In Base version, a salary of $35,000 passed validation (threshold $30,000) and incurred a 15% tax deduction ($5,250). In Head version, the same salary fails validation with HTTP 400 because the minimum threshold was raised to $45,000. For salaries >= $45,000, tax deduction increased to 20%.",
                impact_summary="Salary updates between $30,000 and $45,000 are rejected. Downstream payroll disbursement net amounts are reduced by 5% across all valid salaries.",
                base_trace=[
                    TraceStep(
                        step_index=1,
                        symbol="api.serializers.EmployeeCreateSerializer.validate_annual_salary",
                        file_path="serializers.py",
                        line_number=45,
                        explanation="Checks value >= 30000; returns validated salary value.",
                        provenance="framework_rule",
                    ),
                    TraceStep(
                        step_index=2,
                        symbol="api.services.payroll.calculate_tax_deduction",
                        file_path="services/payroll.py",
                        line_number=18,
                        explanation="Calculates tax deduction at flat 15% rate: gross * 0.15.",
                        provenance="statically_established",
                    ),
                ],
                head_trace=[
                    TraceStep(
                        step_index=1,
                        symbol="api.serializers.EmployeeCreateSerializer.validate_annual_salary",
                        file_path="serializers.py",
                        line_number=45,
                        explanation="Checks value >= 45000; raises serializers.ValidationError if below $45,000.",
                        provenance="framework_rule",
                    ),
                    TraceStep(
                        step_index=2,
                        symbol="api.services.payroll.calculate_tax_deduction",
                        file_path="services/payroll.py",
                        line_number=18,
                        explanation="Calculates tax deduction at updated 20% rate: gross * 0.20.",
                        provenance="statically_established",
                    ),
                ],
                verification_plan=VerificationPlanSchema(
                    preconditions="Employee record exists with valid salary.",
                    input_data="process_payroll(employee, gross_amount=Decimal('50000.00'))",
                    expected_result="Tax deduction equals $10,000.00 (20%) instead of previous $7,500.00 (15%).",
                    rationale="Validates the new deduction rate and ensures compliance calculations match new bracket rules.",
                    existing_test_ref="tests.test_payroll.PayrollUnitTests.test_tax_deduction_head_rate",
                    coverage_classification="existing_covered",
                    execution_status="not_executed",
                ),
                uncertainty_report=[
                    "Static analysis cannot confirm whether existing database rows with salaries < $45,000 will be flagged by background audit jobs.",
                ],
                status="completed",
            )

        # Generic scenario fallback
        else:
            return ScenarioSynthesisResult(
                question=package.scenario_question,
                normalized_condition=f"Evaluation of question across detected diffs: {package.scenario_question}",
                target_behavior="General behavioral delta analysis.",
                interpretation_assumptions=[
                    "Evaluated against detected Base and Head AST symbols."
                ],
                behavioral_delta_summary="Identified changes across serializer validation rules, model defaults, and payroll deduction rates between versions.",
                impact_summary="Upstream API routes and downstream database records are impacted by optional fields and revised validation bounds.",
                base_trace=[],
                head_trace=[],
                verification_plan=VerificationPlanSchema(
                    preconditions="Standard test database.",
                    input_data="Execute full test suite.",
                    expected_result="Assertions match head behavior.",
                    rationale="Regression verification.",
                    existing_test_ref="",
                    coverage_classification="suggested_uncovered",
                    execution_status="not_executed",
                ),
                uncertainty_report=[
                    "Scenario question does not map to a single isolated symbol; review Behavior Delta Ledger for individual component changes."
                ],
                status="completed",
            )
