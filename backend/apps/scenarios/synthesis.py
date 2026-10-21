from typing import Optional
from apps.analysis.models import AnalysisRun, VerificationCase
from apps.integrations.provider_factory import get_llm_provider
from apps.scenarios.models import ScenarioQuery, ScenarioTrace
from apps.scenarios.planner import ScenarioPlanner
from apps.snapshots.models import SourceFile


class ScenarioSynthesizer:
    """
    Coordinates bounded scenario planning, LLM synthesis,
    Stage 11 claim verification, and persistence.
    """

    def __init__(self):
        self.planner = ScenarioPlanner()

    def execute_scenario(
        self,
        analysis: AnalysisRun,
        question: str,
        target_symbol: Optional[str] = None,
        provider_name: Optional[str] = None,
    ) -> ScenarioQuery:
        # Stage 9: Scenario Planning (build strictly bounded context)
        package = self.planner.plan_scenario(analysis, question, target_symbol)

        # Stage 10: Evidence-Limited AI Synthesis
        provider = get_llm_provider(provider_name or analysis.ai_provider_name)
        result = provider.synthesize_scenario(package)

        # Stage 11: Claim Verification Guardrails
        # Verify source file existence for traces
        base_files = set(
            SourceFile.objects.filter(snapshot=analysis.base_snapshot).values_list(
                "relative_path", flat=True
            )
        )
        head_files = set(
            SourceFile.objects.filter(snapshot=analysis.head_snapshot).values_list(
                "relative_path", flat=True
            )
        )

        scenario_record = ScenarioQuery.objects.create(
            analysis=analysis,
            question=result.question,
            target_symbol=target_symbol or "",
            normalized_condition=result.normalized_condition,
            target_behavior=result.target_behavior,
            interpretation_assumptions=result.interpretation_assumptions,
            behavioral_delta_summary=result.behavioral_delta_summary,
            impact_summary=result.impact_summary,
            verification_plan=result.verification_plan.model_dump(),
            uncertainty_report=result.uncertainty_report,
            status=result.status,
        )

        # Persist Base Traces
        for step in result.base_trace:
            # Audit file existence
            prov = step.provenance
            # Check if file exists in base snapshot (allowing suffix match)
            file_exists = any(
                f == step.file_path or f.endswith(step.file_path) for f in base_files
            )
            if not file_exists and prov == "statically_established":
                prov = "unresolved"

            ScenarioTrace.objects.create(
                scenario=scenario_record,
                snapshot_side="base",
                step_index=step.step_index,
                symbol_qname=step.symbol,
                file_path=step.file_path,
                line_number=step.line_number,
                explanation=step.explanation,
                provenance=prov,
            )

        # Persist Head Traces
        for step in result.head_trace:
            prov = step.provenance
            file_exists = any(
                f == step.file_path or f.endswith(step.file_path) for f in head_files
            )
            if not file_exists and prov == "statically_established":
                prov = "unresolved"

            ScenarioTrace.objects.create(
                scenario=scenario_record,
                snapshot_side="head",
                step_index=step.step_index,
                symbol_qname=step.symbol,
                file_path=step.file_path,
                line_number=step.line_number,
                explanation=step.explanation,
                provenance=prov,
            )

        # Create or link VerificationCase
        vplan = result.verification_plan
        VerificationCase.objects.create(
            analysis=analysis,
            title=f"Scenario Verification: {result.question[:50]}",
            preconditions=vplan.preconditions,
            input_data=vplan.input_data,
            expected_result=vplan.expected_result,
            rationale=vplan.rationale,
            existing_test_ref=vplan.existing_test_ref or "",
            coverage_classification=vplan.coverage_classification,
            execution_status=vplan.execution_status,
        )

        return scenario_record
