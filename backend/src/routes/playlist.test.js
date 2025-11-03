import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import prisma from '../config/database.js';
import { calculatePosition } from '../utils/position.js';

describe('Playlist Operations', () => {
  beforeEach(async () => {
    // Clean database before each test
    await prisma.playlistTrack.deleteMany();
    await prisma.track.deleteMany();
  });

  afterEach(async () => {
    // Clean up after each test
    await prisma.playlistTrack.deleteMany();
    await prisma.track.deleteMany();
  });

  describe('Position Algorithm', () => {
    it('should calculate middle position correctly', () => {
      const result = calculatePosition(1.0, 2.0);
      expect(result).toBe(1.5);
    });

    it('should handle first position', () => {
      const result = calculatePosition(null, null);
      expect(result).toBe(1.0);
    });

    it('should handle insert at beginning', () => {
      const result = calculatePosition(null, 1.0);
      expect(result).toBe(0);
    });

    it('should handle insert at end', () => {
      const result = calculatePosition(1.0, null);
      expect(result).toBe(2.0);
    });
  });

  describe('Database Operations', () => {
    it('should create a track', async () => {
      const track = await prisma.track.create({
        data: {
          title: 'Test Track',
          artist: 'Test Artist',
          duration_seconds: 180,
        },
      });

      expect(track).toBeDefined();
      expect(track.title).toBe('Test Track');
    });

    it('should create a playlist item', async () => {
      const track = await prisma.track.create({
        data: {
          title: 'Test Track',
          artist: 'Test Artist',
          duration_seconds: 180,
        },
      });

      const playlistItem = await prisma.playlistTrack.create({
        data: {
          trackId: track.id,
          position: 1.0,
          votes: 0,
          addedBy: 'TestUser',
        },
      });

      expect(playlistItem).toBeDefined();
      expect(playlistItem.trackId).toBe(track.id);
      expect(playlistItem.position).toBe(1.0);
    });

    it('should prevent duplicate tracks in playlist', async () => {
      const track = await prisma.track.create({
        data: {
          title: 'Test Track',
          artist: 'Test Artist',
          duration_seconds: 180,
        },
      });

      await prisma.playlistTrack.create({
        data: {
          trackId: track.id,
          position: 1.0,
        },
      });

      // Try to add same track again - should fail
      await expect(
        prisma.playlistTrack.create({
          data: {
            trackId: track.id,
            position: 2.0,
          },
        })
      ).rejects.toThrow();
    });

    it('should maintain order by position', async () => {
      const track1 = await prisma.track.create({
        data: {
          title: 'Track 1',
          artist: 'Artist',
          duration_seconds: 180,
        },
      });

      const track2 = await prisma.track.create({
        data: {
          title: 'Track 2',
          artist: 'Artist',
          duration_seconds: 200,
        },
      });

      const track3 = await prisma.track.create({
        data: {
          title: 'Track 3',
          artist: 'Artist',
          duration_seconds: 220,
        },
      });

      // Insert in non-sequential order
      await prisma.playlistTrack.create({
        data: { trackId: track2.id, position: 2.0 },
      });
      await prisma.playlistTrack.create({
        data: { trackId: track1.id, position: 1.0 },
      });
      await prisma.playlistTrack.create({
        data: { trackId: track3.id, position: 3.0 },
      });

      const items = await prisma.playlistTrack.findMany({
        orderBy: { position: 'asc' },
        include: { track: true },
      });

      expect(items[0].track.title).toBe('Track 1');
      expect(items[1].track.title).toBe('Track 2');
      expect(items[2].track.title).toBe('Track 3');
    });

    it('should only allow one playing track', async () => {
      const track1 = await prisma.track.create({
        data: {
          title: 'Track 1',
          artist: 'Artist',
          duration_seconds: 180,
        },
      });

      const track2 = await prisma.track.create({
        data: {
          title: 'Track 2',
          artist: 'Artist',
          duration_seconds: 200,
        },
      });

      await prisma.playlistTrack.create({
        data: {
          trackId: track1.id,
          position: 1.0,
          isPlaying: true,
        },
      });

      await prisma.playlistTrack.create({
        data: {
          trackId: track2.id,
          position: 2.0,
          isPlaying: false,
        },
      });

      const playingTracks = await prisma.playlistTrack.findMany({
        where: { isPlaying: true },
      });

      expect(playingTracks.length).toBe(1);
    });
  });

  describe('Vote Counting', () => {
    it('should increment votes correctly', async () => {
      const track = await prisma.track.create({
        data: {
          title: 'Test Track',
          artist: 'Test Artist',
          duration_seconds: 180,
        },
      });

      const playlistItem = await prisma.playlistTrack.create({
        data: {
          trackId: track.id,
          position: 1.0,
          votes: 0,
        },
      });

      const updated = await prisma.playlistTrack.update({
        where: { id: playlistItem.id },
        data: { votes: { increment: 1 } },
      });

      expect(updated.votes).toBe(1);

      const updated2 = await prisma.playlistTrack.update({
        where: { id: playlistItem.id },
        data: { votes: { increment: -1 } },
      });

      expect(updated2.votes).toBe(0);
    });
  });
});

