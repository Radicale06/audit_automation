import React, { createContext, useContext, useEffect, useState } from 'react';
import CryptoJS from 'crypto-js';
import { HistoryItem, UserHistory } from '../types/userHistory';

const STORAGE_KEY = 'user_history';
const ENCRYPTION_KEY = 'hat-security-history-key'; // In production, this should be an environment variable

const UserHistoryContext = createContext<UserHistory | undefined>(undefined);

export const UserHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    // const loadHistory = () => {
    //   const encrypted = localStorage.getItem(STORAGE_KEY);
    //   if (encrypted) {
    //     try {
    //       const decrypted = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
    //       const parsed = JSON.parse(decrypted);
    //       setHistory(parsed.map((item: any) => ({
    //         ...item,
    //         timestamp: new Date(item.timestamp)
    //       })));
    //     } catch (error) {
    //       console.error('Failed to load history:', error);
    //       localStorage.removeItem(STORAGE_KEY);
    //     }
    //   }
    // };

    // loadHistory();
  }, []);

  useEffect(() => {
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(history),
      ENCRYPTION_KEY
    ).toString();
    localStorage.setItem(STORAGE_KEY, encrypted);
  }, [history]);

  const addItem = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    const newItem: HistoryItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    setHistory(prev => [newItem, ...prev].slice(0, 100)); // Keep last 100 items
    
    // Play notification sound
    const audio = new Audio('/notification.mp3');
    audio.play().catch(() => {}); // Ignore if audio fails to play
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Action', 'Content', 'Path'];
    const csvContent = [
      headers.join(','),
      ...history.map(item => [
        item.timestamp.toISOString(),
        item.type,
        item.action,
        item.content || '',
        item.path || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'user-history.csv';
    link.click();
  };

  return (
    <UserHistoryContext.Provider value={{ items: history, addItem, clearHistory, exportToCSV }}>
      {children}
    </UserHistoryContext.Provider>
  );
};

export const useUserHistory = () => {
  const context = useContext(UserHistoryContext);
  if (context === undefined) {
    throw new Error('useUserHistory must be used within a UserHistoryProvider');
  }
  return context;
};