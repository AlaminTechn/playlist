'use client';

import { useState, useEffect, useRef } from 'react';
import { playlistApi } from '@/lib/api';

export default function NowPlaying({ playlist, onPlaybackStateChange }) {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [playStartTime, setPlayStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [volume, setVolume] = useState(0.6); // 0..1 (UI only)
  const [isMuted, setIsMuted] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekProgress, setSeekProgress] = useState(null);
  const progressBarRef = useRef(null);

  useEffect(() => {
    const playing = playlist.find(item => item.is_playing);
    if (playing) {
      setCurrentTrack(playing);
      setProgress(0);
      setElapsedTime(0);
      setPlayStartTime(Date.now());
      setIsPaused(false);
      if (onPlaybackStateChange) {
        onPlaybackStateChange({ paused: false, hasTrack: true });
      }
    } else {
      setCurrentTrack(null);
      setProgress(0);
      setElapsedTime(0);
      if (onPlaybackStateChange) {
        onPlaybackStateChange({ paused: false, hasTrack: false });
      }
    }
  }, [playlist]);

  useEffect(() => {
    if (!currentTrack || isPaused || isSeeking) return;
    const interval = setInterval(() => {
      const elapsed = (Date.now() - playStartTime) / 1000;
      const totalDuration = currentTrack.track.duration_seconds;
      const newProgress = Math.min(elapsed / totalDuration, 1);
      setElapsedTime(elapsed);
      setProgress(newProgress);
      if (newProgress >= 1) {
        playNextTrack();
      }
    }, 100);
    return () => clearInterval(interval);
  }, [currentTrack, isPaused, playStartTime, isSeeking]);

  const playNextTrack = async () => {
    if (!currentTrack) return;
    const currentIndex = playlist.findIndex(item => item.id === currentTrack.id);
    if (currentIndex === -1) return;
    const nextIndex = currentIndex + 1;
    if (nextIndex < playlist.length) {
      const nextTrack = playlist[nextIndex];
      try { await playlistApi.setPlaying(nextTrack.id); } catch (e) { console.error(e); }
    }
  };

  const playPrevTrack = async () => {
    if (!currentTrack) return;
    const currentIndex = playlist.findIndex(item => item.id === currentTrack.id);
    if (currentIndex === -1) return;
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      const prevTrack = playlist[prevIndex];
      try { await playlistApi.setPlaying(prevTrack.id); } catch (e) { console.error(e); }
    }
  };

  const handleTogglePause = () => {
    const next = !isPaused;
    setIsPaused(next);
    if (!isPaused) {
      const remainingTime = currentTrack.track.duration_seconds - elapsedTime;
      setPlayStartTime(Date.now() - (currentTrack.track.duration_seconds - remainingTime) * 1000);
    }
    if (onPlaybackStateChange) {
      onPlaybackStateChange({ paused: next, hasTrack: Boolean(currentTrack) });
    }
  };

  const handleSkip = () => { playNextTrack(); };

  const handleProgressClick = (e) => {
    if (!currentTrack || !progressBarRef.current) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const progressBarWidth = rect.width;
    const clickProgress = Math.max(0, Math.min(1, clickX / progressBarWidth));
    
    seekToPosition(clickProgress);
  };

  const handleProgressMouseDown = (e) => {
    e.preventDefault();
    setIsSeeking(true);
    updateSeekPosition(e);
    
    const handleMouseMove = (e) => {
      updateSeekPosition(e);
    };
    
    const handleMouseUp = () => {
      if (seekProgress !== null) {
        seekToPosition(seekProgress);
      }
      setIsSeeking(false);
      setSeekProgress(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleProgressWheel = (e) => {
    e.preventDefault();
    if (!currentTrack) return;
    
    const scrollDelta = e.deltaY > 0 ? -0.05 : 0.05; // Scroll down = backward, up = forward
    const currentProgress = isSeeking ? (seekProgress || progress) : progress;
    const newProgress = Math.max(0, Math.min(1, currentProgress + scrollDelta));
    
    if (isSeeking) {
      setSeekProgress(newProgress);
    } else {
      seekToPosition(newProgress);
    }
  };

  const updateSeekPosition = (e) => {
    if (!progressBarRef.current) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const progressBarWidth = rect.width;
    const newSeekProgress = Math.max(0, Math.min(1, mouseX / progressBarWidth));
    
    setSeekProgress(newSeekProgress);
  };

  const seekToPosition = (newProgress) => {
    if (!currentTrack) return;
    
    const totalDuration = currentTrack.track.duration_seconds;
    const newElapsedTime = newProgress * totalDuration;
    
    setProgress(newProgress);
    setElapsedTime(newElapsedTime);
    setPlayStartTime(Date.now() - newElapsedTime * 1000);
    setSeekProgress(null);
    setIsSeeking(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const effectiveVolume = isMuted ? 0 : volume;
  const displayProgress = isSeeking && seekProgress !== null ? seekProgress : progress;
  const displayElapsedTime = isSeeking && seekProgress !== null 
    ? seekProgress * currentTrack.track.duration_seconds 
    : elapsedTime;

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
              <img 
                src={currentTrack.track.cover_url} 
                alt={currentTrack.track.title} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  e.target.src = `https://picsum.photos/seed/${currentTrack.track.title}/48/48.jpg`;
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-700" />
            )}
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
            <button className="p-2 text-gray-400 hover:text-white" title="Shuffle">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4l5 5m0 0l5-5m-5 5L9 9m6 6l5 5m0 0l-5-5m5 5l-1-1M4 20l5-5"/></svg>
            </button>
            <button onClick={playPrevTrack} className="p-2 text-gray-300 hover:text-white" title="Previous">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 5h2v14H6z"/><path d="M20 6v12l-8.5-6L20 6z"/></svg>
            </button>
            <button onClick={handleTogglePause} className="p-2 rounded-full bg-white text-gray-900 hover:scale-105 active:scale-95 transition-transform" title={isPaused ? 'Play' : 'Pause'}>
              {isPaused ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
              )}
            </button>
            <button onClick={handleSkip} className="p-2 text-gray-300 hover:text-white" title="Next">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 5h2v14h-2z"/><path d="M4 6l8.5 6L4 18V6z"/></svg>
            </button>
            <button className="p-2 text-gray-400 hover:text-white" title="Queue">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h7"/></svg>
            </button>
          </div>

          <div className="mt-2 w-full flex items-center gap-2 text-[11px] text-gray-400">
            <span className="w-10 text-right">{formatTime(displayElapsedTime)}</span>
            <div 
              ref={progressBarRef}
              className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden cursor-pointer group relative"
              onClick={handleProgressClick}
              onMouseDown={handleProgressMouseDown}
              onWheel={handleProgressWheel}
            >
              <div 
                className={`h-full transition-all ${isSeeking ? 'bg-blue-400' : 'bg-white group-hover:bg-gray-200'}`} 
                style={{ width: `${displayProgress * 100}%` }} 
              />
              {isSeeking && (
                <div 
                  className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-400 rounded-full shadow-lg border border-white"
                  style={{ left: `${displayProgress * 100}%`, marginLeft: '-6px' }}
                />
              )}
              {/* Hover indicator */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="h-full bg-white/20 pointer-events-none" />
              </div>
            </div>
            <span className="w-10">{formatTime(total)}</span>
          </div>
        </div>

        {/* Right: lyrics + volume + fullscreen */}
        <div className="flex items-center justify-end gap-3 text-gray-300">
          <button className="p-2 hover:text-white" title="Lyrics">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16h6M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </button>
          {/* Mute/Unmute */}
          <button
            onClick={() => setIsMuted(v => !v)}
            className="p-2 hover:text-white"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {effectiveVolume === 0 ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 9v6h4l5 5V4l-5 5H9z"/><path d="M19 9l-6 6" stroke="currentColor" strokeWidth="2"/></svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 10v4h4l5 5V5L7 10H3z"/></svg>
            )}
          </button>
          {/* Volume slider */}
          <div className="flex items-center gap-2 w-32 select-none">
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(effectiveVolume * 100)}
              onChange={(e) => {
                const val = Number(e.target.value) / 100;
                setIsMuted(false);
                setVolume(val);
              }}
              className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <button className="p-2 hover:text-white" title="Fullscreen">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 3H5a2 2 0 00-2 2v3m0 6v3a2 2 0 002 2h3m8-16h3a2 2 0 012 2v3m0 6v3a2 2 0 01-2 2h-3"/></svg>
          </button>
        </div>
      </div>
      <div className="max-w-[1400px] mx-auto px-4 pb-2 text-[11px] text-gray-500">
        Note: Playback is simulated for this demo – no real audio output. Scroll or click on the progress bar to seek.
      </div>
    </div>
  );
}
