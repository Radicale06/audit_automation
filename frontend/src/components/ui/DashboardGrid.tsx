import { Card, Text, Metric, Title, AreaChart, DonutChart, BarList } from '@tremor/react';
import { motion, AnimatePresence } from 'framer-motion';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { cn } from '../../utils/cn';

interface KPICardProps {
  title: string;
  metric: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    positive: boolean;
  };
  loading?: boolean;
}

interface DashboardGridProps {
  isLoading?: boolean;
}

const KPICard = ({ title, metric, icon, trend, loading }: KPICardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    layout
  >
    <div className="stats-card">
      {loading ? (
        <>
          <Skeleton height={24} width={100} />
          <Skeleton height={36} width={80} className="mt-2" />
        </>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full p-2 bg-primary-50 dark:bg-navy-700">
                {icon}
              </div>
              <Text className="stats-card-title">{title}</Text>
            </div>
            {trend && (
              <div className={cn(
                "stats-card-badge",
                trend.positive 
                  ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                  : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
              )}>
                <span>{trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
              </div>
            )}
          </div>
          <Metric className="stats-card-value">{metric}</Metric>
        </>
      )}
    </div>
  </motion.div>
);

const LoadingChart = () => (
  <div className="space-y-4">
    <Skeleton height={24} width={140} />
    <Skeleton height={288} />
  </div>
);

const chartdata = [
  { date: '2024-01', "Conversations": 34, "Résolutions": 31 },
  { date: '2024-02', "Conversations": 42, "Résolutions": 38 },
  { date: '2024-03', "Conversations": 51, "Résolutions": 48 },
  { date: '2024-04', "Conversations": 47, "Résolutions": 45 },
  { date: '2024-05', "Conversations": 63, "Résolutions": 59 },
];

const categoryData = [
  { name: 'Questions générales', value: 35 },
  { name: 'Support technique', value: 25 },
  { name: 'Demandes spécifiques', value: 20 },
  { name: 'Autres', value: 20 },
];

export const DashboardGrid = ({ isLoading }: DashboardGridProps) => {
  return (
    <motion.div layout className="space-y-6">
      <div className="dashboard-grid">
        <KPICard
          title="Total Conversations"
          metric="2,845"
          loading={isLoading}
          trend={{ value: 12.5, positive: true }}
          icon={<svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>}
        />
        <KPICard
          title="Taux de Satisfaction"
          metric="94.2%"
          loading={isLoading}
          trend={{ value: 2.1, positive: true }}
          icon={<svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
        />
        <KPICard
          title="Temps Moyen de Réponse"
          metric="1.8s"
          loading={isLoading}
          trend={{ value: 0.3, positive: true }}
          icon={<svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="chart-card">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <LoadingChart />
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="chart-card-header">
                  <Title className="chart-title">Tendance des Conversations</Title>
                  <select className="text-sm border border-surface-200 dark:border-navy-700 rounded-lg px-2 py-1">
                    <option value="7">7 jours</option>
                    <option value="30">30 jours</option>
                    <option value="90">90 jours</option>
                  </select>
                </div>
                <AreaChart
                  className="h-72 mt-4"
                  data={chartdata}
                  index="date"
                  categories={["Conversations", "Résolutions"]}
                  colors={["blue", "green"]}
                  valueFormatter={(value) => `${value}`}
                  showLegend
                  showGridLines={false}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        <Card className="chart-card">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <LoadingChart />
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="chart-card-header">
                  <Title className="chart-title">Distribution par Catégorie</Title>
                  <button className="text-sm text-primary-500 hover:text-primary-600 dark:hover:text-primary-400">
                    Voir détails
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DonutChart
                    className="h-52"
                    data={categoryData}
                    category="value"
                    index="name"
                    valueFormatter={(value) => `${value}%`}
                    colors={["blue", "cyan", "indigo", "sky"]}
                  />
                  <BarList
                    className="mt-2"
                    data={categoryData.map(item => ({
                      name: item.name,
                      value: item.value,
                      icon: () => <span className="text-xs">●</span>
                    }))}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </motion.div>
  );
};