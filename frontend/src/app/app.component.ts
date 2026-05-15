import { Component, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterOutlet, RouterLink, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './core/services/auth.service';
import { CartService } from './core/services/cart.service';
import { NotificationService } from './core/services/notification.service';
import { ChatService } from './core/services/chat.service';
import { ProductService } from './core/services/product.service';
import { FormsModule } from '@angular/forms';
import { environment } from '../environments/environment';

import { ChatWidgetComponent } from './features/chat/chat-widget/chat-widget.component';
import { fadeAnimation } from './core/animations/route.animations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, FormsModule, ChatWidgetComponent, NgOptimizedImage],
  animations: [fadeAnimation],
  template: `
    <!-- Header -->
    @if (!isAdminRoute) {
    <header class="glass sticky top-0 z-50 transition-all duration-300">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex items-center justify-between h-20 gap-8">
          <div class="flex items-center gap-2 md:gap-4">
            <!-- Logo: Hidden on mobile, visible on desktop -->
            <a routerLink="/" class="hidden md:flex items-center space-x-3 group shrink-0 py-2">
              <div class="flex flex-col leading-none">
                <div class="flex items-center">
                  <span class="text-3xl font-black tracking-tighter text-slate-900 group-hover:text-primary-600 transition-colors uppercase">Chung</span>
                  <span class="text-3xl font-black tracking-tighter text-[#d4af37] ml-1 uppercase">Mobile</span>
                </div>
                <span class="text-[9px] font-bold tracking-[0.2em] text-slate-500 uppercase mt-1">Uy tín là sự nghiệp</span>
              </div>
            </a>
            <!-- Mobile Title -->
            <a routerLink="/" class="md:hidden font-bold text-lg text-gray-800">Chung Mobile</a>
          </div>

          <!-- Search & Category -->
          <div class="hidden md:flex flex-1 max-w-2xl items-center gap-4">
            <!-- Category Mega Menu -->
            <div class="relative group">
              <button class="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors border border-transparent hover:border-gray-300">
                <span class="text-xl">☰</span>
                <span class="font-medium">Danh mục</span>
              </button>

              <!-- Dropdown Content -->
              <div class="absolute top-full left-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl py-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-left z-50 border border-gray-100 ring-1 ring-black/5">
                <div class="px-5 py-3 border-b border-gray-100">
                  <span class="text-sm font-bold text-gray-900 tracking-wide uppercase">Thương hiệu</span>
                </div>
                <div class="p-2 space-y-1">
                  @for (brand of brands; track brand) {
                    <a 
                      (click)="selectBrand(brand)"
                      class="px-4 py-3 rounded-xl text-gray-700 hover:bg-primary-50 hover:text-primary-600 cursor-pointer transition-colors flex items-center justify-between group/item"
                    >
                      <span class="font-medium">{{ brand }}</span>
                      <svg class="w-4 h-4 opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                      </svg>
                    </a>
                  }
                </div>
              </div>
            </div>
            <div class="flex-1 relative group">
              <input 
                type="text" 
                [(ngModel)]="searchQuery"
                (keyup.enter)="search()"
                placeholder="Bạn cần tìm gì hôm nay?" 
                class="w-full pl-10 pr-12 py-2 rounded-xl border border-gray-200 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 bg-gray-50 focus:bg-white transition-all shadow-sm"
              >
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors text-lg">🔍</span>
              <button 
                (click)="search()"
                class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </button>
            </div>
          </div>

          <!-- Actions -->
          <!-- Actions -->
          <div class="flex items-center gap-4">
            <!-- Notifications -->
            @if (authService.currentUser$ | async) {
              <div class="relative">
                <button 
                  class="relative w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-primary-600 transition-all duration-200 focus:outline-none"
                  (click)="toggleNotifications()"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                  </svg>
                  @if (unreadCount > 0) {
                    <span class="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
                  }
                </button>

                @if (showNotifications) {
                  <div class="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl py-2 z-50 max-h-[30rem] overflow-y-auto border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div class="flex items-center justify-between px-5 py-3 border-b border-gray-50">
                      <h3 class="font-bold text-gray-900">Thông báo</h3>
                      <button (click)="markAllRead()" class="text-xs font-medium text-primary-600 hover:text-primary-700">Đã đọc tất cả</button>
                    </div>
                    @if (notifications.length === 0) {
                      <div class="p-8 text-center">
                        <div class="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                        </div>
                        <p class="text-sm text-gray-500">Chưa có thông báo nào</p>
                      </div>
                    } @else {
                      <div class="divide-y divide-gray-50">
                        @for (notif of notifications; track notif._id) {
                          <div 
                            class="px-5 py-4 hover:bg-gray-50 cursor-pointer transition-colors group"
                            [class.bg-blue-50]="!notif.read"
                            (click)="readNotification(notif)"
                          >
                            <div class="flex gap-3">
                              <div class="shrink-0 mt-1">
                                <div class="w-2 h-2 rounded-full" [class.bg-primary-500]="!notif.read" [class.bg-gray-200]="notif.read"></div>
                              </div>
                              <div>
                                <p class="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">{{ notif.title }}</p>
                                <p class="text-sm text-gray-600 mt-0.5 line-clamp-2">{{ notif.content }}</p>
                                <p class="text-xs text-gray-400 mt-2">{{ formatDate(notif.createdAt) }}</p>
                              </div>
                            </div>
                          </div>
                        }
                      </div>
                    }
                  </div>
                }
              </div>
            }

            <!-- Cart -->
            <a routerLink="/cart" class="relative w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-primary-600 transition-all duration-200">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
              </svg>
              @if (cartCount > 0) {
                <span class="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
              }
            </a>

            <!-- User Menu -->
            @if (authService.currentUser$ | async; as user) {
              <div class="relative ml-2">
                <button (click)="toggleUserMenu()" class="flex items-center gap-3 p-1 pr-4 rounded-full hover:bg-gray-100 transition-all duration-200 border border-transparent hover:border-gray-200 group">
                  <div class="w-9 h-9 rounded-full overflow-hidden border border-gray-200 shadow-sm relative">
                    <div class="absolute inset-0 bg-gray-100 animate-pulse" *ngIf="!user.avatar && !user.name"></div>
                    @if (user.avatar) {
                      <img [ngSrc]="getImageUrl(user.avatar)" fill alt="Avatar" class="object-cover">
                    } @else {
                      <div class="w-full h-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                        {{ user.name.charAt(0).toUpperCase() }}
                      </div>
                    }
                  </div>
                  <span class="hidden md:block font-medium text-gray-700 group-hover:text-primary-600">{{ user.name }}</span>
                  <svg class="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>
                
                @if (showUserMenu) {
                  <div class="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div class="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                      <p class="text-sm font-bold text-gray-900">{{ user.name }}</p>
                      <p class="text-xs text-gray-500 truncate">{{ user.email }}</p>
                    </div>
                    <a routerLink="/profile" class="block px-4 py-2.5 text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-600 font-medium" (click)="showUserMenu = false">
                      👤 Thông tin tài khoản
                    </a>
                    <a routerLink="/orders" class="block px-4 py-2.5 text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-600 font-medium" (click)="showUserMenu = false">
                      📦 Đơn mua
                    </a>
                    @if (user.role === 'admin') {
                      <a routerLink="/admin" class="block px-4 py-2.5 text-sm text-primary-600 hover:bg-primary-50 font-bold" (click)="showUserMenu = false">
                        ⚡ Quản trị hệ thống
                      </a>
                    }
                    <div class="border-t border-gray-100 mt-1 pt-1">
                      <button (click)="logout()" class="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium">
                        🚪 Đăng xuất
                      </button>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <div class="flex items-center gap-3">
                <a routerLink="/auth/login" class="px-5 py-2.5 rounded-xl font-bold hover:bg-gray-100 text-gray-600 transition-all">
                  Đăng nhập
                </a>
                <a routerLink="/auth/register" class="btn btn-primary shadow-lg shadow-primary-600/20">
                  Đăng ký
                </a>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Mobile Menu Overlay -->
      @if (mobileMenuOpen) {
        <div class="fixed inset-0 z-50 md:hidden">
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" (click)="closeMobileMenu()"></div>
          
          <!-- Drawer -->
          <div class="absolute inset-y-0 left-0 w-[80%] max-w-sm bg-white shadow-2xl transform transition-transform duration-300 flex flex-col">
            <!-- Drawer Header -->
            <div class="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <span class="font-bold text-lg text-gray-900">Menu</span>
              <button (click)="closeMobileMenu()" class="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <!-- Drawer Content -->
            <div class="flex-1 overflow-y-auto p-4 space-y-6">
              <!-- Mobile Search -->
              <div class="relative group">
                <input 
                  type="text" 
                  [(ngModel)]="searchQuery"
                  (keyup.enter)="search()"
                  placeholder="Tìm kiếm sản phẩm..." 
                  class="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 bg-gray-50 focus:bg-white transition-all shadow-sm"
                >
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              </div>

              <!-- User Info (if logged in) -->
              @if (authService.currentUser$ | async; as user) {
                <div class="bg-primary-50 p-4 rounded-xl border border-primary-100">
                  <div class="flex items-center gap-3 mb-3">
                    @if (user.avatar) {
                       <img [src]="getImageUrl(user.avatar)" class="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm">
                    } @else {
                       <div class="w-12 h-12 rounded-full bg-white text-primary-600 flex items-center justify-center font-bold text-xl shadow-sm border border-primary-100">
                         {{ user.name.charAt(0).toUpperCase() }}
                       </div>
                    }
                    <div>
                      <div class="font-bold text-gray-900">{{ user.name }}</div>
                      <div class="text-xs text-primary-600 font-medium">{{ user.email }}</div>
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-2">
                    <a routerLink="/profile" (click)="closeMobileMenu()" class="btn btn-sm bg-white text-gray-700 hover:text-primary-600 border border-gray-200">Hồ sơ</a>
                    @if (user.role === 'admin') {
                      <a routerLink="/admin" (click)="closeMobileMenu()" class="btn btn-sm bg-indigo-600 text-white hover:bg-indigo-700 border-none">Quản trị</a>
                    }
                    <button (click)="logout(); closeMobileMenu()" class="col-span-2 btn btn-sm bg-red-50 text-red-600 hover:bg-red-100 border-red-100 mt-1">Đăng xuất</button>
                  </div>
                </div>
              } @else {
                <div class="grid grid-cols-2 gap-3">
                  <a routerLink="/auth/login" (click)="closeMobileMenu()" class="btn btn-secondary justify-center">Đăng nhập</a>
                  <a routerLink="/auth/register" (click)="closeMobileMenu()" class="btn btn-primary justify-center">Đăng ký</a>
                </div>
              }

              <!-- Menu Items -->
              <div class="space-y-1">
                <a routerLink="/" (click)="closeMobileMenu()" class="block px-4 py-3 rounded-xl hover:bg-gray-50 font-medium text-gray-700 hover:text-primary-600 transition-colors">
                  🏠 Trang chủ
                </a>
                <a routerLink="/products" (click)="closeMobileMenu()" class="block px-4 py-3 rounded-xl hover:bg-gray-50 font-medium text-gray-700 hover:text-primary-600 transition-colors">
                  📱 Tất cả điện thoại
                </a>
              </div>

              <!-- Brands -->
              <div>
                <h3 class="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Thương hiệu</h3>
                <div class="space-y-1">
                  @for (brand of brands; track brand) {
                    <a 
                      (click)="selectBrand(brand); closeMobileMenu()"
                      class="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-600 hover:text-primary-600 cursor-pointer transition-colors"
                    >
                      <span>{{ brand }}</span>
                      <svg class="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                    </a>
                  }
                </div>
              </div>
            </div>
            
            <!-- Drawer Footer -->
            <div class="p-4 border-t border-gray-100 bg-gray-50 text-center text-xs text-gray-400">
              &copy; 2026 Chung Mobile App
            </div>
          </div>
        </div>
      }
    </header>
    }

    <!-- Main Content -->
    <main class="min-h-screen" [@fadeAnimation]="o.isActivated ? o.activatedRoute : ''">
      <router-outlet #o="outlet"></router-outlet>
    </main>
    
    @if (authService.currentUser$ | async) {
      <app-chat-widget></app-chat-widget>
    }

    @if (!isAdminRoute) {
    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-12">
      <div class="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div class="flex items-center space-x-3 mb-6">
            <div class="flex flex-col leading-none">
              <div class="flex items-center">
                <span class="text-2xl font-black tracking-tighter text-white uppercase">Chung</span>
                <span class="text-2xl font-black tracking-tighter text-[#d4af37] ml-1 uppercase">Mobile</span>
              </div>
              <span class="text-[8px] font-bold tracking-[0.2em] text-gray-400 uppercase mt-1">Uy tín là sự nghiệp</span>
            </div>
          </div>
          <p class="text-gray-400">Cửa hàng điện thoại chính hãng với giá tốt nhất thị trường.</p>
        </div>
        <div>
          <h4 class="font-semibold mb-4">Liên kết</h4>
          <ul class="space-y-2 text-gray-400">
            <li><a href="#" class="hover:text-white">Về chúng tôi</a></li>
            <li><a href="#" class="hover:text-white">Sản phẩm</a></li>
            <li><a href="#" class="hover:text-white">Khuyến mãi</a></li>
          </ul>
        </div>
        <div>
          <h4 class="font-semibold mb-4">Hỗ trợ</h4>
          <ul class="space-y-2 text-gray-400">
            <li><a href="#" class="hover:text-white">Hướng dẫn mua hàng</a></li>
            <li><a href="#" class="hover:text-white">Chính sách đổi trả</a></li>
            <li><a href="#" class="hover:text-white">Bảo hành</a></li>
          </ul>
        </div>
        <div>
          <h4 class="font-semibold mb-4">Liên hệ</h4>
          <ul class="space-y-2 text-gray-400">
            <li>📞 1900 xxxx</li>
            <li>✉️ support&#64;phoneshop.vn</li>
            <li>📍 123 Đường ABC, TP.HCM</li>
          </ul>
        </div>
      </div>
      <div class="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
        &copy; 2026 Chung Mobile. All rights reserved.
      </div>
    </footer>
    }
  `
})
export class AppComponent implements OnInit {
  showUserMenu = false;
  showNotifications = false;
  cartCount = 0;
  unreadCount = 0;
  selectedBrand = '';
  searchQuery = '';
  brands: string[] = [];
  notifications: any[] = [];
  mobileMenuOpen = false;
  isAdminRoute = false;

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    if (this.mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
    document.body.style.overflow = '';
  }



  constructor(
    public authService: AuthService,
    private cartService: CartService,
    private notificationService: NotificationService,
    private chatService: ChatService,
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit() {
    this.productService.getBrands().subscribe({
      next: (res) => {
        if (res.success) {
          this.brands = res.data || [];
        }
      }
    });

    // Check current route
    this.isAdminRoute = this.router.url.startsWith('/admin');

    // Watch for route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isAdminRoute = event.urlAfterRedirects.startsWith('/admin');
    });

    if (this.authService.isLoggedIn) {
      this.loadUserData();
    }

    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.loadUserData();
      }
    });

    this.cartService.cart$.subscribe(cart => {
      this.cartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    });

    this.notificationService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
    });

    this.notificationService.notifications$.subscribe(notifs => {
      this.notifications = notifs;
    });
  }

  loadUserData() {
    this.cartService.getCart().subscribe();
    this.notificationService.getNotifications().subscribe();
    this.notificationService.connect();
    this.chatService.connect();
  }

  search() {
    const params: any = {};
    
    if (this.searchQuery.trim()) {
      params.search = this.searchQuery;
    }
    
    if (this.selectedBrand) {
      params.brand = this.selectedBrand;
    }

    this.router.navigate(['/products'], { queryParams: params });
  }

  selectBrand(brand: string) {
    this.selectedBrand = brand;
    this.search(); // Navigate immediately
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
    this.showNotifications = false;
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    this.showUserMenu = false;
  }

  markAllRead() {
    this.notificationService.markAllAsRead().subscribe();
  }

  readNotification(notif: any) {
    if (!notif.read) {
      this.notificationService.markAsRead(notif._id).subscribe();
    }
    // Navigate based on type if needed, e.g. order
    if (notif.data?.orderId) {
      this.router.navigate(['/orders', notif.data.orderId]);
    }
    this.showNotifications = false;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString('vi-VN');
  }

  logout() {
    this.authService.logout();
    this.notificationService.disconnect();
    this.chatService.disconnect();
    this.showUserMenu = false;
    this.showNotifications = false;
    this.router.navigate(['/']);
  }
  getImageUrl(path: string | undefined): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return environment.apiUrl.replace('/api', '') + path;
  }
}
