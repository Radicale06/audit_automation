import React, { useState } from 'react';
import { MessageSquare, Trash2, Loader, Plus, Clock } from 'lucide-react';
import { useChatHistory } from '../context/ChatHistoryContext';
import ErrorNotification from './ErrorNotification';
import NewChatModal from './NewChatModal';
import Tooltip from './Tooltip';

const ChatHistory: React.FC = () => {
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const {
    conversations,
    currentConversation,
    deleteConversation,
    setCurrentConversation,
  refreshConversations,
    loading,
    error,
    clearError
  } = useChatHistory();

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) {
      return `Il y a ${minutes} min`;
    } else if (hours < 24) {
      return `Il y a ${hours}h`;
    } else if (days === 1) {
      return 'Hier';
    } else if (days < 7) {
      return `Il y a ${days}j`;
    } else {
      return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'short'
      }).format(date);
    }
  };

  if (loading && conversations?.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#161b22] text-gray-400">
        <Loader className="w-8 h-8 animate-spin mb-4" />
        <p className="text-sm">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#161b22]">
      {error && (
        <div className="mx-3 mt-3">
          <ErrorNotification 
            error={{
              message: error.message,
              code: error.code as "VALIDATION_ERROR" | "UNAUTHORIZED" | "FORBIDDEN" | "ERROR" | undefined
            }} 
            onDismiss={clearError}
          />
        </div>
      )}
      
      <div className="p-3">
        <Tooltip content="Nouvelle conversation">
          <button
            onClick={() => setShowNewChatModal(true)}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            <Plus className="w-5 h-5" />
            <span>Nouvelle conversation</span>
          </button>
        </Tooltip>
      </div>

      <div className="flex-1 overflow-y-auto space-y-0.5 p-3">
        {conversations?.map((conversation) => (
          <div
            key={conversation.id}
            onClick={() => setCurrentConversation(conversation)}
            className={`group px-3 py-4 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg ${
              currentConversation?.id === conversation.id
                ? 'bg-blue-600/90 shadow-md'
                : 'hover:bg-gray-700/50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${
                  currentConversation?.id === conversation.id
                    ? 'bg-white/10'
                    : 'bg-gray-600'
                }`}>
                  <MessageSquare className={`w-4 h-4 ${
                    currentConversation?.id === conversation.id
                      ? 'text-white'
                      : 'text-gray-300'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-medium text-sm line-clamp-1 ${
                    currentConversation?.id === conversation.id
                      ? 'text-white'
                      : 'text-gray-100'
                  }`}>
                    {conversation.title}
                  </h3>
                  <div className={`flex items-center mt-1 text-xs ${
                    currentConversation?.id === conversation.id
                      ? 'text-white/70'
                      : 'text-gray-400'
                  }`}>
                    <Clock className="w-3 h-3 mr-1" />
                    {formatDate(conversation.timestamp)}
                  </div>
                </div>
              </div>
              <Tooltip content="Supprimer la conversation">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(conversation.id);
                  }}
                  disabled={loading}
                  className={`opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    currentConversation?.id === conversation.id
                      ? 'hover:bg-white/20 text-white/90 hover:text-white'
                      : 'hover:bg-red-500/10 text-red-400 hover:text-red-500'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </Tooltip>
            </div>
          </div>
        ))}

        {!loading && conversations?.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 p-6">
            <MessageSquare className="w-12 h-12 mb-4 text-gray-500" />
            <p className="text-sm">Aucune conversation</p>
            <p className="text-xs mt-2">
              Commencez une nouvelle conversation pour interagir avec l'assistant
            </p>
          </div>
        )}
      </div>

      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        onSuccess={async () => {
          await refreshConversations();
        }}
      />
    </div>
  );
};

export default ChatHistory;