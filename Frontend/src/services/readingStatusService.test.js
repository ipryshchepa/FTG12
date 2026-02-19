import { describe, it, expect, vi } from 'vitest';
import * as readingStatusService from './readingStatusService';
import * as api from './api';

vi.mock('./api');

describe('Reading Status Service', () => {
  describe('updateReadingStatus', () => {
    it('should call api.put with correct endpoint and payload', async () => {
      const statusData = { status: 'Completed', completedAt: '2024-01-15' };
      const mockResponse = { id: 1, bookId: 1, ...statusData };
      api.put.mockResolvedValueOnce(mockResponse);

      const result = await readingStatusService.updateReadingStatus(1, statusData);

      expect(api.put).toHaveBeenCalledWith('/api/books/1/reading-status', statusData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteReadingStatus', () => {
    it('should call api.del with correct endpoint', async () => {
      api.del.mockResolvedValueOnce(null);

      await readingStatusService.deleteReadingStatus(1);

      expect(api.del).toHaveBeenCalledWith('/api/books/1/reading-status');
    });
  });
});
