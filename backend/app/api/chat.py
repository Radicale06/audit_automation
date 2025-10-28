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
    """Format cadrage data as HTML table with download button"""
    html = f"""
    <div class="audit-table-container">
    <h3>📋 Cadrage de Mission d'Audit</h3>
    <table border="1" style="border-collapse: collapse; width: 100%; margin: 10px 0;">
        <thead>
            <tr style="background-color: #f8f9fa;">
                <th style="padding: 12px; border: 1px solid #dee2e6;">Champ</th>
                <th style="padding: 12px; border: 1px solid #dee2e6;">Détail</th>
            </tr>
        </thead>
        <tbody>
            <tr><td style="padding: 12px; border: 1px solid #dee2e6;"><strong>Domaine(s) concerné(s)</strong></td><td style="padding: 12px; border: 1px solid #dee2e6;">{cadrage_data.get('domaines', '')}</td></tr>
            <tr><td style="padding: 12px; border: 1px solid #dee2e6;"><strong>Processus inclus</strong></td><td style="padding: 12px; border: 1px solid #dee2e6;">{cadrage_data.get('processus', '')}</td></tr>
            <tr><td style="padding: 12px; border: 1px solid #dee2e6;"><strong>Exclusions éventuelles</strong></td><td style="padding: 12px; border: 1px solid #dee2e6;">{cadrage_data.get('exclusions', '')}</td></tr>
            <tr><td style="padding: 12px; border: 1px solid #dee2e6;"><strong>Référentiels pris en compte</strong></td><td style="padding: 12px; border: 1px solid #dee2e6;">{cadrage_data.get('referentiels', 'ISO 27001, ANCS')}</td></tr>
    """
    
    for i, objectif in enumerate(cadrage_data.get('objectifs', []), 1):
        html += f'<tr><td style="padding: 12px; border: 1px solid #dee2e6;"><strong>Objectif {i}</strong></td><td style="padding: 12px; border: 1px solid #dee2e6;">{objectif}</td></tr>'
    
    html += """
        </tbody>
    </table>
    <button onclick="downloadExcel('cadrage')" style="margin-top: 10px; padding: 8px 16px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">
        📊 Télécharger Cadrage Excel
    </button>
    </div>
    """
    return html

def get_cadrage_from_history(conversation_history: List[Dict]) -> Dict[str, Any]:
    """Extract cadrage data from conversation history"""
    # Look for cadrage data in bot messages
    for msg in conversation_history:
        if msg["type"] == "bot" and "Cadrage" in msg["message"]:
            # Extract data from previous cadrage if available
            return {"mission": "Audit de sécurité", "scope": "Systèmes informatiques"}
    return {"mission": "Audit de sécurité informatique", "scope": "Infrastructure IT"}

def format_checklist_response(checklist: List[Dict[str, str]]) -> str:
    """Format checklist as HTML table with download button"""
    html = """
    <div class="audit-table-container">
    <h3>✅ Checklist d'Audit ISO 27001</h3>
    <table border="1" style="border-collapse: collapse; width: 100%; margin: 10px 0;">
        <thead>
            <tr style="background-color: #e9ecef;">
                <th style="padding: 12px; border: 1px solid #dee2e6;">Section</th>
                <th style="padding: 12px; border: 1px solid #dee2e6;">Exigence</th>
                <th style="padding: 12px; border: 1px solid #dee2e6;">Assigné à</th>
                <th style="padding: 12px; border: 1px solid #dee2e6;">Conforme</th>
                <th style="padding: 12px; border: 1px solid #dee2e6;">Date MAJ</th>
            </tr>
        </thead>
        <tbody>
    """
    
    for item in checklist:
        html += f"""
        <tr>
            <td style="padding: 12px; border: 1px solid #dee2e6;">{item.get('section', '')}</td>
            <td style="padding: 12px; border: 1px solid #dee2e6;">{item.get('exigence', '')}</td>
            <td style="padding: 12px; border: 1px solid #dee2e6;">{item.get('assigne_a', '')}</td>
            <td style="padding: 12px; border: 1px solid #dee2e6;">{item.get('conforme', '')}</td>
            <td style="padding: 12px; border: 1px solid #dee2e6;">{item.get('date_maj', '')}</td>
        </tr>
        """
    
    html += """
        </tbody>
    </table>
    <button onclick="downloadExcel('checklist')" style="margin-top: 10px; padding: 8px 16px; background-color: #17a2b8; color: white; border: none; border-radius: 4px; cursor: pointer;">
        📋 Télécharger Checklist Excel
    </button>
    </div>
    """
    return html

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
    """Format vulnerability finding as HTML table with download button"""
    criticite_color = {
        "Critique": "🔴",
        "Majeure": "🟠", 
        "Mineure": "🟡",
        "Observation": "🔵"
    }
    
    color = criticite_color.get(constat_data.get('criticite', ''), '🟡')
    
    html = f"""
    <div class="audit-table-container">
    <h3>🔍 Constat d'Audit</h3>
    <table border="1" style="border-collapse: collapse; width: 100%; margin: 10px 0;">
        <thead>
            <tr style="background-color: #f8f9fa;">
                <th style="padding: 12px; border: 1px solid #dee2e6;">Champ</th>
                <th style="padding: 12px; border: 1px solid #dee2e6;">Détail</th>
            </tr>
        </thead>
        <tbody>
            <tr><td style="padding: 12px; border: 1px solid #dee2e6;"><strong>Référence du constat</strong></td><td style="padding: 12px; border: 1px solid #dee2e6;">{constat_data.get('reference', '')}</td></tr>
            <tr><td style="padding: 12px; border: 1px solid #dee2e6;"><strong>Intitulé du constat</strong></td><td style="padding: 12px; border: 1px solid #dee2e6;">{constat_data.get('intitule', '')}</td></tr>
            <tr><td style="padding: 12px; border: 1px solid #dee2e6;"><strong>Entité auditée</strong></td><td style="padding: 12px; border: 1px solid #dee2e6;">{constat_data.get('entite', '')}</td></tr>
            <tr><td style="padding: 12px; border: 1px solid #dee2e6;"><strong>Description du constat</strong></td><td style="padding: 12px; border: 1px solid #dee2e6;">{constat_data.get('description', '')}</td></tr>
            <tr><td style="padding: 12px; border: 1px solid #dee2e6;"><strong>Criticité</strong></td><td style="padding: 12px; border: 1px solid #dee2e6;"><strong>{color} {constat_data.get('criticite', '')}</strong></td></tr>
            <tr><td style="padding: 12px; border: 1px solid #dee2e6;"><strong>Norme(s) de référence</strong></td><td style="padding: 12px; border: 1px solid #dee2e6;">{constat_data.get('normes', '')}</td></tr>
            <tr><td style="padding: 12px; border: 1px solid #dee2e6;"><strong>Preuves</strong></td><td style="padding: 12px; border: 1px solid #dee2e6;">{constat_data.get('preuves', '')}</td></tr>
            <tr><td style="padding: 12px; border: 1px solid #dee2e6;"><strong>Recommandations</strong></td><td style="padding: 12px; border: 1px solid #dee2e6;">{constat_data.get('recommandations', '')}</td></tr>
        </tbody>
    </table>
    <button onclick="downloadExcel('constat')" style="margin-top: 10px; padding: 8px 16px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">
        🔍 Télécharger Constat Excel
    </button>
    </div>
    """
    return html

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
    """Generate final ANCS report in PDF format"""
    today = datetime.utcnow().strftime("%d/%m/%Y")
    
    report = f"""
    <div class="ancs-report">
    <h1>📄 RAPPORT D'AUDIT DE SÉCURITÉ</h1>
    <h2>Conforme aux normes ANCS</h2>
    
    <h3>1. CONTEXTE ET PÉRIMÈTRE</h3>
    <p><strong>Mission :</strong> {mission_data.get('mission_description', 'Audit de sécurité informatique')}</p>
    <p><strong>Périmètre :</strong> {mission_data.get('scope', 'Infrastructure informatique')}</p>
    <p><strong>Date d'audit :</strong> {today}</p>
    <p><strong>Référentiels :</strong> ISO 27001:2022, ANCS</p>
    
    <h3>2. MÉTHODOLOGIE</h3>
    <ul>
        <li>Analyse documentaire</li>
        <li>Entretiens avec les équipes</li>
        <li>Tests techniques</li>
        <li>Vérification de conformité</li>
    </ul>
    
    <h3>3. SYNTHÈSE DES CONSTATS</h3>
    <p><strong>Nombre de constats identifiés :</strong> {len(mission_data.get('findings', []))}</p>
    
    <h3>4. RECOMMANDATIONS PRIORITAIRES</h3>
    <ul>
        <li>Renforcer la gestion des accès privilégiés</li>
        <li>Améliorer la surveillance de la sécurité</li>
        <li>Mettre à jour les politiques de sécurité</li>
    </ul>
    
    <h3>5. PLAN D'ACTION</h3>
    <p>Les actions correctives doivent être mises en œuvre selon les priorités définies.</p>
    
    <hr>
    <p><strong>Date du rapport :</strong> {today}</p>
    <p><strong>Référence :</strong> AUDIT-SEC-2025-001</p>
    
    <button onclick="downloadPDF('rapport')" style="margin-top: 20px; padding: 10px 20px; background-color: #6f42c1; color: white; border: none; border-radius: 4px; cursor: pointer;">
        📄 Télécharger Rapport PDF
    </button>
    </div>
    """
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
    
    # Determine audit phase based on user input and conversation history
    audit_phase = determine_audit_phase(request.prompt, conversation_history)
    
    # Generate AI response using appropriate Mistral service method based on phase
    try:
        if audit_phase == "questions":
            # Step 2: Generate pertinent questions about scope
            ai_response = await mistral_service.generate_questions(request.prompt)
            
        elif audit_phase == "cadrage":
            # Step 4: Generate mission scoping (Excel format)
            qa_pairs = extract_qa_pairs_from_history(conversation_history)
            cadrage_data = await mistral_service.generate_cadrage(
                mission_description=get_initial_mission_description(conversation_history),
                qa_pairs=qa_pairs
            )
            ai_response = format_cadrage_response(cadrage_data)
            
        elif audit_phase == "checklist":
            # Step 6: Generate global checklist
            cadrage_data = get_cadrage_from_history(conversation_history)
            checklist = await mistral_service.generate_checklist(cadrage_data)
            ai_response = format_checklist_response(checklist)
            
        elif audit_phase == "constat":
            # Step 7: Generate vulnerability finding (Excel format)
            context = get_mission_context_from_history(conversation_history)
            constat_data = await mistral_service.generate_constat(request.prompt, context)
            ai_response = format_constat_response(constat_data)
            
        elif audit_phase == "synthesis":
            # Step 9: Generate synthesis of whole mission
            mission_data = compile_mission_data_from_history(conversation_history)
            ai_response = await mistral_service.generate_synthesis(mission_data)
            
        elif audit_phase == "rapport":
            # Step 10: Generate final ANCS report (PDF format)
            mission_data = compile_mission_data_from_history(conversation_history)
            ai_response = generate_ancs_report(mission_data)
            
        else:
            # Default: General chat or initial mission description
            ai_response = "Bonjour ! Je suis votre assistant d'audit. Pour commencer, pouvez-vous me donner une description générale de votre mission d'audit ?"
            
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