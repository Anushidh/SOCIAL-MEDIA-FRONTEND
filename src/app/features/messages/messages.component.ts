import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, Subscription } from 'rxjs';
import { MessagesService } from '../../core/services/messages.service';
import { UsersService } from '../../core/services/users.service';
import { AuthService } from '../../core/services/auth.service';
import { SocketService } from '../../core/services/socket.service';
import { ToastService } from '../../core/services/toast.service';
import { Conversation, Message, User } from '../../core/models';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { TimeAgoPipe } from '../../shared/pipes/time-ago.pipe';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, AvatarComponent, TimeAgoPipe],
  templateUrl: './messages.component.html',
})
export class MessagesComponent implements OnInit, OnDestroy {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  conversations: Conversation[] = [];
  messages: Message[] = [];
  activeConversation: Conversation | null = null;
  loadingConversations = true;
  loadingMessages = false;
  messageInput = '';
  sending = false;
  selectedFile: File | null = null;
  filePreview: string | null = null;
  showNewChat = false;
  newChatQuery = '';
  searchedUsers: User[] = [];
  currentUserId: string | undefined;

  // Typing indicators
  typingUsers: Set<string> = new Set();
  private typingTimeout: ReturnType<typeof setTimeout> | null = null;

  private userSearchSubject = new Subject<string>();
  private subscriptions = new Subscription();

  constructor(
    private messagesService: MessagesService,
    private usersService: UsersService,
    private authService: AuthService,
    private socketService: SocketService,
    private toast: ToastService,
    private route: ActivatedRoute,
  ) {
    this.currentUserId = this.authService.currentUser?.id;
  }

  ngOnInit(): void {
    this.loadConversations();
    this.socketService.connectChat();
    this.setupSocketListeners();

    this.subscriptions.add(
      this.userSearchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe((q) => {
        if (q.length >= 2) {
          this.usersService.search(q).subscribe({
            next: (res) => {
              this.searchedUsers = res.data.filter((u) => u.id !== this.currentUserId);
            },
          });
        } else {
          this.searchedUsers = [];
        }
      }),
    );

    this.subscriptions.add(
      this.route.queryParams.subscribe((params) => {
        if (params['conversationId']) {
          this.loadConversations(params['conversationId']);
        }
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    if (this.activeConversation) {
      this.socketService.leaveConversation(this.activeConversation.id);
    }
  }

  private setupSocketListeners(): void {
    // New real-time message
    this.subscriptions.add(
      this.socketService.onChat<Message>('newMessage').subscribe((msg) => {
        if (msg.conversationId === this.activeConversation?.id) {
          if (msg.senderId !== this.currentUserId) {
            this.messages.push(msg);
            setTimeout(() => this.scrollToBottom());
            this.socketService.markRead(this.activeConversation.id);
            this.messagesService.markAsRead(this.activeConversation.id).subscribe({
              next: () => this.messagesService.getUnreadCount().subscribe()
            });
          }
        } else {
          // Update unread count on the conversation in the list
          const conv = this.conversations.find((c) => c.id === msg.conversationId);
          if (conv) conv.unreadCount = (conv.unreadCount ?? 0) + 1;
        }
        this.updateConversationList(msg);
      }),
    );

    // Typing indicators
    this.subscriptions.add(
      this.socketService.typing$.subscribe(({ userId, conversationId }) => {
        if (conversationId === this.activeConversation?.id && userId !== this.currentUserId) {
          this.typingUsers.add(userId);
        }
      }),
    );

    this.subscriptions.add(
      this.socketService.stoppedTyping$.subscribe(({ userId, conversationId }) => {
        if (conversationId === this.activeConversation?.id) {
          this.typingUsers.delete(userId);
        }
      }),
    );
  }

  loadConversations(openConversationId?: string): void {
    this.loadingConversations = true;
    this.messagesService.getConversations().subscribe({
      next: (convs) => {
        this.conversations = convs;
        this.loadingConversations = false;
        if (openConversationId) {
          const conv = convs.find((c) => c.id === openConversationId);
          if (conv) this.openConversation(conv);
        }
      },
      error: () => (this.loadingConversations = false),
    });
  }

  onNewChatSearch(value: string): void {
    this.userSearchSubject.next(value);
  }

  startConversation(user: User): void {
    this.messagesService.createConversation(user.id).subscribe({
      next: (conv) => {
        this.showNewChat = false;
        this.newChatQuery = '';
        this.searchedUsers = [];
        if (!this.conversations.find((c) => c.id === conv.id)) {
          this.conversations.unshift(conv);
        }
        this.openConversation(conv);
      },
      error: () => this.toast.error('Could not start conversation'),
    });
  }

  backToList(): void {
    if (this.activeConversation) {
      this.socketService.leaveConversation(this.activeConversation.id);
    }
    this.activeConversation = null;
  }

  openConversation(conv: Conversation): void {
    if (this.activeConversation) {
      this.socketService.leaveConversation(this.activeConversation.id);
    }
    this.activeConversation = conv;
    this.messages = [];
    this.typingUsers.clear();
    this.loadingMessages = true;

    this.socketService.joinConversation(conv.id);

    this.messagesService.getMessages(conv.id).subscribe({
      next: (res) => {
        this.messages = [...res.data].reverse();
        this.loadingMessages = false;
        setTimeout(() => this.scrollToBottom());
        
        if (conv.unreadCount > 0) {
          conv.unreadCount = 0;
          this.messagesService.markAsRead(conv.id).subscribe({
            next: () => this.messagesService.getUnreadCount().subscribe()
          });
          this.socketService.markRead(conv.id);
        } else {
          this.messagesService.markAsRead(conv.id).subscribe();
          this.socketService.markRead(conv.id);
        }
      },
      error: () => (this.loadingMessages = false),
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (file.size > 50 * 1024 * 1024) {
      this.toast.error('File must be less than 50MB');
      return;
    }
    
    this.selectedFile = file;
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      const reader = new FileReader();
      reader.onload = (e) => this.filePreview = e.target?.result as string;
      reader.readAsDataURL(file);
    } else {
      this.filePreview = null;
    }
    // clear input
    event.target.value = null;
  }

  removeFile(): void {
    this.selectedFile = null;
    this.filePreview = null;
  }

  sendMessage(): void {
    if ((!this.messageInput.trim() && !this.selectedFile) || !this.activeConversation || this.sending) return;
    this.sending = true;
    const content = this.messageInput;
    this.messageInput = '';

    // Stop typing immediately
    this.socketService.sendStopTyping(this.activeConversation.id);
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
      this.typingTimeout = null;
    }

    const finalizeSendMessage = (mediaUrl?: string, mediaType?: string) => {
      this.socketService.sendMessage(this.activeConversation!.id, content, mediaUrl, mediaType).then((res) => {
        if (res.success && res.message) {
          this.messages.push(res.message);
          this.sending = false;
          this.removeFile();
          setTimeout(() => this.scrollToBottom());
          this.updateConversationList(res.message);
        } else {
          this.messageInput = content;
          this.sending = false;
          this.toast.error('Failed to send message');
        }
      }).catch(() => {
        this.messageInput = content;
        this.sending = false;
        this.toast.error('Failed to send message');
      });
    };

    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      this.messagesService.uploadMedia(formData).subscribe({
        next: (res) => finalizeSendMessage(res.mediaUrl, res.mediaType),
        error: () => {
          this.messageInput = content;
          this.sending = false;
          this.toast.error('Failed to upload media');
        }
      });
    } else {
      finalizeSendMessage();
    }
  }

  onTyping(): void {
    if (!this.activeConversation) return;
    this.socketService.sendTyping(this.activeConversation.id);

    // Auto-stop typing after 3 seconds of inactivity
    if (this.typingTimeout) clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => {
      if (this.activeConversation) {
        this.socketService.sendStopTyping(this.activeConversation.id);
      }
    }, 3000);
  }

  get isTyping(): boolean {
    return this.typingUsers.size > 0;
  }

  getOtherParticipant(conv: Conversation) {
    return conv.participants?.find((p) => p.id !== this.currentUserId);
  }

  private updateConversationList(msg: Message): void {
    const convIndex = this.conversations.findIndex((c) => c.id === msg.conversationId);
    if (convIndex > -1) {
      const conv = this.conversations[convIndex];
      conv.lastMessage = msg;
      conv.updatedAt = msg.createdAt;
      
      // Move to top if not already at the top
      if (convIndex !== 0) {
        this.conversations.splice(convIndex, 1);
        this.conversations.unshift(conv);
      }
    }
  }

  private scrollToBottom(): void {
    if (this.messagesContainer?.nativeElement) {
      const el = this.messagesContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }
}
