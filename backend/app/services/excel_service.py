import pandas as pd
from io import BytesIO
from typing import List, Dict, Any
import os
from datetime import datetime

class ExcelService:
    
    @staticmethod
    async def generate_cadrage_excel(cadrage_data: Dict[str, Any]) -> BytesIO:
        # Créer un DataFrame pour le cadrage
        data = {
            'Champ': [
                'Domaine(s) concerné(s)',
                'Processus inclus',
                'Exclusions éventuelles',
                'Référentiels pris en compte'
            ],
            'Détail à compléter': [
                cadrage_data.get('domaines', ''),
                cadrage_data.get('processus', ''),
                cadrage_data.get('exclusions', ''),
                cadrage_data.get('referentiels', '')
            ]
        }
        
        # Ajouter les objectifs
        objectifs = cadrage_data.get('objectifs', [])
        for i, obj in enumerate(objectifs, 1):
            data['Champ'].append(f'Objectif {i}')
            data['Détail à compléter'].append(obj)
        
        df = pd.DataFrame(data)
        
        # Créer le fichier Excel
        output = BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            # Ajouter le titre
            title_df = pd.DataFrame([['Trame – Étape 1 : Cadrage de la mission d\'audit']])
            title_df.to_excel(writer, sheet_name='Cadrage', index=False, header=False)
            
            # Ajouter le contenu principal
            df.to_excel(writer, sheet_name='Cadrage', index=False, startrow=2)
            
            # Formater le fichier
            worksheet = writer.sheets['Cadrage']
            worksheet.column_dimensions['A'].width = 30
            worksheet.column_dimensions['B'].width = 50
        
        output.seek(0)
        return output

    @staticmethod
    async def generate_checklist_excel(checklist_data: List[Dict[str, str]]) -> BytesIO:
        # Créer le DataFrame pour la checklist
        df = pd.DataFrame(checklist_data)
        
        # Réorganiser les colonnes
        columns = ['section', 'exigence', 'assigne_a', 'conforme', 'date_maj']
        column_names = {
            'section': 'SECTION/CATÉGORIE',
            'exigence': 'EXIGENCES/TÂCHES',
            'assigne_a': 'ATTRIBUÉ À',
            'conforme': 'EN CONFORMITÉ ?',
            'date_maj': 'DATE DE LA DERNIÈRE MISE À JOUR'
        }
        
        df = df[columns]
        df.rename(columns=column_names, inplace=True)
        
        # Créer le fichier Excel
        output = BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            # Ajouter le titre
            title_df = pd.DataFrame([['MODÈLE DE LISTE DE VÉRIFICATION POUR LES CONTRÔLES ISO 27001']])
            title_df.to_excel(writer, sheet_name='Checklist', index=False, header=False)
            
            # Ajouter le contenu
            df.to_excel(writer, sheet_name='Checklist', index=False, startrow=2)
            
            # Formater
            worksheet = writer.sheets['Checklist']
            worksheet.column_dimensions['A'].width = 35
            worksheet.column_dimensions['B'].width = 50
            worksheet.column_dimensions['C'].width = 20
            worksheet.column_dimensions['D'].width = 15
            worksheet.column_dimensions['E'].width = 25
        
        output.seek(0)
        return output

    @staticmethod
    async def generate_constat_excel(constat_data: Dict[str, Any]) -> BytesIO:
        # Créer le DataFrame pour le constat
        data = {
            'Champ': [
                'Référence du constat',
                'Intitulé du constat',
                'Entité auditée',
                'Description du constat',
                'Criticité',
                'Norme(s) de référence',
                'Preuves',
                'Recommandations'
            ],
            'Détail': [
                constat_data.get('reference', ''),
                constat_data.get('intitule', ''),
                constat_data.get('entite', ''),
                constat_data.get('description', ''),
                constat_data.get('criticite', ''),
                constat_data.get('normes', ''),
                constat_data.get('preuves', ''),
                constat_data.get('recommandations', '')
            ]
        }
        
        df = pd.DataFrame(data)
        
        # Créer le fichier Excel
        output = BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            # Ajouter le titre
            title_df = pd.DataFrame([['FICHE DE CONSTAT D\'AUDIT']])
            title_df.to_excel(writer, sheet_name='Constat', index=False, header=False)
            
            # Ajouter le contenu
            df.to_excel(writer, sheet_name='Constat', index=False, startrow=2)
            
            # Formater
            worksheet = writer.sheets['Constat']
            worksheet.column_dimensions['A'].width = 30
            worksheet.column_dimensions['B'].width = 60
            
            # Ajouter le total à la fin
            total_row = len(df) + 4
            worksheet.cell(row=total_row, column=1, value='Total')
            worksheet.cell(row=total_row, column=2, value=len(data['Champ']))
        
        output.seek(0)
        return output

excel_service = ExcelService()