from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Neo4j Settings
    NEO4J_URI: Optional[str] = None
    NEO4J_USERNAME: Optional[str] = None
    NEO4J_PASSWORD: Optional[str] = None
    NEO4J_DATABASE: str = "neo4j"
    
    # Databricks Settings
    DATABRICKS_SERVER_HOSTNAME: Optional[str] = None
    DATABRICKS_HTTP_PATH: Optional[str] = None
    DATABRICKS_TOKEN: Optional[str] = None
    
    class Config:
        env_file = "../.env"
        env_file_encoding = "utf-8"

settings = Settings()

def is_neo4j_configured() -> bool:
    return all([settings.NEO4J_URI, settings.NEO4J_USERNAME, settings.NEO4J_PASSWORD])

def is_databricks_configured() -> bool:
    return all([settings.DATABRICKS_SERVER_HOSTNAME, settings.DATABRICKS_HTTP_PATH, settings.DATABRICKS_TOKEN])

def is_demo_mode() -> bool:
    """Returns True if critical database credentials are missing."""
    return not is_databricks_configured()
