import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useArtistProfile, useArtistFollowers, useAuctionResults } from '../../client/src/hooks/useArtistProfile';
import { ReactNode } from 'react';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useArtistProfile Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch artist data successfully', async () => {
    const mockArtist = {
      id: 1,
      name: 'Test Artist',
      bio: 'Test bio',
      nationality: 'Saudi Arabia'
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockArtist)
    });

    const { result } = renderHook(() => useArtistProfile(1), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockArtist);
    expect(mockFetch).toHaveBeenCalledWith('/api/artists/1');
  });

  it('should handle artist fetch error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useArtistProfile(1), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
  });

  it('should not fetch without valid artist ID', () => {
    const { result } = renderHook(() => useArtistProfile(0), {
      wrapper: createWrapper()
    });

    expect(result.current.isPending).toBe(true);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe('useArtistFollowers Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch followers data successfully', async () => {
    const mockFollowers = {
      followers: [
        { id: 1, userId: 'user1', userName: 'Test User' }
      ],
      totalCount: 1
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockFollowers)
    });

    const { result } = renderHook(() => useArtistFollowers(1), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockFollowers);
    expect(mockFetch).toHaveBeenCalledWith('/api/artists/1/followers');
  });

  it('should handle empty followers list', async () => {
    const mockEmptyFollowers = {
      followers: [],
      totalCount: 0
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockEmptyFollowers)
    });

    const { result } = renderHook(() => useArtistFollowers(1), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.totalCount).toBe(0);
    expect(result.current.data?.followers).toHaveLength(0);
  });
});

describe('useAuctionResults Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch auction results successfully', async () => {
    const mockResults = [
      {
        id: 1,
        artworkTitle: 'Test Artwork',
        hammerPrice: '25000.00',
        auctionHouse: 'Test Auction House',
        auctionDate: '2024-01-15T00:00:00Z'
      }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResults)
    });

    const { result } = renderHook(() => useAuctionResults(1), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockResults);
    expect(mockFetch).toHaveBeenCalledWith('/api/artists/1/auction-results');
  });

  it('should handle empty auction results', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([])
    });

    const { result } = renderHook(() => useAuctionResults(1), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(0);
  });

  it('should handle auction results fetch error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Failed to fetch'));

    const { result } = renderHook(() => useAuctionResults(1), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
  });
});