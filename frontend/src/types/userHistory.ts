// Removed unused import 'IconType' and fixed module reference if needed

export interface HistoryItem {
  id: string;
  type: 'document' | 'chat' | 'report';
  action: string;
  timestamp: Date;
  path?: string;
  content?: string;
}

export interface UserHistory {
  items: HistoryItem[];
  addItem: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
  exportToCSV: () => void;
}