import pytest
from fastapi.testclient import TestClient
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    # Ensure demo mode fallback is working
    assert data["demo_mode"] == True

def test_login_success():
    response = client.post("/api/login", json={"email": "admin@anveshak.demo", "password": "Admin@123"})
    assert response.status_code == 200
    data = response.json()
    assert "token" in data
    assert data["user"]["role"] == "admin"

def test_login_failure():
    response = client.post("/api/login", json={"email": "admin@anveshak.demo", "password": "wrong"})
    assert response.status_code == 401

def test_get_cases():
    response = client.get("/api/cases")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert "fir_number" in data[0]

def test_get_graph_nodes():
    response = client.get("/api/graph/nodes")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert "label" in data[0]

def test_explain_connection():
    response = client.post("/api/connections/explain", json={"source_id": "P-001", "target_id": "P-002"})
    assert response.status_code == 200
    data = response.json()
    assert data["hops"] == 3
