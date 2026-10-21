from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class BoundedContextPackage(BaseModel):
    scenario_question: str
    target_symbol: Optional[str] = None
    source_excerpts: Dict[str, str] = Field(default_factory=dict)
    candidate_paths: Dict[str, List[Dict[str, Any]]] = Field(default_factory=dict)
    contract_deltas: List[Dict[str, Any]] = Field(default_factory=list)
    behavior_deltas: List[Dict[str, Any]] = Field(default_factory=list)
    known_unknowns: List[Dict[str, Any]] = Field(default_factory=list)


class TraceStep(BaseModel):
    step_index: int
    symbol: str
    file_path: str
    line_number: Optional[int] = None
    explanation: str
    provenance: str = "statically_established"  # statically_established, framework_rule, inferred, unresolved, runtime_verified


class VerificationPlanSchema(BaseModel):
    preconditions: str
    input_data: str
    expected_result: str
    rationale: str
    existing_test_ref: Optional[str] = ""
    coverage_classification: str = "suggested_uncovered"
    execution_status: str = "not_executed"


class ScenarioSynthesisResult(BaseModel):
    question: str
    normalized_condition: str
    target_behavior: str
    interpretation_assumptions: List[str] = Field(default_factory=list)
    behavioral_delta_summary: str
    impact_summary: str
    base_trace: List[TraceStep] = Field(default_factory=list)
    head_trace: List[TraceStep] = Field(default_factory=list)
    verification_plan: VerificationPlanSchema
    uncertainty_report: List[str] = Field(default_factory=list)
    status: str = "completed"


class LLMProvider(ABC):
    @abstractmethod
    def synthesize_scenario(
        self, package: BoundedContextPackage
    ) -> ScenarioSynthesisResult:
        """
        Synthesize scenario trace and verification recommendations
        over the strictly bounded context package.
        """
        pass
