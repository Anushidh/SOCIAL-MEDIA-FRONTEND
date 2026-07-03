import { User } from './user.model';
import { Comment } from './comment.model';

export interface Post {
  id: string;
  content: string;
  imageUrls?: string[];
  author?: User;
  authorId: string;
  likesCount: number;
  commentsCount: number;
  repostsCount: number;
  hashtags?: { id: string; name: string }[];
  comments?: Comment[];
  createdAt: string;
  updatedAt: string;
  // client-side state
  isLiked?: boolean;
  isBookmarked?: boolean;
  isReposted?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}
