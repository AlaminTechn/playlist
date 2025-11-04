'use client';

import React, { useState, useEffect } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';

export default function NotificationModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('all');
  const { notifications, markAsRead, clearAll, removeNotification } = useNotifications();

  const markAllAsRead = () => {
    notifications.forEach(notif => {
      if (!notif.read) {
        markAsRead(notif.id);
      }
    });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'upvote':
        return (
          <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13.5 19.25c-.69 0-1.25-.56-1.25-1.25V13.75L10.23 9.7c-.42-.84.19-1.97 1.13-1.97h4.14c.66 0 1.25.45 1.43 1.1L18.8 11H20.5A1.5 1.5 0 0122 12.5v5A1.5 1.5 0 01-18.5 19h-7z"/>
            <path d="M18 5h3a1 1 0 011 1v6a1 1 0 01-1 1h-3v8z"/>
          </svg>
        );
      case 'downvote':
        return (
          <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10.5 4.75c.69 0 1.25.56 1.25 1.25v4.25l2.02 4.03c.42.84-.19 1.97-1.13 1.97H8.5A1.5 1.5 0 017 13v-5A1.5 1.5 0 018.5 5h7z"/>
            <path d="M6 19H3a1 1 0 01-1-1v-6a1 1 0 011-1h3V5z"/>
          </svg>
        );
      case 'added':
        return (
          <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 5v14m-7-7h14"/>
          </svg>
        );
      case 'removed':
        return (
          <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 18L18 6M6 6l12 12"/>
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 16h-1v-4h-1m1-4h1M5 8h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2z"/>
          </svg>
        );
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'upvote': return 'text-blue-400';
      case 'downvote': return 'text-red-400';
      case 'added': return 'text-green-400';
      case 'removed': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notif.read;
    return notif.type === activeTab;
  });

  const totalUnread = notifications.filter(notif => !notif.read).length;

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-end p-4 pt-20"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-md max-h-[60vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Notifications</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {['all', 'unread', 'upvote', 'downvote', 'added', 'removed'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'text-primary-400 border-b-2 border-primary-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {tab === 'all' && `All (${notifications.length})`}
              {tab === 'unread' && `Unread (${totalUnread})`}
              {tab === 'upvote' && 'Upvotes'}
              {tab === 'downvote' && 'Downvotes'}
              {tab === 'added' && 'Added'}
              {tab === 'removed' && 'Removed'}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-3 border-b border-gray-700">
          <button
            onClick={markAllAsRead}
            className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
          >
            Mark all as read
          </button>
          <button
            onClick={clearAll}
            className="text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            Clear all
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-400">
              <svg className="w-12 h-12 mb-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 16h-1v-4h-1m1-4h1M5 8h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2z"/>
              </svg>
              <p>No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 hover:bg-gray-800/50 transition-colors ${
                    notif.read ? 'bg-gray-900/50' : 'bg-gray-900'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="mt-1">
                      {getNotificationIcon(notif.type)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className={`font-medium ${getNotificationColor(notif.type)}`}>
                          {notif.title}
                        </p>
                        {!notif.read && (
                          <span className="w-2 h-2 bg-primary-400 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-300">{notif.message}</p>
                      <p className="text-xs text-gray-500">{formatTime(notif.timestamp)}</p>
                      
                      {/* Track info if available */}
                      {notif.track && (
                        <div className="mt-2 p-2 bg-gray-800/50 rounded-lg">
                          <p className="text-sm text-white truncate">{notif.track.title}</p>
                          <p className="text-xs text-gray-400 truncate">{notif.track.artist}</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex flex-col gap-1">
                      {!notif.read && (
                        <button
                          onClick={() => markAsRead(notif.id)}
                          className="p-1 rounded hover:bg-gray-700 transition-colors"
                          title="Mark as read"
                        >
                          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 12l2 2 4-4 1.5 1.5L11 16 7.5 12.5 9 12z"/>
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => removeNotification(notif.id)}
                        className="p-1 rounded hover:bg-gray-700 transition-colors"
                        title="Remove notification"
                      >
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
