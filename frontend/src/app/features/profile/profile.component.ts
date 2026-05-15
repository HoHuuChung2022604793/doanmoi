import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-2xl mx-auto px-4 py-8">
      <h1 class="text-2xl font-bold mb-6">Tài khoản của tôi</h1>

      <!-- Tabs -->
      <div class="flex gap-2 mb-6">
        <button (click)="activeTab = 'profile'" [class]="activeTab === 'profile' ? 'btn-primary' : 'btn-secondary'" class="btn">
          Thông tin cá nhân
        </button>
        <button (click)="activeTab = 'password'" [class]="activeTab === 'password' ? 'btn-primary' : 'btn-secondary'" class="btn">
          Đổi mật khẩu
        </button>
      </div>

      @if (activeTab === 'profile') {
        <div class="card p-6">
          @if (message) {
            <div [class]="messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'" class="p-3 rounded-lg mb-4">
              {{ message }}
            </div>
          }

          <form (ngSubmit)="updateProfile()">
            <div class="mb-6 flex flex-col items-center">
              <div class="w-32 h-32 rounded-full overflow-hidden bg-gray-200 mb-4 relative group cursor-pointer border-4 border-white shadow-lg">
                <img [src]="getImageUrl(user?.avatar)" alt="Avatar" class="w-full h-full object-cover">
                <div class="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white transition-opacity duration-200">
                  <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                </div>
                <input type="file" class="absolute inset-0 opacity-0 cursor-pointer" (change)="onFileSelected($event)" accept="image/*">
              </div>
              <p class="text-sm text-gray-500">Nhấn vào hình để đổi ảnh đại diện</p>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" [value]="user?.email" class="input bg-gray-100" disabled>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
              <input type="text" [(ngModel)]="profileForm.name" name="name" class="input" required>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
              <input type="tel" [(ngModel)]="profileForm.phone" name="phone" class="input">
            </div>

            <div class="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tỉnh/Thành phố</label>
                <input type="text" [(ngModel)]="profileForm.address.city" name="city" class="input">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện</label>
                <input type="text" [(ngModel)]="profileForm.address.district" name="district" class="input">
              </div>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Địa chỉ chi tiết</label>
              <input type="text" [(ngModel)]="profileForm.address.street" name="street" class="input" placeholder="Số nhà, tên đường">
            </div>

            <button type="submit" class="btn btn-primary w-full" [disabled]="loading">
              {{ loading ? 'Đang lưu...' : 'Cập nhật thông tin' }}
            </button>
          </form>
        </div>
      }

      @if (activeTab === 'password') {
        <div class="card p-6">
          @if (passwordMessage) {
            <div [class]="passwordMessageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'" class="p-3 rounded-lg mb-4">
              {{ passwordMessage }}
            </div>
          }

          <form (ngSubmit)="changePassword()">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
              <input type="password" [(ngModel)]="passwordForm.currentPassword" name="currentPassword" class="input" required>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
              <input type="password" [(ngModel)]="passwordForm.newPassword" name="newPassword" class="input" required>
            </div>

            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
              <input type="password" [(ngModel)]="passwordForm.confirmPassword" name="confirmPassword" class="input" required>
            </div>

            <button type="submit" class="btn btn-primary w-full" [disabled]="passwordLoading">
              {{ passwordLoading ? 'Đang đổi...' : 'Đổi mật khẩu' }}
            </button>
          </form>
        </div>
      }
    </div>
  `
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  activeTab = 'profile';
  loading = false;
  message = '';
  messageType: 'success' | 'error' = 'success';

  profileForm = {
    name: '',
    phone: '',
    address: { street: '', city: '', district: '', ward: '' }
  };

  passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
  passwordLoading = false;
  passwordMessage = '';
  passwordMessageType: 'success' | 'error' = 'success';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      if (this.user) {
        this.profileForm.name = this.user.name;
        this.profileForm.phone = this.user.phone || '';
        if (this.user.address) {
          this.profileForm.address = { ...this.profileForm.address, ...this.user.address };
        }
      }
    });
  }

  getImageUrl(path: string | undefined): string {
    if (!path) return 'https://ui-avatars.com/api/?name=' + (this.user?.name || 'User') + '&background=random';
    if (path.startsWith('http')) return path;
    return environment.apiUrl.replace('/api', '') + path;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.loading = true;
      this.authService.updateAvatar(file).subscribe({
        next: (res) => {
          if (res.success) {
            this.message = 'Cập nhật ảnh đại diện thành công!';
            this.messageType = 'success';
          }
          this.loading = false;
        },
        error: (err) => {
          this.message = err.error?.message || 'Lỗi cập nhật ảnh';
          this.messageType = 'error';
          this.loading = false;
        }
      });
    }
  }

  updateProfile() {
    this.loading = true;
    this.message = '';

    this.authService.updateProfile({
      name: this.profileForm.name,
      phone: this.profileForm.phone,
      address: this.profileForm.address
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.message = 'Cập nhật thành công!';
          this.messageType = 'success';
        } else {
          this.message = res.message || 'Có lỗi xảy ra';
          this.messageType = 'error';
        }
        this.loading = false;
      },
      error: (err) => {
        this.message = err.error?.message || 'Có lỗi xảy ra';
        this.messageType = 'error';
        this.loading = false;
      }
    });
  }

  changePassword() {
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.passwordMessage = 'Mật khẩu xác nhận không khớp';
      this.passwordMessageType = 'error';
      return;
    }

    this.passwordLoading = true;
    this.passwordMessage = '';

    this.authService.changePassword(this.passwordForm.currentPassword, this.passwordForm.newPassword).subscribe({
      next: (res) => {
        if (res.success) {
          this.passwordMessage = 'Đổi mật khẩu thành công!';
          this.passwordMessageType = 'success';
          this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
        } else {
          this.passwordMessage = res.message || 'Có lỗi xảy ra';
          this.passwordMessageType = 'error';
        }
        this.passwordLoading = false;
      },
      error: (err) => {
        this.passwordMessage = err.error?.message || 'Có lỗi xảy ra';
        this.passwordMessageType = 'error';
        this.passwordLoading = false;
      }
    });
  }
}
