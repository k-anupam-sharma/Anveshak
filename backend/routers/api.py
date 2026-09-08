from fastapi import APIRouter, HTTPException, Depends
from backend.auth import authenticate_user, User
from pydantic import BaseModel
from typing import Optional

from backend.database.databricks_client import databricks_client
from backend.database.neo4j_client import neo4j_client
from backend.config import is_demo_mode

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "demo_mode": is_demo_mode(),
        "databricks_connected": databricks_client.connection is not None,
        "neo4j_connected": neo4j_client.driver is not None
    }

@router.post("/login")
def login(request: LoginRequest):
    user = authenticate_user(request.email, request.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"token": "fake-jwt-token-for-demo", "user": user.model_dump()}

@router.get("/dashboard/stats")
def get_dashboard_stats():
    return databricks_client.get_dashboard_stats()

@router.get("/cases")
def get_cases():
    return databricks_client.get_cases()

@router.get("/cases/{case_id}")
def get_case(case_id: str):
    case = databricks_client.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case

@router.get("/health/neo4j")
def health_neo4j():
    import os
    import logging
    from dotenv import load_dotenv
    from neo4j import GraphDatabase

    # Load .env (finds it in root or backend)
    load_dotenv()

    uri = os.getenv("NEO4J_URI")
    username = os.getenv("NEO4J_USERNAME")
    password = os.getenv("NEO4J_PASSWORD")
    database = os.getenv("NEO4J_DATABASE")

    # Safe diagnostics
    hostname = uri.split("@")[-1] if uri and "@" in uri else (uri.split("://")[-1] if uri else None)
    print("--- Neo4j Health Check Diagnostics ---")
    print(f"NEO4J_URI hostname: {hostname}")
    print(f"NEO4J_USERNAME: {username}")
    print(f"NEO4J_DATABASE: {database}")
    print(f"NEO4J_PASSWORD exists: {bool(password)}")
    print("--------------------------------------")

    try:
        driver = GraphDatabase.driver(
            uri,
            auth=(username, password)
        )
        
        driver.verify_connectivity()
        return {"status": "connected"}
    except Exception as e:
        import traceback
        logging.error(f"Neo4j connection failed:\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=503, 
            detail={
                "error_type": type(e).__name__, 
                "message": str(e)
            }
        )

@router.get("/graph/full")
def get_full_graph():
    try:
        return neo4j_client.get_full_graph()
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))

@router.get("/graph/entity/{entity_id}")
def get_entity_graph(entity_id: str):
    try:
        return neo4j_client.get_entity_neighborhood(entity_id)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))

@router.get("/graph/case/{case_id}")
def get_case_graph(case_id: str):
    try:
        return neo4j_client.get_case_neighborhood(case_id)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))

class ExplainRequest(BaseModel):
    source_id: str
    target_id: str

@router.post("/connections/explain")
def explain_connection(request: ExplainRequest):
    try:
        return neo4j_client.explain_connection(request.source_id, request.target_id)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))

@router.get("/timeline")
def get_timeline(entity_id: Optional[str] = None):
    return databricks_client.get_timeline(entity_id)

@router.get("/leads")
def get_leads():
    return databricks_client.get_leads()
