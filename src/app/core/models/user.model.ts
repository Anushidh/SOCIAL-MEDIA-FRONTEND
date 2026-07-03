export interface User {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  isPrivate?: boolean;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    username: string;
    email: string;
    displayName?: string;
    avatarUrl?: string;
  };
}
