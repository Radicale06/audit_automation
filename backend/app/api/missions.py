from fastapi import APIRouter, HTTPException, Body, UploadFile, File, Depends
from fastapi.responses import StreamingResponse
from typing import List, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
import json
import io

from ..core.database import get_db
from ..core.auth import get_current_user
from ..models.user import User

router = APIRouter(prefix="/api/missions", tags=["missions"])

# Temporary in-memory storage for missions (replace with proper DB later if needed)
fake_missions: Dict[str, Dict] = {}
mission_counter = 0

@router.get("/", response_model=List[Dict[str, Any]])
async def get_all_missions(current_user: User = Depends(get_current_user)):
    """Récupérer toutes les missions"""
    user_missions = []
    for mission_id, mission in fake_missions.items():
        if mission["user_id"] == current_user.id:
            mission_copy = mission.copy()
            mission_copy["_id"] = mission_id
            user_missions.append(mission_copy)
    return user_missions

@router.post("/", response_model=Dict[str, Any])
async def create_mission(
    title: str = Body(...),
    description: str = Body(...),
    current_user: User = Depends(get_current_user)
):
    """Créer une nouvelle mission d'audit"""
    global mission_counter
    mission_counter += 1
    mission_id = f"mission_{mission_counter}"
    
    new_mission = {
        "title": title,
        "description": description,
        "status": "initial",
        "user_id": current_user.id,
        "created_at": datetime.utcnow().isoformat(),
        "conversation_history": []
    }
    
    fake_missions[mission_id] = new_mission
    
    return {
        "mission_id": mission_id,
        "status": "initial",
        "message": "Mission créée avec succès"
    }

@router.get("/{mission_id}")
async def get_mission(
    mission_id: str,
    current_user: User = Depends(get_current_user)
):
    """Récupérer une mission par son ID"""
    if mission_id not in fake_missions:
        raise HTTPException(status_code=404, detail="Mission not found")
    
    mission = fake_missions[mission_id]
    if mission["user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    mission_copy = mission.copy()
    mission_copy["_id"] = mission_id
    return mission_copy

@router.post("/{mission_id}/message")
async def add_message(
    mission_id: str,
    content: str = Body(..., embed=True),
    current_user: User = Depends(get_current_user)
):
    """Ajouter un message à la conversation"""
    if mission_id not in fake_missions:
        raise HTTPException(status_code=404, detail="Mission not found")
    
    mission = fake_missions[mission_id]
    if mission["user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Add user message to history
    user_message = {
        "role": "user",
        "content": content,
        "timestamp": datetime.utcnow().isoformat()
    }
    mission["conversation_history"].append(user_message)
    
    # Simple bot response (you can integrate your existing mission logic here)
    bot_response = {
        "role": "assistant", 
        "content": f"Merci pour votre message: {content}. Je traite votre demande...",
        "timestamp": datetime.utcnow().isoformat()
    }
    mission["conversation_history"].append(bot_response)
    
    # Update mission status
    mission["status"] = "active"
    mission["updated_at"] = datetime.utcnow().isoformat()
    
    return {
        "message": bot_response["content"],
        "status": "active"
    }