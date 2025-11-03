import React from 'react';

export default function PlaylistHeader({ title = 'Collaborative Playlist', coverUrl, totalTracks = 0, totalDurationLabel = '0:00', followersLabel = 'Public', onPlayAll, compact = false }) {
  if (compact) {
    return (
      <div className="m-3 p-3 rounded-xl border border-gray-700/60 bg-gray-800/70 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-md shadow-xl bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center overflow-hidden">
            {coverUrl ? (
              <img src={coverUrl} alt={title} className="w-full h-full object-cover" />
            ) : (
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase tracking-wide text-gray-400">Playing from</div>
            <div className="text-lg font-bold text-white truncate">{title}</div>
            <div className="mt-1 text-xs text-gray-300 space-x-2 truncate">
              <span className="text-white/90">{followersLabel}</span>
              <span>•</span>
              <span>{totalTracks} tracks</span>
              <span>•</span>
              <span>{totalDurationLabel}</span>
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button onClick={onPlayAll} className="px-3 py-1.5 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-200 hover:scale-105 active:scale-95 shadow-md">
            Play
          </button>
          <button className="px-3 py-1.5 rounded-full border border-gray-600 text-gray-200 text-sm hover:bg-gray-700/60 transition-colors">
            Follow
          </button>
        </div>
      </div>
    );
  }

  // Minimal top navigation bar
  return (
    <div className="bg-gray-900/60 backdrop-blur-sm sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
        {/* Home button */}
        <button className="p-2 rounded-full bg-gray-800 text-gray-200 hover:text-white hover:bg-gray-700 transition-colors" title="Home">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
          </svg>
        </button>

        {/* Back / Forward (disabled visuals) */}
        <div className="hidden md:flex items-center gap-2">
          <button className="p-2 rounded-full bg-gray-800 text-gray-400 cursor-not-allowed" title="Back">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
          </button>
          <button className="p-2 rounded-full bg-gray-800 text-gray-400 cursor-not-allowed" title="Forward">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>

        {/* Search field */}
        <div className="flex-1">
          <div className="relative max-w-xl">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"/></svg>
            </span>
            <input
              type="text"
              placeholder="What do you want to play?"
              className="w-full pl-9 pr-3 py-2 rounded-full bg-gray-800 text-gray-200 placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* User actions */}
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-full border border-gray-700 text-gray-200 hover:bg-gray-800/80">Explore Premium</button>
          <button className="p-2 rounded-full bg-gray-800 text-gray-200 hover:text-white hover:bg-gray-700" title="Notifications">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
          </button>
          <button className="p-1.5 rounded-full bg-gray-700 text-white" title="Account">
            <span className="inline-flex w-7 h-7 items-center justify-center rounded-full bg-primary-600 text-white font-semibold">U</span>
          </button>
        </div>
      </div>
    </div>
  );
}
