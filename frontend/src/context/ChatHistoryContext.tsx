// 📦 Importations des hooks React, services API, gestion d'erreurs et notifications
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { chatService, Message, Conversation } from '../api/chatService';
import { handleApiError, ApiError } from '../api/errorUtils';
import { useToast } from './ToastContext';
import { useUserProfile } from './UserProfileContext';

// 🧩 Définition du type du contexte que l'on va créer
interface ChatHistoryContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  error: ApiError | null;
  setCurrentConversation: (conversation: Conversation | null) => void;
  addMessage: (message: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  clearError: () => void;
  refreshConversations: () => Promise<void>;
}

// 🎯 Création du contexte
const ChatHistoryContext = createContext<ChatHistoryContextType | undefined>(undefined);

// 🛡️ Fournisseur du contexte : ce composant enveloppe l'application
export const ChatHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 🔧 États
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const { showToast } = useToast();
  const { user } = useUserProfile();
  const sendingRef = useRef(false);

  useEffect(() => {
    getConversations();
  }, [user?._id]);

  // Load messages when conversation changes
  useEffect(() => {
    if (currentConversation) {
      loadConversationMessages(currentConversation.id);
    } else {
      setMessages([]);
    }
  }, [currentConversation]);

  // 🔄 Fonction pour vider l'erreur
  const clearError = () => {
    setError(null);
  };

  const getConversations = async () => {
    try {
      setLoading(true);
      clearError();
  const conversations = await chatService.getConversations();
  // Rely on server-side filtering for non-admins to avoid dropping items when user field isn't populated
  setConversations(user?.role === 'admin' ? conversations : conversations);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      showToast(apiError.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const refreshConversations = async () => {
    await getConversations();
  };

  const loadConversationMessages = async (chatId: string) => {
    try {
      setLoading(true);
      clearError();
      const messages = await chatService.getConversationMessages(chatId);
      setMessages(messages);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      showToast(apiError.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const createNewConversation = async () => {
    try {
      setLoading(true);
      clearError();
      const newConversation = await chatService.createChat(`Nouvelle conversation ${new Date().toLocaleTimeString()}`);
      setConversations(prev => [newConversation, ...prev]);
      setCurrentConversation(newConversation);
      return newConversation;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      showToast(apiError.message, 'error');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const addMessage = async (text: string) => {
    let conversationToUse = currentConversation;
    
    if (!conversationToUse) {
      const newConv = await createNewConversation();
      if (!newConv) return;
      conversationToUse = newConv;
    }
    
    if (sendingRef.current) return; // Prevent duplicate sends
    sendingRef.current = true;
    
    try {
      setLoading(true);
      
      // Create a temporary user message and add it immediately to the UI
      const tempUserMessage: Message = {
        id: `temp-${Date.now()}`,
        text,
        sender: 'user',
        timestamp: new Date().toISOString(),
      };
      
      // Add the user message to the UI immediately
      setMessages(prev => [...prev, tempUserMessage]);
      
      // Send message to API using the conversation we have
      const response = await chatService.sendMessage(
        conversationToUse.id,
        text
      );

      // The response is likely the messages array directly, not wrapped in .data
      const apiMessages = Array.isArray(response) ? response : (response.data || response.messages || []);
      
      // Simply replace all messages with the API response since it should contain the full conversation
      if (apiMessages.length > 0) {
        setMessages(apiMessages);
      } else {
        // If API doesn't return messages, keep our temp message and add a fallback bot response
        console.warn('API response did not contain messages array:', response);
        
        // Create a fallback bot message if the API response has text content
        const botText = response.text || response.message || 'Message reçu';
        const botMessage: Message = {
          id: `bot-${Date.now()}`,
          text: botText,
          sender: 'bot',
          timestamp: new Date().toISOString(),
        };
        
        setMessages(prev => [...prev, botMessage]);
      }
      
      // Refresh conversations list
      refreshConversations();
      
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      showToast(apiError.message, 'error');
      
      // Remove the temporary message on error
      setMessages(prev => prev.filter(m => !m.id.startsWith('temp-')));
      throw apiError;
    } finally {
      setLoading(false);
      sendingRef.current = false;
    }
  };

  // 🗑️ Supprimer une conversation
  const deleteConversation = async (id: string) => {
    try {
      setLoading(true);
      clearError();
      await chatService.deleteConversation(id);

      setConversations(prev => prev.filter(conv => conv.id !== id));

      if (currentConversation?.id === id) {
        setCurrentConversation(null);
        setMessages([]);
      }

      showToast('Conversation supprimée', 'success');
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      showToast(apiError.message, 'error');
      throw apiError;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ChatHistoryContext.Provider
      value={{
        conversations,
        currentConversation,
        messages,
        loading,
        error,
        setCurrentConversation,
        addMessage,
        deleteConversation,
  clearError,
  refreshConversations
      }}
    >
      {children}
    </ChatHistoryContext.Provider>
  );
};

// 🎯 Hook personnalisé pour accéder plus facilement au contexte
export const useChatHistory = () => {
  const context = useContext(ChatHistoryContext);
  if (context === undefined) {
    throw new Error('useChatHistory must be used within a ChatHistoryProvider');
  }
  return context;
};

