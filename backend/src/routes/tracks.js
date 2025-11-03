import express from 'express';
import prisma from '../config/database.js';

const router = express.Router();

/**
 * GET /api/tracks
 * Get all available tracks in the library
 */
router.get('/', async (req, res) => {
  try {
    const tracks = await prisma.track.findMany({
      orderBy: [
        { artist: 'asc' },
        { title: 'asc' },
      ],
    });

    res.json(tracks);
  } catch (error) {
    console.error('Error fetching tracks:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch tracks',
        details: error.message,
      },
    });
  }
});

/**
 * GET /api/tracks/:id
 * Get a specific track by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const track = await prisma.track.findUnique({
      where: { id: req.params.id },
    });

    if (!track) {
      return res.status(404).json({
        error: {
          code: 'TRACK_NOT_FOUND',
          message: 'Track not found',
          details: { track_id: req.params.id },
        },
      });
    }

    res.json(track);
  } catch (error) {
    console.error('Error fetching track:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch track',
        details: error.message,
      },
    });
  }
});

export default router;

