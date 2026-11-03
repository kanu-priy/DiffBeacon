import hmac
import json

import pytest
from django.test import override_settings
from rest_framework.test import APIClient

from apps.integrations.github_service import GitHubService


@pytest.mark.django_db
@override_settings(GITHUB_APP_SLUG="diffbeacon-test")
def test_github_connect_route_returns_install_url_for_configured_app():
    client = APIClient()
    register = client.post(
        "/api/v1/auth/register/",
        {
            "email": "ghuser@example.com",
            "username": "ghuser",
            "password": "StrongPass123!",
            "password_confirm": "StrongPass123!",
        },
        format="json",
    )
    assert register.status_code == 201, register.content
    token = register.json()["access"]
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    response = client.get("/api/v1/integrations/github/connect/")
    assert response.status_code == 200, response.content
    payload = response.json()
    assert payload["status"] == "ready"
    assert payload["install_url"] == "https://github.com/apps/diffbeacon-test/installations/new"


@pytest.mark.django_db
def test_webhook_signature_verification_uses_hmac_sha256():
    secret = "super-secret"
    payload = json.dumps({"action": "opened", "number": 42}).encode("utf-8")
    signature = "sha256=" + hmac.new(secret.encode("utf-8"), payload, "sha256").hexdigest()

    assert GitHubService.verify_webhook_signature(payload, signature, secret) is True
    assert GitHubService.verify_webhook_signature(payload, "sha256=deadbeef", secret) is False


@pytest.mark.django_db
@override_settings(GITHUB_APP_SLUG="diffbeacon-test")
def test_github_connection_status_reports_not_connected_state():
    client = APIClient()
    register = client.post(
        "/api/v1/auth/register/",
        {
            "email": "status@example.com",
            "username": "statususer",
            "password": "StrongPass123!",
            "password_confirm": "StrongPass123!",
        },
        format="json",
    )
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {register.json()['access']}")

    response = client.get("/api/v1/integrations/github/connection/")
    assert response.status_code == 200, response.content
    payload = response.json()
    assert payload["connected"] is False
    assert payload["status"] == "not_connected"
