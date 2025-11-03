'use client';

import { useState, useEffect } from 'react';
import { playlistApi } from '@/lib/api';

export default function NowPlaying({ playlist }) {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [playStartTime, setPlayStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    // Find currently playing track
    const playing = playlist.find(item => item.is_playing);
    
    if (playing) {
      setCurrentTrack(playing);
      setProgress(0);
      setElapsedTime(0);
      setPlayStartTime(Date.now());
      setIsPaused(false);
    } else {
      setCurrentTrack(null);
      setProgress(0);
      setElapsedTime(0);
    }
  }, [playlist]);

  useEffect(() => {
    if (!currentTrack || isPaused) return;

    const interval = setInterval(() => {
      const elapsed = (Date.now() - playStartTime) / 1000;
      const totalDuration = currentTrack.track.duration_seconds;
      const newProgress = Math.min(elapsed / totalDuration, 1);

      setElapsedTime(elapsed);
      setProgress(newProgress);

      // Auto-advance to next track
      if (newProgress >= 1) {
        playNextTrack();
      }
    }, 100); // Update every 100ms for smooth progress

    return () => clearInterval(interval);
  }, [currentTrack, isPaused, playStartTime]);

  const playNextTrack = async () => {
    if (!currentTrack) return;

    const currentIndex = playlist.findIndex(item => item.id === currentTrack.id);
    if (currentIndex === -1) return;

    const nextIndex = currentIndex + 1;
    if (nextIndex < playlist.length) {
      const nextTrack = playlist[nextIndex];
      try {
        await playlistApi.setPlaying(nextTrack.id);
      } catch (error) {
        console.error('Error playing next track:', error);
      }
    }
  };

  const handleTogglePause = () => {
    setIsPaused(!isPaused);
    if (!isPaused) {
      // Adjust start time to account for elapsed time
      const remainingTime = currentTrack.track.duration_seconds - elapsedTime;
      setPlayStartTime(Date.now() - (currentTrack.track.duration_seconds - remainingTime) * 1000);
    }
  };

  const handleSkip = () => {
    playNextTrack();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentTrack) {
    return (
      <div className="border-t bg-gray-50 dark:bg-gray-900 p-4">
        <div className="text-center text-gray-500">
          No track is currently playing
        </div>
      </div>
    );
  }

  return (
    <div className="border-t bg-white dark:bg-gray-800 shadow-lg">
      <div className="p-4">
        <div className="flex items-center gap-4">
          {/* Album Art / Placeholder */}
          <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
            {currentTrack.track.cover_url ? (
              <img
                src={currentTrack.track.cover_url}
                alt={currentTrack.track.title}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            )}
          </div>

          {/* Track Info */}
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{currentTrack.track.title}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {currentTrack.track.artist}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleTogglePause}
              className="p-3 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors"
              aria-label={isPaused ? 'Play' : 'Pause'}
            >
              {isPaused ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              )}
            </button>
            <button
              onClick={handleSkip}
              className="p-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Skip"
              disabled={playlist.findIndex(item => item.id === currentTrack.id) === playlist.length - 1}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>{formatTime(elapsedTime)}</span>
            <span>{formatTime(currentTrack.track.duration_seconds)}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary-500 h-full transition-all duration-100"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

