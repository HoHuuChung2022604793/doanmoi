import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../core/services/chat.service';
import { AuthService } from '../../core/services/auth.service';
import { Message } from '../../core/models';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-8">
      <h1 class="text-2xl font-bold mb-6">Chat hỗ trợ</h1>

      <div class="card h-[600px] flex">
        <!-- Conversations -->
        <div class="w-1/3 border-r">
          <div class="p-4 border-b">
            <h2 class="font-semibold">Cuộc trò chuyện</h2>
          </div>
          <div class="overflow-y-auto h-[calc(100%-60px)]">
            @if (loadingConversations) {
              <div class="p-4 text-center text-gray-500">Đang tải...</div>
            } @else if (conversations.length === 0) {
              <div class="p-4">
                <p class="text-gray-500 text-sm mb-4">Chưa có cuộc trò chuyện nào</p>
                @if (admins.length > 0) {
                  <p class="text-sm font-medium mb-2">Bắt đầu chat với:</p>
                  @for (admin of admins; track admin._id) {
                    <button 
                      (click)="startChat(admin)"
                      class="w-full text-left p-3 hover:bg-gray-50 rounded-lg flex items-center gap-3"
                    >
                      <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span class="text-primary-600 font-medium">{{ admin.name?.charAt(0) }}</span>
                      </div>
                      <div>
                        <p class="font-medium">{{ admin.name }}</p>
                        <p class="text-xs text-gray-500">Admin</p>
                      </div>
                    </button>
                  }
                }
              </div>
            } @else {
              @for (conv of conversations; track conv.user._id) {
                <button 
                  (click)="selectConversation(conv)"
                  [class.bg-primary-50]="selectedUser?._id === conv.user._id"
                  class="w-full text-left p-4 hover:bg-gray-50 border-b flex items-center gap-3"
                >
                  <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    @if (conv.user.email === 'chatbot@chungmobile.com') {
                      <span class="text-2xl">🤖</span>
                    } @else {
                      <span class="text-primary-600 font-medium">{{ conv.user.name?.charAt(0) }}</span>
                    }
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-center">
                      <p class="font-medium truncate">{{ conv.user.name }}</p>
                      @if (conv.unreadCount > 0) {
                        <span class="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {{ conv.unreadCount }}
                        </span>
                      }
                    </div>
                    <p class="text-sm text-gray-500 truncate">{{ conv.lastMessage?.content }}</p>
                  </div>
                </button>
              }
            }
          </div>
        </div>

        <!-- Messages -->
        <div class="flex-1 flex flex-col">
          @if (!selectedUser) {
            <div class="flex-1 flex items-center justify-center text-gray-500">
              Chọn một cuộc trò chuyện để bắt đầu
            </div>
          } @else {
            <!-- Header -->
            <div class="p-4 border-b flex items-center gap-3">
              <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                @if (selectedUser.email === 'chatbot@chungmobile.com') {
                  <span class="text-2xl">🤖</span>
                } @else {
                  <span class="text-primary-600 font-medium">{{ selectedUser.name?.charAt(0) }}</span>
                }
              </div>
              <div>
                <p class="font-medium">{{ selectedUser.name }}</p>
                @if (isTyping) {
                  <p class="text-xs text-green-600">Đang gõ...</p>
                }
              </div>
            </div>

            <!-- Messages -->
            <div class="flex-1 overflow-y-auto p-4 space-y-4" #messagesContainer>
              @for (msg of messages; track msg._id) {
                <div [class]="msg.sender._id === currentUserId ? 'flex justify-end' : 'flex justify-start'">
                  <div 
                    [class]="msg.sender._id === currentUserId ? 'bg-primary-600 text-white' : 'bg-gray-100'"
                    class="max-w-[70%] px-4 py-2 rounded-2xl"
                  >
                    <p>{{ msg.content }}</p>
                    <p class="text-xs opacity-70 mt-1">{{ formatTime(msg.createdAt) }}</p>
                  </div>
                </div>
              }
            </div>

            <!-- Input -->
            <div class="p-4 border-t">
              <form (ngSubmit)="sendMessage()" class="flex gap-2">
                <input 
                  type="text" 
                  [(ngModel)]="messageContent" 
                  name="message"
                  class="input flex-1" 
                  placeholder="Nhập tin nhắn..."
                  (input)="onTyping()"
                >
                <button type="submit" class="btn btn-primary" [disabled]="!messageContent.trim() || sending">
                  Gửi
                </button>
              </form>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class ChatComponent implements OnInit, OnDestroy {
  conversations: any[] = [];
  admins: any[] = [];
  messages: Message[] = [];
  selectedUser: any = null;
  messageContent = '';
  loadingConversations = true;
  sending = false;
  isTyping = false;
  currentUserId = '';
  private typingTimeout: any;

  constructor(
    private chatService: ChatService,
    private authService: AuthService
  ) {
    this.currentUserId = this.authService.currentUser?._id || '';
  }

  ngOnInit() {
    this.chatService.connect();
    this.loadConversations();
    this.loadAdmins();

    this.chatService.messageReceived$.subscribe(message => {
      if (this.selectedUser && (message.sender._id === this.selectedUser._id || message.receiver === this.selectedUser._id)) {
        this.messages.push(message);
        // Scroll to bottom
        setTimeout(() => {
          const container = document.querySelector('.overflow-y-auto');
          if (container) container.scrollTop = container.scrollHeight;
        }, 100);
      }
      this.loadConversations(); // Update unread count/last message
    });

    this.chatService.onUserTyping((data) => {
      if (this.selectedUser?._id === data.userId) {
        this.isTyping = true;
        setTimeout(() => this.isTyping = false, 2000);
      }
    });
  }

  ngOnDestroy() {
    if (this.typingTimeout) clearTimeout(this.typingTimeout);
  }

  loadConversations() {
    this.chatService.getConversations().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.conversations = res.data;
        }
        this.loadingConversations = false;
      },
      error: () => this.loadingConversations = false
    });
  }

  loadAdmins() {
    this.chatService.getAdmins().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.admins = res.data;
        }
      }
    });
  }

  selectConversation(conv: any) {
    this.selectedUser = conv.user;
    this.loadMessages();
  }

  startChat(admin: any) {
    this.selectedUser = admin;
    this.messages = [];
  }

  loadMessages() {
    if (!this.selectedUser) return;

    this.chatService.getMessages(this.selectedUser._id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.messages = res.data;
        }
      }
    });
  }

  sendMessage() {
    if (!this.messageContent.trim() || !this.selectedUser) return;

    this.sending = true;
    this.chatService.sendMessage(this.selectedUser._id, this.messageContent).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.messages = [...this.messages, res.data];
          this.messageContent = '';
        }
        this.sending = false;
      },
      error: () => this.sending = false
    });
  }

  onTyping() {
    if (this.typingTimeout) clearTimeout(this.typingTimeout);
    
    if (this.selectedUser) {
      this.chatService.emitTyping(this.selectedUser._id);
    }

    this.typingTimeout = setTimeout(() => {
      if (this.selectedUser) {
        this.chatService.emitStopTyping(this.selectedUser._id);
      }
    }, 1000);
  }

  formatTime(date: string): string {
    return new Date(date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  }
}
