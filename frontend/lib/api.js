import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const tracksApi = {
  getAll: async () => {
    const response = await api.get('/api/tracks');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/api/tracks/${id}`);
    return response.data;
  },
};

export const playlistApi = {
  getAll: async () => {
    const response = await api.get('/api/playlist');
    return response.data;
  },
  
  add: async (trackId, addedBy, options = {}) => {
    const response = await api.post('/api/playlist', {
      track_id: trackId,
      added_by: addedBy,
      ...options,
    });
    return response.data;
  },
  
  update: async (id, updates) => {
    const response = await api.patch(`/api/playlist/${id}`, updates);
    return response.data;
  },
  
  vote: async (id, direction) => {
    const response = await api.post(`/api/playlist/${id}/vote`, {
      direction,
    });
    return response.data;
  },
  
  remove: async (id) => {
    await api.delete(`/api/playlist/${id}`);
  },
  
  setPlaying: async (id) => {
    const response = await api.patch(`/api/playlist/${id}`, {
      is_playing: true,
    });
    return response.data;
  },
};

export default api;

