import React from 'react';
import { X, Download, FileText, MessageSquare, FileBarChart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { HistoryItem } from '../types/userHistory';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, history }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const getIconForType = (type: string) => {
    switch (type) {
      case 'document': return FileText;
      case 'chat': return MessageSquare;
      case 'report': return FileBarChart;
      default: return FileText;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{t('activity_history')}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {history.map((item) => {
              const Icon = getIconForType(item.type);
              return (
                <div
                  key={item.id}
                  className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{item.action}</p>
                    {item.content && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.content}</p>
                    )}
                    <p className="text-xs text-gray-500">{formatDate(item.timestamp)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => {/* Handle export */}}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>{t('export_to_csv')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;