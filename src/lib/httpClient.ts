import axios from 'axios';

// Use Next.js API routes as proxy instead of direct backend calls
// This keeps all auth logic in the backend
export const httpClient = axios.create({
  baseURL: '/api/auth', // Proxy through Next.js API routes
  withCredentials: true,
});

// Pokemon API client - proxies through Next.js API routes
export const pokemonHttpClient = axios.create({
  baseURL: '/api/pokemon', // Proxy through Next.js API routes
  withCredentials: true,
});

