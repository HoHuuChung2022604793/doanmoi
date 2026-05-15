import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CouponService, Coupon } from '../../../core/services/coupon.service';

@Component({
  selector: 'app-admin-coupons',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-slate-800">Quản lý Mã giảm giá</h2>
          <p class="text-sm text-slate-500">Tạo mã Voucher cho người dùng nhập khi thanh toán</p>
        </div>
        <button (click)="openModal()" class="btn btn-primary flex items-center gap-2">
          <span>🎫</span> Tạo mã mới
        </button>
      </div>

      <!-- Coupons List -->
      <div class="card overflow-hidden shadow-lg border-0 ring-1 ring-slate-100 font-sans">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-50 border-b border-slate-100">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Mã Code</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Loại giảm</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Giá trị</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Hạn dùng</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Lượt dùng</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                <th class="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 bg-white">
              @for (coupon of coupons; track coupon._id) {
                <tr class="hover:bg-slate-50 transition-colors group">
                  <td class="px-6 py-4">
                    <span class="font-mono font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded border border-primary-100">{{ coupon.code }}</span>
                  </td>
                  <td class="px-6 py-4">
                    <span class="text-sm font-medium text-slate-600">
                      {{ coupon.discountType === 'percentage' ? 'Phần trăm (%)' : 'Cố định (VNĐ)' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 font-bold text-slate-800">
                    {{ coupon.discountType === 'percentage' ? coupon.discountValue + '%' : formatPrice(coupon.discountValue) }}
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-xs text-slate-600">
                       {{ coupon.endDate | date:'dd/MM/yyyy' }}
                    </div>
                  </td>
                  <td class="px-6 py-4 text-sm">
                    {{ coupon.usedCount }} / {{ coupon.usageLimit > 0 ? coupon.usageLimit : '∞' }}
                  </td>
                  <td class="px-6 py-4">
                    <span [class]="coupon.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'" class="px-3 py-1 rounded-full text-[10px] font-bold border">
                      {{ coupon.isActive ? 'ĐANG CHẠY' : 'DỪNG' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button (click)="editCoupon(coupon)" class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors">✏️</button>
                      <button (click)="deleteCoupon(coupon)" class="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors">🗑️</button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Coupon Modal -->
      @if (showModal) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" (click)="closeModal()">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col animate-in fade-in zoom-in duration-300" (click)="$event.stopPropagation()">
            <div class="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 class="text-xl font-bold">{{ editingCoupon ? 'Sửa mã giảm giá' : 'Tạo mã mới' }}</h3>
              <button (click)="closeModal()" class="text-2xl text-slate-400">×</button>
            </div>
            <div class="p-6 space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-bold mb-1">Mã Code (Ví dụ: SALE10) *</label>
                  <input type="text" [(ngModel)]="form.code" class="input uppercase" placeholder="NHẬP MÃ">
                </div>
                <div>
                  <label class="block text-sm font-bold mb-1">Loại giảm giá</label>
                  <select [(ngModel)]="form.discountType" class="input">
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed">Số tiền cố định (VNĐ)</option>
                  </select>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-bold mb-1">Giá trị giảm *</label>
                  <input type="number" [(ngModel)]="form.discountValue" class="input">
                </div>
                <div>
                  <label class="block text-sm font-bold mb-1">Đơn tối thiểu áp dụng</label>
                  <input type="number" [(ngModel)]="form.minOrderAmount" class="input">
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-bold mb-1">Ngày bắt đầu</label>
                  <input type="date" [(ngModel)]="form.startDate" class="input">
                </div>
                <div>
                  <label class="block text-sm font-bold mb-1">Ngày hết hạn</label>
                  <input type="date" [(ngModel)]="form.endDate" class="input">
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-bold mb-1">Giới hạn số lần dùng (0 = ko giới hạn)</label>
                  <input type="number" [(ngModel)]="form.usageLimit" class="input">
                </div>
                <div class="flex items-end pb-3">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" [(ngModel)]="form.isActive" class="w-5 h-5">
                    <span class="font-bold text-sm">Đang kích hoạt</span>
                  </label>
                </div>
              </div>
            </div>
            <div class="p-6 border-t border-slate-100 flex justify-end gap-3">
              <button (click)="closeModal()" class="px-6 py-2 rounded-xl bg-slate-100 font-bold">Hủy</button>
              <button (click)="saveCoupon()" class="btn btn-primary px-8" [disabled]="saving">
                {{ saving ? 'Đang lưu...' : 'Lưu mã giảm giá' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class AdminCouponsComponent implements OnInit {
  coupons: Coupon[] = [];
  showModal = false;
  editingCoupon: Coupon | null = null;
  saving = false;

  form: any = {
    code: '',
    discountType: 'percentage',
    discountValue: 0,
    minOrderAmount: 0,
    startDate: '',
    endDate: '',
    usageLimit: 0,
    isActive: true
  };

  constructor(private couponService: CouponService) {}

  ngOnInit() {
    this.loadCoupons();
  }

  loadCoupons() {
    this.couponService.getCoupons().subscribe(res => {
      this.coupons = res.data;
    });
  }

  openModal() {
    this.editingCoupon = null;
    this.resetForm();
    this.showModal = true;
  }

  resetForm() {
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    this.form = {
      code: '',
      discountType: 'percentage',
      discountValue: 0,
      minOrderAmount: 0,
      startDate: today,
      endDate: nextMonth.toISOString().split('T')[0],
      usageLimit: 0,
      isActive: true
    };
  }

  editCoupon(coupon: Coupon) {
    this.editingCoupon = coupon;
    this.form = {
      ...coupon,
      startDate: new Date(coupon.startDate).toISOString().split('T')[0],
      endDate: new Date(coupon.endDate).toISOString().split('T')[0]
    };
    this.showModal = true;
  }

  saveCoupon() {
    if (!this.form.code || !this.form.discountValue) return;
    this.saving = true;

    const request = this.editingCoupon 
      ? this.couponService.updateCoupon(this.editingCoupon._id!, this.form)
      : this.couponService.createCoupon(this.form);

    request.subscribe({
      next: () => {
        this.loadCoupons();
        this.closeModal();
      },
      complete: () => this.saving = false
    });
  }

  deleteCoupon(coupon: Coupon) {
    if (!confirm('Xóa mã này?')) return;
    this.couponService.deleteCoupon(coupon._id!).subscribe(() => this.loadCoupons());
  }

  closeModal() {
    this.showModal = false;
    this.editingCoupon = null;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  }
}
