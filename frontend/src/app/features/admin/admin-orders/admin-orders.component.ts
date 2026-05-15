import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models';

import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <h2 class="text-2xl font-bold mb-6">Quản lý đơn hàng</h2>

      <!-- Filters -->
      <div class="flex gap-4 mb-6">
        <select [(ngModel)]="statusFilter" (change)="loadOrders()" class="input w-auto">
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ xử lý</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="shipping">Đang giao</option>
          <option value="delivered">Đã giao</option>
          <option value="cancelled">Đã hủy</option>
        </select>
        <input 
          type="text" 
          [(ngModel)]="searchQuery"
          (keyup.enter)="loadOrders()"
          class="input max-w-xs" 
          placeholder="Tìm theo mã đơn, tên, SĐT..."
        >
      </div>

      <!-- Table & Pagination -->
      <div class="card overflow-hidden shadow-lg border-0 ring-1 ring-slate-100">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-50 border-b border-slate-100">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Mã đơn</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Khách hàng</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Sản phẩm</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng tiền</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Ngày đặt</th>
                <th class="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 bg-white">
              @for (order of orders; track order._id) {
                <tr class="hover:bg-slate-50 transition-colors group">
                  <td class="px-6 py-4 font-mono font-medium text-slate-600">#{{ order.orderNumber }}</td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold">
                        {{ order.shippingAddress.name.charAt(0).toUpperCase() }}
                      </div>
                      <div>
                        <p class="font-medium text-slate-800 text-sm">{{ order.shippingAddress.name }}</p>
                        <p class="text-xs text-slate-400">{{ order.shippingAddress.phone }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-sm text-slate-600">
                    <div class="flex items-center gap-1">
                      <span class="font-medium">{{ order.items.length }}</span> sản phẩm
                    </div>
                  </td>
                  <td class="px-6 py-4 font-bold text-slate-700">{{ formatPrice(order.totalAmount) }}</td>
                  <td class="px-6 py-4">
                    <div class="relative">
                      <select 
                        [value]="order.status"
                        (change)="updateStatus(order, $event)"
                        [class]="getStatusClass(order.status)"
                        class="appearance-none pl-8 pr-8 py-1.5 rounded-full text-xs font-bold border-0 cursor-pointer focus:ring-2 focus:ring-offset-1 transition-all"
                        [disabled]="order.status === 'delivered' || order.status === 'cancelled'"
                      >
                        <option value="pending">Chờ xử lý</option>
                        <option value="confirmed">Đã xác nhận</option>
                        <option value="shipping">Đang giao</option>
                        <option value="delivered">Đã giao</option>
                        <option value="cancelled">Đã hủy</option>
                      </select>
                      <span class="absolute left-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-current opacity-50 pointer-events-none"></span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-sm text-slate-500">{{ formatDate(order.createdAt) }}</td>
                  <td class="px-6 py-4 text-right">
                    <button (click)="viewOrder(order)" class="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium text-sm hover:bg-primary-50 px-2 py-1 rounded transition-colors">
                      <span>👁️</span> Chi tiết
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        
        <!-- Pagination (Simple Placeholder) -->
        <div class="px-6 py-4 bg-slate-50 border-t border-slate-200 text-sm text-slate-500">
          Hiển thị <span class="font-bold text-slate-900">{{ orders.length }}</span> đơn hàng mới nhất
        </div>
      </div>

      <!-- Detail Modal -->
      @if (selectedOrder) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" (click)="selectedOrder = null">
          <div class="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-bold">Đơn hàng {{ selectedOrder.orderNumber }}</h3>
              <div class="flex gap-2">
                <button (click)="printInvoice()" class="btn btn-secondary text-sm">🖨️ In hóa đơn</button>
                <button (click)="selectedOrder = null" class="text-gray-400 hover:text-gray-600 text-xl">✕</button>
              </div>
            </div>

            <!-- Print Styles -->
            <style>
              @media print {
                body * {
                  visibility: hidden;
                }
                .fixed, .fixed * {
                  visibility: visible;
                }
                .fixed {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 100%;
                  height: 100%;
                  background: white;
                  padding: 20px;
                }
                button {
                  display: none;
                }
              }
            </style>

            <div class="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h4 class="font-medium mb-2">Thông tin giao hàng</h4>
                <p>{{ selectedOrder.shippingAddress.name }}</p>
                <p class="text-gray-600">{{ selectedOrder.shippingAddress.phone }}</p>
                <p class="text-gray-600">
                  {{ selectedOrder.shippingAddress.street }}, 
                  {{ selectedOrder.shippingAddress.district }}, 
                  {{ selectedOrder.shippingAddress.city }}
                </p>
              </div>
              <div>
                <h4 class="font-medium mb-2">Thông tin đơn hàng</h4>
                <p>Ngày đặt: {{ formatDate(selectedOrder.createdAt) }}</p>
                <p>Thanh toán: {{ getPaymentMethod(selectedOrder.paymentMethod) }}</p>
                
                <!-- Payment Proof & Status -->
                @if (selectedOrder.paymentMethod === 'banking') {
                  <div class="mt-3 p-3 bg-slate-50 border rounded-lg">
                    <p class="font-bold text-sm mb-2 text-slate-700">Thông tin chuyển khoản:</p>
                    
                    <div class="flex items-center gap-2 mb-2">
                       <span class="text-sm">Trạng thái tiền:</span>
                       <span class="text-xs font-bold px-2 py-1 rounded-full" 
                         [class]="selectedOrder.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'">
                         {{ selectedOrder.paymentStatus === 'paid' ? 'ĐÃ NHẬN ĐƯỢC' : 'CHỜ XÁC NHẬN' }}
                       </span>
                    </div>

                    @if (selectedOrder.paymentProof) {
                      <div class="mb-2">
                        <a [href]="getImageUrl(selectedOrder.paymentProof)" target="_blank" class="block relative group overflow-hidden rounded border border-slate-200">
                          <img [src]="getImageUrl(selectedOrder.paymentProof)" class="w-full h-auto max-h-48 object-contain bg-white">
                          <div class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs">
                            Bấm để xem ảnh lớn
                          </div>
                        </a>
                      </div>
                    } @else {
                       <p class="text-xs text-red-500 italic mb-2">Khách chưa upload ảnh bill</p>
                    }
                    
                    @if (selectedOrder.paymentStatus === 'pending') {
                       <button (click)="confirmPayment(selectedOrder)" class="btn btn-primary w-full text-sm py-1.5 flex items-center justify-center gap-2">
                         <span>✅</span> Xác nhận đã nhận tiền
                       </button>
                    }
                  </div>
                }

                @if (selectedOrder.note) {
                  <p class="text-gray-600 mt-2">Ghi chú: {{ selectedOrder.note }}</p>
                }


              </div>
            </div>

            <h4 class="font-medium mb-2">Sản phẩm</h4>
            <div class="space-y-3 mb-4">
              @for (item of selectedOrder.items; track item.product) {
                <div class="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <img [src]="getImageUrl(item.product?.thumbnail || item.thumbnail)" class="w-12 h-12 object-contain bg-white rounded">
                  <div class="flex-1">
                    <p class="font-medium">{{ item.product?.name || item.name || 'Sản phẩm không xác định' }}</p>
                    <p class="text-sm text-gray-500">x{{ item.quantity }}</p>
                  </div>
                  <p class="font-medium">{{ formatPrice(item.price * item.quantity) }}</p>
                </div>
              }
            </div>

            <div class="border-t pt-4">
              <div class="flex justify-between mb-2">
                <span>Tạm tính</span>
                <span>{{ formatPrice(selectedOrder.totalAmount - selectedOrder.shippingFee) }}</span>
              </div>
              <div class="flex justify-between mb-2">
                <span>Phí vận chuyển</span>
                <span>{{ formatPrice(selectedOrder.shippingFee) }}</span>
              </div>
              <div class="flex justify-between font-bold text-lg">
                <span>Tổng cộng</span>
                <span class="text-primary-600">{{ formatPrice(selectedOrder.totalAmount) }}</span>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class AdminOrdersComponent implements OnInit {
  orders: Order[] = [];
  statusFilter = '';
  searchQuery = '';
  selectedOrder: Order | null = null;
  
  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.orderService.getAllOrders(1, 100, this.statusFilter || undefined, this.searchQuery || undefined).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.orders = res.data.orders;
        }
      }
    });
  }

  updateStatus(order: Order, event: Event) {
    const status = (event.target as HTMLSelectElement).value;
    this.orderService.updateOrderStatus(order._id, status).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.updateOrderInList(res.data);
        }
      }
    });
  }

  confirmPayment(order: Order) {
    if (!confirm('Xác nhận đã nhận được tiền chuyển khoản?')) return;
    
    // Update paymentStatus = paid AND status = confirmed
    this.orderService.updateOrderStatus(order._id, 'confirmed', 'paid').subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.selectedOrder = res.data;
          this.updateOrderInList(res.data);
          alert('Đã xác nhận thanh toán!');
        }
      },
      error: () => alert('Lỗi xác nhận thanh toán')
    });
  }

  updateOrderInList(updatedOrder: Order) {
    const index = this.orders.findIndex(o => o._id === updatedOrder._id);
    if (index > -1) {
      this.orders[index] = updatedOrder;
    }
  }

  viewOrder(order: Order) {
    this.selectedOrder = order;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700', confirmed: 'bg-blue-100 text-blue-700',
      shipping: 'bg-purple-100 text-purple-700', delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700'
    };
    return map[status] || 'bg-gray-100 text-gray-700';
  }

  getPaymentMethod(method: string): string {
    const map: Record<string, string> = { cod: 'COD', banking: 'Chuyển khoản', momo: 'MoMo', vnpay: 'VNPay' };
    return map[method] || method;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('vi-VN');
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  }

  getImageUrl(path?: string): string {
    if (!path) return 'https://via.placeholder.com/50';
    if (path.startsWith('http')) return path;
    
    // Remove /api from apiUrl to get base URL (http://localhost:5001)
    const baseUrl = environment.apiUrl.replace('/api', '');
    return baseUrl + path;
  }

  isVideo(path: string): boolean {
    if (!path) return false;
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
    return videoExtensions.some(ext => path.toLowerCase().endsWith(ext));
  }

  printInvoice() {
    window.print();
  }
}
