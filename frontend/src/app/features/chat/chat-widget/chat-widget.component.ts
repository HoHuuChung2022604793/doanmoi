import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatService } from '../../../core/services/chat.service';
import { AuthService } from '../../../core/services/auth.service';
import { Message } from '../../../core/models';
import { Subscription } from 'rxjs';
import { MarkdownPipe } from '../../../shared/pipes/markdown.pipe';
import { ProductImagePipe } from '../../../shared/pipes/product-image.pipe';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownPipe, ProductImagePipe],
  template: `
    <!-- Messenger Button -->
    <a 
      href="https://www.messenger.com/t/7160850830601181" 
      target="_blank"
      class="fixed bottom-24 right-6 w-14 h-14 bg-[#0084FF] hover:bg-[#0078e6] text-white rounded-full shadow-lg flex items-center justify-center transition-all z-50 focus:outline-none hover:scale-110"
      [class.opacity-0]="isOpen"
      [class.pointer-events-none]="isOpen"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="currentColor">
        <path d="M14 0C6.268 0 0 5.992 0 13.383c0 3.996 1.838 7.617 4.904 10.134v5.336a.834.834 0 0 0 1.25.72l4.285-2.25c1.127.31 2.316.48 3.561.48 7.732 0 14-5.992 14-13.383C28 5.992 21.732 0 14 0zm1.545 18.066l-3.812-4.06-7.443 4.06 8.167-8.666 3.911 4.06 7.344-4.06-8.167 8.666z"/>
      </svg>
    </a>

    <!-- Toggle Button -->
    <button 
      (click)="toggleChat()"
      class="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all z-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      [class.scale-0]="isOpen"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      @if (unreadCount > 0) {
        <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
          {{ unreadCount }}
        </span>
      }
    </button>

    <!-- Chat Window -->
    <div 
      class="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col transition-all duration-300 z-50 overflow-hidden border border-gray-100"
      [class.scale-0]="!isOpen"
      [class.origin-bottom-right]="true"
    >
      <!-- Header -->
      <div class="bg-primary-600 p-4 flex items-center justify-between text-white shrink-0">
        <div class="flex items-center gap-3">
          @if (selectedUser) {
            <button (click)="backToConversations()" class="hover:bg-primary-500 p-1 rounded">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
              </svg>
            </button>
            <div>
              <h3 class="font-bold text-sm">{{ selectedUser.name }}</h3>
              @if (isTyping) {
                <p class="text-xs opacity-80">Đang gõ...</p>
              } @else {
                <p class="text-xs opacity-80">Hỗ trợ trực tuyến</p>
              }
            </div>
          } @else {
            <h3 class="font-bold text-lg">Chat hỗ trợ</h3>
          }
        </div>
        <button (click)="toggleChat()" class="hover:bg-primary-500 p-1 rounded">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto bg-gray-50 custom-scrollbar" #scrollContainer>
        @if (loading) {
          <div class="flex items-center justify-center h-full text-gray-400">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        } @else if (!selectedUser) {
          <!-- List Conversations/Admins -->
          <div class="p-2">
            @if (conversations.length === 0) {
              <div class="text-center py-8 px-4">
                <div class="bg-primary-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h4 class="font-semibold text-gray-800 mb-2">Xin chào!</h4>
                <p class="text-sm text-gray-500 mb-6">Chúng tôi có thể giúp gì cho bạn?</p>
                
                <!-- Bot Section (Always Visible) -->
                @if (bot) {
                  <div class="mb-2">
                    <button 
                      (click)="startChat(bot)"
                      class="w-full bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-3 text-left group"
                    >
                      <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white font-bold backdrop-blur-sm">
                        🤖
                      </div>
                      <div>
                        <p class="font-bold text-white">Trợ lý ảo AI</p>
                        <p class="text-xs text-blue-100">Trả lời ngay lập tức</p>
                      </div>
                    </button>
                  </div>
                }

                <!-- Human Admins Section -->
                @if (humanAdmins.length > 0) {
                  <p class="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 text-left">Nhân viên hỗ trợ</p>
                  @for (admin of humanAdmins; track admin._id) {
                    <button 
                      (click)="startChat(admin)"
                      class="w-full bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all mb-2 flex items-center gap-3 text-left group"
                    >
                      <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold group-hover:bg-primary-600 group-hover:text-white transition-colors">
                        {{ admin.name?.charAt(0) }}
                      </div>
                      <div>
                        <p class="font-medium text-gray-800">{{ admin.name }}</p>
                        <p class="text-xs text-gray-500">Admin</p>
                      </div>
                    </button>
                  }
                } @else if (!bot) {
                  <p class="text-sm text-gray-500">Hiện không có nhân viên trực tuyến.</p>
                }
              </div>
            } @else {
               <!-- Bot Action (Always Visible) -->
               @if (bot) {
                 <div class="mb-2">
                   <button 
                     (click)="startChat(bot)"
                     class="w-full bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-3 text-left group"
                   >
                     <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white font-bold backdrop-blur-sm">
                       🤖
                     </div>
                     <div>
                       <p class="font-bold text-white">Trợ lý ảo AI</p>
                       <p class="text-xs text-blue-100">Trả lời ngay lập tức</p>
                     </div>
                   </button>
                 </div>
               }

               <!-- Support Action -->
               @if (humanAdmins.length > 0) {
                <div class="mb-2">
                   <button 
                    (click)="startChat(humanAdmins[0])"
                    class="w-full bg-primary-50 hover:bg-primary-100 p-3 rounded-lg border border-primary-100 flex items-center gap-3 text-left transition-colors"
                  >
                    <div class="w-10 h-10 bg-white text-primary-600 rounded-full flex items-center justify-center shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p class="font-bold text-primary-700">Chat với Hỗ trợ</p>
                      <p class="text-xs text-primary-600">Luôn sẵn sàng giúp đỡ bạn</p>
                    </div>
                  </button>
                </div>
               }

              <!-- Active Conversations -->
              @for (conv of conversations; track conv.user._id) {
                <button 
                  (click)="startChat(conv.user, conv)"
                  class="w-full p-3 hover:bg-white rounded-lg transition-colors flex items-center gap-3 text-left border-b border-gray-100 last:border-0"
                >
                  <div class="relative">
                    <div class="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                      @if (conv.user.email === 'chatbot@chungmobile.com') {
                        <span class="text-2xl">🤖</span>
                      } @else {
                        {{ conv.user.name?.charAt(0) }}
                      }
                    </div>
                    @if (conv.unreadCount > 0) {
                      <span class="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                        {{ conv.unreadCount }}
                      </span>
                    }
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-center mb-1">
                      <p class="font-semibold text-gray-800 truncate">{{ conv.user.name }}</p>
                      <span class="text-[10px] text-gray-400">{{ formatTimeShort(conv.lastMessage?.createdAt) }}</span>
                    </div>
                    <p class="text-sm text-gray-500 truncate" [class.font-semibold]="conv.unreadCount > 0">
                      {{ conv.sender === currentUserId ? 'Bạn: ' : '' }}{{ conv.lastMessage?.content }}
                    </p>
                  </div>
                </button>
              }
            }
          </div>
        } @else {
          <!-- Message List -->
          <div class="p-4 space-y-4" (click)="handleContentClick($event)">
            @for (msg of messages; track msg._id) {
              <div [class]="msg.sender._id === currentUserId ? 'flex justify-end' : 'flex justify-start'">
                <div class="max-w-[85%]">
                  <div 
                    [class]="msg.sender._id === currentUserId 
                      ? 'bg-primary-600 text-white rounded-l-2xl rounded-tr-2xl' 
                      : (msg.sender.email === 'chatbot@chungmobile.com' 
                          ? 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-r-2xl rounded-tl-2xl border-0' 
                          : 'bg-white border border-gray-200 text-gray-800 rounded-r-2xl rounded-tl-2xl')"
                    class="px-4 py-2 shadow-sm relative group"
                  >
                    @if (msg.sender.email === 'chatbot@chungmobile.com') {
                      <div class="flex items-center gap-1.5 mb-1.5 border-b border-white/10 pb-1.5">
                        <span class="text-base">🤖</span>
                        <span class="text-[10px] font-bold uppercase tracking-wider opacity-80">Trợ lý AI</span>
                      </div>
                    }
                    <div class="text-sm leading-relaxed ai-content" [innerHTML]="msg.content | markdown | async"></div>
                    <p 
                      class="text-[10px] mt-1 text-right opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-5 right-0 text-gray-400 w-full"
                      [class.text-white]="msg.sender._id === currentUserId"
                    >
                      {{ formatTime(msg.createdAt) }}
                    </p>
                  </div>

                  <!-- Product Cards -->
                  @if (msg.suggestedProducts && msg.suggestedProducts.length > 0) {
                    <div class="mt-2 space-y-2">
                      @for (product of msg.suggestedProducts; track product._id) {
                        <a [href]="'/products/' + product._id" 
                           (click)="navigateToProduct($event, product._id)"
                           class="product-card-suggest block bg-white rounded-xl border border-gray-200 p-2.5 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group/card"
                        >
                          <div class="flex items-center gap-3">
                            <div class="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                              @if (product.thumbnail) {
                                <img [src]="product.thumbnail | productImage" [alt]="product.name" class="w-full h-full object-cover">
                              } @else {
                                <div class="w-full h-full flex items-center justify-center text-2xl">📱</div>
                              }
                            </div>
                            <div class="flex-1 min-w-0">
                              <p class="text-xs font-semibold text-gray-800 truncate group-hover/card:text-blue-600 transition-colors">{{ product.name }}</p>
                              <p class="text-xs font-bold text-red-500 mt-0.5">{{ formatPrice(product.price) }}</p>
                              <div class="flex items-center gap-2 mt-0.5">
                                @if (product.rating > 0) {
                                  <span class="text-[10px] text-amber-500">⭐ {{ product.rating }}/5</span>
                                }
                                @if (product.sold > 0) {
                                  <span class="text-[10px] text-gray-400">Đã bán {{ product.sold }}+</span>
                                }
                              </div>
                            </div>
                            <div class="text-blue-500 group-hover/card:translate-x-1 transition-transform">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </a>
                      }
                    </div>
                  }
                </div>
              </div>
            }
            @if (isTyping) {
              <div class="flex justify-start">
                <div class="bg-gray-100 rounded-full px-4 py-2 flex gap-1">
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- Input Area -->
      @if (selectedUser) {
        <div class="bg-white border-t border-gray-100 shrink-0">
          <!-- Quick Suggestions -->
          @if (isBotChat && messages.length <= 2) {
            <div class="px-3 pt-2 flex flex-wrap gap-1.5">
              @for (suggestion of quickSuggestions; track suggestion) {
                <button 
                  (click)="useSuggestion(suggestion)"
                  class="text-[11px] px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full border border-blue-200 transition-colors whitespace-nowrap"
                >{{ suggestion }}</button>
              }
            </div>
          }
          <div class="p-3">
            <form (ngSubmit)="sendMessage()" class="flex gap-2">
              <input 
                type="text" 
                [(ngModel)]="messageContent" 
                name="message"
                class="flex-1 bg-gray-50 border-0 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all" 
                placeholder="Nhập tin nhắn..."
                (input)="onTyping()"
                autocomplete="off"
              >
              <button 
                type="submit" 
                class="w-10 h-10 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                [disabled]="!messageContent.trim() || sending"
              >
                @if (sending) {
                  <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                } @else {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                }
              </button>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background-color: rgba(156, 163, 175, 0.5);
      border-radius: 20px;
    }
    .delay-200 { animation-delay: 200ms; }
    
    :host ::ng-deep .ai-content h3 {
      font-weight: bold;
      font-size: 0.95rem;
      margin-bottom: 0.5rem;
      color: inherit;
    }
    :host ::ng-deep .ai-content ul {
      list-style-type: disc;
      padding-left: 1.25rem;
      margin-bottom: 0.5rem;
    }
    :host ::ng-deep .ai-content li {
      margin-bottom: 0.25rem;
    }
    :host ::ng-deep .ai-content p {
      margin-bottom: 0.5rem;
    }
    :host ::ng-deep .ai-content p:last-child {
      margin-bottom: 0;
    }
    :host ::ng-deep .ai-content strong {
      font-weight: 700;
    }
    :host ::ng-deep .ai-content .product-link-inline {
      display: inline-block;
      background: rgba(255,255,255,0.2);
      color: #fff;
      padding: 2px 10px;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.8rem;
      margin-top: 4px;
      border: 1px solid rgba(255,255,255,0.3);
      transition: all 0.2s;
      cursor: pointer;
    }
    :host ::ng-deep .ai-content .product-link-inline:hover {
      background: rgba(255,255,255,0.35);
      transform: translateX(2px);
    }
    .product-card-suggest {
      animation: slideUp 0.3s ease-out;
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ChatWidgetComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  isOpen = false;
  loading = true;
  conversations: any[] = [];
  admins: any[] = [];
  messages: Message[] = [];
  selectedUser: any = null;
  messageContent = '';
  sending = false;
  isTyping = false;
  currentUserId = '';
  unreadCount = 0;
  bot: any = null;
  humanAdmins: any[] = [];
  private typingTimeout: any;
  private msgSub: Subscription | null = null;

  quickSuggestions = [
    '📱 Điện thoại bán chạy',
    '💰 Giá rẻ cho sinh viên',
    '🎮 Chiến game mượt',
    '📸 Chụp ảnh đẹp',
    '🔋 Pin trâu',
    '👑 Flagship cao cấp'
  ];

  get isBotChat(): boolean {
    return this.selectedUser?.email === 'chatbot@chungmobile.com';
  }

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUserId = this.authService.currentUser?._id || '';
  }

  ngOnInit() {
    // Only subscribe to currentUser, which will trigger initChat
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUserId = user._id;
        this.initChat();
      } else {
        this.isOpen = false;
        this.messages = [];
        this.conversations = [];
        if (this.msgSub) {
          this.msgSub.unsubscribe();
        }
      }
    });

    // Listen for remote open events
    this.chatService.openChat$.subscribe(data => {
      this.isOpen = true;
      this.startChat(data.user);
      
      if (data.initialMessage) {
        // Delay slightly to ensure chat is loaded
        setTimeout(() => {
          this.messageContent = data.initialMessage!;
          this.sendMessage(data.context);
        }, 800);
      }
    });
  }

  initChat() {
    this.chatService.connect();
    
    // Clear previous subscription to prevent duplicate listeners
    if (this.msgSub) {
      this.msgSub.unsubscribe();
    }

    // 1. Load Admins & Bot first
    this.chatService.getAdmins().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const allAdmins = res.data;
          this.bot = allAdmins.find((a: any) => a.email === 'chatbot@chungmobile.com');
          this.humanAdmins = allAdmins.filter((a: any) => a.email !== 'chatbot@chungmobile.com');

          // 2. Load conversations normally without resetting bot chat
          this.loadConversations();
        } else {
          this.loadConversations();
        }
      },
      error: () => this.loadConversations()
    });

    // 3. Listeners
    this.msgSub = this.chatService.messageReceived$.subscribe(message => {
      // Basic deduplication check
      const exists = this.messages.some(m => m._id === message._id);
      if (exists) return;

      if (this.selectedUser && (message.sender._id === this.selectedUser._id || message.receiver === this.selectedUser._id)) {
        this.messages.push(message);
        this.scrollToBottom();
      }
      this.loadConversations(); // Just refresh list
      if (!this.isOpen) {
        // Optional: Play sound
      }
    });

    this.chatService.onUserTyping((data) => {
      if (this.selectedUser?._id === data.userId) {
        this.isTyping = true;
        this.scrollToBottom();
        setTimeout(() => {
          this.isTyping = false;
        }, 3000);
      }
    });
  }

  loadConversations() {
    this.chatService.getConversations().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.conversations = res.data;
          this.calculateUnread();
        }
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  loadAdmins() {
    // Only used for updates if needed, logic is now mainlined in initChat
  }

  calculateUnread() {
    this.unreadCount = this.conversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      setTimeout(() => this.scrollToBottom(), 100);
      if (this.conversations.length > 0 && !this.selectedUser) {
        // Auto select most recent conversation if only one? 
        // Or just let user pick. Let's let user pick if list.
        // If single conversation, maybe auto-pick?
        // this.startChat(this.conversations[0].user, this.conversations[0]);
      }
    }
  }

  startChat(user: any, conversation?: any) {
    this.selectedUser = user;
    this.messages = [];
    this.loading = true;
    
    this.chatService.getMessages(user._id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.messages = res.data;
          this.scrollToBottom();
        }
        this.loading = false;
      }
    });
  }

  backToConversations() {
    this.selectedUser = null;
    this.loadConversations();
  }

  sendMessage(context?: any) {
    if (!this.messageContent.trim() || !this.selectedUser) return;

    const content = this.messageContent;
    this.messageContent = '';
    this.sending = true;
    
    this.chatService.sendMessage(this.selectedUser._id, content, context).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.messages.push(res.data);
          this.scrollToBottom();
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

  scrollToBottom() {
    if (this.scrollContainer) {
      setTimeout(() => {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }, 50);
    }
  }

  ngAfterViewChecked() {
    // Optional: Keep scrolled to bottom if user was at bottom
  }

  ngOnDestroy() {
    if (this.typingTimeout) clearTimeout(this.typingTimeout);
    if (this.msgSub) this.msgSub.unsubscribe();
  }

  formatTime(date: string): string {
    return new Date(date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  }

  formatTimeShort(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  }

  navigateToProduct(event: Event, productId: string) {
    event.preventDefault();
    event.stopPropagation();
    this.router.navigate(['/products', productId]);
    this.isOpen = false;
  }

  handleContentClick(event: Event) {
    const target = event.target as HTMLElement;
    const link = target.closest('a.product-link-inline') as HTMLAnchorElement;
    if (link) {
      event.preventDefault();
      const href = link.getAttribute('href');
      if (href && href.startsWith('/products/')) {
        this.router.navigate([href]);
        this.isOpen = false;
      }
    }
  }

  useSuggestion(suggestion: string) {
    this.messageContent = suggestion;
    this.sendMessage();
  }
}
