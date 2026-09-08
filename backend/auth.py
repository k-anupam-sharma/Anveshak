from pydantic import BaseModel
from typing import Optional

class User(BaseModel):
    email: str
    role: str
    name: str

# Demo Accounts Map
DEMO_USERS = {
    "admin@anveshak.demo": {"email": "admin@anveshak.demo", "password": "Admin@123", "role": "admin", "name": "System Admin"},
    "investigator@anveshak.demo": {"email": "investigator@anveshak.demo", "password": "Investigator@123", "role": "investigator", "name": "Investigator Sharma"},
    "supervisor@anveshak.demo": {"email": "supervisor@anveshak.demo", "password": "Supervisor@123", "role": "supervisor", "name": "Supervisor Patel"},
}

def authenticate_user(email: str, password: str) -> Optional[User]:
    user_data = DEMO_USERS.get(email)
    if user_data and user_data["password"] == password:
        return User(email=user_data["email"], role=user_data["role"], name=user_data["name"])
    return None
