import axios from 'axios';

/**
 * HTTP client for authentication endpoints
 * Automatically includes cookies for auth token
 */
export const httpClient = axios.create({
  baseURL: '/api/auth',
  withCredentials: true,
});

/**
 * HTTP client for Pokemon API endpoints
 * Automatically includes cookies for auth token verification
 */
export const pokemonHttpClient = axios.create({
  baseURL: '/api/pokemon',
  withCredentials: true,
});

