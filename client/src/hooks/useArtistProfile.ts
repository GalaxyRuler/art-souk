import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Artist {
  id: number;
  name: string;
  bio?: string;
  nationality?: string;
  birthYear?: number;
  style?: string;
  instagram?: string;
  twitter?: string;
  website?: string;
}

interface Follower {
  id: number;
  userId: string;
  userName?: string;
  userEmail?: string;
  followedAt: string;
}

interface FollowersResponse {
  followers: Follower[];
  totalCount: number;
}

interface AuctionResult {
  id: number;
  artworkId?: number;
  artworkTitle?: string;
  artworkMedium?: string;
  auctionDate: string;
  hammerPrice: string;
  estimateLow?: string;
  estimateHigh?: string;
  auctionHouse: string;
  lotNumber?: string;
  provenance?: string;
}

interface Show {
  id: number;
  title: string;
  venue: string;
  startDate: string;
  endDate?: string;
  type: string;
  description?: string;
}

interface GalleryRelationship {
  id: number;
  galleryId: number;
  galleryName?: string;
  galleryLocation?: string;
  galleryWebsite?: string;
  representationType: string;
  startDate: string;
  endDate?: string;
  contractDetails?: string;
}

// Custom hook for fetching artist profile data
export function useArtistProfile(artistId: number) {
  return useQuery<Artist>({
    queryKey: ['artist', artistId],
    queryFn: async () => {
      const response = await fetch(`/api/artists/${artistId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch artist');
      }
      return response.json();
    },
    enabled: !!artistId && artistId > 0
  });
}

// Custom hook for fetching artist followers
export function useArtistFollowers(artistId: number) {
  return useQuery<FollowersResponse>({
    queryKey: ['artist', artistId, 'followers'],
    queryFn: async () => {
      const response = await fetch(`/api/artists/${artistId}/followers`);
      if (!response.ok) {
        throw new Error('Failed to fetch followers');
      }
      return response.json();
    },
    enabled: !!artistId && artistId > 0
  });
}

// Custom hook for fetching auction results
export function useAuctionResults(artistId: number) {
  return useQuery<AuctionResult[]>({
    queryKey: ['artist', artistId, 'auction-results'],
    queryFn: async () => {
      const response = await fetch(`/api/artists/${artistId}/auction-results`);
      if (!response.ok) {
        throw new Error('Failed to fetch auction results');
      }
      return response.json();
    },
    enabled: !!artistId && artistId > 0
  });
}

// Custom hook for fetching artist shows/exhibitions
export function useArtistShows(artistId: number) {
  return useQuery<Show[]>({
    queryKey: ['artist', artistId, 'shows'],
    queryFn: async () => {
      const response = await fetch(`/api/artists/${artistId}/shows`);
      if (!response.ok) {
        throw new Error('Failed to fetch shows');
      }
      return response.json();
    },
    enabled: !!artistId && artistId > 0
  });
}

// Custom hook for fetching gallery relationships
export function useArtistGalleries(artistId: number) {
  return useQuery<GalleryRelationship[]>({
    queryKey: ['artist', artistId, 'galleries'],
    queryFn: async () => {
      const response = await fetch(`/api/artists/${artistId}/galleries`);
      if (!response.ok) {
        throw new Error('Failed to fetch gallery relationships');
      }
      return response.json();
    },
    enabled: !!artistId && artistId > 0
  });
}

// Custom hook for following/unfollowing artist
export function useFollowArtist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ artistId, action }: { artistId: number; action: 'follow' | 'unfollow' }) => {
      const method = action === 'follow' ? 'POST' : 'DELETE';
      const response = await fetch(`/api/artists/${artistId}/follow`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} artist`);
      }

      if (action === 'follow') {
        return response.json();
      }
      return null;
    },
    onSuccess: (_, { artistId }) => {
      // Invalidate and refetch followers data
      queryClient.invalidateQueries({ queryKey: ['artist', artistId, 'followers'] });
    },
  });
}

// Custom hook for checking if user follows an artist
export function useIsFollowing(artistId: number) {
  return useQuery<boolean>({
    queryKey: ['artist', artistId, 'is-following'],
    queryFn: async () => {
      const response = await fetch(`/api/artists/${artistId}/is-following`);
      if (!response.ok) {
        return false; // Default to not following if endpoint fails
      }
      const data = await response.json();
      return data.isFollowing || false;
    },
    enabled: !!artistId && artistId > 0
  });
}