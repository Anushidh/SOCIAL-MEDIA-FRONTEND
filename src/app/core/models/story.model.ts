import { User } from './user.model';

export interface Story {
  id: string;
  imageUrl: string;
  caption?: string;
  author: User;
  authorId: string;
  expiresAt: string;
  viewsCount: number;
  createdAt: string;
}

export interface StoryGroup {
  user: User;
  stories: Story[];
}
