'use client';

import { useState, useEffect, useMemo } from 'react';
import { tracksApi, playlistApi } from '@/lib/api';

export default function TrackLibrary({ playlistTracks, onAddTrack }) {
  const [tracks, setTracks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTracks();
  }, []);

  const loadTracks = async () => {
    try {
      setLoading(true);
      const data = await tracksApi.getAll();
      setTracks(data);
    } catch (error) {
      console.error('Error loading tracks:', error);
    } finally {
      setLoading(false);
    }
  };

  const playlistTrackIds = new Set(playlistTracks.map(t => t.track_id));

  const genres = useMemo(() => {
    const genreSet = new Set(['all']);
    tracks.forEach(track => {
      if (track.genre) {
        genreSet.add(track.genre);
      }
    });
    return Array.from(genreSet).sort();
  }, [tracks]);

  const filteredTracks = useMemo(() => {
    return tracks.filter(track => {
      const matchesSearch = 
        track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (track.album && track.album.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesGenre = selectedGenre === 'all' || track.genre === selectedGenre;
      
      return matchesSearch && matchesGenre;
    });
  }, [tracks, searchQuery, selectedGenre]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddTrack = async (trackId) => {
    try {
      await playlistApi.add(trackId, 'User', {});
      if (onAddTrack) {
        onAddTrack();
      }
    } catch (error) {
      console.error('Error adding track:', error);
      if (error.response?.data?.error?.code === 'DUPLICATE_TRACK') {
        alert('This track is already in the playlist');
      }
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="text-center text-gray-500">Loading tracks...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b space-y-3">
        <h2 className="text-xl font-bold">Track Library</h2>
        
        <input
          type="text"
          placeholder="Search tracks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        
        <select
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {genres.map(genre => (
            <option key={genre} value={genre}>
              {genre === 'all' ? 'All Genres' : genre}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {filteredTracks.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No tracks found
            </div>
          ) : (
            filteredTracks.map(track => {
              const isInPlaylist = playlistTrackIds.has(track.id);
              
              return (
                <div
                  key={track.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors animate-slide-up"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{track.title}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {track.artist} {track.album && `• ${track.album}`}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDuration(track.duration_seconds)}
                      {track.genre && ` • ${track.genre}`}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleAddTrack(track.id)}
                    disabled={isInPlaylist}
                    className={`ml-4 px-4 py-2 rounded-lg font-medium transition-colors ${
                      isInPlaylist
                        ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-primary-500 text-white hover:bg-primary-600 active:scale-95'
                    }`}
                  >
                    {isInPlaylist ? 'Added' : 'Add'}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

