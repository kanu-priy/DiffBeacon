import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient


User = get_user_model()


@pytest.mark.django_db
def test_user_registration_and_login_flow():
    client = APIClient()

    register = client.post(
        "/api/v1/auth/register/",
        {
            "email": "demo@example.com",
            "username": "demouser",
            "password": "StrongPass123!",
            "password_confirm": "StrongPass123!",
        },
        format="json",
    )
    assert register.status_code == 201, register.content
    payload = register.json()
    assert payload["user"]["email"] == "demo@example.com"
    assert "access" in payload
    assert "refresh" in payload

    login_res = client.post(
        "/api/v1/auth/login/",
        {"username": "demouser", "password": "StrongPass123!"},
        format="json",
    )
    assert login_res.status_code == 200, login_res.content

    token = login_res.json()["access"]
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    me = client.get("/api/v1/auth/me/")
    assert me.status_code == 200, me.content
    assert me.json()["email"] == "demo@example.com"

    workspace = client.post(
        "/api/v1/workspaces/",
        {"name": "My Workspace", "description": "Real user data"},
        format="json",
    )
    assert workspace.status_code == 201, workspace.content

    visible = client.get("/api/v1/workspaces/")
    assert visible.status_code == 200, visible.content
    assert any(item["name"] == "My Workspace" for item in visible.json())


@pytest.mark.django_db
def test_workspaces_are_private_to_their_owner():
    client = APIClient()
    client.post(
        "/api/v1/auth/register/",
        {
            "email": "first@example.com",
            "username": "firstuser",
            "password": "StrongPass123!",
            "password_confirm": "StrongPass123!",
        },
        format="json",
    )
    first_token = client.post(
        "/api/v1/auth/login/",
        {"username": "firstuser", "password": "StrongPass123!"},
        format="json",
    ).json()["access"]

    client.credentials(HTTP_AUTHORIZATION=f"Bearer {first_token}")
    first_ws = client.post(
        "/api/v1/workspaces/",
        {"name": "Private Board", "description": "Owner only"},
        format="json",
    )
    assert first_ws.status_code == 201, first_ws.content
    owner_id = first_ws.json()["owner_id"]

    second_client = APIClient()
    second_client.post(
        "/api/v1/auth/register/",
        {
            "email": "second@example.com",
            "username": "seconduser",
            "password": "StrongPass123!",
            "password_confirm": "StrongPass123!",
        },
        format="json",
    )
    second_token = second_client.post(
        "/api/v1/auth/login/",
        {"username": "seconduser", "password": "StrongPass123!"},
        format="json",
    ).json()["access"]
    second_client.credentials(HTTP_AUTHORIZATION=f"Bearer {second_token}")

    list_res = second_client.get("/api/v1/workspaces/")
    assert list_res.status_code == 200
    names = [item["name"] for item in list_res.json()]
    assert "Private Board" not in names

    detail = second_client.get(f"/api/v1/workspaces/{first_ws.json()['id']}/")
    assert detail.status_code == 403
