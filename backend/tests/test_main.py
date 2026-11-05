import os
from fastapi.testclient import TestClient

# Default test environment to production Vercel frontend URL
os.environ.setdefault("FRONTEND_URL", "https://job-finder-six-orcin.vercel.app")

from main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200


def test_react_quiz_endpoint():
    response = client.get("/quizzes/react")
    assert response.status_code == 200
    data = response.json()
    assert data["title"]
    assert len(data["questions"]) == 3


def test_fastapi_quiz_endpoint():
    response = client.get("/quizzes/fastapi")
    assert response.status_code == 200
    data = response.json()
    assert len(data["questions"]) == 3


def test_unknown_quiz_endpoint():
    response = client.get("/quizzes/unknown")
    assert response.status_code == 404


def test_cors_options_preflight():
    """Verify CORS preflight (OPTIONS) response for production Vercel origin."""
    response = client.options(
        "/quizzes/react",
        headers={
            "Origin": "https://job-finder-six-orcin.vercel.app",
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "content-type",
        },
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "https://job-finder-six-orcin.vercel.app"
    assert "GET" in response.headers.get("access-control-allow-methods", "")
    assert "content-type" in response.headers.get("access-control-allow-headers", "").lower()


def test_cors_get_production_origin():
    """Verify CORS GET request from production Vercel origin includes allow-origin header."""
    response = client.get(
        "/quizzes/react",
        headers={
            "Origin": "https://job-finder-six-orcin.vercel.app",
            "Content-Type": "application/json",
        },
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "https://job-finder-six-orcin.vercel.app"
