import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../core/services/chat.service';
import { AuthService } from '../../../core/services/auth.service';
import { Message } from '../../../core/models';

@Component({
  selector: 'app-admin-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <h2 class="text-2xl font-bold mb-6">Chat hỗ trợ khách hàng</h2>

      <div class="card h-[600px] flex">
        <!-- Conversations -->
        <div class="w-1/3 border-r">
          <div class="p-4 border-b bg-gray-50">
            <h3 class="font-semibold">Cuộc trò chuyện</h3>
          </div>
          <div class="overflow-y-auto h-[calc(100%-60px)]">
            @if (conversations.length === 0) {
              <div class="p-4 text-center text-gray-500">Chưa có tin nhắn nào</div>
            } @else {
              @for (conv of conversations; track conv.user._id) {
                <button 
                  (click)="selectConversation(conv)"
                  [class.bg-primary-50]="selectedUser?._id === conv.user._id"
                  class="w-full text-left p-4 hover:bg-gray-50 border-b flex items-center gap-3"
                >
                  <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <span class="font-medium">{{ conv.user.name?.charAt(0) }}</span>
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
              Chọn một cuộc trò chuyện
            </div>
          } @else {
            <div class="p-4 border-b flex items-center gap-3 bg-gray-50">
              <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span class="font-medium">{{ selectedUser.name?.charAt(0) }}</span>
              </div>
              <div>
                <p class="font-medium">{{ selectedUser.name }}</p>
                <p class="text-xs text-gray-500">{{ selectedUser.email }}</p>
              </div>
            </div>

            <div class="flex-1 overflow-y-auto p-4 space-y-4">
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

            <div class="p-4 border-t">
              <form (ngSubmit)="sendMessage()" class="flex gap-2">
                <input 
                  type="text" 
                  [(ngModel)]="messageContent" 
                  name="message"
                  class="input flex-1" 
                  placeholder="Nhập tin nhắn..."
                >
                <button type="submit" class="btn btn-primary" [disabled]="!messageContent.trim()">Gửi</button>
              </form>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class AdminChatComponent implements OnInit {
  conversations: any[] = [];
  messages: Message[] = [];
  selectedUser: any = null;
  messageContent = '';
  currentUserId = '';

  constructor(
    private chatService: ChatService,
    private authService: AuthService
  ) {
    this.currentUserId = this.authService.currentUser?._id || '';
  }

  ngOnInit() {
    this.chatService.connect();
    this.loadConversations();

    this.chatService.messageReceived$.subscribe(message => {
      if (this.selectedUser && (message.sender._id === this.selectedUser._id || message.receiver === this.selectedUser._id)) {
        this.messages.push(message);
      }
      this.loadConversations(); // Update list order/unread
    });
  }

  loadConversations() {
    this.chatService.getConversations().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.conversations = res.data;
        }
      }
    });
  }

  selectConversation(conv: any) {
    this.selectedUser = conv.user;
    this.loadMessages();
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

    this.chatService.sendMessage(this.selectedUser._id, this.messageContent).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.messages = [...this.messages, res.data];
          this.messageContent = '';
        }
      }
    });
  }

  formatTime(date: string): string {
    return new Date(date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  }
}
