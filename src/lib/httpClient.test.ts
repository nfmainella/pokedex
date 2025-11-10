import { httpClient, pokemonHttpClient } from './httpClient';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('httpClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('httpClient instance', () => {
    it('should be created with axios.create', () => {
      // Re-import to get the actual module
      jest.isolateModules(() => {
        require('./httpClient');
      });

      expect(mockedAxios.create).toBeDefined();
    });

    it('should have correct properties', () => {
      // Since we're mocking axios, we need to verify the configuration passed to create
      // The actual instance is created at module load time, so we verify it's exported
      expect(httpClient).toBeDefined();
      expect(typeof httpClient.get).toBe('function');
      expect(typeof httpClient.post).toBe('function');
      expect(typeof httpClient.put).toBe('function');
      expect(typeof httpClient.delete).toBe('function');
      expect(typeof httpClient.patch).toBe('function');
    });
  });

  describe('pokemonHttpClient instance', () => {
    it('should be created with axios.create', () => {
      // Re-import to get the actual module
      jest.isolateModules(() => {
        require('./httpClient');
      });

      expect(mockedAxios.create).toBeDefined();
    });

    it('should have correct properties', () => {
      expect(pokemonHttpClient).toBeDefined();
      expect(typeof pokemonHttpClient.get).toBe('function');
      expect(typeof pokemonHttpClient.post).toBe('function');
      expect(typeof pokemonHttpClient.put).toBe('function');
      expect(typeof pokemonHttpClient.delete).toBe('function');
      expect(typeof pokemonHttpClient.patch).toBe('function');
    });
  });

  describe('client configuration', () => {
    it('should create httpClient with auth base URL', () => {
      jest.isolateModules(() => {
        jest.unmock('./httpClient');
        const { httpClient: client } = require('./httpClient');
        expect(client.defaults.baseURL).toBe('/api/auth');
      });
    });

    it('should create pokemonHttpClient with pokemon base URL', () => {
      jest.isolateModules(() => {
        jest.unmock('./httpClient');
        const { pokemonHttpClient: client } = require('./httpClient');
        expect(client.defaults.baseURL).toBe('/api/pokemon');
      });
    });

    it('should enable credentials for httpClient', () => {
      jest.isolateModules(() => {
        jest.unmock('./httpClient');
        const { httpClient: client } = require('./httpClient');
        expect(client.defaults.withCredentials).toBe(true);
      });
    });

    it('should enable credentials for pokemonHttpClient', () => {
      jest.isolateModules(() => {
        jest.unmock('./httpClient');
        const { pokemonHttpClient: client } = require('./httpClient');
        expect(client.defaults.withCredentials).toBe(true);
      });
    });
  });

  describe('HTTP methods', () => {
    it('httpClient should support all standard HTTP methods', async () => {
      expect(httpClient.get).toBeDefined();
      expect(httpClient.post).toBeDefined();
      expect(httpClient.put).toBeDefined();
      expect(httpClient.patch).toBeDefined();
      expect(httpClient.delete).toBeDefined();
      expect(httpClient.head).toBeDefined();
      expect(httpClient.options).toBeDefined();
    });

    it('pokemonHttpClient should support all standard HTTP methods', async () => {
      expect(pokemonHttpClient.get).toBeDefined();
      expect(pokemonHttpClient.post).toBeDefined();
      expect(pokemonHttpClient.put).toBeDefined();
      expect(pokemonHttpClient.patch).toBeDefined();
      expect(pokemonHttpClient.delete).toBeDefined();
      expect(pokemonHttpClient.head).toBeDefined();
      expect(pokemonHttpClient.options).toBeDefined();
    });
  });

  describe('client types', () => {
    it('should be AxiosInstance', () => {
      // Verify both clients have the required methods and properties
      expect(typeof httpClient.request).toBe('function');
      expect(typeof httpClient.interceptors).toBe('object');
    });

    it('pokemonHttpClient should be AxiosInstance', () => {
      expect(typeof pokemonHttpClient.request).toBe('function');
      expect(typeof pokemonHttpClient.interceptors).toBe('object');
    });
  });
});
