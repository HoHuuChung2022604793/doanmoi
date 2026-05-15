import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div class="max-w-md w-full">
        <div class="text-center mb-8">
          <a routerLink="/" class="inline-flex items-center space-x-2">
            <span class="text-4xl">📱</span>
            <span class="text-2xl font-bold text-primary-600">Chung Mobile</span>
          </a>
          <h2 class="mt-6 text-3xl font-bold text-gray-900">Đăng nhập</h2>
          <p class="mt-2 text-gray-600">
            Chưa có tài khoản? 
            <a routerLink="/auth/register" class="text-primary-600 hover:underline">Đăng ký ngay</a>
          </p>
        </div>

        <div class="card p-8">
          @if (error) {
            <div class="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{{ error }}</div>
          }

          <form (ngSubmit)="onSubmit()">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                [(ngModel)]="email" 
                name="email"
                class="input" 
                placeholder="email@example.com"
                required
              >
            </div>

            <div class="mb-6">
              <div class="flex items-center justify-between mb-1">
                <label class="block text-sm font-medium text-gray-700">Mật khẩu</label>
                <a routerLink="/auth/forgot-password" class="text-xs text-primary-600 hover:underline">Quên mật khẩu?</a>
              </div>
              <input 
                type="password" 
                [(ngModel)]="password" 
                name="password"
                class="input" 
                placeholder="••••••••"
                required
              >
            </div>

            <button 
              type="submit" 
              class="btn btn-primary w-full py-3"
              [disabled]="loading"
            >
              {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
            </button>
          </form>

          <div class="mt-6">
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-300"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-2 bg-white text-gray-500">Hoặc đăng nhập bằng</span>
              </div>
            </div>

            <div class="mt-6 grid grid-cols-1 gap-4">
              <a href="https://doan2-par9.onrender.com/api/auth/google" class="group relative w-full flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-xl bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:shadow-md hover:border-gray-400 transition-all duration-200">
                <img src="assets/images/google.svg" alt="Google" class="w-5 h-5 mr-3">
                Tiếp tục với Google
              </a>

              <a href="https://doan2-par9.onrender.com/api/auth/facebook" class="group relative w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl bg-[#1877F2] text-sm font-semibold text-white hover:bg-[#166fe5] hover:shadow-md transition-all duration-200">
                <img src="assets/images/facebook.svg" alt="Facebook" class="w-5 h-5 mr-3">
                Tiếp tục với Facebook
              </a>
            </div>
          </div>

          <div class="mt-6 text-center text-sm text-gray-500">
            <p>Tài khoản demo:</p>
            <p>Admin: admin&#64;chungmobile.com / admin123</p>
            <p>User: user&#64;example.com / user123</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    if (!this.email || !this.password) {
      this.error = 'Vui lòng nhập đầy đủ thông tin';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const user = res.data.user;
          if (user.role === 'admin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/']);
          }
        } else {
          this.error = res.message || 'Đăng nhập thất bại';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Đăng nhập thất bại';
        this.loading = false;
      }
    });
  }
}
