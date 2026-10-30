import os
import json
import logging
from typing import Optional
from django.conf import settings
import urllib.request
import urllib.error

from .llm_base import LLMProvider, BoundedContextPackage, ScenarioSynthesisResult, TraceStep, VerificationPlanSchema
from .mock_provider import DeterministicMockProvider

logger = logging.getLogger(__name__)


class OpenAIProvider(LLMProvider):
    """
    OpenAI Provider utilizing Chat Completions with JSON response format.
    Gracefully falls back to DeterministicMockProvider on authentication, rate limit, or timeout errors.
    """

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or os.environ.get("OPENAI_API_KEY", "") or getattr(settings, "OPENAI_API_KEY", "")
        self.model = model or os.environ.get("OPENAI_MODEL", "gpt-4o-mini")
        self.fallback = DeterministicMockProvider()

    def _redact_secrets(self, text: str) -> str:
        import re
        patterns = [
            (r'(?i)(?:api_key|secret|token|password|bearer|authorization)\s*[:=]\s*["\']?([a-zA-Z0-9_\-\.]{8,})["\']?', r'\1: [REDACTED_SECRET]'),
            (r'sk-[a-zA-Z0-9]{32,}', '[REDACTED_OPENAI_KEY]'),
            (r'ghp_[a-zA-Z0-9]{36}', '[REDACTED_GITHUB_TOKEN]'),
        ]
        redacted = text
        for pat, repl in patterns:
            redacted = re.sub(pat, repl, redacted)
        return redacted

    def synthesize_scenario(self, package: BoundedContextPackage) -> ScenarioSynthesisResult:
        if not self.api_key:
            logger.warning("No OpenAI API key provided. Falling back to deterministic local rule engine.")
            res = self.fallback.synthesize_scenario(package)
            res.uncertainty_report.append("Notice: Local deterministic fallback used because OPENAI_API_KEY is not set.")
            return res

        system_prompt = (
            "You are an expert static analysis and change-intelligence engine for DiffBeacon.\n"
            "Analyze the provided bounded context package and output ONLY a valid JSON object matching this schema:\n"
            "{\n"
            '  "question": string,\n'
            '  "normalized_condition": string,\n'
            '  "target_behavior": string,\n'
            '  "interpretation_assumptions": [string],\n'
            '  "behavioral_delta_summary": string,\n'
            '  "impact_summary": string,\n'
            '  "base_trace": [{"step_index": int, "symbol": string, "file_path": string, "line_number": int, "explanation": string, "provenance": string}],\n'
            '  "head_trace": [{"step_index": int, "symbol": string, "file_path": string, "line_number": int, "explanation": string, "provenance": string}],\n'
            '  "verification_plan": {"preconditions": string, "input_data": string, "expected_result": string, "rationale": string, "existing_test_ref": string, "coverage_classification": string, "execution_status": string},\n'
            '  "uncertainty_report": [string]\n'
            "}\n"
            "Provenance must be one of: statically_established, framework_rule, inferred, unresolved, runtime_verified.\n"
            "Do NOT hallucinate nonexistent files or symbols."
        )

        user_content = self._redact_secrets(package.model_dump_json(indent=2))

        payload = {
            "model": self.model,
            "response_format": {"type": "json_object"},
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Bounded Context Package:\n{user_content}"},
            ],
            "temperature": 0.1,
            "max_tokens": 2048,
        }

        try:
            req = urllib.request.Request(
                "https://api.openai.com/v1/chat/completions",
                data=json.dumps(payload).encode("utf-8"),
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self.api_key}",
                },
                method="POST",
            )

            with urllib.request.urlopen(req, timeout=12) as response:
                resp_data = json.loads(response.read().decode("utf-8"))
                choice = resp_data["choices"][0]["message"]["content"]
                parsed = json.loads(choice)
                return ScenarioSynthesisResult(**parsed)

        except urllib.error.HTTPError as http_err:
            logger.error(f"OpenAI API HTTP error: {http_err.code} - {http_err.reason}")
            res = self.fallback.synthesize_scenario(package)
            res.uncertainty_report.append(f"Fallback to deterministic local engine: OpenAI API returned HTTP {http_err.code} ({http_err.reason}).")
            return res
        except Exception as exc:
            logger.error(f"OpenAI API call failed: {exc}")
            res = self.fallback.synthesize_scenario(package)
            res.uncertainty_report.append(f"Fallback to deterministic local engine: {str(exc)}")
            return res
