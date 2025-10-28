import { useState, useEffect, useCallback } from 'react';
import { AreaChart, BarList, DonutChart, Select, SelectItem, BarChart } from '@tremor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { StatsCard } from '../components/ui/StatsCard';
import { ChartCard } from '../components/ui/ChartCard';
import { FilterBar } from '../components/ui/FilterBar';
import ParticlesBackground from '../components/ParticlesBackground';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { ScrollToTop } from '../components/ui/ScrollToTop';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../hooks/useTheme';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useUserProfile } from '../context/UserProfileContext';
import UserSession from '../components/UserSession';
import '../styles/dashboard.css';
import '../styles/dashboard-pro.css';
import '../styles/loading-effects.css';
import '../styles/modern-dashboard.css';
import { cn } from '../components/LoadingSpinner';

interface FilterState {
  dateRange: string;
  category: string;
  status: string;
}

const chartdata = [
  { date: 'Jan 2024', "Utilisation IA": 75, "Performance": 82 },
  { date: 'Fév 2024', "Utilisation IA": 78, "Performance": 85 },
  { date: 'Mars 2024', "Utilisation IA": 82, "Performance": 88 },
  { date: 'Avr 2024', "Utilisation IA": 85, "Performance": 90 },
  { date: 'Mai 2024', "Utilisation IA": 88, "Performance": 92 },
];

const satisfactionData = [
  { rating: 5, count: 45, label: "Très satisfait 😃" },
  { rating: 4, count: 30, label: "Satisfait 🙂" },
  { rating: 3, count: 15, label: "Neutre 😐" },
  { rating: 2, count: 7, label: "Insatisfait ☹️" },
  { rating: 1, count: 3, label: "Très insatisfait 😤" },
];

const performanceData = [
  { name: 'Taux d\'Erreurs IA', value: 8 },
  { name: 'Amélioration Continue', value: 92 },
  { name: 'Précision Rapports', value: 95 },
  { name: 'Satisfaction Auditeur', value: 88 },
];

const checklistData = [
  { month: 'Jan', "Checklists": 45, "Plans d'action": 38 },
  { month: 'Fév', "Checklists": 52, "Plans d'action": 43 },
  { month: 'Mars', "Checklists": 58, "Plans d'action": 50 },
  { month: 'Avr', "Checklists": 63, "Plans d'action": 55 },
  { month: 'Mai', "Checklists": 70, "Plans d'action": 65 },
];

const conformityData = {
  value: 87,
  target: 95,
  categories: [
    { name: 'Conforme', value: 87 },
    { name: 'Non-conforme', value: 13 },
  ]
};

const adoptionTrendData = [
  { date: 'T1 2024', "Utilisation": 65, "Formation": 78, "Satisfaction": 72 },
  { date: 'T2 2024', "Utilisation": 72, "Formation": 82, "Satisfaction": 76 },
  { date: 'T3 2024', "Utilisation": 78, "Formation": 85, "Satisfaction": 81 },
  { date: 'T4 2024', "Utilisation": 85, "Formation": 88, "Satisfaction": 86 },
];

const aiPerformanceTrendData = [
  { 
    date: 'S1 2024', 
    "Précision IA": 92,
    "Taux de Détection": 88,
    "Vitesse Traitement": 95,
    trend: 91.6
  },
  { 
    date: 'S2 2024', 
    "Précision IA": 93,
    "Taux de Détection": 90,
    "Vitesse Traitement": 96,
    trend: 93
  },
  { 
    date: 'S3 2024', 
    "Précision IA": 94,
    "Taux de Détection": 91,
    "Vitesse Traitement": 97,
    trend: 94
  },
  { 
    date: 'S4 2024', 
    "Précision IA": 96,
    "Taux de Détection": 93,
    "Vitesse Traitement": 98,
    trend: 95.6
  }
];

const dateRanges = [
  { value: '7d', label: '7 derniers jours' },
  { value: '30d', label: '30 derniers jours' },
  { value: '90d', label: '90 derniers jours' },
  { value: 'year', label: 'Cette année' },
];

const recentActivities = [
  { id: 1, type: 'message', user: 'Sophie Martin', action: 'a envoyé un nouveau message', time: 'il y a 2 min', avatar: 'https://ui-avatars.com/api/?name=Sophie+Martin' },
  { id: 2, type: 'alert', user: 'Système', action: 'maintenance prévue dans 24h', time: 'il y a 5 min', icon: '⚠️' },
  { id: 3, type: 'update', user: 'Marc Dubois', action: 'a mis à jour son profil', time: 'il y a 10 min', avatar: 'https://ui-avatars.com/api/?name=Marc+Dubois' },
];

const DashboardPage = () => {
  const { showToast } = useToast();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUserProfile();
  const [selectedRange, setSelectedRange] = useState('30d');
  const [isKeyboardHelpVisible, setIsKeyboardHelpVisible] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<number>(300000); // 5 minutes
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [exportLoading, setExportLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showActivityFeed, setShowActivityFeed] = useState(false);

  useKeyboardShortcuts([
    {
      key: '/',
      handler: () => setIsKeyboardHelpVisible(true),
      description: 'Afficher les raccourcis clavier',
    },
    {
      key: 'Escape',
      handler: () => setIsKeyboardHelpVisible(false),
      description: 'Fermer les raccourcis clavier',
    },
    {
      key: 'r',
      ctrlKey: true,
      handler: () => handleRefreshData(),
      description: 'Actualiser les données du tableau de bord',
    },
  ]);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update last refresh time
      setLastUpdate(new Date());
      
      showToast('Mise à jour', 'Données actualisées', { type: 'success' });
    } catch (error) {
      showToast('Erreur', 'Échec de la mise à jour', { type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    const interval = setInterval(fetchDashboardData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchDashboardData, refreshInterval]);

  const handleRefreshData = async () => {
    setIsLoading(true);
    showToast('Actualisation', 'Mise à jour des données...', { type: 'info', duration: 2000 });

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      showToast('Succès', 'Données actualisées avec succès', { type: 'success' });
    } catch {
      showToast('Erreur', "Impossible d'actualiser les données", { type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async (format: 'csv' | 'pdf' | 'excel') => {
    setExportLoading(true);
    showToast('Export', `Préparation de l'export en ${format.toUpperCase()}...`, { type: 'info' });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      showToast('Succès', `Données exportées en ${format.toUpperCase()}`, { type: 'success' });
    } catch (error) {
      showToast('Erreur', "Échec de l'export", { type: 'error' });
    } finally {
      setExportLoading(false);
    }
  };

  const handleFilterChange = async (filters: FilterState) => {
    setIsLoading(true);
    showToast(
      'Mise à jour des données',
      'Application des nouveaux filtres...',
      { type: 'info', duration: 2000 }
    );

    try {
      // Simuler un chargement des données
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showToast(
        'Données mises à jour',
        'Les graphiques ont été actualisés avec succès',
        { type: 'success' }
      );
    } catch (error) {
      showToast(
        'Erreur de chargement',
        'Impossible de mettre à jour les données. Veuillez réessayer.',
        { type: 'error' }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRangeChange = (value: string) => {
    setSelectedRange(value);
    showToast(
      'Période modifiée',
      `Affichage des données pour: ${
        dateRanges.find(r => r.value === value)?.label
      }`,
      { type: 'info', duration: 2000 }
    );
  };



  const stats = [
    {
      title: "Périmètres définis",
      value: "156",
      change: { value: 15.2, trend: 'up' as const },
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
      </svg>,
      color: 'blue' as const,
      description: "Nombre total de périmètres d'audit définis"
    },
    {
      title: "Taux de Satisfaction",
      value: "94.2%",
      change: { value: 2.1, trend: 'up' as const },
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>,
      color: 'green' as const,
      description: "Basé sur les retours utilisateurs"
    },
    {
      title: "Temps Moyen de Réponse",
      value: "1.8s",
      change: { value: 0.3, trend: 'up' as const },
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>,
      color: 'purple' as const,
      description: "Temps de réponse moyen"
    }
  ];

  return (
    <div className="dashboard-layout bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-navy-900 dark:via-indigo-950 dark:to-purple-950">
      <div className="fixed z-0 w-full h-full">
        <ParticlesBackground />
      </div>
      
      <div className="relative z-[1000px] flex min-h-screen">

        <div className="flex-1">
          <header className="dashboard-header backdrop-blur-lg bg-white/80 dark:bg-navy-900/80 border-b border-gray-200/20 dark:border-gray-800/20">
            <div className="px-6 py-4 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Tableau de Bord
                </h1>
                <p className="text-sm text-surface-600 dark:text-surface-300 mt-1">
                  Aperçu de vos activités
                </p>
              </div>
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <div className="relative">
                  <input
                    type="search"
                    placeholder="Rechercher..."
                    className="w-64 px-4 py-2.5 rounded-xl bg-white/50 dark:bg-navy-800/50 border border-gray-200/50 dark:border-gray-700/50 focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <span className="absolute right-3 top-3 text-gray-400 dark:text-gray-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                </div>
                <button
                  onClick={() => setShowActivityFeed(!showActivityFeed)}
                  className="relative p-2.5 rounded-xl bg-white/50 dark:bg-navy-800/50 hover:bg-white/80 dark:hover:bg-navy-700/80 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl border border-gray-200/20 dark:border-gray-700/20"
                >
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                    3
                  </span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
              <div className="p-4">
                <div className="flex flex-col">
                  <p className="font-semibold text-surface-900 dark:text-surface-100">
                    {user?.firstname} {user?.lastname}
                  </p>
                  <p className="text-sm text-surface-500 dark:text-surface-400">{user?.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn(
                      "px-2 py-0.5 text-xs rounded-full",
                      user?.role === 'admin' 
                        ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    )}>
                      {user?.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                    </span>
                    <span className={cn(
                      "flex items-center gap-1 px-2 py-0.5 text-xs rounded-full",
                      user?.isActive
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    )}>
                      <span className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        user?.isActive ? "bg-green-500" : "bg-red-500"
                      )} />
                      {user?.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </div>
              </div>
                  </div>
                  <UserSession />
                </div>
              </div>
            </div>
          </header>
          
          <main className="dashboard-main p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <FilterBar onFilterChange={handleFilterChange} />
            
              <div className="mt-6 space-y-8">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="hover-card glass-morphism glow-effect rounded-xl p-6"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                      <h3 className="text-2xl font-bold mt-2 text-gradient">{stat.value}</h3>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-500/10 dark:bg-blue-500/20">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <div className={`flex items-center gap-1 text-sm ${
                      stat.change.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      <span>{stat.change.trend === 'up' ? '↑' : '↓'}</span>
                      <span>{stat.change.value}%</span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">vs dernière période</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{stat.description}</p>
                </motion.div>
                
                ))
                
                }
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <ChartCard
                  title="Utilisation & Performance IA"
                  loading={isLoading}
                  className="backdrop-blur-lg bg-white/80 dark:bg-navy-900/80 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300"
                  action={
                    <Select 
                      value={selectedRange} 
                      onValueChange={handleRangeChange}
                      className="min-w-[160px] backdrop-blur-lg"
                    >
                      {dateRanges.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </Select>
                  }
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <AreaChart
                      className="h-72 mt-4"
                      data={chartdata}
                      index="date"
                      categories={["Utilisation IA", "Performance"]}
                      colors={["#3B82F6", "#22C55E"]}
                      valueFormatter={(value) => `${value}%`}
                      showLegend
                      showGridLines={false}
                      showAnimation={true}
                    />
                  </motion.div>
                </ChartCard>

                <ChartCard
                  title="Performance & Satisfaction"
                  loading={isLoading}
                  className="backdrop-blur-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-navy-900/80 dark:to-navy-900/60 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                  action={
                    <button className="px-4 py-2 rounded-lg bg-primary-500/10 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-500/20 transition-all duration-300">
                      Voir détails
                    </button>
                  }
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DonutChart
                      className="h-52"
                      data={performanceData}
                      category="value"
                      index="name"
                      valueFormatter={(value) => `${value}%`}
                      colors={["#EF4444", "#22C55E", "#3B82F6", "#8B5CF6"]}
                    />
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Satisfaction Auditeur</h4>
                      <BarList
                        data={satisfactionData.map(item => ({
                          name: item.label,
                          value: item.count,
                          color: item.rating > 3 ? "#22C55E" : item.rating === 3 ? "#F59E0B" : "#EF4444"
                        }))}
                      />
                    </div>
                  </div>
                </ChartCard>
              </div>

              {/* Checklists and Conformity */}
              <div className="grid gap-6 lg:grid-cols-2 mt-6">
                <ChartCard
                  title="Checklists & Plans d'action"
                  loading={isLoading}
                  className="backdrop-blur-lg bg-white/80 dark:bg-navy-900/80 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <BarChart
                    className="h-72 mt-4"
                    data={checklistData}
                    index="month"
                    categories={["Checklists", "Plans d'action"]}
                    colors={["#3B82F6", "#22C55E"]}
                    valueFormatter={(value) => `${value}`}
                    showLegend
                    showAnimation={true}
                  />
                </ChartCard>

                <ChartCard
                  title="Conformité & Performance"
                  loading={isLoading}
                  className="backdrop-blur-lg bg-white/80 dark:bg-navy-900/80 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Taux de conformité</h4>
                      <p className="text-2xl font-bold text-surface-900 dark:text-surface-100">{conformityData.value}%</p>
                    </div>
                    <div className="relative h-4 rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className="absolute h-full rounded-full bg-green-500"
                        style={{ width: `${conformityData.value}%` }}
                      />
                      <div 
                        className="absolute h-full w-0.5 bg-red-500"
                        style={{ left: `${conformityData.target}%` }}
                      >
                        <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-red-500">
                          Objectif {conformityData.target}%
                        </span>
                      </div>
                    </div>
                  </div>
                </ChartCard>
              </div>

              {/* Performance & Adoption Trends */}
              <div className="mt-6">
                <ChartCard
                  title="Tendances d'adoption et performance"
                  loading={isLoading}
                  className="backdrop-blur-lg bg-white/80 dark:bg-navy-900/80 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <AreaChart
                    className="h-72 mt-4"
                    data={adoptionTrendData}
                    index="date"
                    categories={["Utilisation", "Formation", "Satisfaction"]}
                    colors={["#3B82F6", "#8B5CF6", "#22C55E"]}
                    valueFormatter={(value) => `${value}%`}
                    showLegend
                    showGridLines={false}
                    showAnimation={true}
                  />
                </ChartCard>
              </div>

              {/* AI Performance Trend */}
              <div className="mt-6">
                <ChartCard
                  title="Tendances de performance IA"
                  loading={isLoading}
                  className="backdrop-blur-lg bg-white/80 dark:bg-navy-900/80 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <AreaChart
                    className="h-72 mt-4"
                    data={aiPerformanceTrendData}
                    index="date"
                    categories={["Précision IA", "Taux de Détection", "Vitesse Traitement"]}
                    colors={["#3B82F6", "#22C55E", "#EF4444"]}
                    valueFormatter={(value) => `${value}%`}
                    showLegend
                    showGridLines={false}
                    showAnimation={true}
                  />
                </ChartCard>
              </div></div>
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
