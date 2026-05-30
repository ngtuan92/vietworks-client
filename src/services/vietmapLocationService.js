// src/services/vietmapLocationService.js
import axios from 'axios';

const VIETMAP_API_KEY = import.meta.env.VITE_VIETMAP_API_KEY;

export const searchVietMapPlaces = async (text) => {
  if (!text?.trim()) return [];

  const response = await axios.get('https://maps.vietmap.vn/api/autocomplete/v4', {
    params: {
      apikey: VIETMAP_API_KEY,
      text,
      display_type: 5
    }
  });

  return response.data || [];
};

export const getVietMapPlaceDetail = async (refId) => {
  const response = await axios.get('https://maps.vietmap.vn/api/place/v4', {
    params: {
      apikey: VIETMAP_API_KEY,
      refid: refId
    }
  });

  return response.data;
};