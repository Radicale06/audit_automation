import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Search, Trash2, RefreshCw, Power, PowerOff, Download, Filter, SortAsc, SortDesc, FileSpreadsheet, Users, UserPlus, MoreVertical, UserCheck, UserX, Clock, ChevronLeft, ChevronRight, Activity, Calendar, Settings, Printer, FileText, UserCog } from 'lucide-react';
import { authService } from '../api/authService';
import { useUserProfile } from '../context/UserProfileContext';
import { motion } from 'framer-motion';

interface User {
  _id?: string;
  firstname: string;
  lastname: string;
  email: string;
  isActive?: boolean;
  role?: string;
  lastLogin?: string;
  avatar?: string;
  activities?: Array<{
    action: string;
    timestamp: string;
    details: string;
  }>;
}

const UserManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useUserProfile();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<{type: string; userId: string} | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [processingBatch, setProcessingBatch] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(['firstname', 'lastname', 'email', 'status', 'role']);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [roleFilter, setRoleFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const token = useSelector((state: any) => state.auth.token);

  // Check if user has admin role
  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            You need administrator privileges to access this page.
          </p>
        </div>
      </div>
    );
  }

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/user/all", {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Access denied: Admin privileges required to view users');
        }
        if (response.status === 401) {
          throw new Error('Authentication required. Please login again.');
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // The backend API returns users in the 'users' property
      if (data && data.users && Array.isArray(data.users)) {
        setUsers(data.users);
        setFilteredUsers(data.users);
      } else {
        // Fallback in case the structure changes
        const userArray = Array.isArray(data) ? data : [];
        setUsers(userArray);
        setFilteredUsers(userArray);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
      setFilteredUsers([]);
      const errorMessage = error instanceof Error ? error.message : t('errors.fetchUsersFailed');
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
      return;
    }
    
    const lowercasedFilter = searchTerm.toLowerCase();
    const filtered = users.filter(user => {
      return (
        user.firstname.toLowerCase().includes(lowercasedFilter) ||
        user.lastname.toLowerCase().includes(lowercasedFilter) ||
        user.email.toLowerCase().includes(lowercasedFilter)
      );
    });
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm(t('userManagement.confirmDelete'))) {
      return;
    }
    try {
      const response = await fetch(`http://localhost:8000/user/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }

      toast.success(t('userManagement.userDeletedSuccess'));
      // Update the users list locally
      setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
      setFilteredUsers(prevFilteredUsers => prevFilteredUsers.filter(user => user._id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error instanceof Error ? error.message : t('errors.deleteUserFailed'));
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const actionText = newStatus ? 'activate' : 'deactivate';
    
    if (!window.confirm(`Are you sure you want to ${actionText} this user?`)) {
      return;
    }

    try {
      await authService.updateUserStatus(userId, newStatus, token);
      
      // Update the users list locally
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId ? { ...user, isActive: newStatus } : user
        )
      );
      setFilteredUsers(prevFilteredUsers => 
        prevFilteredUsers.map(user => 
          user._id === userId ? { ...user, isActive: newStatus } : user
        )
      );

      toast.success(`User ${actionText}d successfully`);
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error(error instanceof Error ? error.message : `Failed to ${actionText} user`);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const exportUsers = () => {
    const csv = filteredUsers.map(user => 
      `${user.firstname},${user.lastname},${user.email},${user.isActive ? 'Active' : 'Inactive'}`
    ).join('\n');
    
    const blob = new Blob([`First Name,Last Name,Email,Status\n${csv}`], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();
  };

  const exportToPDF = () => {
    const doc = window.open('', '_blank');
    if (doc) {
      doc.document.write(`
        <html>
          <head>
            <title>Users Report</title>
            <style>
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f5f5f5; }
            </style>
          </head>
          <body>
            <h1>Users Report</h1>
            <table>
              <thead>
                <tr>
                  ${visibleColumns.map(col => `<th>${col}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${filteredUsers.map(user => `
                  <tr>
                    ${visibleColumns.map(col => `<td>${user[col as keyof User] || ''}</td>`).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `);
      doc.document.close();
      doc.print();
    }
  };

  const handleBulkAction = async (action: 'delete' | 'activate' | 'deactivate') => {
    if (!selectedUsers.length) return;
    
    if (!window.confirm(`Are you sure you want to ${action} the selected users?`)) return;

    try {
      // Perform bulk action API call
      const response = await fetch(`http://localhost:8000/user/bulk`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ userIds: selectedUsers, action }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }

      toast.success(`Users ${action}d successfully`);
      // Refetch users after bulk action
      fetchUsers();
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast.error(error instanceof Error ? error.message : `Failed to ${action} users`);
    }
  };

  // Add new stats calculation
  const userStats = {
    total: filteredUsers.length,
    active: filteredUsers.filter(u => u.isActive).length,
    inactive: filteredUsers.filter(u => !u.isActive).length,
    recentlyAdded: filteredUsers.filter(u => {
      // Example: users added in last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return new Date(u.createdAt || '') > sevenDaysAgo;
    }).length
  };

  // Add confirmation dialog handler
  const handleConfirmAction = () => {
    if (!pendingAction) return;
    
    if (pendingAction.type === 'delete') {
      handleDeleteUser(pendingAction.userId);
    } else if (pendingAction.type === 'toggle') {
      const user = users.find(u => u._id === pendingAction.userId);
      if (user) handleToggleUserStatus(user._id!, user.isActive || false);
    }
    
    setShowConfirmDialog(false);
    setPendingAction(null);
  };

  // Add pagination calculation
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Add new handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleBatchOperationProgress = async (total: number) => {
    setProcessingBatch(true);
    setBatchProgress(0);
    
    for (let i = 0; i <= total; i++) {
      setBatchProgress((i / total) * 100);
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    setProcessingBatch(false);
  };

  // Add keyboard shortcut handler
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('input[type="text"]')?.focus();
      }
      if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        fetchUsers();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Add column customization component
  const ColumnSettings = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Customize Columns</h3>
          <button onClick={() => setShowColumnSettings(false)}>×</button>
        </div>
        <div className="space-y-2">
          {['firstname', 'lastname', 'email', 'status', 'role', 'lastLogin'].map(column => (
            <label key={column} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={visibleColumns.includes(column)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setVisibleColumns([...visibleColumns, column]);
                  } else {
                    setVisibleColumns(visibleColumns.filter(c => c !== column));
                  }
                }}
              />
              <span className="capitalize">{column.replace(/([A-Z])/g, ' $1').trim()}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  // Add activity log component
  const ActivityLog = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">User Activity Log</h3>
          <button onClick={() => setShowActivityLog(false)}>×</button>
        </div>
        <div className="space-y-4">
          {selectedUser?.activities?.map((activity, index) => (
            <div key={index} className="border-l-2 border-blue-500 pl-4">
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2" />
                {new Date(activity.timestamp).toLocaleString()}
              </div>
              <p className="font-medium">{activity.action}</p>
              <p className="text-sm text-gray-500">{activity.details}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading && users.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/4 mb-8"></div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-4 py-8"
    >
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-500" />
              {t('userManagement.title', 'User Management')}
            </h1>
            <p className="mt-2 text-md text-gray-600 dark:text-gray-400">
              {t('userManagement.subtitle', 'Manage user accounts, permissions and roles.')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 rounded-full text-sm font-medium">
              {filteredUsers.length} {filteredUsers.length === 1 ? 'User' : 'Users'}
            </span>
          </div>
        </div>
        

      </header>

      {/* Add Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.total}</h3>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Users</p>
              <h3 className="text-2xl font-bold text-green-600">{userStats.active}</h3>
            </div>
            <UserCheck className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Inactive Users</p>
              <h3 className="text-2xl font-bold text-red-600">{userStats.inactive}</h3>
            </div>
            <UserX className="h-8 w-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Recently Added</p>
              <h3 className="text-2xl font-bold text-purple-600">{userStats.recentlyAdded}</h3>
            </div>
            <Clock className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
      >
        {/* Enhanced toolbar */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Left side actions */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder={t('userManagement.searchPlaceholder', 'Search users...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <select 
                  className="form-select rounded-lg border-gray-300 dark:border-gray-600"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                >
                  <option value="all">All Users</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
                <button
                  onClick={exportUsers}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export
                </button>
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              {selectedUsers.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleBulkAction('activate')}
                    className="inline-flex items-center px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium"
                  >
                    Activate Selected
                  </button>
                  <button
                    onClick={() => handleBulkAction('deactivate')}
                    className="inline-flex items-center px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium"
                  >
                    Deactivate Selected
                  </button>
                </div>
              )}
              <button
                onClick={fetchUsers}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced table header */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
              <tr>
                <th scope="col" className="sticky left-0 z-20 px-6 py-3 bg-gray-50 dark:bg-gray-700">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setSelectedUsers(checked ? filteredUsers.map(u => u._id!).filter(Boolean) : []);
                    }}
                  />
                </th>
                {visibleColumns.map(column => (
                  <th
                    key={column}
                    onClick={() => handleSort(column)}
                    className="group px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="whitespace-nowrap">{column.charAt(0).toUpperCase() + column.slice(1)}</span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        {sortField === column ? (
                          sortDirection === 'asc' ? 
                            <SortAsc className="h-4 w-4 text-blue-500" /> : 
                            <SortDesc className="h-4 w-4 text-blue-500" />
                        ) : (
                          <SortAsc className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </th>
                ))}
                <th scope="col" className="sticky right-0 z-20 px-6 py-3 bg-gray-50 dark:bg-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedUsers.map((user, index) => (
                <motion.tr
                  key={user._id || Math.random().toString()}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className={`
                    group hover:bg-gray-50 dark:hover:bg-gray-700/50 
                    transition-colors duration-150
                    ${selectedUsers.includes(user._id!) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                  `}
                >
                  <td className="sticky left-0 z-20 px-6 py-4 whitespace-nowrap bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user._id!)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers([...selectedUsers, user._id!]);
                        } else {
                          setSelectedUsers(selectedUsers.filter(id => id !== user._id));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                  </td>
                  {/* Data cells with hover effects */}
                  {visibleColumns.map(column => (
                    <td 
                      key={column}
                      className="px-6 py-4 whitespace-nowrap text-sm group-hover:text-gray-900 dark:group-hover:text-white transition-colors"
                    >
                      {column === 'status' ? (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors
                          ${user.isActive 
                            ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-100' 
                            : 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-100'
                          }`}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      ) : (
                        <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {user[column as keyof User]}
                        </span>
                      )}
                    </td>
                  ))}
                  {/* Actions cell with tooltips */}
                  <td className="sticky right-0 z-20 px-6 py-4 whitespace-nowrap bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50">
                    <div className="flex items-center gap-2">
                      <button
                        title={user.isActive ? "Deactivate User" : "Activate User"}
                        onClick={() => handleToggleUserStatus(user._id!, user.isActive || false)}
                        className={`
                          inline-flex items-center p-1 rounded-full
                          transition-colors duration-200
                          ${user.isActive 
                            ? 'hover:bg-red-100 text-red-600 dark:hover:bg-red-900/20' 
                            : 'hover:bg-green-100 text-green-600 dark:hover:bg-green-900/20'
                          }
                        `}
                      >
                        {user.isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                      </button>
                      <button
                        title="Delete User"
                        onClick={() => {
                          setPendingAction({ type: 'delete', userId: user._id! });
                          setShowConfirmDialog(true);
                        }}
                        className="p-1 rounded-full hover:bg-red-100 text-red-600 dark:hover:bg-red-900/20 transition-colors duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        title="View Details"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowDetailsModal(true);
                        }}
                        className="p-1 rounded-full hover:bg-blue-100 text-blue-600 dark:hover:bg-blue-900/20 transition-colors duration-200"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Card Footer with Pagination (placeholder for future implementation) */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Show
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="mx-2 rounded-md border-gray-300 dark:border-gray-600"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
                entries
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-md disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-md disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Add Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Confirm Action</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to {pendingAction?.type} this user?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Details Modal */}
      {showDetailsModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold">User Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">First Name</p>
                <p className="font-medium">{selectedUser.firstname}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Name</p>
                <p className="font-medium">{selectedUser.lastname}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  selectedUser.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {selectedUser.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="font-medium">{selectedUser.role}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Login</p>
                <p className="font-medium">{new Date(selectedUser.lastLogin || '').toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Column Settings Modal */}
      {showColumnSettings && <ColumnSettings />}

      {/* Add Activity Log Modal */}
      {showActivityLog && <ActivityLog />}

      {/* Add Advanced Filters Component */}
      {showAdvancedFilters && (
        <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full rounded-lg border-gray-300 dark:border-gray-600"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
                <option value="guest">Guest</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date Added</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full rounded-lg border-gray-300 dark:border-gray-600"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions Menu */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => setShowColumnSettings(true)}
          className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          title="Customize Columns"
        >
          <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
        <button
          onClick={() => setShowActivityLog(true)}
          className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          title="View Activity Log"
        >
          <Activity className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
        <button
          onClick={() => {/* Role management logic */}}
          className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          title="Manage Roles"
        >
          <UserCog className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
    </motion.div>
  );
};

export default UserManagementPage;

/**
 * fetchUsers
 * Récupère la liste de tous les utilisateurs depuis l’API backend.
 * Utilisé pour afficher, rafraîchir ou mettre à jour la liste des utilisateurs dans l’interface admin.
 * Séquence : Admin → UI → fetchUsers() → API → UI (mise à jour de la liste)
 */

/**
 * handleDeleteUser
 * Supprime un utilisateur sélectionné via l’API backend.
 * Affiche une confirmation, puis effectue la suppression et met à jour la liste locale.
 * Séquence : Admin → UI → handleDeleteUser(userId) → API → UI (mise à jour de la liste)
 */

/**
 * handleToggleUserStatus
 * Active ou désactive un utilisateur (changement de statut actif/inactif).
 * Affiche une confirmation, puis effectue la modification via l’API et met à jour la liste locale.
 * Séquence : Admin → UI → handleToggleUserStatus(userId, currentStatus) → API → UI (mise à jour de la liste)
 */

/**
 * handleSort
 * Trie la liste des utilisateurs selon le champ choisi (nom, email, etc.).
 * Met à jour l’état local pour l’affichage trié.
 * Séquence : Admin → UI → handleSort(field) → UI (mise à jour de la liste)
 */

/**
 * exportUsers
 * Exporte la liste filtrée des utilisateurs au format CSV.
 * Génère un fichier téléchargeable côté client.
 * Séquence : Admin → UI → exportUsers() → Génération CSV → Téléchargement
 */

/**
 * exportToPDF
 * Exporte la liste filtrée des utilisateurs au format PDF (impression).
 * Ouvre une fenêtre d’impression avec la table des utilisateurs.
 * Séquence : Admin → UI → exportToPDF() → Génération PDF → Impression
 */

/**
 * handleBulkAction
 * Effectue une action de masse (activation, désactivation, suppression) sur plusieurs utilisateurs sélectionnés.
 * Envoie la requête au backend puis rafraîchit la liste.
 * Séquence : Admin → UI → handleBulkAction(action) → API → UI (mise à jour de la liste)
 */

/**
 * handleConfirmAction
 * Gère la confirmation d’une action critique (suppression, activation/désactivation).
 * Appelle la fonction appropriée selon l’action en attente.
 * Séquence : Admin → UI → handleConfirmAction() → (handleDeleteUser ou handleToggleUserStatus)
 */

/**
 * handlePageChange
 * Change la page courante de la pagination.
 * Met à jour l’état local pour afficher la page demandée.
 * Séquence : Admin → UI → handlePageChange(page) → UI (mise à jour de la liste)
 */

/**
 * handleBatchOperationProgress
 * Simule la progression d’une opération de masse (pour feedback visuel).
 * Séquence : Admin → UI → handleBatchOperationProgress(total) → UI (affichage progression)
 */

/**
 * ColumnSettings (composant)
 * Permet à l’admin de personnaliser les colonnes visibles dans le tableau.
 * Séquence : Admin → UI → ColumnSettings → UI (mise à jour de l’affichage)
 */

/**
 * ActivityLog (composant)
 * Affiche l’historique des activités d’un utilisateur sélectionné.
 * Séquence : Admin → UI → ActivityLog → UI (affichage du log)
 */