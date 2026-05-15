import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, FormsModule],
  template: `
    <div class="min-h-screen flex" style="background: linear-gradient(135deg, #f0f4ff 0%, #f8fafc 40%, #fdf2f8 100%);">
      <!-- Sidebar -->
      <aside class="w-[72px] hover:w-[260px] bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white flex-shrink-0 flex flex-col shadow-2xl shadow-slate-900/40 relative z-20 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group overflow-hidden">
        <!-- Logo Area -->
        <div class="h-[72px] flex items-center px-4 border-b border-white/5 overflow-hidden flex-shrink-0">
          <a [routerLink]="['/admin']" class="flex items-center gap-3.5 hover:opacity-90 transition-opacity min-w-max">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/40 flex-shrink-0 ring-1 ring-white/20">
              <span class="text-xl font-black text-white">C</span>
            </div>
            <div class="opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap translate-x-2 group-hover:translate-x-0">
              <h1 class="text-base font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Chung Mobile</h1>
              <p class="text-[9px] text-indigo-400 font-semibold tracking-[0.2em] uppercase">Admin Portal</p>
            </div>
          </a>
        </div>

        <!-- Nav -->
        <nav class="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <div class="text-[9px] font-bold text-slate-500 uppercase tracking-[0.25em] mb-2 px-3 mt-1 opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap">Tổng quan</div>
          
          <a routerLink="/admin" routerLinkActive="!bg-gradient-to-r !from-indigo-600 !to-blue-600 !text-white !shadow-lg !shadow-indigo-600/30 !ring-1 !ring-indigo-400/30" [routerLinkActiveOptions]="{exact: true}"
             class="flex items-center gap-3.5 px-2.5 py-2.5 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all duration-200 group/item min-w-max">
            <span class="w-[42px] h-[42px] rounded-xl bg-white/5 group-hover/item:bg-white/10 transition-all flex items-center justify-center flex-shrink-0 text-lg">📊</span>
            <span class="text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap translate-x-2 group-hover:translate-x-0">Dashboard</span>
          </a>

          <div class="text-[9px] font-bold text-slate-500 uppercase tracking-[0.25em] mb-2 px-3 mt-5 opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap">Quản lý</div>

          <a [routerLink]="['/admin/products']" routerLinkActive="!bg-gradient-to-r !from-indigo-600 !to-blue-600 !text-white !shadow-lg !shadow-indigo-600/30 !ring-1 !ring-indigo-400/30"
             class="flex items-center gap-3.5 px-2.5 py-2.5 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all duration-200 group/item min-w-max">
            <span class="w-[42px] h-[42px] rounded-xl bg-white/5 group-hover/item:bg-white/10 transition-all flex items-center justify-center flex-shrink-0 text-lg">📱</span>
            <span class="text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap translate-x-2 group-hover:translate-x-0">Sản phẩm</span>
          </a>
          <a [routerLink]="['/admin/orders']" routerLinkActive="!bg-gradient-to-r !from-indigo-600 !to-blue-600 !text-white !shadow-lg !shadow-indigo-600/30 !ring-1 !ring-indigo-400/30"
             class="flex items-center gap-3.5 px-2.5 py-2.5 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all duration-200 group/item min-w-max">
            <span class="w-[42px] h-[42px] rounded-xl bg-white/5 group-hover/item:bg-white/10 transition-all flex items-center justify-center flex-shrink-0 text-lg">📦</span>
            <span class="text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap translate-x-2 group-hover:translate-x-0">Đơn hàng</span>
          </a>
          <a [routerLink]="['/admin/promotions']" routerLinkActive="!bg-gradient-to-r !from-indigo-600 !to-blue-600 !text-white !shadow-lg !shadow-indigo-600/30 !ring-1 !ring-indigo-400/30"
             class="flex items-center gap-3.5 px-2.5 py-2.5 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all duration-200 group/item min-w-max">
            <span class="w-[42px] h-[42px] rounded-xl bg-white/5 group-hover/item:bg-white/10 transition-all flex items-center justify-center flex-shrink-0 text-lg">🏷️</span>
            <span class="text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap translate-x-2 group-hover:translate-x-0">Khuyến mãi</span>
          </a>
          <a [routerLink]="['/admin/coupons']" routerLinkActive="!bg-gradient-to-r !from-indigo-600 !to-blue-600 !text-white !shadow-lg !shadow-indigo-600/30 !ring-1 !ring-indigo-400/30"
             class="flex items-center gap-3.5 px-2.5 py-2.5 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all duration-200 group/item min-w-max">
            <span class="w-[42px] h-[42px] rounded-xl bg-white/5 group-hover/item:bg-white/10 transition-all flex items-center justify-center flex-shrink-0 text-lg">🎫</span>
            <span class="text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap translate-x-2 group-hover:translate-x-0">Voucher</span>
          </a>
          <a [routerLink]="['/admin/users']" routerLinkActive="!bg-gradient-to-r !from-indigo-600 !to-blue-600 !text-white !shadow-lg !shadow-indigo-600/30 !ring-1 !ring-indigo-400/30"
             class="flex items-center gap-3.5 px-2.5 py-2.5 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all duration-200 group/item min-w-max">
            <span class="w-[42px] h-[42px] rounded-xl bg-white/5 group-hover/item:bg-white/10 transition-all flex items-center justify-center flex-shrink-0 text-lg">👥</span>
            <span class="text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap translate-x-2 group-hover:translate-x-0">Người dùng</span>
          </a>
          <a routerLink="/admin/chat" routerLinkActive="!bg-gradient-to-r !from-indigo-600 !to-blue-600 !text-white !shadow-lg !shadow-indigo-600/30 !ring-1 !ring-indigo-400/30"
             class="flex items-center gap-3.5 px-2.5 py-2.5 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all duration-200 group/item min-w-max">
            <span class="w-[42px] h-[42px] rounded-xl bg-white/5 group-hover/item:bg-white/10 transition-all flex items-center justify-center flex-shrink-0 text-lg">💬</span>
            <span class="text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap translate-x-2 group-hover:translate-x-0">Chat hỗ trợ</span>
          </a>
        </nav>

        <!-- Bottom Actions -->
        <div class="px-2 py-3 border-t border-white/5">
          <a routerLink="/" class="flex items-center gap-3.5 px-2.5 py-2.5 rounded-xl text-slate-500 hover:bg-white/5 hover:text-slate-300 transition-all min-w-max">
            <span class="w-[42px] h-[42px] flex items-center justify-center text-lg flex-shrink-0">🌐</span>
            <span class="text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap translate-x-2 group-hover:translate-x-0">Về trang chủ</span>
          </a>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 flex flex-col h-screen overflow-hidden relative">
        <!-- Top Header -->
        <header class="h-[72px] bg-white/70 backdrop-blur-2xl border-b border-slate-200/50 flex items-center justify-between px-8 sticky top-0 z-10">
          <div>
            <h2 class="text-xl font-bold text-slate-800 tracking-tight">Tổng quan</h2>
            <p class="text-xs text-slate-400 mt-0.5">Chào mừng trở lại, <span class="font-semibold text-slate-600">{{ authService.currentUser?.name }}</span></p>
          </div>
          
          <div class="flex items-center gap-3">
            <!-- Search -->
            <div class="hidden lg:flex items-center gap-2 px-4 py-2 bg-slate-100/80 rounded-xl text-sm text-slate-400 group focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all w-64 border border-transparent focus-within:border-indigo-200">
              <svg class="w-4 h-4 group-focus-within:text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input type="text" [(ngModel)]="searchQuery" (keyup.enter)="onSearch()" placeholder="Tìm kiếm..." class="bg-transparent border-none outline-none text-xs text-slate-700 w-full placeholder:text-slate-400">
              <span class="ml-auto text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border text-slate-300">⌘K</span>
            </div>

            <div class="h-6 w-px bg-slate-200"></div>

            <!-- Notification -->
            <div class="relative">
              <button (click)="toggleNotifications()" class="w-9 h-9 rounded-xl bg-slate-100/80 hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-indigo-600 transition-all relative">
                <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                @if ((notificationService.unreadCount$ | async); as count) {
                  @if (count > 0) {
                    <span class="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 rounded-full text-[9px] text-white font-bold flex items-center justify-center ring-2 ring-white">
                      {{ count }}
                    </span>
                  }
                }
              </button>

              <!-- Notifications Dropdown -->
              @if (showNotifications) {
                <div class="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div class="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                    <span class="text-xs font-bold text-slate-800 uppercase tracking-wider">Thông báo</span>
                    <button (click)="markAllNotificationsRead()" class="text-[10px] text-indigo-600 font-bold hover:underline">Đã đọc tất cả</button>
                  </div>
                  <div class="max-h-[300px] overflow-y-auto custom-scrollbar">
                    @if ((notificationService.notifications$ | async)?.length === 0) {
                      <div class="p-8 text-center text-slate-400 text-xs">Không có thông báo mới</div>
                    }
                    @for (notif of (notificationService.notifications$ | async); track notif._id) {
                      <div class="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors unread-notif" [class.bg-indigo-50]="!notif.read">
                        <p class="text-xs font-bold text-slate-800">{{ notif.title }}</p>
                        <p class="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{{ notif.content }}</p>
                        <p class="text-[9px] text-slate-400 mt-1">{{ notif.createdAt | date:'HH:mm dd/MM' }}</p>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>

            <!-- Profile -->
            <div class="relative">
              <div (click)="toggleProfileMenu()" class="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-xl bg-slate-100/80 hover:bg-slate-100 cursor-pointer transition-all border border-transparent hover:border-slate-200">
                <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-indigo-500/30 ring-1 ring-white/50">
                  {{ authService.currentUser?.name?.charAt(0)?.toUpperCase() }}
                </div>
                <div class="hidden md:block">
                  <p class="text-xs font-bold text-slate-700 leading-tight">{{ authService.currentUser?.name }}</p>
                  <p class="text-[10px] text-slate-400 leading-tight">Quản trị viên</p>
                </div>
                <svg class="w-3.5 h-3.5 text-slate-400 ml-1 hidden md:block transition-transform duration-200" [class.rotate-180]="showProfileMenu" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
              </div>

              <!-- Profile Dropdown -->
              @if (showProfileMenu) {
                <div class="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <a routerLink="/" class="flex items-center gap-2 px-4 py-2.5 text-xs text-slate-600 hover:bg-slate-50 transition-colors">
                    <span>🌐</span> Về trang chủ
                  </a>
                  <div class="h-px bg-slate-100 my-1"></div>
                  <button (click)="logout()" class="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 transition-colors font-bold">
                    <span>🚪</span> Đăng xuất
                  </button>
                </div>
              }
            </div>
          </div>
        </header>

        <!-- Content Scroll Area -->
        <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AdminLayoutComponent {
  showProfileMenu = false;
  showNotifications = false;
  searchQuery = '';

  constructor(
    public authService: AuthService,
    public notificationService: NotificationService,
    private router: Router
  ) {}

  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
    this.showNotifications = false;
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    this.showProfileMenu = false;
  }

  markAllNotificationsRead() {
    this.notificationService.markAllAsRead().subscribe();
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/admin/products'], { queryParams: { search: this.searchQuery } });
      this.searchQuery = '';
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
