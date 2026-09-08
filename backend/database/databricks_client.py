from backend.config import settings, is_demo_mode
from backend.database.mock_data import MOCK_CASES, MOCK_TIMELINE, MOCK_STATS, MOCK_LEADS
import logging

logger = logging.getLogger(__name__)

class DatabricksClient:
    def __init__(self):
        self.demo_mode = is_demo_mode()
        self.connection = None
        if not self.demo_mode:
            try:
                from databricks import sql
                self.connection = sql.connect(
                    server_hostname=settings.DATABRICKS_SERVER_HOSTNAME,
                    http_path=settings.DATABRICKS_HTTP_PATH,
                    access_token=settings.DATABRICKS_TOKEN
                )
            except Exception as e:
                logger.error(f"Failed to connect to Databricks: {e}. Falling back to demo mode.")
                self.demo_mode = True

    def get_dashboard_stats(self):
        if self.demo_mode:
            return MOCK_STATS
        return {}
    
    def get_cases(self):
        if self.demo_mode:
            return MOCK_CASES
        return []

    def get_case(self, case_id: str):
        if self.demo_mode:
            for c in MOCK_CASES:
                if c["id"] == case_id:
                    return c
            return None
        return None

    def get_timeline(self, entity_id: str = None):
        if self.demo_mode:
            if entity_id:
                return [t for t in MOCK_TIMELINE if entity_id in t["entities"]]
            return MOCK_TIMELINE
        return []

    def get_leads(self):
        if self.demo_mode:
            return MOCK_LEADS
        return []

databricks_client = DatabricksClient()
