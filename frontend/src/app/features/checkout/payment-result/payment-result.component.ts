import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models';

@Component({
  selector: 'app-payment-result',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-2xl mx-auto px-4 py-16 text-center">
      @if (loading) {
        <div class="flex flex-col items-center">
          <div class="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p class="text-gray-600 font-medium">Đang xác thực thanh toán...</p>
        </div>
      } @else {
        <div class="card p-8 shadow-xl animate-in zoom-in duration-500">
          @if (success) {
            <div class="text-green-500 text-6xl mb-4">✓</div>
            <h1 class="text-2xl font-bold text-gray-900 mb-2">Thanh toán thành công!</h1>
            <p class="text-gray-600 mb-8">
              Cảm ơn bạn đã tin tưởng Chung Mobile. Đơn hàng của bạn đang được xử lý.
            </p>
            <div class="flex justify-center gap-4">
              <a [routerLink]="['/orders', order?._id]" class="btn btn-primary px-8">Xem đơn hàng</a>
              <a routerLink="/" class="btn btn-secondary px-8">Trang chủ</a>
            </div>
          } @else {
            <div class="text-red-500 text-6xl mb-4">✕</div>
            <h1 class="text-2xl font-bold text-gray-900 mb-2">Thanh toán thất bại</h1>
            <p class="text-gray-600 mb-8">
              {{ errorMessage || 'Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại hoặc chọn phương thức khác.' }}
            </p>
            <div class="flex justify-center gap-4">
              <a routerLink="/cart" class="btn btn-primary px-8">Quay lại giỏ hàng</a>
              <a routerLink="/chat" class="btn btn-secondary px-8">Hỗ trợ ngay</a>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class PaymentResultComponent implements OnInit {
  loading = true;
  success = false;
  errorMessage = '';
  order: Order | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (Object.keys(params).length === 0) {
        this.router.navigate(['/']);
        return;
      }

      this.orderService.verifyVnPayPayment(params).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.success = true;
            this.order = res.data;
          } else {
            this.success = false;
            this.errorMessage = res.message || 'Thanh toán không hợp lệ';
          }
          this.loading = false;
        },

        error: (err) => {
          this.success = false;
          this.errorMessage = err.error?.message || 'Lỗi xác thực thanh toán';
          this.loading = false;
        }
      });
    });
  }
}
