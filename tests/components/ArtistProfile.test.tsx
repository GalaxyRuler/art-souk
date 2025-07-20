import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { ArtistProfile } from '../../client/src/pages/ArtistProfile';

// Mock dependencies
vi.mock('wouter', () => ({
  useParams: () => ({ id: '1' }),
  useLocation: () => ['/artists/1', vi.fn()]
}));

vi.mock('../../client/src/lib/i18n', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' }
  })
}));

// Mock API responses
const mockArtistData = {
  id: 1,
  name: 'Ahmed Al-Rashid',
  bio: 'Contemporary Saudi artist specializing in abstract expressionism',
  nationality: 'Saudi Arabia',
  birthYear: 1985,
  style: 'Contemporary',
  instagram: '@ahmed.alrashid',
  twitter: '@AhmedArt',
  website: 'https://ahmed-alrashid.com'
};

const mockFollowersData = {
  followers: [
    {
      id: 1,
      userId: 'user1',
      userName: 'Art Collector',
      followedAt: '2024-01-15T10:00:00Z'
    }
  ],
  totalCount: 1
};

const mockAuctionResults = [
  {
    id: 1,
    artworkTitle: 'Desert Dreams',
    hammerPrice: '45000.00',
    auctionHouse: 'Christie\'s Dubai',
    auctionDate: '2024-01-20T00:00:00Z',
    estimateLow: '35000.00',
    estimateHigh: '55000.00'
  }
];

const mockShows = [
  {
    id: 1,
    title: 'Visions of Tomorrow',
    venue: 'King Abdulaziz Center for World Culture',
    startDate: '2024-02-01T00:00:00Z',
    endDate: '2024-03-15T00:00:00Z',
    type: 'solo'
  }
];

const mockGalleries = [
  {
    id: 1,
    galleryName: 'Athr Gallery',
    galleryLocation: 'Riyadh, Saudi Arabia',
    representationType: 'exclusive',
    startDate: '2024-01-01T00:00:00Z'
  }
];

// Mock fetch with different responses based on URL
global.fetch = vi.fn().mockImplementation((url: string) => {
  if (url.includes('/artists/1')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockArtistData)
    });
  }
  if (url.includes('/followers')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockFollowersData)
    });
  }
  if (url.includes('/auction-results')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockAuctionResults)
    });
  }
  if (url.includes('/shows')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockShows)
    });
  }
  if (url.includes('/galleries')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockGalleries)
    });
  }
  return Promise.reject(new Error('Unknown URL'));
});

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('ArtistProfile Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render artist basic information', async () => {
    renderWithQueryClient(<ArtistProfile />);

    await waitFor(() => {
      expect(screen.getByText('Ahmed Al-Rashid')).toBeInTheDocument();
      expect(screen.getByText('Contemporary Saudi artist specializing in abstract expressionism')).toBeInTheDocument();
      expect(screen.getByText('Saudi Arabia')).toBeInTheDocument();
      expect(screen.getByText('1985')).toBeInTheDocument();
    });
  });

  it('should display social media links', async () => {
    renderWithQueryClient(<ArtistProfile />);

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /instagram/i })).toHaveAttribute('href', 'https://instagram.com/ahmed.alrashid');
      expect(screen.getByRole('link', { name: /twitter/i })).toHaveAttribute('href', 'https://twitter.com/AhmedArt');
      expect(screen.getByRole('link', { name: /website/i })).toHaveAttribute('href', 'https://ahmed-alrashid.com');
    });
  });

  it('should display follower count', async () => {
    renderWithQueryClient(<ArtistProfile />);

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument(); // follower count
      expect(screen.getByText(/follower/i)).toBeInTheDocument();
    });
  });

  it('should render auction results section', async () => {
    renderWithQueryClient(<ArtistProfile />);

    await waitFor(() => {
      expect(screen.getByText('Desert Dreams')).toBeInTheDocument();
      expect(screen.getByText('45,000.00 SAR')).toBeInTheDocument();
      expect(screen.getByText('Christie\'s Dubai')).toBeInTheDocument();
    });
  });

  it('should render exhibition history', async () => {
    renderWithQueryClient(<ArtistProfile />);

    await waitFor(() => {
      expect(screen.getByText('Visions of Tomorrow')).toBeInTheDocument();
      expect(screen.getByText('King Abdulaziz Center for World Culture')).toBeInTheDocument();
      expect(screen.getByText(/solo/i)).toBeInTheDocument();
    });
  });

  it('should render gallery relationships', async () => {
    renderWithQueryClient(<ArtistProfile />);

    await waitFor(() => {
      expect(screen.getByText('Athr Gallery')).toBeInTheDocument();
      expect(screen.getByText('Riyadh, Saudi Arabia')).toBeInTheDocument();
      expect(screen.getByText(/exclusive/i)).toBeInTheDocument();
    });
  });

  it('should handle loading states', () => {
    renderWithQueryClient(<ArtistProfile />);

    // Should show loading indicators initially
    expect(screen.getByTestId('artist-profile-loading')).toBeInTheDocument();
  });

  it('should handle error states', async () => {
    // Mock fetch to return error
    global.fetch = vi.fn().mockRejectedValue(new Error('API Error'));

    renderWithQueryClient(<ArtistProfile />);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('should handle follow/unfollow interaction', async () => {
    // Mock authenticated user
    global.fetch = vi.fn().mockImplementation((url: string, options: any) => {
      if (options?.method === 'POST' && url.includes('/follow')) {
        return Promise.resolve({
          ok: true,
          status: 201,
          json: () => Promise.resolve({ id: 1, userId: 'user1', artistId: 1 })
        });
      }
      // Return default mocks for other requests
      return global.fetch(url);
    });

    renderWithQueryClient(<ArtistProfile />);

    await waitFor(() => {
      const followButton = screen.getByRole('button', { name: /follow/i });
      expect(followButton).toBeInTheDocument();
    });
  });
});