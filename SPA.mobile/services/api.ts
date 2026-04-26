import axios from 'axios';

// Replace with your actual backend URL
const BASE_URL = 'http://localhost:3000'; 

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

export const parkingService = {
  getLocations: async (query?: any) => {
    const response = await api.get('/parking-locations', { params: query });
    return response.data;
  },
  
  getNearbyLocations: async (lat: number, lng: number, radius?: number) => {
    const response = await api.get('/parking-locations/nearby', {
      params: { lat, lng, radius },
    });
    return response.data;
  },
  
  getLocationDetail: async (id: string) => {
    const response = await api.get(`/parking-locations/${id}`);
    return response.data;
  },
  
  getSlots: async (id: string) => {
    const response = await api.get(`/parking-locations/${id}/slots`);
    return response.data;
  },
};
