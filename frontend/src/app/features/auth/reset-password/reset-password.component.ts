import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div class="max-w-md w-full space-y-8 p-10 bg-white rounded-3xl shadow-xl border border-slate-100">
        <div class="text-center">
          <div class="mx-auto h-16 w-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-4">
            <svg class="h-8 w-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </div>
          <h2 class="text-3xl font-bold text-slate-900">Đặt lại mật khẩu</h2>
          <p class="mt-2 text-sm text-slate-500">
            Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
          </p>
        </div>

        @if (isSuccess) {
          <div class="rounded-2xl bg-green-50 p-6 border border-green-100 text-center animate-in fade-in zoom-in duration-300">
            <div class="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto mb-4">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            </div>
            <h3 class="text-green-800 font-bold text-lg mb-2">Thành công!</h3>
            <p class="text-sm text-green-700 mb-6">
              Mật khẩu của bạn đã được thay đổi. Bạn có thể đăng nhập ngay bây giờ.
            </p>
            <a routerLink="/auth/login" class="btn btn-primary w-full py-3">Đăng nhập</a>
          </div>
        } @else {
          <form class="mt-8 space-y-6" (ngSubmit)="onSubmit()">
            <div class="space-y-4">
              <div>
                <label for="password" class="block text-sm font-bold text-slate-700 mb-2">Mật khẩu mới</label>
                <input id="password" name="password" type="password" required [(ngModel)]="password"
                  class="input"
                  placeholder="••••••••">
              </div>
              <div>
                <label for="confirmPassword" class="block text-sm font-bold text-slate-700 mb-2">Xác nhận mật khẩu</label>
                <input id="confirmPassword" name="confirmPassword" type="password" required [(ngModel)]="confirmPassword"
                  class="input"
                  placeholder="••••••••">
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
                <span class="group-hover:scale-105 transition-transform">{{ loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu' }}</span>
              </button>
            </div>
          </form>
        }
      </div>
    </div>
  `
})
export class ResetPasswordComponent implements OnInit {
  password = '';
  confirmPassword = '';
  token = '';
  loading = false;
  isSuccess = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.params['token'];
    if (!this.token) {
      this.error = 'Token không hợp lệ';
    }
  }

  onSubmit() {
    if (this.password !== this.confirmPassword) {
      this.error = 'Mật khẩu xác nhận không khớp';
      return;
    }

    if (this.password.length < 6) {
      this.error = 'Mật khẩu phải có ít nhất 6 ký tự';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.resetPassword(this.token, this.password).subscribe({
      next: (res) => {
        if (res.success) {
          this.isSuccess = true;
        } else {
          this.error = res.message || 'Có lỗi xảy ra';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Token không hợp lệ hoặc đã hết hạn';
        this.loading = false;
      }
    });
  }
}
