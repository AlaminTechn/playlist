import request from 'supertest';
import app from '../server.js';
import prisma from '../config/database.js';

describe('Playlist API (supertest)', () => {
  let trackId;
  let itemId;

  beforeAll(async () => {
    await prisma.playlistTrack.deleteMany();
    await prisma.track.deleteMany();

    const t = await prisma.track.create({
      data: { title: 'Test T', artist: 'Artist', duration_seconds: 180 },
    });
    trackId = t.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('GET /api/tracks returns library', async () => {
    const res = await request(app).get('/api/tracks').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('title');
  });

  it('POST /api/playlist adds track', async () => {
    const res = await request(app)
      .post('/api/playlist')
      .send({ track_id: trackId, added_by: 'User' })
      .expect(201);
    expect(res.body.track_id).toBe(trackId);
    itemId = res.body.id;
  });

  it('PATCH /api/playlist/:id sets playing', async () => {
    const res = await request(app)
      .patch(`/api/playlist/${itemId}`)
      .send({ is_playing: true })
      .expect(200);
    expect(res.body.is_playing).toBe(true);
  });

  it('POST /api/playlist/:id/vote increments', async () => {
    const res = await request(app)
      .post(`/api/playlist/${itemId}/vote`)
      .send({ direction: 'up' })
      .expect(200);
    expect(typeof res.body.votes).toBe('number');
  });

  it('DELETE /api/playlist/:id removes item', async () => {
    await request(app).delete(`/api/playlist/${itemId}`).expect(204);
  });
});


