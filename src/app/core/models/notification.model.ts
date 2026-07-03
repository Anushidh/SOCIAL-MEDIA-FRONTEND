import { User } from './user.model';

export enum NotificationType {
  LIKE = 'like',
  COMMENT = 'comment',
  FOLLOW = 'follow',
  MESSAGE = 'message',
  MENTION = 'mention',
}

export interface Notification {
  id: string;
  type: NotificationType;
  actor?: User;
  actorId: string;
  recipientId: string;
  entityId?: string;
  entityType?: string;
  isRead: boolean;
  createdAt: string;
}
