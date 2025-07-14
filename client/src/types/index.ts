// API Response Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  role: string;
  roles: string[];
  roleSetupComplete: boolean;
  lifecycleStage: string;
  profileCompleteness: number;
  riskLevel: string;
  lastActiveAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Artist {
  id: number;
  userId: string;
  name: string;
  nameAr?: string;
  biography?: string;
  biographyAr?: string;
  nationality?: string;
  birthYear?: number;
  profileImage?: string;
  coverImage?: string;
  website?: string;
  instagram?: string;
  featured: boolean;
}

export interface Gallery {
  id: number;
  userId: string;
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  location?: string;
  locationAr?: string;
  website?: string;
  instagram?: string;
  featured: boolean;
}

export interface Artwork {
  id: number;
  artistId: number;
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  medium: string;
  mediumAr?: string;
  dimensions?: string;
  year?: number;
  price?: number;
  currency: string;
  availability: string;
  category: string;
  style?: string;
  imageUrl?: string;
  imageUrls?: string[];
  featured: boolean;
  viewCount: number;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: number;
  userId: string;
  entityType: string;
  entityId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: User;
}

export interface Profile {
  bio?: string;
  bioAr?: string;
  location?: string;
  locationAr?: string;
  website?: string;
  instagram?: string;
}

// API Response Types
export interface FavoriteResponse {
  isFavorite: boolean;
}

export interface FollowResponse {
  isFollowing: boolean;
}

export interface LikeResponse {
  isLiked: boolean;
}

export interface LikeCountResponse {
  likes: number;
}

export interface CommentsResponse {
  comments: Comment[];
}

// Window type extension for external libraries
declare global {
  interface Window {
    Sentry?: {
      captureException: (error: Error, context?: any) => void;
    };
  }
}