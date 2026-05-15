import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../../core/models';
import { PricePipe } from '../../pipes/price.pipe';
import { ProductImagePipe } from '../../pipes/product-image.pipe';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink, NgOptimizedImage, PricePipe, ProductImagePipe],
  template: `
    <a [routerLink]="['/products', product._id]" class="group h-full flex flex-col bg-white rounded-3xl overflow-hidden border border-slate-100 hover:border-primary-200 hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-500 relative">
      <!-- Badge Giảm giá -->
      <div *ngIf="getDiscount() > 0 || product.promotion" class="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <span *ngIf="product.promotion" class="bg-gradient-to-r from-orange-500 to-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg uppercase tracking-wider animate-pulse">
          Flash Sale
        </span>
        <span class="bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg shadow-red-500/30 uppercase tracking-wider w-fit">
          -{{ product.promotion ? product.promotion.discountPercentage : getDiscount() }}%
        </span>
      </div>

      <!-- Khung ảnh chuẩn hóa (Cách 1) -->
      <div class="product-image-container bg-slate-50/50 group-hover:bg-primary-50/30 transition-colors duration-500">
        <img 
          [ngSrc]="(product.thumbnail || product.images[0]) | productImage" 
          fill
          priority
          [alt]="product.name"
          class="product-image group-hover:scale-110 transition-transform duration-700 ease-out"
          (error)="onImageError($event)"
        >
        
        <!-- Countdown Timer -->
        <div *ngIf="product.promotion && product.promotion.endDate" class="absolute bottom-2 inset-x-2 bg-black/60 backdrop-blur-md rounded-xl p-2 text-center text-white z-10">
          <div class="text-[9px] uppercase tracking-tighter opacity-70 mb-0.5">Kết thúc sau</div>
          <div class="font-mono text-xs font-bold">{{ countdownText }}</div>
        </div>

        <!-- Overlay nút bấm (Chỉ hiện trên Desktop khi hover) -->
        <div class="absolute inset-x-0 bottom-4 px-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 hidden lg:block">
          <div class="bg-white/80 backdrop-blur-md rounded-2xl p-3 text-center text-sm font-bold text-primary-600 shadow-xl border border-white">
            Xem chi tiết
          </div>
        </div>
      </div>

      <!-- Nội dung sản phẩm -->
      <div class="p-5 flex flex-col flex-1">
        <div class="mb-auto">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[10px] font-bold text-primary-600 uppercase tracking-widest">{{ product.brand }}</span>
            <div class="flex items-center gap-0.5" [title]="(product.rating || 0) + ' sao'">
              @for (star of getStars(); track $index) {
                <div class="relative w-3.5 h-3.5">
                  <!-- Star Background (Gray) -->
                  <svg class="absolute inset-0 w-full h-full text-slate-200" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <!-- Star Foreground (Amber) -->
                  <div class="absolute inset-0 overflow-hidden" [style.width.%]="star * 100">
                    <svg class="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  </div>
                </div>
              }
            </div>
          </div>
          
          <h3 class="font-bold text-slate-800 text-base mb-3 line-clamp-2 leading-snug group-hover:text-primary-600 transition-colors">
            {{ product.name }}
          </h3>
          
          <div class="flex items-center gap-2 mb-4">
             <span class="text-[11px] text-slate-400">Đã bán {{ product.sold || 0 }}</span>
             <span class="w-1 h-1 bg-slate-200 rounded-full"></span>
             <span class="text-[11px] text-slate-400">{{ product.numReviews }} đánh giá</span>
          </div>
        </div>
        
        <!-- Giá & Hành động -->
        <div class="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
          <div class="flex flex-col">
            <span class="text-lg font-extrabold text-slate-900 leading-none mb-1">
              {{ product.promotion ? (product.salePrice | price) : (product.price | price) }}
            </span>
            <span *ngIf="product.promotion" class="text-xs text-slate-400 line-through">
              {{ product.price | price }}
            </span>
            <span *ngIf="!product.promotion && product.originalPrice && product.originalPrice > product.price" class="text-xs text-slate-400 line-through">
              {{ product.originalPrice | price }}
            </span>
          </div>
          <div class="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary-600 group-hover:text-white group-hover:rotate-[360deg] transition-all duration-700 shadow-sm">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
          </div>
        </div>
      </div>
    </a>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
    
    .product-image-container {
      position: relative;
      width: 100%;
      aspect-ratio: 1 / 1; /* Chuẩn hóa tỷ lệ 1:1 */
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .product-image {
      width: 100% !important;
      height: 100% !important;
      position: absolute !important;
      top: 0;
      left: 0;
      object-fit: contain; /* Đảm bảo ảnh không bị méo */
      padding: 1.5rem; /* Tạo khoảng thở cho sản phẩm */
    }
  `]
})
export class ProductCardComponent implements OnInit, OnDestroy {
  @Input({ required: true }) product!: Product;
  
  countdownText = '';
  private timer: any;

  ngOnInit() {
    if (this.product.promotion) {
      this.startTimer();
    }
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  private startTimer() {
    this.updateCountdown();
    this.timer = setInterval(() => {
      this.updateCountdown();
    }, 1000);
  }

  private stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  private updateCountdown() {
    if (!this.product.promotion?.endDate) return;
    this.countdownText = this.getCountdown(this.product.promotion.endDate as string);
  }

  getCountdown(endDate: string): string {
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();
    const diff = end - now;

    if (diff <= 0) return 'Đã kết thúc';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  getDiscount(): number {
    if (!this.product.originalPrice) return 0;
    return Math.round((1 - this.product.price / this.product.originalPrice) * 100);
  }

  getStars(): number[] {
    const rating = this.product.rating || 0;
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) stars.push(1);
      else if (rating >= i - 0.5) stars.push(0.5);
      else stars.push(0);
    }
    return stars;
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'https://via.placeholder.com/300x300?text=Phone';
  }
}
