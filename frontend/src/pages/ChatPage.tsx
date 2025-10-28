import React, { useState, useRef, useCallback } from 'react';
import { Send, Menu, X, Loader, MessageCircle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import UserSession from '../components/UserSession';
import ChatHistory from '../components/ChatHistory';
import MessageRenderer from '../components/MessageRenderer';
import { useChatHistory } from '../context/ChatHistoryContext';
import { useUserProfile } from '../context/UserProfileContext';
import { useNavigate } from 'react-router-dom';

const ChatPage = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    currentConversation,
    messages,
    addMessage,
    loading,
  } = useChatHistory();
  const { user } = useUserProfile();

  const scrollToBottom = useCallback(() => {
    if (!loading) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [loading]);

  // Scroll when new message is added
  React.useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    const userMessage = message.trim();
    setMessage(''); // Clear input immediately
    
    try {
      setIsTyping(true);
      // Simply pass the message to the context which now properly handles UI updates
      await addMessage(userMessage);
    } catch (err) {
      console.error('Failed to send message:', err);
      setMessage(userMessage);
    } finally {
      setIsTyping(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gradient-to-b from-[#0d1117] to-[#1a1f2b]">
      {/* Sidebar Desktop */}
      <motion.div 
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        className="hidden lg:flex flex-col w-80 border-r border-gray-700/50 bg-[#161b22]/90 backdrop-blur-lg shadow-2xl"
      >
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-lg font-semibold text-gray-100">Conversations</h1>
        </div>
        <div className="flex-1 overflow-hidden">
          <ChatHistory />
        </div>
      </motion.div>

      {/* Sidebar Mobile */}
      <AnimatePresence>
        {isHistoryOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed inset-y-0 left-0 w-full sm:w-80 bg-[#161b22]/95 backdrop-blur-lg z-50 lg:hidden"
          >
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-100">Conversations</h2>
                <button
                  onClick={() => setIsHistoryOpen(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-300" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <ChatHistory />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zone principale */}
      <div className="flex-1 flex flex-col bg-transparent relative">
        {/* Header */}
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed top-0 right-0 left-0 lg:left-80 bg-[#161b22]/80 backdrop-blur-lg border-b border-gray-700/50 z-10"
        >
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsHistoryOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Menu className="h-5 w-5 text-gray-300" />
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBackToDashboard}
                className="p-2 bg-[#0d1117]/70 hover:bg-[#0d1117] rounded-lg transition-colors flex items-center space-x-2 border border-gray-700/50 shadow-md"
                title="Retour au tableau de bord"
              >
                <ArrowLeft className="h-4 w-4 text-gray-300" />
                <span className="text-sm text-gray-300 hidden sm:inline">Tableau de bord</span>
              </motion.button>
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 p-2 rounded-lg shadow-md">
                  <img src="/logo.png" alt="HAT Security" className="h-6 w-6" />
                </div>
                <h1 className="text-lg font-semibold text-gray-100">Assistant d'Audit</h1>
              </div>
            </div>
            <UserSession />
          </div>
        </motion.header>

        {/* Zone de messages */}
        <main className="flex-1 overflow-y-auto pt-16 pb-32 px-4 scroll-smooth">
          {!currentConversation ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full flex flex-col items-center justify-center text-center p-4"
            >
              <MessageCircle className="h-12 w-12 text-gray-600 mb-4" />
              <h2 className="text-xl font-semibold text-gray-300 mb-2">Bienvenue dans l'assistant d'audit</h2>
              <p className="text-gray-500 max-w-md">
                Commencez une nouvelle conversation ou sélectionnez une conversation existante pour interagir avec l'assistant.
              </p>
            </motion.div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', damping: 25 }}
                    className={`mb-6 ${msg.sender === 'bot' ? 'flex' : 'flex flex-row-reverse'}`}
                  >
                    <div className={`flex-shrink-0 ${msg.sender === 'bot' ? 'mr-4' : 'ml-4'}`}>
                      <motion.div 
                        whileHover={{ scale: 1.1 }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                          msg.sender === 'bot'
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                            : 'bg-gradient-to-br from-gray-600 to-gray-700'
                        }`}
                      >
                        {msg.sender === 'bot' ? (
                          <img src="/logo.png" alt="Assistant" className="w-6 h-6 rounded" />
                        ) : (
                          <span className="text-gray-100 font-medium">{user?.firstname?.[0] || 'U'}</span>
                        )}
                      </motion.div>
                    </div>
                    <div className={`flex flex-col ${msg.sender === 'bot' ? 'items-start' : 'items-end'}`}>
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className={`max-w-[85%] px-6 py-4 rounded-2xl shadow-lg ${
                          msg.sender === 'bot'
                            ? 'bg-[#161b22]/90 text-gray-100 border border-gray-700/50 backdrop-blur-sm'
                            : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                        }`}
                      >
                        <MessageRenderer text={msg.text} sender={msg.sender} />
                      </motion.div>
                      <span className="text-xs text-gray-400 mt-2 font-['Inter']">
                        {msg.sender === 'bot' ? 'Assistant' : 'Vous'} • {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-2 text-gray-400 text-sm"
                >
                  <div className="flex space-x-1">
                    <motion.div
                      animate={{ y: [0, -3, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6 }}
                      className="w-2 h-2 bg-blue-500 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -3, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                      className="w-2 h-2 bg-blue-500 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -3, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                      className="w-2 h-2 bg-blue-500 rounded-full"
                    />
                  </div>
                  <span>Assistant est en train d'écrire...</span>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </main>

        {/* Zone de saisie */}
        <motion.footer 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-0 right-0 left-0 lg:left-80 bg-[#161b22]/80 backdrop-blur-lg border-t border-gray-700/50 p-4 shadow-lg"
        >
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="flex items-end space-x-4">
              <div className="flex-1 bg-[#0d1117]/50 rounded-2xl shadow-inner border border-gray-700/50 focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-transparent transition-all duration-300">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Posez votre question..."
                  className="w-full p-4 bg-transparent border-0 focus:ring-0 resize-none text-gray-100 placeholder-gray-500 font-['Inter'] rounded-2xl"
                  style={{ minHeight: '56px', maxHeight: '200px' }}
                  disabled={loading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={!message.trim() || loading}
                className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex-shrink-0 shadow-lg hover:shadow-blue-500/20"
                title="Envoyer le message"
              >
                {loading ? (
                  <Loader className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </motion.button>
            </div>
          </form>
        </motion.footer>
      </div>

      {/* Overlay mobile avec effet de flou */}
      <AnimatePresence>
        {isHistoryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setIsHistoryOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatPage;