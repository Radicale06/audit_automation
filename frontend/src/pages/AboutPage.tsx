import React from 'react';
import { Target, Code, Shield, Users, Brain, Lock } from 'lucide-react';
import UserSession from '../components/UserSession';

const AboutPage = () => {
  const values = [
    {
      icon: Brain,
      title: 'Innovation',
      description: 'Intégration continue des dernières avancées en IA'
    },
    {
      icon: Shield,
      title: 'Fiabilité',
      description: 'Réponses précises et recommandations validées'
    },
    {
      icon: Users,
      title: 'Accessibilité',
      description: 'Outil utilisable même par les non-experts'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-end px-6 py-4">
        <UserSession />
      </div>
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            À propos de HAT Security
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Notre mission est de fournir un support intelligent et précis aux auditeurs en cybersécurité
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Notre Vision
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Faciliter l'audit ISO/IEC 27001 grâce à l'intelligence artificielle et à une interface intuitive, 
              même pour les utilisateurs non experts en sécurité.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Notre Technologie
            </h2>
            <ul className="space-y-4">
              <li className="flex items-start">
                <Code className="h-6 w-6 text-blue-500 mr-2 mt-1" />
                <span className="text-gray-600 dark:text-gray-400">
                  Modèles LLM pour la compréhension du langage naturel
                </span>
              </li>
              <li className="flex items-start">
                <Brain className="h-6 w-6 text-blue-500 mr-2 mt-1" />
                <span className="text-gray-600 dark:text-gray-400">
                  RAG pour combiner connaissances internes et externes
                </span>
              </li>
              <li className="flex items-start">
                <Lock className="h-6 w-6 text-blue-500 mr-2 mt-1" />
                <span className="text-gray-600 dark:text-gray-400">
                  Base de données vectorielle pour un accès rapide et sécurisé
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
              <value.icon className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {value.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
