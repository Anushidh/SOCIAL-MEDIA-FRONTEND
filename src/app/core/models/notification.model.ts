import { User } from './user.model';

export enum NotificationType {
  LIKE = 'like',
  COMMENT = 'comment',
  FOLLOW = 'follow',
  FOLLOW_REQUEST = 'follow_request',
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
