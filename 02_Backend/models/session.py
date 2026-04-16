from pydantic import BaseModel
from typing import Optional


class CreateSessionRequest(BaseModel):
    user_id: Optional[str] = None


class CreateSessionResponse(BaseModel):
    session_id: str
    client_secret: str
    expires_at: int


class ChatRequest(BaseModel):
    session_id: str
    message: str
    personality: str = "clear"