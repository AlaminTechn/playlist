'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load notifications from localStorage on mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem('playlistNotifications');
    if (savedNotifications) {
      const parsed = JSON.parse(savedNotifications);
      setNotifications(parsed);
      setUnreadCount(parsed.filter(n => !n.read).length);
    }
  }, []);

  const addNotification = (type, title, message, track = null) => {
    const newNotif = {
      id: Date.now().toString(),
      type,
      title,
      message,
      track,
      timestamp: Date.now(),
      read: false
    };
    
    const updated = [newNotif, ...notifications];
    setNotifications(updated);
    setUnreadCount(prev => prev + 1);
    
    // Save to localStorage for persistence
    localStorage.setItem('playlistNotifications', JSON.stringify(updated));
  };

  const markAsRead = (id) => {
    const updated = notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    );
    setNotifications(updated);
    setUnreadCount(prev => Math.max(0, prev - 1));
    localStorage.setItem('playlistNotifications', JSON.stringify(updated));
  };

  const removeNotification = (id) => {
    const notifToRemove = notifications.find(n => n.id === id);
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    if (notifToRemove && !notifToRemove.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    localStorage.setItem('playlistNotifications', JSON.stringify(updated));
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem('playlistNotifications');
  };

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    removeNotification,
    clearAll
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
