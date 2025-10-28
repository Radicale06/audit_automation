PROMPT_TEMPLATES = {
    "generate_questions": """
En tant qu'expert en audit, tu dois générer UNIQUEMENT 2-3 questions essentielles et précises pour clarifier le périmètre de la mission suivante :

Description de la mission : {mission_description}

Génère EXACTEMENT 2 questions combinées qui couvrent :
1. Les systèmes/actifs concernés ET les processus à inclure/exclure
2. Les référentiels souhaités (ISO 27001, ANCS, NIST, etc.)

Format : Une question directe par ligne. Sois concis et précis.

Exemple de questions attendues :
1. Quels sont les systèmes ou actifs concernés et quels processus souhaitez-vous inclure ou exclure ?
2. Quels référentiels souhaitez-vous appliquer (ISO 27001, normes ANCS, NIST CSF, autres) ?
""",

    "generate_cadrage": """
Sur la base des informations suivantes, génère un cadrage de mission d'audit structuré :

Description initiale : {mission_description}

Questions et réponses :
{qa_pairs}

Le cadrage doit suivre exactement cette structure :
- Domaine(s) concerné(s): [à compléter]
- Processus inclus: [à compléter]
- Exclusions éventuelles: [à compléter]
- Référentiels pris en compte: [à compléter]
- Objectif 1: Vérifier [à compléter]
- Objectif 2: Identifier [à compléter]
- Objectif 3: Évaluer [à compléter]
- Objectif 4: Recommander [à compléter]

Sois précis et professionnel.
""",

    "generate_checklist": """
En te basant sur le cadrage de mission suivant, génère une checklist d'audit détaillée selon la norme ISO 27001 :

{cadrage_data}

La checklist doit couvrir les sections pertinentes parmi :
- 5. Politiques de sécurité de l'information
- 6. Organisation de la sécurité de l'information
- 7. Sécurité des ressources humaines
- 8. Gestion des actifs
- 9. Contrôle d'accès
- 10. Cryptographie
- 11. Sécurité physique et environnementale
- 12. Sécurité liée à l'exploitation
- 13. Sécurité des communications
- 14. Acquisition, développement et maintenance des systèmes
- 15. Relations avec les fournisseurs
- 16. Gestion des incidents
- 17. Continuité de l'activité
- 18. Conformité

Format : Section/Catégorie | Exigence/Tâche
Génère au moins 20 points de contrôle pertinents.
""",

    "generate_constat": """
Génère un constat d'audit détaillé pour la vulnérabilité suivante :

Vulnérabilité : {vulnerability}
Contexte de la mission : {context}

Le constat doit inclure :
- Référence du constat: [Code unique]
- Intitulé du constat: [Titre concis]
- Entité auditée: [Nom de l'entité]
- Description du constat: [Description détaillée]
- Criticité: [Critique/Majeure/Mineure/Observation]
- Norme(s) de référence: [ISO 27001 clauses applicables]
- Preuves: [Éléments de preuve collectés]
- Recommandations: [Actions correctives suggérées]

Sois précis et utilise un langage professionnel d'audit.
""",

    "generate_synthesis": """
Sur la base de l'ensemble de la mission d'audit suivante, rédige une synthèse executive :

{mission_data}

La synthèse doit inclure :
1. Contexte et périmètre de la mission
2. Méthodologie appliquée
3. Principaux constats (points forts et faiblesses)
4. Niveau de conformité global
5. Recommandations prioritaires
6. Conclusion

Longueur : 300-500 mots
Ton : Professionnel et objectif
"""
}