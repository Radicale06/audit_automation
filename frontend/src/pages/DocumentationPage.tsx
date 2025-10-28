import React from 'react';
import { Book, CheckCircle, History, Brain, Database, HelpCircle } from 'lucide-react';

const DocumentationPage = () => {
  const sections = [
    {
      title: 'Fonctionnalités principales',
      icon: CheckCircle,
      items: [
        { title: 'Interaction intelligente', description: 'Posez vos questions en langage naturel et obtenez des réponses précises.' },
        { title: 'Génération de checklist', description: 'Création automatique de checklists d\'audit basées sur la norme ISO/IEC 27001.' },
        { title: 'Historique des conversations', description: 'Suivi des échanges pour référence future.' }
      ]
    },
    {
      title: 'Architecture technique',
      icon: Database,
      items: [
        { title: 'Frontend', description: 'Interface web intuitive développée en React.' },
        { title: 'Backend', description: 'Serveur Node.js pour la gestion des requêtes et des conversations.' },
        { title: 'IA', description: 'Modèle LLM intégré avec technologie RAG.' }
      ]
    },
    {
      title: 'Guide utilisateur',
      icon: Book,
      items: [
        { title: 'Étape 1', description: 'Connectez-vous avec vos identifiants professionnels.' },
        { title: 'Étape 2', description: 'Posez une question ou sélectionnez un type d\'audit.' },
        { title: 'Étape 3', description: 'Recevez des recommandations et la checklist associée.' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Documentation du Chatbot IA pour Auditeurs
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Guide complet pour utiliser efficacement notre assistant IA dédié aux audits de sécurité
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sections.map((section, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <section.icon className="h-6 w-6 text-blue-500 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {section.title}
                </h2>
              </div>
              <div className="space-y-4">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="border-l-2 border-blue-500 pl-4">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DocumentationPage;
