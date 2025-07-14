// Core domain types for Art Souk application

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  roles: UserRole[];
  isEmailVerified: boolean;
  lifecycleStage: LifecycleStage;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = "collector" | "artist" | "gallery" | "admin";

export type LifecycleStage = "aware" | "join" | "explore" | "transact" | "retain" | "advocate";

export interface Artist {
  id: number;
  userId: string;
  name: string;
  nameAr: string;
  bio: string;
  bioAr: string;
  birthYear: number;
  nationality: string;
  location: string;
  website?: string;
  instagramHandle?: string;
  profileImageUrl?: string;
  isVerified: boolean;
  followerCount: number;
  artworkCount: number;
  averagePrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface Gallery {
  id: number;
  userId: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  location: string;
  website?: string;
  phoneNumber?: string;
  email?: string;
  instagramHandle?: string;
  profileImageUrl?: string;
  isVerified: boolean;
  followerCount: number;
  artistCount: number;
  exhibitionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Artwork {
  id: number;
  artistId: number;
  galleryId?: number;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  medium: string;
  mediumAr: string;
  style: string;
  styleAr: string;
  year: number;
  dimensions: string;
  price: number;
  currency: string;
  availability: "available" | "sold" | "reserved";
  imageUrl: string;
  additionalImages: string[];
  category: string;
  categoryAr: string;
  isFramed: boolean;
  frameDescription?: string;
  frameDescriptionAr?: string;
  featured: boolean;
  viewCount: number;
  favoriteCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Auction {
  id: number;
  artworkId: number;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  startDate: string;
  endDate: string;
  startingBid: number;
  currentBid: number;
  minimumBid: number;
  biddingIncrement: number;
  estimatedValue: number;
  reservePrice?: number;
  status: "upcoming" | "live" | "ended";
  viewCount: number;
  bidCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Bid {
  id: number;
  auctionId: number;
  userId: string;
  amount: number;
  isWinning: boolean;
  createdAt: string;
}

export interface Workshop {
  id: number;
  instructorId: number;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  category: string;
  categoryAr: string;
  skillLevel: "beginner" | "intermediate" | "advanced";
  duration: number;
  price: number;
  currency: string;
  maxParticipants: number;
  currentParticipants: number;
  startDate: string;
  endDate: string;
  location: string;
  isOnline: boolean;
  meetingLink?: string;
  materials: string[];
  materialsAr: string[];
  imageUrl: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: number;
  organizerId: number;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  category: string;
  categoryAr: string;
  startDate: string;
  endDate: string;
  location: string;
  address: string;
  addressAr: string;
  price: number;
  currency: string;
  maxAttendees: number;
  currentAttendees: number;
  isOnline: boolean;
  meetingLink?: string;
  imageUrl: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Commission {
  id: number;
  collectorId: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  category: string;
  categoryAr: string;
  medium: string;
  mediumAr: string;
  style: string;
  styleAr: string;
  dimensions: string;
  budget: number;
  currency: string;
  deadline: string;
  colorPalette: string[];
  referenceImages: string[];
  status: "open" | "in_progress" | "completed" | "cancelled";
  selectedBidId?: number;
  bidCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
  status: "success" | "error";
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Query and mutation types
export type QueryKey = string | readonly unknown[];

export interface QueryOptions<T> {
  enabled?: boolean;
  refetchInterval?: number;
  staleTime?: number;
  cacheTime?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export interface MutationOptions<T, V> {
  onSuccess?: (data: T, variables: V) => void;
  onError?: (error: Error, variables: V) => void;
  onSettled?: (data: T | undefined, error: Error | null, variables: V) => void;
}