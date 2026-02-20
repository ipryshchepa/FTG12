import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as api from './api';
import config from '../config';

// Mock fetch globally
global.fetch = vi.fn();

describe('API Service', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('get', () => {
    it('should make GET request with correct URL and headers', async () => {
      const mockData = { id: 1, name: 'Test' };
      fetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockData
      });

      const result = await api.get('/api/test');

      expect(fetch).toHaveBeenCalledWith(
        `${config.API_URL}/api/test`,
        expect.objectContaining({
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
      );
      expect(result).toEqual(mockData);
    });

    it('should handle error responses', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ title: 'Resource not found' })
      });

      await expect(api.get('/api/test')).rejects.toThrow('Resource not found');
    });
  });

  describe('post', () => {
    it('should make POST request with correct body', async () => {
      const postData = { name: 'Test' };
      const mockResponse = { id: 1, ...postData };
      
      fetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockResponse
      });

      const result = await api.post('/api/test', postData);

      expect(fetch).toHaveBeenCalledWith(
        `${config.API_URL}/api/test`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postData)
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('put', () => {
    it('should make PUT request with correct body', async () => {
      const putData = { id: 1, name: 'Updated' };
      
      fetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => null
      });

      await api.put('/api/test/1', putData);

      expect(fetch).toHaveBeenCalledWith(
        `${config.API_URL}/api/test/1`,
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(putData)
        })
      );
    });
  });

  describe('del', () => {
    it('should make DELETE request', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => null
      });

      await api.del('/api/test/1');

      expect(fetch).toHaveBeenCalledWith(
        `${config.API_URL}/api/test/1`,
        expect.objectContaining({
          method: 'DELETE'
        })
      );
    });
  });

  describe('error handling', () => {
    it('should extract error from ProblemDetails format', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({
          title: 'Validation Error',
          detail: 'Invalid input',
          errors: { field: ['Error message'] }
        })
      });

      await expect(api.get('/api/test')).rejects.toThrow('Validation Error');
    });

    it('should handle non-JSON error responses', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => { throw new Error('Parse error'); }
      });

      await expect(api.get('/api/test')).rejects.toThrow('HTTP 500: Internal Server Error');
    });
  });
});
