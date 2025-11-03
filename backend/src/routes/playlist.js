import express from 'express';
import prisma from '../config/database.js';
import { calculatePosition, getEndPosition } from '../utils/position.js';
import { broadcastPlaylistEvent } from '../websocket/server.js';

const router = express.Router();

/**
 * GET /api/playlist
 * Get current playlist ordered by position
 */
router.get('/', async (req, res) => {
  try {
    const items = await prisma.playlistTrack.findMany({
      include: {
        track: true,
      },
      orderBy: {
        position: 'asc',
      },
    });

    const formatted = items.map(item => ({
      id: item.id,
      track_id: item.trackId,
      track: {
        id: item.track.id,
        title: item.track.title,
        artist: item.track.artist,
        album: item.track.album,
        duration_seconds: item.track.duration_seconds,
        genre: item.track.genre,
        cover_url: item.track.cover_url,
      },
      position: item.position,
      votes: item.votes,
      added_by: item.addedBy,
      added_at: item.addedAt.toISOString(),
      is_playing: item.isPlaying,
      played_at: item.playedAt?.toISOString() || null,
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching playlist:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch playlist',
        details: error.message,
      },
    });
  }
});

/**
 * POST /api/playlist
 * Add a track to the playlist
 */
router.post('/', async (req, res) => {
  try {
    const { track_id, added_by, position: targetPosition, before_id, after_id } = req.body;

    if (!track_id) {
      return res.status(400).json({
        error: {
          code: 'MISSING_TRACK_ID',
          message: 'track_id is required',
        },
      });
    }

    // Check if track exists
    const track = await prisma.track.findUnique({
      where: { id: track_id },
    });

    if (!track) {
      return res.status(404).json({
        error: {
          code: 'TRACK_NOT_FOUND',
          message: 'Track not found',
          details: { track_id },
        },
      });
    }

    // Check if track is already in playlist
    const existing = await prisma.playlistTrack.findUnique({
      where: { trackId: track_id },
    });

    if (existing) {
      return res.status(409).json({
        error: {
          code: 'DUPLICATE_TRACK',
          message: 'This track is already in the playlist',
          details: { track_id },
        },
      });
    }

    // Calculate position
    let newPosition;
    
    if (targetPosition !== undefined) {
      // Explicit position provided
      newPosition = targetPosition;
    } else if (before_id || after_id) {
      // Insert before/after specific item
      const beforeItem = before_id ? await prisma.playlistTrack.findUnique({
        where: { id: before_id },
      }) : null;
      
      const afterItem = after_id ? await prisma.playlistTrack.findUnique({
        where: { id: after_id },
      }) : null;

      if (before_id && !beforeItem) {
        return res.status(404).json({
          error: {
            code: 'ITEM_NOT_FOUND',
            message: 'Before item not found',
            details: { item_id: before_id },
          },
        });
      }

      if (after_id && !afterItem) {
        return res.status(404).json({
          error: {
            code: 'ITEM_NOT_FOUND',
            message: 'After item not found',
            details: { item_id: after_id },
          },
        });
      }

      const prevPosition = afterItem?.position || null;
      const nextPosition = beforeItem?.position || null;
      newPosition = calculatePosition(prevPosition, nextPosition);
    } else {
      // Add to end
      const maxPosition = await prisma.playlistTrack.aggregate({
        _max: { position: true },
      });
      newPosition = getEndPosition(maxPosition._max.position);
    }

    // Create playlist item
    const playlistItem = await prisma.playlistTrack.create({
      data: {
        trackId: track_id,
        position: newPosition,
        addedBy: added_by || 'Anonymous',
      },
      include: {
        track: true,
      },
    });

    const formatted = {
      id: playlistItem.id,
      track_id: playlistItem.trackId,
      track: {
        id: playlistItem.track.id,
        title: playlistItem.track.title,
        artist: playlistItem.track.artist,
        album: playlistItem.track.album,
        duration_seconds: playlistItem.track.duration_seconds,
        genre: playlistItem.track.genre,
        cover_url: playlistItem.track.cover_url,
      },
      position: playlistItem.position,
      votes: playlistItem.votes,
      added_by: playlistItem.addedBy,
      added_at: playlistItem.addedAt.toISOString(),
      is_playing: playlistItem.isPlaying,
      played_at: playlistItem.playedAt?.toISOString() || null,
    };

    // Broadcast event
    broadcastPlaylistEvent('track.added', { item: formatted });

    res.status(201).json(formatted);
  } catch (error) {
    console.error('Error adding track to playlist:', error);
    
    if (error.code === 'P2002') {
      return res.status(409).json({
        error: {
          code: 'DUPLICATE_TRACK',
          message: 'This track is already in the playlist',
        },
      });
    }

    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to add track to playlist',
        details: error.message,
      },
    });
  }
});

/**
 * PATCH /api/playlist/:id
 * Update playlist item (position, is_playing)
 */
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { position, is_playing } = req.body;

    const updates = {};

    if (position !== undefined) {
      updates.position = position;
    }

    if (is_playing !== undefined) {
      // If setting to playing, unset all other playing tracks
      if (is_playing) {
        await prisma.playlistTrack.updateMany({
          where: { isPlaying: true },
          data: { isPlaying: false },
        });
        updates.isPlaying = true;
        updates.playedAt = new Date();
      } else {
        updates.isPlaying = false;
      }
    }

    const updated = await prisma.playlistTrack.update({
      where: { id },
      data: updates,
      include: {
        track: true,
      },
    });

    const formatted = {
      id: updated.id,
      track_id: updated.trackId,
      track: {
        id: updated.track.id,
        title: updated.track.title,
        artist: updated.track.artist,
        album: updated.track.album,
        duration_seconds: updated.track.duration_seconds,
        genre: updated.track.genre,
        cover_url: updated.track.cover_url,
      },
      position: updated.position,
      votes: updated.votes,
      added_by: updated.addedBy,
      added_at: updated.addedAt.toISOString(),
      is_playing: updated.isPlaying,
      played_at: updated.playedAt?.toISOString() || null,
    };

    // Broadcast event
    if (position !== undefined) {
      broadcastPlaylistEvent('track.moved', { item: formatted });
    }
    if (is_playing !== undefined) {
      if (is_playing) {
        broadcastPlaylistEvent('track.playing', { id: updated.id });
      }
    }

    res.json(formatted);
  } catch (error) {
    console.error('Error updating playlist item:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        error: {
          code: 'ITEM_NOT_FOUND',
          message: 'Playlist item not found',
          details: { item_id: req.params.id },
        },
      });
    }

    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update playlist item',
        details: error.message,
      },
    });
  }
});

/**
 * POST /api/playlist/:id/vote
 * Vote on a track (upvote or downvote)
 */
router.post('/:id/vote', async (req, res) => {
  try {
    const { id } = req.params;
    const { direction } = req.body;

    if (!direction || !['up', 'down'].includes(direction)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_VOTE_DIRECTION',
          message: 'direction must be "up" or "down"',
        },
      });
    }

    const voteIncrement = direction === 'up' ? 1 : -1;

    const updated = await prisma.playlistTrack.update({
      where: { id },
      data: {
        votes: {
          increment: voteIncrement,
        },
      },
      include: {
        track: true,
      },
    });

    const formatted = {
      id: updated.id,
      track_id: updated.trackId,
      track: {
        id: updated.track.id,
        title: updated.track.title,
        artist: updated.track.artist,
        album: updated.track.album,
        duration_seconds: updated.track.duration_seconds,
        genre: updated.track.genre,
        cover_url: updated.track.cover_url,
      },
      position: updated.position,
      votes: updated.votes,
      added_by: updated.addedBy,
      added_at: updated.addedAt.toISOString(),
      is_playing: updated.isPlaying,
      played_at: updated.playedAt?.toISOString() || null,
    };

    // Broadcast event
    broadcastPlaylistEvent('track.voted', { item: formatted });

    res.json(formatted);
  } catch (error) {
    console.error('Error voting on track:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        error: {
          code: 'ITEM_NOT_FOUND',
          message: 'Playlist item not found',
          details: { item_id: req.params.id },
        },
      });
    }

    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to vote on track',
        details: error.message,
      },
    });
  }
});

/**
 * DELETE /api/playlist/:id
 * Remove a track from the playlist
 */
router.delete('/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    
    await prisma.playlistTrack.delete({
      where: { id: itemId },
    });

    // Broadcast event
    broadcastPlaylistEvent('track.removed', { id: itemId });

    res.status(204).send();
  } catch (error) {
    console.error('Error removing track from playlist:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        error: {
          code: 'ITEM_NOT_FOUND',
          message: 'Playlist item not found',
          details: { item_id: req.params.id },
        },
      });
    }

    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to remove track from playlist',
        details: error.message,
      },
    });
  }
});

export default router;

