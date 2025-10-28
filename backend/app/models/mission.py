from typing import List, Optional, Dict, Any, Annotated
from datetime import datetime
from pydantic import BaseModel, Field, BeforeValidator
from bson import ObjectId

# Pydantic v2 way of handling ObjectId
def validate_object_id(v: Any) -> ObjectId:
    if isinstance(v, ObjectId):
        return v
    if isinstance(v, str) and ObjectId.is_valid(v):
        return ObjectId(v)
    raise ValueError("Invalid ObjectId")

PyObjectId = Annotated[ObjectId, BeforeValidator(validate_object_id)]

class Message(BaseModel):
    role: str
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    files: Optional[List[Dict[str, Any]]] = []

class Conversation(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    mission_id: PyObjectId
    messages: List[Message] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Mission(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    title: str
    description: str
    status: str = "initial"  # initial, questioning, scoping, checklist, audit, synthesis, report
    current_conversation_id: Optional[PyObjectId] = None
    generated_files: List[Dict[str, str]] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class MissionCreate(BaseModel):
    title: str
    description: str