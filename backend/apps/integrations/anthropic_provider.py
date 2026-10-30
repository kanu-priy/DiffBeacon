import os
import json
import logging
from typing import Optional
from django.conf import settings
import urllib.request
import urllib.error

from .llm_base import LLMProvider, BoundedContextPackage, ScenarioSynthesisResult
from .mock_provider import DeterministicMockProvider

logger = logging.getLogger(__name__)


class AnthropicProvider(LLMProvider):
    """
    Anthropic Claude 3.5 Provider.
    Gracefully falls back to DeterministicMockProvider on authentication, rate limit, or timeout errors.
    """

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or os.environ.get("ANTHROPIC_API_KEY", "") or getattr(settings, "ANTHROPIC_API_KEY", "")
        self.model = model or os.environ.get("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022")
        self.fallback = DeterministicMockProvider()

    def _redact_secrets(self, text: str) -> str:
        import re
        patterns = [
            (r'(?i)(?:api_key|secret|token|password|bearer|authorization)\s*[:=]\s*["\']?([a-zA-Z0-9_\-\.]{8,})["\']?', r'\1: [REDACTED_SECRET]'),
            (r'sk-ant-[a-zA-Z0-9_\-]{32,}', '[REDACTED_ANTHROPIC_KEY]'),
        ]
        redacted = text
        for pat, repl in patterns:
            redacted = re.sub(pat, repl, redacted)
        return redacted

    def synthesize_scenario(self, package: BoundedContextPackage) -> ScenarioSynthesisResult:
        if not self.api_key:
            logger.warning("No Anthropic API key provided. Falling back to deterministic local rule engine.")
            res = self.fallback.synthesize_scenario(package)
            res.uncertainty_report.append("Notice: Local deterministic fallback used because ANTHROPIC_API_KEY is not set.")
            return res

        system_prompt = (
            "You are an expert static analysis engine for DiffBeacon.\n"
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
            "Respond strictly with the JSON object, with no markdown codeblocks or preamble."
        )

        user_content = self._redact_secrets(package.model_dump_json(indent=2))

        payload = {
            "model": self.model,
            "system": system_prompt,
            "messages": [
                {"role": "user", "content": f"Bounded Context Package:\n{user_content}"},
            ],
            "max_tokens": 2048,
            "temperature": 0.1,
        }

        try:
            req = urllib.request.Request(
                "https://api.anthropic.com/v1/messages",
                data=json.dumps(payload).encode("utf-8"),
                headers={
                    "Content-Type": "application/json",
                    "x-api-key": self.api_key,
                    "anthropic-version": "2023-06-01",
                },
                method="POST",
            )

            with urllib.request.urlopen(req, timeout=12) as response:
                resp_data = json.loads(response.read().decode("utf-8"))
                text_block = resp_data["content"][0]["text"].strip()
                # Clean possible markdown ticks
                if text_block.startswith("```json"):
                    text_block = text_block[7:]
                if text_block.endswith("```"):
                    text_block = text_block[:-3]
                parsed = json.loads(text_block.strip())
                return ScenarioSynthesisResult(**parsed)

        except urllib.error.HTTPError as http_err:
            logger.error(f"Anthropic API HTTP error: {http_err.code} - {http_err.reason}")
            res = self.fallback.synthesize_scenario(package)
            res.uncertainty_report.append(f"Fallback to deterministic local engine: Anthropic API returned HTTP {http_err.code} ({http_err.reason}).")
            return res
        except Exception as exc:
            logger.error(f"Anthropic API call failed: {exc}")
            res = self.fallback.synthesize_scenario(package)
            res.uncertainty_report.append(f"Fallback to deterministic local engine: {str(exc)}")
            return res
