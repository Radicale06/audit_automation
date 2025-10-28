import { useNavigate } from 'react-router-dom';
import { ChevronRight, ClipboardList, Bot, FileSpreadsheet, ShieldCheck, Star, HelpCircle } from 'lucide-react';
import ParticlesBackground from '../components/ParticlesBackground';
import BackToDashboard from '../components/BackToDashboard';
import '../styles/effects.css';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: ClipboardList,
      title: 'Création de mission',
      description: 'Définir le périmètre, les objectifs et les référentiels de votre audit.'
    },
    {
      icon: Bot,
      title: 'Assistant IA',
      description: 'Analyse intelligente pour générer checklists, constats et plans d\'action.'
    },
    {
      icon: FileSpreadsheet,
      title: 'Rapports & Synthèses',
      description: 'Génération automatique de rapports personnalisés et synthèses claires.'
    },
    {
      icon: ShieldCheck,
      title: 'Conformité Normative',
      description: 'Vérification du respect des standards ISO, NIST et RGPD.'
    }
  ];

  const stats = [
    { number: '500+', label: 'Audits réalisés' },
    { number: '98%', label: 'Taux de satisfaction' },
    { number: '24/7', label: 'Support disponible' },
    { number: '50+', label: 'Référentiels intégrés' }
  ];

  const testimonials = [
    {
      quote: "L'assistant IA a révolutionné notre façon de mener les audits de sécurité.",
      author: "Marie D.",
      role: "RSSI, Entreprise Fortune 500"
    },
    {
      quote: "Un gain de temps considérable dans la génération des rapports.",
      author: "Thomas B.",
      role: "Auditeur Senior"
    }
  ];

  const faqs = [
    {
      question: "Comment fonctionne l'assistant IA ?",
      answer: "Notre IA analyse vos besoins et génère automatiquement des checklists personnalisées basées sur les meilleures pratiques du secteur."
    },
    {
      question: "Les rapports sont-ils personnalisables ?",
      answer: "Oui, tous les rapports peuvent être adaptés à votre charte graphique et à vos besoins spécifiques."
    }
  ];

  return (
    <div className="relative min-h-screen bg-navy-900 text-white overflow-hidden">
      <div style={{ zIndex: -1, position: 'absolute', width: '100%', height: '100%' }}>
        <ParticlesBackground />
      </div>

      {localStorage.getItem('isLoggedIn') && <BackToDashboard />}

      <div className="relative z-10">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <img src="/logo.png" alt="HAT Security" className="h-8 w-8" />
              </div>
              <span className="text-xl font-bold">HAT Security AI</span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2.5 rounded-lg border border-white/20 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-glow-white"
              >
                Se connecter
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 hover:scale-105 hover:shadow-glow-blue"
              >
                S'inscrire
              </button>
            </div>
          </div>
        </nav>

        <main className="container mx-auto px-6">
          <div className="min-h-[calc(100vh-80px)] flex flex-col">
            {/* Hero Section */}
            <div className="max-w-3xl mb-32">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight animate-float">
                Optimisez vos audits de sécurité grâce à un{' '}
                <span className="text-gradient">assistant intelligent</span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl">
                Définissez le périmètre, générez des checklists et rapports automatiquement, 
                et renforcez la sécurité de vos systèmes.
              </p>
            </div>

            {/* Stats Section */}
            <div className="py-16 border-t border-b border-white/10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center p-6 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
                    <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-3">{stat.number}</div>
                    <div className="text-gray-300 font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Features Grid */}
            <div className="mt-24 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="glass-card p-8 backdrop-blur-lg border border-white/10 hover:border-blue-500/30 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-glow-blue group"
                >
                  <feature.icon className="h-12 w-12 text-blue-500 mb-4 group-hover:text-blue-400 transition-colors" />
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-blue-400 transition-colors">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </div>
              ))}
            </div>

            {/* Testimonials */}
            <div className="mt-32">
              <h2 className="text-3xl font-bold mb-12 text-center">Ce qu'en disent nos clients</h2>
              <div className="grid md:grid-cols-2 gap-8">
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="glass-card p-8 backdrop-blur-lg border border-white/10 hover:border-yellow-500/30 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-glow-yellow group">
                    <Star className="text-yellow-500 h-8 w-8 mb-4 group-hover:text-yellow-400 transition-colors" />
                    <p className="text-lg mb-4 italic leading-relaxed">"{testimonial.quote}"</p>
                    <div className="text-sm text-gray-300">
                      <div className="font-semibold group-hover:text-yellow-400 transition-colors">{testimonial.author}</div>
                      <div className="opacity-75">{testimonial.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ Section */}
            <div className="mt-32">
              <h2 className="text-3xl font-bold mb-12 text-center">Questions fréquentes</h2>
              <div className="grid md:grid-cols-2 gap-8">
                {faqs.map((faq, index) => (
                  <div key={index} className="glass-card p-8 backdrop-blur-lg border border-white/10 hover:border-blue-500/30 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 group">
                    <div className="flex items-start">
                      <div className="p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                        <HelpCircle className="h-6 w-6 text-blue-400 group-hover:text-blue-300 transition-colors" />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-semibold mb-3 text-lg group-hover:text-blue-400 transition-colors">{faq.question}</h3>
                        <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <footer className="mt-32 border-t border-white/10">
              <div className="container mx-auto px-6 py-12">
                <div className="grid md:grid-cols-4 gap-8">
                  <div>
                    <h4 className="font-bold mb-4">À propos</h4>
                    <p className="text-sm text-gray-400">
                      HAT Security AI aide les entreprises à sécuriser leurs systèmes grâce à l'intelligence artificielle.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold mb-4">Liens rapides</h4>
                    <ul className="space-y-2 text-sm">
                      <li><a href="#" className="text-gray-400 hover:text-white">Documentation</a></li>
                      <li><a href="#" className="text-gray-400 hover:text-white">Tarifs</a></li>
                      <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold mb-4">Légal</h4>
                    <ul className="space-y-2 text-sm">
                      <li><a href="#" className="text-gray-400 hover:text-white">Conditions</a></li>
                      <li><a href="#" className="text-gray-400 hover:text-white">Confidentialité</a></li>
                      <li><a href="#" className="text-gray-400 hover:text-white">Cookies</a></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold mb-4">Contact</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="text-gray-400">contact@hatsecurity.com</li>
                      <li className="text-gray-400">+216 28 11 73 51</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-gray-400">
                  © 2024 HAT Security AI. Tous droits réservés.
                </div>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LandingPage;