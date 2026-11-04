
from fastapi.testclient import TestClient

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
