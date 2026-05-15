import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div class="max-w-md w-full space-y-8 p-10 bg-white rounded-3xl shadow-xl border border-slate-100">
        <div class="text-center">
          <div class="mx-auto h-16 w-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-4">
            <svg class="h-8 w-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
            </svg>
          </div>
          <h2 class="text-3xl font-bold text-slate-900">Quên mật khẩu?</h2>
          <p class="mt-2 text-sm text-slate-500">
            Đừng lo lắng, chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu cho bạn.
          </p>
        </div>

        @if (isSubmitted && !error) {
          <div class="rounded-2xl bg-green-50 p-6 border border-green-100 animate-in fade-in zoom-in duration-300">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
              </div>
              <h3 class="text-green-800 font-bold">Kiểm tra email của bạn</h3>
            </div>
            <p class="text-sm text-green-700">
              Chúng tôi đã gửi link đặt lại mật khẩu đến <strong>{{ email }}</strong>. Vui lòng kiểm tra hộp thư đến (và cả thư rác).
            </p>
            <button (click)="isSubmitted = false" class="mt-4 text-sm font-semibold text-green-800 hover:underline">
              Thử lại với email khác
            </button>
          </div>
        } @else {
          <form class="mt-8 space-y-6" (ngSubmit)="onSubmit()">
            <div>
              <label for="email" class="block text-sm font-bold text-slate-700 mb-2">Địa chỉ Email</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/></svg>
                </div>
                <input id="email" name="email" type="email" required [(ngModel)]="email"
                  class="input pl-11"
                  placeholder="name@example.com">
              </div>
            </div>

            @if (error) {
              <div class="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-xl border border-red-100 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                {{ error }}
              </div>
            }

            <div>
              <button type="submit" [disabled]="loading" class="btn btn-primary w-full py-4 text-lg shadow-xl shadow-primary-600/20 group">
                <span class="group-hover:scale-105 transition-transform">{{ loading ? 'Đang xử lý...' : 'Gửi link đặt lại mật khẩu' }}</span>
              </button>
            </div>
          </form>
        }

        <div class="text-center">
          <a routerLink="/auth/login" class="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary-600 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            Quay lại đăng nhập
          </a>
        </div>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  email = '';
  loading = false;
  isSubmitted = false;
  error = '';

  constructor(private authService: AuthService) {}

  onSubmit() {
    if (!this.email) return;

    this.loading = true;
    this.error = '';

    this.authService.forgotPassword(this.email).subscribe({
      next: (res) => {
        if (res.success) {
          this.isSubmitted = true;
        } else {
          this.error = res.message || 'Có lỗi xảy ra';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Có lỗi xảy ra';
        this.loading = false;
      }
    });
  }
}
