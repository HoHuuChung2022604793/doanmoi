import { Component, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { Cart, CartItem } from '../../core/models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, NgOptimizedImage],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-8">
      <h1 class="text-2xl font-bold mb-6">Giỏ hàng</h1>

      @if (loading) {
        <div class="space-y-4">
          @for (i of [1,2,3]; track i) {
            <div class="card p-4 animate-pulse flex gap-4">
              <div class="w-24 h-24 bg-gray-200 rounded"></div>
              <div class="flex-1 space-y-2">
                <div class="bg-gray-200 h-4 rounded w-3/4"></div>
                <div class="bg-gray-200 h-4 rounded w-1/2"></div>
              </div>
            </div>
          }
        </div>
      } @else if (!cart || cart.items.length === 0) {
        <div class="text-center py-12 card">
          <div class="text-6xl mb-4">🛒</div>
          <p class="text-gray-600 mb-4">Giỏ hàng của bạn đang trống</p>
          <a routerLink="/products" class="btn btn-primary">Tiếp tục mua sắm</a>
        </div>
      } @else {
        <div class="space-y-4">
          @for (item of cart.items; track item.product._id) {
            <div class="card p-4 flex gap-4">
              <a [routerLink]="['/products', item.product._id]" class="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                <img 
                  [ngSrc]="getImageUrl(item.product.thumbnail || item.product.images[0])" 
                  fill
                  [alt]="item.product.name"
                  class="object-contain p-2"
                  (error)="onImageError($event)"
                >
              </a>
              <div class="flex-1">
                <a [routerLink]="['/products', item.product._id]" class="font-medium hover:text-primary-600">
                  {{ item.product.name }}
                </a>
                @if (item.color) {
                  <p class="text-sm text-gray-500">Màu: {{ item.color }}</p>
                }
                <p class="text-primary-600 font-semibold mt-1">{{ formatPrice(item.product.price) }}</p>
              </div>
              <div class="flex flex-col items-end justify-between">
                <button 
                  (click)="removeItem(item.product._id)"
                  class="text-gray-400 hover:text-red-500"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
                <div class="flex items-center gap-2">
                  <button 
                    (click)="updateQuantity(item, -1)"
                    [disabled]="item.quantity <= 1"
                    class="w-8 h-8 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                  >
                    -
                  </button>
                  <span class="w-8 text-center">{{ item.quantity }}</span>
                  <button 
                    (click)="updateQuantity(item, 1)"
                    [disabled]="item.quantity >= item.product.stock"
                    class="w-8 h-8 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Summary -->
        <div class="card p-6 mt-6">
          <div class="flex justify-between items-center mb-4">
            <span class="text-gray-600">Tạm tính ({{ cart.items.length }} sản phẩm)</span>
            <span class="text-xl font-bold">{{ formatPrice(cart.total) }}</span>
          </div>
          <div class="flex gap-4">
            <button (click)="clearCart()" class="btn btn-secondary flex-1">Xóa tất cả</button>
            <a routerLink="/checkout" class="btn btn-primary flex-1 text-center">Tiến hành đặt hàng</a>
          </div>
        </div>
      }
    </div>
  `
})
export class CartComponent implements OnInit {
  cart: Cart | null = null;
  loading = true;

  constructor(private cartService: CartService) {}

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    this.cartService.getCart().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.cart = res.data;
        }
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  updateQuantity(item: CartItem, delta: number) {
    const newQuantity = item.quantity + delta;
    this.cartService.updateQuantity(item.product._id, newQuantity, item.color).subscribe();
  }

  removeItem(productId: string) {
    this.cartService.removeFromCart(productId).subscribe();
  }

  clearCart() {
    if (confirm('Bạn có chắc muốn xóa toàn bộ giỏ hàng?')) {
      this.cartService.clearCart().subscribe(() => {
        this.cart = null;
      });
    }
  }

  getImageUrl(path: string): string {
    if (!path) return 'https://via.placeholder.com/100x100?text=Phone';
    if (path.startsWith('http')) return path;
    
    // Normalize path (handle Windows backslash)
    const normalizedPath = path.replace(/\\/g, '/');
    const baseUrl = environment.apiUrl.replace('/api', '');
    
    // Ensure slash separation
    return normalizedPath.startsWith('/') 
      ? `${baseUrl}${normalizedPath}`
      : `${baseUrl}/${normalizedPath}`;
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'https://via.placeholder.com/100x100?text=Phone';
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  }
}
