import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { User } from '../../../core/models';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <h2 class="text-2xl font-bold mb-6">Quản lý người dùng</h2>

      <!-- Search & Actions -->
      <div class="flex items-center justify-between mb-6">
        <input 
          type="text" 
          [(ngModel)]="searchQuery"
          (keyup.enter)="loadUsers()"
          class="input max-w-md" 
          placeholder="Tìm kiếm theo tên, email, SĐT..."
        >
        <button (click)="openCreateModal()" class="btn btn-primary flex items-center gap-2">
          <span>+</span> Thêm quản trị viên
        </button>
      </div>

      <!-- Create Modal -->
      @if (showCreateModal) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" (click)="showCreateModal = false">
          <div class="bg-white rounded-xl p-6 w-full max-w-md" (click)="$event.stopPropagation()">
            <h3 class="text-xl font-bold mb-4">Thêm thành viên mới</h3>
            <form (ngSubmit)="createUser()">
              <div class="mb-4">
                <label class="block text-sm font-medium mb-1">Tên hiển thị</label>
                <input type="text" [(ngModel)]="newUser.name" name="name" class="input" required>
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium mb-1">Email</label>
                <input type="email" [(ngModel)]="newUser.email" name="email" class="input" required>
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium mb-1">Mật khẩu</label>
                <input type="password" [(ngModel)]="newUser.password" name="password" class="input" required>
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium mb-1">Vai trò</label>
                <select [(ngModel)]="newUser.role" name="role" class="input">
                  <option value="user">Người dùng</option>
                  <option value="admin">Quản trị viên (Admin)</option>
                </select>
              </div>
              <div class="flex justify-end gap-3 mt-6">
                <button type="button" (click)="showCreateModal = false" class="btn btn-secondary">Hủy</button>
                <button type="submit" class="btn btn-primary">Tạo tài khoản</button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Table & Pagination -->
      <div class="card overflow-hidden shadow-lg border-0 ring-1 ring-slate-100">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-50 border-b border-slate-100">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Người dùng</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">SĐT</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Vai trò</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Ngày tạo</th>
                <th class="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 bg-white">
              @for (user of users; track user._id) {
                <tr class="hover:bg-slate-50 transition-colors group">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-4">
                      <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-indigo-500 flex items-center justify-center text-white shadow-md">
                        <span class="font-bold">{{ user.name.charAt(0).toUpperCase() }}</span>
                      </div>
                      <div>
                        <div class="font-bold text-slate-800">{{ user.name }}</div>
                        <div class="text-xs text-slate-400 mt-0.5">ID: {{ user._id | slice:0:8 }}...</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-sm text-slate-600">{{ user.email }}</td>
                  <td class="px-6 py-4 text-sm text-slate-600">{{ user.phone || '-' }}</td>
                  <td class="px-6 py-4">
                    <span [ngClass]="{
                      'bg-purple-50 text-purple-700 border-purple-200': user.role === 'admin',
                      'bg-slate-100 text-slate-700 border-slate-200': user.role === 'user'
                    }" class="px-2.5 py-1 rounded-full text-xs font-medium border">
                      {{ user.role === 'admin' ? 'Admin' : 'User' }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <span [class]="user.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'" class="px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 w-fit">
                      <span class="w-1.5 h-1.5 rounded-full" [class]="user.isActive ? 'bg-green-500' : 'bg-red-500'"></span>
                      {{ user.isActive ? 'Hoạt động' : 'Bị khóa' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-slate-500">{{ formatDate(user.createdAt) }}</td>
                  <td class="px-6 py-4 text-right">
                    <button (click)="toggleStatus(user)" [class]="user.isActive ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'" class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border border-transparent hover:border-current">
                      {{ user.isActive ? 'Khóa tài khoản' : 'Mở khóa' }}
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        
        <!-- Pagination (Simple Placeholder) -->
        <div class="px-6 py-4 bg-slate-50 border-t border-slate-200 text-sm text-slate-500">
          Hiển thị <span class="font-bold text-slate-900">{{ users.length }}</span> người dùng
        </div>
      </div>
    </div>
  `
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  searchQuery = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    const params: any = { page: 1, limit: 100 };
    if (this.searchQuery) params.search = this.searchQuery;
    
    this.http.get<any>(`${environment.apiUrl}/users`, { params }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.users = res.data.users;
        }
      }
    });
  }

  toggleStatus(user: User) {
    if (user.role === 'admin') {
      alert('Không thể khóa tài khoản Quản trị viên!');
      return;
    }

    const action = user.isActive ? 'khóa' : 'mở khóa';
    if (!confirm(`Bạn có chắc chắn muốn ${action} tài khoản ${user.email}?`)) {
      return;
    }

    this.http.put<any>(`${environment.apiUrl}/users/${user._id}/toggle-status`, {}).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const index = this.users.findIndex(u => u._id === user._id);
          if (index > -1) {
            this.users[index] = res.data;
          }
        }
      }
    });
  }

  // Create User Feature
  showCreateModal = false;
  newUser = { name: '', email: '', password: '', role: 'admin', phone: '' };

  openCreateModal() {
    this.newUser = { name: '', email: '', password: '', role: 'admin', phone: '' };
    this.showCreateModal = true;
  }

  createUser() {
    this.http.post<any>(`${environment.apiUrl}/users`, this.newUser).subscribe({
      next: (res) => {
        if (res.success) {
          alert('Tạo tài khoản thành công!');
          this.showCreateModal = false;
          this.loadUsers();
        }
      }
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('vi-VN');
  }
}
