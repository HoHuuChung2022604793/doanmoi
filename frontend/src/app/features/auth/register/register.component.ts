import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
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
          <h2 class="mt-6 text-3xl font-bold text-gray-900">Đăng ký</h2>
          <p class="mt-2 text-gray-600">
            Đã có tài khoản? 
            <a routerLink="/auth/login" class="text-primary-600 hover:underline">Đăng nhập</a>
          </p>
        </div>

        <div class="card p-8">
          @if (error) {
            <div class="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{{ error }}</div>
          }

          <form (ngSubmit)="onSubmit()">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
              <input 
                type="text" 
                [(ngModel)]="name" 
                name="name"
                class="input" 
                placeholder="Nguyễn Văn A"
                required
              >
            </div>

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

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
              <input 
                type="tel" 
                [(ngModel)]="phone" 
                name="phone"
                class="input" 
                placeholder="0912345678"
              >
            </div>

            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
              <input 
                type="password" 
                [(ngModel)]="password" 
                name="password"
                class="input" 
                placeholder="Tối thiểu 6 ký tự"
                required
              >
            </div>

            <button 
              type="submit" 
              class="btn btn-primary w-full py-3"
              [disabled]="loading"
            >
              {{ loading ? 'Đang đăng ký...' : 'Đăng ký' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  name = '';
  email = '';
  phone = '';
  password = '';
  loading = false;
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    if (!this.name || !this.email || !this.password) {
      this.error = 'Vui lòng nhập đầy đủ thông tin bắt buộc';
      return;
    }

    if (this.password.length < 6) {
      this.error = 'Mật khẩu phải có ít nhất 6 ký tự';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.register({
      name: this.name,
      email: this.email,
      password: this.password,
      phone: this.phone
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.router.navigate(['/']);
        } else {
          this.error = res.message || 'Đăng ký thất bại';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Đăng ký thất bại';
        this.loading = false;
      }
    });
  }
}
