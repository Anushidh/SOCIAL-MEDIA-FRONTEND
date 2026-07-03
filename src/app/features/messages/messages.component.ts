import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { MessagesService } from '../../core/services/messages.service';
import { UsersService } from '../../core/services/users.service';
import { AuthService } from '../../core/services/auth.service';
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
export class MessagesComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  conversations: Conversation[] = [];
  messages: Message[] = [];
  activeConversation: Conversation | null = null;
  loadingConversations = true;
  loadingMessages = false;
  messageInput = '';
  sending = false;
  showNewChat = false;
  newChatQuery = '';
  searchedUsers: User[] = [];
  currentUserId: string | undefined;

  private userSearchSubject = new Subject<string>();

  constructor(
    private messagesService: MessagesService,
    private usersService: UsersService,
    private authService: AuthService,
    private toast: ToastService,
    private route: ActivatedRoute,
  ) {
    this.currentUserId = this.authService.currentUser?.id;
  }

  ngOnInit(): void {
    this.loadConversations();

    // Debounced user search for new chat
    this.userSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
    ).subscribe((q) => {
      if (q.length >= 2) {
        this.usersService.search(q).subscribe({
          next: (res) => {
            this.searchedUsers = res.data.filter((u) => u.id !== this.currentUserId);
          },
        });
      } else {
        this.searchedUsers = [];
      }
    });

    // Open conversation from query param (e.g. coming from profile "Message" button)
    this.route.queryParams.subscribe((params) => {
      if (params['conversationId']) {
        this.loadConversations(params['conversationId']);
      }
    });
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
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
        // Add to list if not already there
        if (!this.conversations.find((c) => c.id === conv.id)) {
          this.conversations.unshift(conv);
        }
        this.openConversation(conv);
      },
      error: () => this.toast.error('Could not start conversation'),
    });
  }

  openConversation(conv: Conversation): void {
    this.activeConversation = conv;
    this.messages = [];
    this.loadingMessages = true;
    this.messagesService.getMessages(conv.id).subscribe({
      next: (res) => {
        this.messages = [...res.data].reverse(); // newest last
        this.loadingMessages = false;
        conv.unreadCount = 0;
        this.messagesService.markAsRead(conv.id).subscribe();
      },
      error: () => this.loadingMessages = false,
    });
  }

  sendMessage(): void {
    if (!this.messageInput.trim() || !this.activeConversation) return;
    this.sending = true;
    const content = this.messageInput;
    this.messageInput = '';

    this.messagesService.sendMessage(this.activeConversation.id, content).subscribe({
      next: (msg) => {
        this.messages.push(msg);
        this.sending = false;
      },
      error: () => {
        this.messageInput = content;
        this.sending = false;
        this.toast.error('Failed to send message');
      },
    });
  }

  getOtherParticipant(conv: Conversation) {
    return conv.participants?.find((p) => p.id !== this.currentUserId);
  }

  private scrollToBottom(): void {
    if (this.messagesContainer?.nativeElement) {
      const el = this.messagesContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }
}
