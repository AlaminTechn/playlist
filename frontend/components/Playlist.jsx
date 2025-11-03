'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { playlistApi } from '@/lib/api';
import { calculatePosition } from '@/lib/position';

export default function Playlist({ playlist, onUpdate, currentPlayingId }) {
  const [localPlaylist, setLocalPlaylist] = useState(playlist);

  useEffect(() => {
    setLocalPlaylist(playlist);
  }, [playlist]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRemove = async (id) => {
    try {
      await playlistApi.remove(id);
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error removing track:', error);
    }
  };

  const handleVote = async (id, direction) => {
    try {
      await playlistApi.vote(id, direction);
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleSetPlaying = async (id) => {
    try {
      await playlistApi.setPlaying(id);
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error setting playing:', error);
    }
  };

  const onDragEnd = async (result) => {
    if (!result.destination) {
      return;
    }

    const { source, destination } = result;

    if (source.index === destination.index) {
      return;
    }

    const items = Array.from(localPlaylist);
    const [reorderedItem] = items.splice(source.index, 1);
    items.splice(destination.index, 0, reorderedItem);

    // Optimistic update
    setLocalPlaylist(items);

    // Calculate new position
    const prevItem = destination.index > 0 ? items[destination.index - 1] : null;
    const nextItem = destination.index < items.length - 1 ? items[destination.index + 1] : null;

    const newPosition = calculatePosition(
      prevItem?.position || null,
      nextItem?.position || null
    );

    try {
      await playlistApi.update(reorderedItem.id, { position: newPosition });
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error reordering track:', error);
      // Revert on failure
      setLocalPlaylist(playlist);
      if (onUpdate) {
        onUpdate();
      }
    }
  };

  const totalDuration = localPlaylist.reduce((sum, item) => sum + item.track.duration_seconds, 0);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Playlist</h2>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {localPlaylist.length} tracks • {formatDuration(totalDuration)}
          </div>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="playlist">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`flex-1 overflow-y-auto p-4 ${
                snapshot.isDraggingOver ? 'bg-gray-50 dark:bg-gray-900' : ''
              }`}
            >
              {localPlaylist.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  Playlist is empty. Add some tracks!
                </div>
              ) : (
                <div className="space-y-2">
                  {localPlaylist.map((item, index) => {
                    const isPlaying = item.is_playing || item.id === currentPlayingId;
                    
                    return (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`group flex items-center gap-3 p-3 border rounded-lg bg-white dark:bg-gray-800 hover:shadow-md transition-all ${
                              isPlaying
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                : 'hover:border-gray-300'
                            } ${
                              snapshot.isDragging
                                ? 'opacity-50 shadow-lg scale-105'
                                : ''
                            }`}
                          >
                            {/* Drag Handle */}
                            <div
                              {...provided.dragHandleProps}
                              className="flex-shrink-0 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 8h16M4 16h16"
                                />
                              </svg>
                            </div>

                            {/* Now Playing Indicator */}
                            {isPlaying && (
                              <div className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full animate-pulse-playing" />
                            )}

                            {/* Track Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <div className={`font-medium truncate ${isPlaying ? 'text-primary-700 dark:text-primary-300' : ''}`}>
                                  {item.track.title}
                                </div>
                                {isPlaying && (
                                  <span className="text-xs bg-primary-500 text-white px-2 py-0.5 rounded-full">
                                    Now Playing
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                {item.track.artist}
                                {item.track.album && ` • ${item.track.album}`}
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                <span>{formatDuration(item.track.duration_seconds)}</span>
                                <span>•</span>
                                <span>Added by {item.added_by}</span>
                              </div>
                            </div>

                            {/* Vote Section */}
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleVote(item.id, 'down')}
                                className="p-1 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                aria-label="Downvote"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                              <div className={`min-w-[2rem] text-center font-medium ${
                                item.votes > 0
                                  ? 'text-green-600 dark:text-green-400'
                                  : item.votes < 0
                                  ? 'text-red-600 dark:text-red-400'
                                  : 'text-gray-500'
                              }`}>
                                {item.votes > 0 ? '+' : ''}{item.votes}
                              </div>
                              <button
                                onClick={() => handleVote(item.id, 'up')}
                                className="p-1 text-gray-500 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                                aria-label="Upvote"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                              </button>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                              {!isPlaying && (
                                <button
                                  onClick={() => handleSetPlaying(item.id)}
                                  className="p-2 text-gray-500 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded transition-colors"
                                  aria-label="Play"
                                >
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                  </svg>
                                </button>
                              )}
                              <button
                                onClick={() => handleRemove(item.id)}
                                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors opacity-0 group-hover:opacity-100"
                                aria-label="Remove"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                </div>
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

