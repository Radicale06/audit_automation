from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.platypus.tableofcontents import TableOfContents
from io import BytesIO
from datetime import datetime
from typing import Dict, Any, List

class PDFService:
    
    @staticmethod
    async def generate_ancs_report(mission_data: Dict[str, Any]) -> BytesIO:
        output = BytesIO()
        doc = SimpleDocTemplate(output, pagesize=A4, topMargin=2*cm, bottomMargin=2*cm)
        story = []
        styles = getSampleStyleSheet()
        
        # Styles personnalisés
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Title'],
            fontSize=24,
            textColor=colors.HexColor('#1a1a1a'),
            spaceAfter=30,
            alignment=1  # Centre
        )
        
        heading1_style = ParagraphStyle(
            'CustomHeading1',
            parent=styles['Heading1'],
            fontSize=16,
            textColor=colors.HexColor('#2c3e50'),
            spaceAfter=12,
            spaceBefore=20
        )
        
        heading2_style = ParagraphStyle(
            'CustomHeading2',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#34495e'),
            spaceAfter=10,
            spaceBefore=15
        )
        
        normal_style = ParagraphStyle(
            'CustomNormal',
            parent=styles['Normal'],
            fontSize=11,
            leading=14,
            alignment=4  # Justifié
        )
        
        # Page de garde
        story.append(Spacer(1, 2*inch))
        story.append(Paragraph("RAPPORT D'AUDIT", title_style))
        story.append(Spacer(1, 0.5*inch))
        story.append(Paragraph("Conformité aux normes de sécurité", heading2_style))
        story.append(Spacer(1, 1*inch))
        
        # Informations du rapport
        info_data = [
            ['Entité auditée:', mission_data.get('entite', 'À définir')],
            ['Date de l\'audit:', datetime.now().strftime('%d/%m/%Y')],
            ['Référentiel:', mission_data.get('referentiel', 'ISO 27001')],
            ['Auditeur:', mission_data.get('auditeur', 'À définir')]
        ]
        
        info_table = Table(info_data, colWidths=[4*cm, 8*cm])
        info_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ]))
        story.append(info_table)
        story.append(PageBreak())
        
        # Table des matières
        story.append(Paragraph("TABLE DES MATIÈRES", heading1_style))
        story.append(Spacer(1, 0.5*inch))
        
        toc_data = [
            "1. SYNTHÈSE EXECUTIVE",
            "2. CONTEXTE ET PÉRIMÈTRE",
            "3. MÉTHODOLOGIE",
            "4. CONSTATS D'AUDIT",
            "   4.1 Points forts",
            "   4.2 Non-conformités",
            "   4.3 Observations",
            "5. RECOMMANDATIONS",
            "6. PLAN D'ACTION",
            "7. CONCLUSION"
        ]
        
        for item in toc_data:
            story.append(Paragraph(item, normal_style))
        
        story.append(PageBreak())
        
        # 1. Synthèse Executive
        story.append(Paragraph("1. SYNTHÈSE EXECUTIVE", heading1_style))
        synthesis = mission_data.get('synthesis', 'Synthèse à générer')
        story.append(Paragraph(synthesis, normal_style))
        story.append(Spacer(1, 0.3*inch))
        
        # 2. Contexte et périmètre
        story.append(Paragraph("2. CONTEXTE ET PÉRIMÈTRE", heading1_style))
        story.append(Paragraph("2.1 Contexte de la mission", heading2_style))
        context = mission_data.get('contexte', 'Cette mission d\'audit s\'inscrit dans le cadre de l\'évaluation de conformité aux normes de sécurité de l\'information.')
        story.append(Paragraph(context, normal_style))
        
        story.append(Paragraph("2.2 Périmètre audité", heading2_style))
        perimetre = mission_data.get('perimetre', {})
        perimetre_text = f"""
        <b>Domaines concernés:</b> {perimetre.get('domaines', 'À définir')}<br/>
        <b>Processus inclus:</b> {perimetre.get('processus', 'À définir')}<br/>
        <b>Exclusions:</b> {perimetre.get('exclusions', 'Aucune')}<br/>
        <b>Référentiels:</b> {perimetre.get('referentiels', 'ISO 27001')}
        """
        story.append(Paragraph(perimetre_text, normal_style))
        story.append(Spacer(1, 0.3*inch))
        
        # 3. Méthodologie
        story.append(Paragraph("3. MÉTHODOLOGIE", heading1_style))
        methodologie = """
        L'audit a été réalisé selon les phases suivantes:
        • Analyse documentaire
        • Entretiens avec les parties prenantes
        • Tests techniques et contrôles
        • Analyse des écarts
        • Formulation des recommandations
        """
        story.append(Paragraph(methodologie, normal_style))
        story.append(Spacer(1, 0.3*inch))
        
        # 4. Constats d'audit
        story.append(Paragraph("4. CONSTATS D'AUDIT", heading1_style))
        
        # Tableau récapitulatif des constats
        constats = mission_data.get('constats', [])
        if constats:
            constat_data = [['Réf.', 'Intitulé', 'Criticité', 'Clause ISO']]
            for c in constats:
                constat_data.append([
                    c.get('reference', ''),
                    c.get('intitule', ''),
                    c.get('criticite', ''),
                    c.get('normes', '')
                ])
            
            constat_table = Table(constat_data, colWidths=[2*cm, 8*cm, 3*cm, 3*cm])
            constat_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            story.append(constat_table)
        
        story.append(PageBreak())
        
        # Détail des constats
        for i, constat in enumerate(constats, 1):
            story.append(Paragraph(f"4.{i} Constat {constat.get('reference', '')}", heading2_style))
            detail_text = f"""
            <b>Intitulé:</b> {constat.get('intitule', '')}<br/>
            <b>Description:</b> {constat.get('description', '')}<br/>
            <b>Criticité:</b> {constat.get('criticite', '')}<br/>
            <b>Preuves:</b> {constat.get('preuves', '')}<br/>
            <b>Recommandations:</b> {constat.get('recommandations', '')}
            """
            story.append(Paragraph(detail_text, normal_style))
            story.append(Spacer(1, 0.2*inch))
        
        # 5. Recommandations
        story.append(Paragraph("5. RECOMMANDATIONS", heading1_style))
        recommendations = mission_data.get('recommendations', [])
        for i, rec in enumerate(recommendations, 1):
            story.append(Paragraph(f"{i}. {rec}", normal_style))
        story.append(Spacer(1, 0.3*inch))
        
        # 6. Plan d'action
        story.append(Paragraph("6. PLAN D'ACTION", heading1_style))
        story.append(Paragraph("Un plan d'action détaillé devra être établi pour traiter les non-conformités identifiées.", normal_style))
        
        # 7. Conclusion
        story.append(Paragraph("7. CONCLUSION", heading1_style))
        conclusion = mission_data.get('conclusion', 'L\'audit a permis d\'identifier les points d\'amélioration nécessaires pour renforcer la conformité.')
        story.append(Paragraph(conclusion, normal_style))
        
        # Générer le PDF
        doc.build(story)
        output.seek(0)
        return output

pdf_service = PDFService()