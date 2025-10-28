from mistralai.client import MistralClient
from mistralai.models.chat_completion import ChatMessage
from typing import List, Dict, Any
import json
from ..core.config import settings
from ..prompts.templates import PROMPT_TEMPLATES

class MistralService:
    def __init__(self):
        self.client = MistralClient(api_key=settings.MISTRAL_API_KEY)
        self.model = settings.MISTRAL_MODEL

    async def generate_questions(self, mission_description: str) -> List[str]:
        prompt = PROMPT_TEMPLATES["generate_questions"].format(
            mission_description=mission_description
        )
        
        messages = [
            ChatMessage(role="system", content="Tu es un expert en audit qui aide à définir le périmètre exact des missions d'audit. Sois concis et précis."),
            ChatMessage(role="user", content=prompt)
        ]
        
        response = self.client.chat(
            model=self.model,
            messages=messages,
            temperature=0.3
        )
        
        questions = response.choices[0].message.content.strip().split('\n')
        # Nettoyer et filtrer les questions
        cleaned_questions = []
        for q in questions:
            q = q.strip()
            # Retirer la numérotation si présente
            if q and (q[0].isdigit() or q.startswith('-')):
                q = q.lstrip('0123456789.-) ').strip()
            if q:
                cleaned_questions.append(q)
        
        return cleaned_questions[:2]  # Limiter à 2 questions maximum

    async def generate_cadrage(self, mission_description: str, qa_pairs: List[Dict[str, str]]) -> Dict[str, Any]:
        qa_text = "\n".join([f"Q: {qa['question']}\nR: {qa['answer']}" for qa in qa_pairs])
        
        prompt = PROMPT_TEMPLATES["generate_cadrage"].format(
            mission_description=mission_description,
            qa_pairs=qa_text
        )
        
        messages = [
            ChatMessage(role="system", content="Tu es un expert en audit. Génère un cadrage de mission structuré."),
            ChatMessage(role="user", content=prompt)
        ]
        
        response = self.client.chat(
            model=self.model,
            messages=messages,
            temperature=0.3
        )
        
        return self._parse_cadrage_response(response.choices[0].message.content)

    async def generate_checklist(self, cadrage_data: Dict[str, Any]) -> List[Dict[str, str]]:
        prompt = PROMPT_TEMPLATES["generate_checklist"].format(
            cadrage_data=json.dumps(cadrage_data, ensure_ascii=False)
        )
        
        messages = [
            ChatMessage(role="system", content="Tu es un expert en audit ISO 27001. Génère une checklist détaillée."),
            ChatMessage(role="user", content=prompt)
        ]
        
        response = self.client.chat(
            model=self.model,
            messages=messages,
            temperature=0.3
        )
        
        return self._parse_checklist_response(response.choices[0].message.content)

    async def generate_constat(self, vulnerability_description: str, context: Dict[str, Any]) -> Dict[str, Any]:
        prompt = PROMPT_TEMPLATES["generate_constat"].format(
            vulnerability=vulnerability_description,
            context=json.dumps(context, ensure_ascii=False)
        )
        
        messages = [
            ChatMessage(role="system", content="Tu es un expert en audit de sécurité. Génère un constat détaillé."),
            ChatMessage(role="user", content=prompt)
        ]
        
        response = self.client.chat(
            model=self.model,
            messages=messages,
            temperature=0.3
        )
        
        return self._parse_constat_response(response.choices[0].message.content)

    async def generate_synthesis(self, mission_data: Dict[str, Any]) -> str:
        prompt = PROMPT_TEMPLATES["generate_synthesis"].format(
            mission_data=json.dumps(mission_data, ensure_ascii=False)
        )
        
        messages = [
            ChatMessage(role="system", content="Tu es un expert en audit. Génère une synthèse executive."),
            ChatMessage(role="user", content=prompt)
        ]
        
        response = self.client.chat(
            model=self.model,
            messages=messages,
            temperature=0.5
        )
        
        return response.choices[0].message.content
    
    async def chat(self, message: str, conversation_history: List[Dict[str, str]] = None) -> str:
        """General chat method for conversations"""
        messages = [
            ChatMessage(role="system", content="Tu es un assistant IA expert en audit et sécurité informatique. Tu aides les utilisateurs avec leurs questions. Réponds de manière professionnelle et utile.")
        ]
        
        # Add conversation history if provided
        if conversation_history:
            for msg in conversation_history[-10:]:  # Keep last 10 messages for context
                role = "user" if msg.get("type") == "user" else "assistant"
                messages.append(ChatMessage(role=role, content=msg.get("message", "")))
        
        # Add current message
        messages.append(ChatMessage(role="user", content=message))
        
        response = self.client.chat(
            model=self.model,
            messages=messages,
            temperature=0.7
        )
        
        return response.choices[0].message.content.strip()

    def _parse_cadrage_response(self, response: str) -> Dict[str, Any]:
        # Parser la réponse pour extraire les données du cadrage
        lines = response.strip().split('\n')
        cadrage = {
            "domaines": "",
            "processus": "",
            "exclusions": "",
            "referentiels": "",
            "objectifs": []
        }
        
        for line in lines:
            if "domaine" in line.lower():
                cadrage["domaines"] = line.split(':', 1)[1].strip() if ':' in line else ""
            elif "processus" in line.lower():
                cadrage["processus"] = line.split(':', 1)[1].strip() if ':' in line else ""
            elif "exclusion" in line.lower():
                cadrage["exclusions"] = line.split(':', 1)[1].strip() if ':' in line else ""
            elif "référentiel" in line.lower():
                cadrage["referentiels"] = line.split(':', 1)[1].strip() if ':' in line else ""
            elif "objectif" in line.lower() and ':' in line:
                cadrage["objectifs"].append(line.split(':', 1)[1].strip())
        
        return cadrage

    def _parse_checklist_response(self, response: str) -> List[Dict[str, str]]:
        # Parser la réponse pour extraire les items de la checklist
        lines = response.strip().split('\n')
        checklist = []
        
        for line in lines:
            if line.strip() and not line.startswith('#'):
                parts = line.split('|')
                if len(parts) >= 2:
                    checklist.append({
                        "section": parts[0].strip(),
                        "exigence": parts[1].strip(),
                        "assigne_a": "",
                        "conforme": "",
                        "date_maj": ""
                    })
        
        return checklist

    def _parse_constat_response(self, response: str) -> Dict[str, Any]:
        # Parser la réponse pour extraire les données du constat
        lines = response.strip().split('\n')
        constat = {
            "reference": "",
            "intitule": "",
            "entite": "",
            "description": "",
            "criticite": "",
            "normes": "",
            "preuves": "",
            "recommandations": ""
        }
        
        current_field = None
        for line in lines:
            line_lower = line.lower()
            if "référence" in line_lower:
                current_field = "reference"
            elif "intitulé" in line_lower:
                current_field = "intitule"
            elif "entité" in line_lower:
                current_field = "entite"
            elif "description" in line_lower:
                current_field = "description"
            elif "criticité" in line_lower:
                current_field = "criticite"
            elif "norme" in line_lower:
                current_field = "normes"
            elif "preuve" in line_lower:
                current_field = "preuves"
            elif "recommandation" in line_lower:
                current_field = "recommandations"
            
            if current_field and ':' in line:
                value = line.split(':', 1)[1].strip()
                constat[current_field] = value
        
        return constat

mistral_service = MistralService()