'use client';

import { useState, useEffect } from 'react';
import { playlistApi } from '@/lib/api';
import { getWebSocketClient } from '@/lib/websocket';
import TrackLibrary from '@/components/TrackLibrary';
import Playlist from '@/components/Playlist';
import NowPlaying from '@/components/NowPlaying';
import ConnectionStatus from '@/components/ConnectionStatus';

export default function Home() {
  const [playlist, setPlaylist] = useState([]);
  const [currentPlayingId, setCurrentPlayingId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlaylist();
    setupWebSocket();
    
    return () => {
      const ws = getWebSocketClient();
      ws.disconnect();
    };
  }, []);

  const loadPlaylist = async () => {
    try {
      setLoading(true);
      const data = await playlistApi.getAll();
      setPlaylist(data);
      
      // Find currently playing track
      const playing = data.find(item => item.is_playing);
      setCurrentPlayingId(playing?.id || null);
    } catch (error) {
      console.error('Error loading playlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocket = () => {
    const ws = getWebSocketClient();
    ws.connect();

    // Handle playlist events
    ws.on('track.added', (message) => {
      loadPlaylist();
    });

    ws.on('track.removed', (message) => {
      loadPlaylist();
    });

    ws.on('track.moved', (message) => {
      loadPlaylist();
    });

    ws.on('track.voted', (message) => {
      setPlaylist(prev => 
        prev.map(item => 
          item.id === message.item.id ? message.item : item
        )
      );
    });

    ws.on('track.playing', (message) => {
      setCurrentPlayingId(message.id);
      setPlaylist(prev =>
        prev.map(item => ({
          ...item,
          is_playing: item.id === message.id,
        }))
      );
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-medium mb-2">Loading playlist...</div>
          <div className="text-gray-500">Please wait</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                🎵 Collaborative Playlist
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Real-time collaborative playlist manager
              </p>
            </div>
            <ConnectionStatus />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 py-4 gap-4">
        {/* Track Library */}
        <div className="w-1/3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <TrackLibrary playlistTracks={playlist} onAddTrack={loadPlaylist} />
        </div>

        {/* Playlist */}
        <div className="w-2/3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <Playlist 
            playlist={playlist} 
            onUpdate={loadPlaylist}
            currentPlayingId={currentPlayingId}
          />
        </div>
      </div>

      {/* Now Playing Bar */}
      <NowPlaying playlist={playlist} />
    </div>
  );
}

