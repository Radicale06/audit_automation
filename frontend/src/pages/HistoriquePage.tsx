import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Clock, User, SortDesc, Trash2, Loader, BarChart2, Filter, Download, Calendar, ChevronRight, X, FileText, Share2, Archive, Tag, Search, PieChart, List, Grid, LineChart, BarChart, ExternalLink, Hash, FolderOpen } from 'lucide-react';
import { adminChatService, AdminConversation } from '../api/adminChatService';
import { userService, BasicUser } from '../api/userService';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import ErrorNotification from '../components/ErrorNotification';
import Tooltip from '../components/Tooltip';
import '../styles/pages/ChatPage.css';

import { useUserProfile } from '../context/UserProfileContext';
import { useTranslation } from 'react-i18next';

const HistoriquePage: React.FC = () => {
  const { t } = useTranslation();
  const { user, loading: profileLoading } = useUserProfile();
  // Restrict access to admin only
  if (!profileLoading && (!user || user.role !== 'admin')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-100 text-red-700 p-6 rounded shadow text-lg">
          Accès refusé : cette page est réservée à l'administrateur.
        </div>
      </div>
    );
  }
  const [conversations, setConversations] = useState<AdminConversation[]>([]);
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [sortBy, setSortBy] = useState<'date' | 'user'>('date');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [allUsers, setAllUsers] = useState<BasicUser[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<AdminConversation | null>(null);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedConversations, setSelectedConversations] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'timeline'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [showMetrics, setShowMetrics] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);

  const availableTags = ['Important', 'Follow-up', 'Resolved', 'Pending', 'Technical', 'Security'];

  // Add export options
  const exportOptions = [
    { label: 'Export as PDF', value: 'pdf', icon: FileText },
    { label: 'Export as CSV', value: 'csv', icon: Download },
    { label: 'Export as JSON', value: 'json', icon: FolderOpen }
  ];

  useEffect(() => {
    const load = async () => {
      if (!user || user.role !== 'admin') return;
      try {
        setChatLoading(true);
        setError(null);
        // Load all users for admin filter dropdown (non-blocking)
        try {
          const userList = await userService.getAllUsers();
          setAllUsers(userList);
        } catch (e) {
          console.error('Failed to load users', e);
        }
        // Load conversations separately (non-blocking)
        try {
          const data = await adminChatService.getAllConversations();
          setConversations(data);
        } catch (e) {
          console.error('Failed to load conversations', e);
        }
      } catch (e: any) {
        setError({ message: e?.message || 'Erreur lors du chargement des données' });
      } finally {
        setChatLoading(false);
      }
    };
    load();
  }, [user]);

  const users = useMemo(() => {
    // Prefer full user list when available; fallback to users deduced from conversations
    if (allUsers.length > 0) {
      return allUsers.map(u => ({ id: u.id, firstname: u.firstname, lastname: u.lastname }));
    }
    const userMap = new Map<string, { id: string; firstname: string; lastname: string }>();
    conversations.forEach(conv => {
      if (conv.user) {
        userMap.set(conv.user.id, conv.user);
      }
    });
    return Array.from(userMap.values());
  }, [allUsers, conversations]);

  const filteredConversations = useMemo(() => {
    let filtered = [...conversations];

    // Appliquer le filtre par utilisateur
    if (selectedUser) {
      filtered = filtered.filter(conv => conv.user && conv.user.id === selectedUser);
    }

    // Appliquer le tri
    return filtered.sort((a, b) => {
      if (sortBy === 'user') {
        const userA = `${a.user?.firstname} ${a.user?.lastname}`.trim();
        const userB = `${b.user?.firstname} ${b.user?.lastname}`.trim();
        const userComparison = userA.localeCompare(userB);
        if (userComparison !== 0) {
          return sortOrder === 'asc' ? userComparison : -userComparison;
        }
      }
      
      // Tri secondaire par date ou tri principal
      return sortOrder === 'desc'
        ? b.timestamp.getTime() - a.timestamp.getTime()
        : a.timestamp.getTime() - b.timestamp.getTime();
    });
  }, [conversations, selectedUser, sortBy, sortOrder]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleConversationClick = (conversation: any) => {
    // For admin view, we can navigate to chat page with the conversation ID
    // The chat page should handle loading the conversation
    navigate(`/chat?conversationId=${conversation.id}`);
  };

  const handleDeleteConversation = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      setChatLoading(true);
      setError(null);
      await adminChatService.deleteConversation(id);
      setConversations(prev => prev.filter(c => c.id !== id));
      showToast('Conversation supprimée avec succès', 'success');
    } catch (error) {
      showToast('Erreur lors de la suppression de la conversation', 'error');
    } finally {
      setChatLoading(false);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const stats = useMemo(() => ({
    total: conversations.length,
    today: conversations.filter(c => {
      const today = new Date();
      return c.timestamp.toDateString() === today.toDateString();
    }).length,
    thisWeek: conversations.filter(c => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return c.timestamp > weekAgo;
    }).length,
    activeUsers: new Set(conversations.map(c => c.user?.id)).size
  }), [conversations]);

  // Add batch operations handler
  const handleBatchOperation = async (operation: 'export' | 'archive' | 'delete') => {
    if (!selectedConversations.length) return;
    
    try {
      setChatLoading(true);
      switch (operation) {
        case 'export':
          const conversationsToExport = conversations.filter(c => 
            selectedConversations.includes(c.id)
          );
          // Export logic here
          break;
        case 'archive':
          // Archive logic here
          break;
        case 'delete':
          await Promise.all(
            selectedConversations.map(id => adminChatService.deleteConversation(id))
          );
          setConversations(prev => 
            prev.filter(c => !selectedConversations.includes(c.id))
          );
          break;
      }
      showToast(`${operation} completed successfully`, 'success');
      setSelectedConversations([]);
    } catch (error) {
      showToast(`Failed to ${operation}`, 'error');
    } finally {
      setChatLoading(false);
    }
  };

  // Add conversation details panel component
  const ConversationDetailsPanel = () => (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="fixed right-0 top-0 h-full w-96 bg-[#161b22] border-l border-[#30363d] shadow-xl overflow-y-auto z-50"
    >
      {selectedConversation && (
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">Conversation Details</h3>
            <button
              onClick={() => setShowDetailsPanel(false)}
              className="p-2 hover:bg-gray-700 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">Title</h4>
              <p className="text-white">{selectedConversation.title}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">User</h4>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <User className="h-5 w-5 text-blue-500" />
                </div>
                <p className="text-white">
                  {selectedConversation.user 
                    ? `${selectedConversation.user.firstname} ${selectedConversation.user.lastname}`
                    : 'N/A'}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">Date</h4>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-white">{formatDate(selectedConversation.timestamp)}</p>
              </div>
            </div>

            <div className="pt-6 border-t border-[#30363d]">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleConversationExport(selectedConversation.id)}
                  className="flex items-center justify-center px-4 py-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors"
                >
                  <Download size={16} className="mr-2" />
                  Export
                </button>
                <button
                  onClick={() => handleDeleteConversation(new Event('click') as any, selectedConversation.id)}
                  className="flex items-center justify-center px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );

  // Add metrics calculation
  const metrics = useMemo(() => ({
    averageResponseTime: conversations.reduce((acc, conv) => acc + (conv.responseTime || 0), 0) / conversations.length,
    topUsers: Object.entries(
      conversations.reduce((acc, conv) => {
        if (conv.user) {
          acc[conv.user.id] = (acc[conv.user.id] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>)
    ).sort(([, a], [, b]) => b - a).slice(0, 5),
    conversationsByDay: conversations.reduce((acc, conv) => {
      const day = conv.timestamp.toLocaleDateString();
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  }), [conversations]);

  // Add view mode controls to the toolbar
  const ViewControls = () => (
    <div className="flex items-center gap-2 p-2 bg-[#0d1117] rounded-lg border border-[#303d]">
      <button
        onClick={() => setViewMode('grid')}
        className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:bg-[#1f2937]'}`}
      >
        <Grid size={18} />
      </button>
      <button
        onClick={() => setViewMode('list')}
        className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:bg-[#1f2937]'}`}
      >
        <List size={18} />
      </button>
      <button
        onClick={() => setViewMode('timeline')}
        className={`p-2 rounded-lg ${viewMode === 'timeline' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:bg-[#1f2937]'}`}
      >
        <Clock size={18} />
      </button>
    </div>
  );

  // Add search and metrics components
  const SearchAndMetrics = () => (
    <div className="flex items-center gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-[#0d1117] border border-[#303d] rounded-lg text-white placeholder-gray-400"
        />
      </div>
      <button
        onClick={() => setShowMetrics(!showMetrics)}
        className={`p-2 rounded-lg ${showMetrics ? 'bg-purple-500 text-white' : 'bg-[#0d1117] border border-[#303d] text-gray-400'}`}
      >
        <PieChart size={18} />
      </button>
    </div>
  );

  // Add metrics panel
  const MetricsPanel = () => (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="bg-[#161b22] rounded-xl p-6 mb-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-2">Average Response Time</h4>
          <p className="text-2xl font-bold text-white">{metrics.averageResponseTime.toFixed(2)}s</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-2">Most Active Users</h4>
          <div className="space-y-2">
            {metrics.topUsers.map(([userId, count]) => {
              const user = users.find(u => u.id === userId);
              return user ? (
                <div key={userId} className="flex items-center justify-between">
                  <span className="text-sm text-white">{`${user.firstname} ${user.lastname}`}</span>
                  <span className="text-sm text-gray-400">{count} conversations</span>
                </div>
              ) : null;
            })}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-2">Daily Activity</h4>
          <div className="space-y-2">
            {Object.entries(metrics.conversationsByDay).map(([day, count]) => (
              <div key={day} className="flex items-center justify-between">
                <span className="text-sm text-white">{day}</span>
                <span className="text-sm text-gray-400">{count} conversations</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Add timeline view
  const TimelineView = () => (
    <div className="space-y-6">
      {Object.entries(
        filteredConversations.reduce((acc, conv) => {
          const day = conv.timestamp.toLocaleDateString();
          acc[day] = [...(acc[day] || []), conv];
          return acc;
        }, {} as Record<string, AdminConversation[]>)
      ).map(([day, convs]) => (
        <div key={day} className="relative">
          <div className="sticky top-0 bg-[#0d1117] z-10 py-2">
            <h3 className="text-lg font-medium text-white">{day}</h3>
          </div>
          <div className="ml-4 space-y-4">
            {convs.map(conv => (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="group bg-[#161b22] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer hover:translate-y-[-2px] border border-transparent hover:border-blue-500/30"
                onClick={() => handleConversationClick(conv)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-600/20 rounded-lg mr-3">
                        <MessageSquare className="text-blue-500" size={20} />
                      </div>
                      <h3 className="font-medium text-lg text-white group-hover:text-blue-400 transition-colors">{conv.title}</h3>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-400">
                      <Clock size={16} className="mr-2" />
                      <span className="text-sm">{formatDate(conv.timestamp)}</span>
                    </div>
                    <div className="flex items-center text-gray-400">
                      <User size={16} className="mr-2" />
                      <span className="text-sm">{conv.user ? `${conv.user.firstname} ${conv.user.lastname}` : 'N/A'}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-[#30363d] flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleDeleteConversation(e, conv.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  // Add analytics charts component
  const AnalyticsPanel = () => (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="bg-[#161b22] rounded-xl p-6 mb-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-4">Conversation Trends</h4>
          <div className="h-64 bg-[#0d1117] rounded-lg p-4">
            <LineChart className="w-full h-full text-blue-500" />
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-4">User Distribution</h4>
          <div className="h-64 bg-[#0d1117] rounded-lg p-4">
            <BarChart className="w-full h-full text-purple-500" />
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Add export modal component
  const ExportModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div className="bg-[#161b22] rounded-xl p-6 w-96">
        <h3 className="text-xl font-bold mb-4">Export Conversations</h3>
        <div className="space-y-2">
          {exportOptions.map(option => (
            <button
              key={option.value}
              onClick={() => handleExport(option.value)}
              className="w-full flex items-center p-3 rounded-lg hover:bg-[#1f2937] transition-colors"
            >
              <option.icon className="h-5 w-5 mr-3 text-gray-400" />
              <span>{option.label}</span>
              <ExternalLink className="h-4 w-4 ml-auto text-gray-400" />
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );

  // Add tag filters component
  const TagFilters = () => (
    <div className="flex flex-wrap gap-2 mb-4">
      {availableTags.map(tag => (
        <button
          key={tag}
          onClick={() => setSelectedTags(prev => 
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
          )}
          className={`flex items-center px-3 py-1 rounded-full text-sm ${
            selectedTags.includes(tag)
              ? 'bg-blue-500 text-white'
              : 'bg-[#161b22] text-gray-400 hover:bg-[#1f2937]'
          }`}
        >
          <Hash className="h-3 w-3 mr-1" />
          {tag}
        </button>
      ))}
    </div>
  );

  // Update the toolbar section with new controls
  return (
    <div className="text-white">
      {/* Standardized Page Header */}
      <header className="mb-8">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            {t('historique.title', 'Historique')}
          </h1>
          <p className="mt-2 text-md text-gray-600 dark:text-gray-400">
            {t('historique.subtitle', 'Review historical records and logs.')}
          </p>

        </div>
      </header>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-[#161b22] rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Conversations</p>
                <h3 className="text-2xl font-bold text-blue-500 mt-1">{stats.total}</h3>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <MessageSquare className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </div>
          <div className="bg-[#161b22] rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Today's Conversations</p>
                <h3 className="text-2xl font-bold text-green-500 mt-1">{stats.today}</h3>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg">
                <Calendar className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </div>
          <div className="bg-[#161b22] rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">This Week</p>
                <h3 className="text-2xl font-bold text-purple-500 mt-1">{stats.thisWeek}</h3>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <BarChart2 className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </div>
          <div className="bg-[#161b22] rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Users</p>
                <h3 className="text-2xl font-bold text-orange-500 mt-1">{stats.activeUsers}</h3>
              </div>
              <div className="p-3 bg-orange-500/10 rounded-lg">
                <User className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Standardized Card Container */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="container mx-auto p-4">
          {error && (
            <div className="mb-4">
              <ErrorNotification 
                error={{
                  message: error.message,
                  code: error.code as "VALIDATION_ERROR" | "UNAUTHORIZED" | "FORBIDDEN" | "ERROR" | undefined
                }} 
                onDismiss={() => setError(null)}
              />
            </div>
          )}

          {/* Enhanced Filter Controls */}
          <div className="bg-[#161b22] rounded-xl p-6 mb-8 shadow-lg">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-400 mb-2">Filter by User</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg py-2.5 pl-10 pr-4 text-white appearance-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Users</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>{`${user.firstname} ${user.lastname}`}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-400 mb-2">Sort Options</label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setSortBy('date')}
                    className={`flex-1 px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 
                      ${sortBy === 'date' ? 'bg-blue-600 text-white' : 'bg-[#0d1117] border border-[#303d] hover:bg-[#1f2937]'}`}
                  >
                    <Clock size={18} />
                    Date
                  </button>
                  <button
                    onClick={() => setSortBy('user')}
                    className={`flex-1 px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2
                      ${sortBy === 'user' ? 'bg-blue-600 text-white' : 'bg-[#0d1117] border border-[#303d] hover:bg-[#1f2937]'}`}
                  >
                    <User size={18} />
                    User
                  </button>
                  <button
                    onClick={toggleSortOrder}
                    className="px-4 py-2.5 bg-[#0d1117] border border-[#303d] rounded-lg hover:bg-[#1f2937] transition-colors"
                  >
                    <SortDesc className={`transform transition-transform duration-200 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Conversation Cards */}
          {chatLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader className="w-8 h-8 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-400">Chargement des conversations...</span>
            </div>
          ) : filteredConversations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredConversations.map((conversation) => (
                <motion.div
                  key={conversation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="group bg-[#161b22] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer hover:translate-y-[-2px] border border-transparent hover:border-blue-500/30"
                  onClick={() => handleConversationClick(conversation)}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-600/20 rounded-lg mr-3">
                          <MessageSquare className="text-blue-500" size={20} />
                        </div>
                        <h3 className="font-medium text-lg text-white group-hover:text-blue-400 transition-colors">{conversation.title}</h3>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-400">
                        <Clock size={16} className="mr-2" />
                        <span className="text-sm">{formatDate(conversation.timestamp)}</span>
                      </div>
                      <div className="flex items-center text-gray-400">
                        <User size={16} className="mr-2" />
                        <span className="text-sm">{conversation.user ? `${conversation.user.firstname} ${conversation.user.lastname}` : 'N/A'}</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-[#30363d] flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleDeleteConversation(e, conversation.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            // Enhanced empty state
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-[#161b22] rounded-xl border border-[#30363d]"
            >
              <MessageSquare className="w-16 h-16 mx-auto text-gray-600 mb-4" />
              <h3 className="text-xl font-medium text-gray-300 mb-2">No Conversations Found</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                {selectedUser 
                  ? "No conversations found for this user. Try selecting a different user or clearing the filter."
                  : "Start a new conversation to interact with the assistant."}
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Add batch operations toolbar */}
      {selectedConversations.length > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-[#161b22] rounded-lg shadow-lg border border-[#303d] p-2 z-50">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400 px-2">
              {selectedConversations.length} selected
            </span>
            <button
              onClick={() => handleBatchOperation('export')}
              className="p-2 hover:bg-blue-500/10 text-blue-500 rounded-lg"
            >
              <Download size={18} />
            </button>
            <button
              onClick={() => handleBatchOperation('archive')}
              className="p-2 hover:bg-purple-500/10 text-purple-500 rounded-lg"
            >
              <Archive size={18} />
            </button>
            <button
              onClick={() => handleBatchOperation('delete')}
              className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      )}


      {/* Add details panel */}
      {showDetailsPanel && <ConversationDetailsPanel />}

      {/* Add timeline view */}
      {viewMode === 'timeline' && (
        <div className="container mx-auto p-4">
          <TimelineView />
        </div>
      )}

      {/* Add analytics panel */}
      {showAnalytics && (
        <div className="container mx-auto p-4">
          <AnalyticsPanel />
        </div>
      )}

      {/* Add export modal */}
      {showExportModal && <ExportModal />}
    </div>
  );
};

export default HistoriquePage;