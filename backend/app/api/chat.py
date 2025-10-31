from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime
from pydantic import BaseModel

from ..core.database import get_db
from ..core.auth import get_current_user
from ..models.user import User
from ..services.mistral_service import mistral_service

router = APIRouter(prefix="/chat", tags=["chat"])

# Pydantic models for chat
class ChatCreateRequest(BaseModel):
    chatName: str

class ChatMessageRequest(BaseModel):
    chatId: str
    prompt: str

class ChatDeleteRequest(BaseModel):
    chatId: str

class ChatMessagesRequest(BaseModel):
    chatId: str
    page: int = 1

# Temporary in-memory storage (replace with database later)
fake_chats: Dict[str, Dict] = {}
fake_messages: Dict[str, List[Dict]] = {}
chat_counter = 0

# Helper functions for audit workflow
def determine_audit_phase(user_input: str, conversation_history: List[Dict]) -> str:
    """Determine which phase of the audit workflow the user is in"""
    user_input_lower = user_input.lower()
    
    # Check conversation history for context
    bot_messages = [msg["message"] for msg in conversation_history if msg["type"] == "bot"]
    
    # Phase detection logic
    if any("questions" in msg or "préciser" in msg for msg in bot_messages):
        if "?" not in user_input and len(user_input.split()) > 10:
            return "cadrage"  # User is answering questions, generate cadrage
    
    if "checklist" in user_input_lower or "contrôles" in user_input_lower:
        return "checklist"
    
    if any(word in user_input_lower for word in ["vulnérabilité", "faille", "problème", "constat", "trouvé"]):
        return "constat"
    
    if "synthèse" in user_input_lower or "résumé" in user_input_lower:
        return "synthesis"
    
    if "rapport" in user_input_lower or "ancs" in user_input_lower or "final" in user_input_lower:
        return "rapport"
    
    # If no bot messages yet and user provides mission description
    if not bot_messages and len(user_input.split()) > 5:
        return "questions"
    
    return "default"

def extract_qa_pairs_from_history(conversation_history: List[Dict]) -> List[Dict[str, str]]:
    """Extract question-answer pairs from conversation history"""
    qa_pairs = []
    messages = conversation_history
    
    for i in range(len(messages) - 1):
        if messages[i]["type"] == "bot" and "?" in messages[i]["message"]:
            if i + 1 < len(messages) and messages[i + 1]["type"] == "user":
                qa_pairs.append({
                    "question": messages[i]["message"],
                    "answer": messages[i + 1]["message"]
                })
    
    return qa_pairs

def get_initial_mission_description(conversation_history: List[Dict]) -> str:
    """Get the initial mission description from conversation history"""
    for msg in conversation_history:
        if msg["type"] == "user" and len(msg["message"].split()) > 5:
            return msg["message"]
    return "Mission d'audit de sécurité informatique"

def format_cadrage_response(cadrage_data: Dict[str, Any]) -> str:
    """Format cadrage data as plain text response"""
    response = "📋 **Cadrage de Mission d'Audit**\n\n"
    response += f"**Domaine(s) concerné(s):** {cadrage_data.get('domaines', '')}\n"
    response += f"**Processus inclus:** {cadrage_data.get('processus', '')}\n"
    response += f"**Exclusions éventuelles:** {cadrage_data.get('exclusions', '')}\n"
    response += f"**Référentiels pris en compte:** {cadrage_data.get('referentiels', 'ISO 27001, ANCS')}\n\n"
    
    for i, objectif in enumerate(cadrage_data.get('objectifs', []), 1):
        response += f"**Objectif {i}:** {objectif}\n"
    
    return response

def get_cadrage_from_history(conversation_history: List[Dict]) -> Dict[str, Any]:
    """Extract cadrage data from conversation history"""
    # Look for cadrage data in bot messages
    for msg in conversation_history:
        if msg["type"] == "bot" and "Cadrage" in msg["message"]:
            # Extract data from previous cadrage if available
            return {"mission": "Audit de sécurité", "scope": "Systèmes informatiques"}
    return {"mission": "Audit de sécurité informatique", "scope": "Infrastructure IT"}

def format_checklist_response(checklist: List[Dict[str, str]]) -> str:
    """Format checklist as plain text response"""
    response = "✅ **Checklist d'Audit ISO 27001**\n\n"
    
    for item in checklist:
        response += f"**Section:** {item.get('section', '')}\n"
        response += f"**Exigence:** {item.get('exigence', '')}\n"
        response += f"---\n"
    
    return response

def get_mission_context_from_history(conversation_history: List[Dict]) -> Dict[str, Any]:
    """Get mission context from conversation history"""
    context = {
        "mission_type": "Audit de sécurité informatique",
        "scope": "Infrastructure IT",
        "standards": ["ISO 27001", "ANCS"]
    }
    
    # Extract more specific context if available
    for msg in conversation_history:
        if msg["type"] == "user" and any(word in msg["message"].lower() for word in ["serveur", "base", "réseau"]):
            context["scope"] = msg["message"][:100]
            break
    
    return context

def format_constat_response(constat_data: Dict[str, Any]) -> str:
    """Format vulnerability finding as plain text response"""
    criticite_color = {
        "Critique": "🔴",
        "Majeure": "🟠", 
        "Mineure": "🟡",
        "Observation": "🔵"
    }
    
    color = criticite_color.get(constat_data.get('criticite', ''), '🟡')
    
    response = "🔍 **Constat d'Audit**\n\n"
    response += f"**Référence du constat:** {constat_data.get('reference', '')}\n"
    response += f"**Intitulé du constat:** {constat_data.get('intitule', '')}\n"
    response += f"**Entité auditée:** {constat_data.get('entite', '')}\n"
    response += f"**Description du constat:** {constat_data.get('description', '')}\n"
    response += f"**Criticité:** {color} {constat_data.get('criticite', '')}\n"
    response += f"**Norme(s) de référence:** {constat_data.get('normes', '')}\n"
    response += f"**Preuves:** {constat_data.get('preuves', '')}\n"
    response += f"**Recommandations:** {constat_data.get('recommandations', '')}\n"
    
    return response

def compile_mission_data_from_history(conversation_history: List[Dict]) -> Dict[str, Any]:
    """Compile all mission data from conversation history"""
    mission_data = {
        "mission_description": "Audit de sécurité informatique",
        "scope": "Infrastructure IT",
        "findings": [],
        "checklist_completed": False,
        "cadrage_done": False
    }
    
    # Extract findings and other data from conversation
    for msg in conversation_history:
        if msg["type"] == "bot":
            if "Constat" in msg["message"]:
                mission_data["findings"].append(msg["message"])
            elif "Checklist" in msg["message"]:
                mission_data["checklist_completed"] = True
            elif "Cadrage" in msg["message"]:
                mission_data["cadrage_done"] = True
    
    return mission_data

def generate_ancs_report(mission_data: Dict[str, Any]) -> str:
    """Generate final ANCS report as plain text"""
    today = datetime.utcnow().strftime("%d/%m/%Y")
    
    report = "📄 **RAPPORT D'AUDIT DE SÉCURITÉ**\n"
    report += "*Conforme aux normes ANCS*\n\n"
    
    report += "## 1. CONTEXTE ET PÉRIMÈTRE\n"
    report += f"**Mission:** {mission_data.get('mission_description', 'Audit de sécurité informatique')}\n"
    report += f"**Périmètre:** {mission_data.get('scope', 'Infrastructure informatique')}\n"
    report += f"**Date d'audit:** {today}\n"
    report += "**Référentiels:** ISO 27001:2022, ANCS\n\n"
    
    report += "## 2. MÉTHODOLOGIE\n"
    report += "- Analyse documentaire\n"
    report += "- Entretiens avec les équipes\n"
    report += "- Tests techniques\n"
    report += "- Vérification de conformité\n\n"
    
    report += "## 3. SYNTHÈSE DES CONSTATS\n"
    report += f"**Nombre de constats identifiés:** {len(mission_data.get('findings', []))}\n\n"
    
    report += "## 4. RECOMMANDATIONS PRIORITAIRES\n"
    report += "- Renforcer la gestion des accès privilégiés\n"
    report += "- Améliorer la surveillance de la sécurité\n"
    report += "- Mettre à jour les politiques de sécurité\n\n"
    
    report += "## 5. PLAN D'ACTION\n"
    report += "Les actions correctives doivent être mises en œuvre selon les priorités définies.\n\n"
    
    report += "---\n"
    report += f"**Date du rapport:** {today}\n"
    report += "**Référence:** AUDIT-SEC-2025-001\n"
    
    return report

@router.get("/list")
async def get_chat_list(current_user: User = Depends(get_current_user)):
    """Get list of user's chats"""
    user_chats = []
    for chat_id, chat in fake_chats.items():
        if chat["user_id"] == current_user.id:
            user_chats.append({
                "_id": chat_id,
                "chatName": chat["chatName"],
                "createdAt": chat["createdAt"],
                "user": {
                    "_id": str(current_user.id),
                    "firstname": current_user.firstname,
                    "lastname": current_user.lastname
                }
            })
    return user_chats

@router.post("/create")
async def create_chat(
    request: ChatCreateRequest,
    current_user: User = Depends(get_current_user)
):
    """Create a new chat"""
    global chat_counter
    chat_counter += 1
    chat_id = f"chat_{chat_counter}"
    
    new_chat = {
        "chatName": request.chatName,
        "user_id": current_user.id,
        "createdAt": datetime.utcnow().isoformat(),
    }
    
    fake_chats[chat_id] = new_chat
    fake_messages[chat_id] = []
    
    return {
        "chat": {
            "_id": chat_id,
            "chatName": request.chatName,
            "createdAt": new_chat["createdAt"],
            "user": {
                "_id": str(current_user.id),
                "firstname": current_user.firstname,
                "lastname": current_user.lastname
            }
        }
    }

@router.post("/message")
async def send_message(
    request: ChatMessageRequest,
    current_user: User = Depends(get_current_user)
):
    """Send a message in a chat"""
    chat_id = request.chatId
    
    if chat_id not in fake_chats:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    if fake_chats[chat_id]["user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Create user message
    user_message = {
        "_id": f"msg_{len(fake_messages[chat_id]) + 1}",
        "message": request.prompt,
        "type": "user",
        "createdAt": datetime.utcnow().isoformat()
    }
    
    fake_messages[chat_id].append(user_message)
    
    # Get conversation history for context
    conversation_history = fake_messages[chat_id][:-1]  # Exclude the just-added user message
    
    # Generate AI response using Mistral service
    try:
        # Always use general chat functionality
        ai_response = await mistral_service.chat(request.prompt, conversation_history)
            
    except Exception as e:
        # Fallback to simple response if Mistral fails
        ai_response = f"Je suis désolé, je n'ai pas pu traiter votre demande. Erreur: {str(e)}"
    
    # Create bot response
    bot_response = {
        "_id": f"msg_{len(fake_messages[chat_id]) + 1}",
        "message": ai_response,
        "type": "bot", 
        "createdAt": datetime.utcnow().isoformat()
    }
    
    fake_messages[chat_id].append(bot_response)
    
    return {
        "message": {
            "id": bot_response["_id"],
            "text": bot_response["message"],
            "sender": "bot",
            "timestamp": bot_response["createdAt"]
        }
    }

@router.post("/messages")
async def get_chat_messages(
    request: ChatMessagesRequest,
    current_user: User = Depends(get_current_user)
):
    """Get messages for a chat"""
    chat_id = request.chatId
    
    if chat_id not in fake_chats:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    if fake_chats[chat_id]["user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    messages = fake_messages.get(chat_id, [])
    
    return {
        "data": messages
    }

@router.post("/delete")
async def delete_chat(
    request: ChatDeleteRequest,
    current_user: User = Depends(get_current_user)
):
    """Delete a chat"""
    chat_id = request.chatId
    
    if chat_id not in fake_chats:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    if fake_chats[chat_id]["user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    del fake_chats[chat_id]
    if chat_id in fake_messages:
        del fake_messages[chat_id]
    
    return {"message": "Chat deleted successfully"}