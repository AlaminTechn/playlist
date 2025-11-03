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

  const playPrevTrack = async () => {
    if (!currentTrack) return;

    const currentIndex = playlist.findIndex(item => item.id === currentTrack.id);
    if (currentIndex === -1) return;

    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      const prevTrack = playlist[prevIndex];
      try {
        await playlistApi.setPlaying(prevTrack.id);
      } catch (error) {
        console.error('Error playing previous track:', error);
      }
    }
  };

  const handleTogglePause = () => {
    setIsPaused(!isPaused);
    if (!isPaused) {
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
      <div className="border-t border-gray-800 bg-gray-900/90">
        <div className="max-w-[1400px] mx-auto px-4 py-3 text-center text-gray-400">
          No track is currently playing
        </div>
      </div>
    );
  }

  const total = currentTrack.track.duration_seconds;

  return (
    <div className="border-t border-gray-800 bg-gray-900/95">
      <div className="max-w-[1400px] mx-auto px-4 py-2 grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)] items-center gap-4">
        {/* Left: track summary */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-700 flex-shrink-0">
            {currentTrack.track.cover_url ? (
              <img src={currentTrack.track.cover_url} alt={currentTrack.track.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-700" />)
            }
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm text-white">{currentTrack.track.title}</div>
            <div className="truncate text-xs text-gray-400">{currentTrack.track.artist}</div>
          </div>
          <span className="ml-1 text-green-500">●</span>
        </div>

        {/* Center: controls + progress */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-4">
            {/* Shuffle (visual only) */}
            <button className="p-2 text-gray-400 hover:text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4l5 5m0 0l5-5m-5 5L9 9m6 6l5 5m0 0l-5-5m5 5l-1-1M4 20l5-5"/></svg>
            </button>
            {/* Previous */}
            <button onClick={playPrevTrack} className="p-2 text-gray-300 hover:text-white">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 5h2v14H6z"/><path d="M20 6v12l-8.5-6L20 6z"/></svg>
            </button>
            {/* Play/Pause circle */}
            <button onClick={handleTogglePause} className="p-2 rounded-full bg-white text-gray-900 hover:scale-105 active:scale-95 transition-transform">
              {isPaused ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
              )}
            </button>
            {/* Next */}
            <button onClick={handleSkip} className="p-2 text-gray-300 hover:text-white">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 5h2v14h-2z"/><path d="M4 6l8.5 6L4 18V6z"/></svg>
            </button>
            {/* Queue (visual only) */}
            <button className="p-2 text-gray-400 hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h7"/></svg>
            </button>
          </div>

          {/* Progress */}
          <div className="mt-2 w-full flex items-center gap-2 text-[11px] text-gray-400">
            <span className="w-10 text-right">{formatTime(elapsedTime)}</span>
            <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-white" style={{ width: `${progress * 100}%` }} />
            </div>
            <span className="w-10">{formatTime(total)}</span>
          </div>
        </div>

        {/* Right: extra controls (visual) */}
        <div className="flex items-center justify-end gap-3 text-gray-300">
          <button className="p-2 hover:text-white" title="Lyrics">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16h6M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </button>
          <div className="flex items-center gap-2 w-28">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 10v4h4l5 5V5L7 10H3z"/></svg>
            <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden"><div className="h-full bg-gray-300 w-3/5"/></div>
          </div>
          <button className="p-2 hover:text-white" title="Fullscreen">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 3H5a2 2 0 00-2 2v3m0 6v3a2 2 0 002 2h3m8-16h3a2 2 0 012 2v3m0 6v3a2 2 0 01-2 2h-3"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

