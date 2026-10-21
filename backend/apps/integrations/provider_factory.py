import os
from django.conf import settings
from .llm_base import LLMProvider
from .mock_provider import DeterministicMockProvider


def get_llm_provider(provider_name: str = None) -> LLMProvider:
    name = (provider_name or getattr(settings, "LLM_PROVIDER", "mock")).lower()

    if name == "mock":
        return DeterministicMockProvider()
    elif name == "openai":
        from .openai_provider import OpenAIProvider
        return OpenAIProvider()
    elif name == "anthropic":
        from .anthropic_provider import AnthropicProvider
        return AnthropicProvider()
    else:
        # Default fallback to mock provider
        return DeterministicMockProvider()
