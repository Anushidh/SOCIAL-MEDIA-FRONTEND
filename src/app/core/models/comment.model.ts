import { User } from './user.model';

export interface Comment {
  id: string;
  content: string;
  author?: User;
  authorId: string;
  postId: string;
  parentId?: string;
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
}
