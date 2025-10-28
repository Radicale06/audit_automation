import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { chatService } from '../api/chatService';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const NewChatModal: React.FC<NewChatModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [chatName, setChatName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatName.trim() || loading) return;

    try {
      setLoading(true);
      setError('');
      await chatService.createChat(chatName.trim());
      showToast('Conversation créée avec succès', 'success');
      setChatName('');
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      showToast('Erreur lors de la création de la conversation', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-gray-100">Nouvelle conversation</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="chatName" className="block text-sm font-medium text-gray-300 mb-2">
                Nom de la conversation
              </label>
              <input
                type="text"
                id="chatName"
                value={chatName}
                onChange={(e) => setChatName(e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Entrez le nom de la conversation"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm">{error}</div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={!chatName.trim() || loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Création...' : 'Créer'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewChatModal;