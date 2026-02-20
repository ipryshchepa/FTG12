import { describe, it, expect, vi } from 'vitest';
import * as ratingService from './ratingService';
import * as api from './api';

vi.mock('./api');

describe('Rating Service', () => {
  describe('createOrUpdateRating', () => {
    it('should call api.post with correct endpoint and payload', async () => {
      const ratingData = { score: 8, notes: 'Great book' };
      const mockResponse = { id: 1, bookId: 1, ...ratingData };
      api.post.mockResolvedValueOnce(mockResponse);

      const result = await ratingService.createOrUpdateRating(1, ratingData);

      expect(api.post).toHaveBeenCalledWith('/api/books/1/rating', ratingData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteRating', () => {
    it('should call api.del with correct endpoint', async () => {
      api.del.mockResolvedValueOnce(null);

      await ratingService.deleteRating(1);

      expect(api.del).toHaveBeenCalledWith('/api/books/1/rating');
    });
  });
});
