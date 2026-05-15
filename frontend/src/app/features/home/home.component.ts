import { Component, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, NgOptimizedImage, ProductCardComponent],
  template: `
    <!-- Hero Banner Slider -->
    <section class="py-6 lg:py-10 bg-gradient-to-b from-slate-100 to-white">
      <div class="mx-auto px-4 group" style="max-width: 60%;">
        <div class="relative rounded-2xl overflow-hidden shadow-2xl shadow-slate-300/50" style="aspect-ratio: 16/7;">
          <!-- Slides -->
          @for (slide of slides; track $index) {
            <div 
              class="absolute inset-0 transition-opacity duration-700 ease-in-out"
              [style.opacity]="currentSlide === $index ? '1' : '0'"
              [style.z-index]="currentSlide === $index ? '10' : '0'"
            >
              <img 
                [src]="slide.image" 
                [alt]="slide.alt"
                class="w-full h-full object-cover"
              >
            </div>
          }

          <!-- Gradient overlay -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none z-[11]"></div>

          <!-- Indicators -->
          @if (slides.length > 1) {
            <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
              @for (slide of slides; track $index) {
                <button 
                  (click)="setSlide($index)"
                  class="h-2 rounded-full transition-all duration-300 hover:bg-white/80"
                  [ngClass]="currentSlide === $index ? 'w-8 bg-white shadow-lg' : 'w-3 bg-white/50'">
                </button>
              }
            </div>
            
            <!-- Arrows -->
            <button (click)="prevSlide()" class="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/20 hover:bg-white/50 text-white backdrop-blur-md transition-all duration-300 z-20 opacity-0 group-hover:opacity-100">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <button (click)="nextSlide()" class="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/20 hover:bg-white/50 text-white backdrop-blur-md transition-all duration-300 z-20 opacity-0 group-hover:opacity-100">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg>
            </button>
          }
        </div>
      </div>
    </section>

    <!-- Brands -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4">
        <p class="text-center text-slate-500 font-medium mb-8">Đối tác chính thức của các thương hiệu hàng đầu</p>
        <div class="flex flex-wrap justify-center items-center gap-4 lg:gap-8">
          @for (brand of brands; track brand) {
            <a 
              [routerLink]="['/products']" 
              [queryParams]="{brand: brand}"
              class="group relative px-8 py-4 bg-slate-50 rounded-2xl hover:bg-white hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300 border border-slate-100 hover:border-primary-100 min-w-[120px] text-center"
            >
              <span class="text-lg font-bold text-slate-600 group-hover:text-primary-600 transition-colors">{{ brand }}</span>
            </a>
          }
        </div>
      </div>
    </section>

    <!-- Featured Products -->
    <section class="py-24 bg-slate-50">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 class="text-4xl font-bold text-slate-900 mb-4">Sản phẩm nổi bật</h2>
            <div class="h-1 w-20 bg-primary-500 rounded-full"></div>
          </div>
          <a routerLink="/products" class="group flex items-center font-semibold text-primary-600 hover:text-primary-700">
            Xem tất cả 
            <span class="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
          </a>
        </div>

        @if (loading) {
          <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
            @for (i of [1,2,3,4]; track i) {
              <div class="card p-4 animate-pulse h-[400px]">
                <div class="bg-gray-200 h-48 rounded-2xl mb-4"></div>
                <div class="space-y-3">
                  <div class="bg-gray-200 h-4 rounded w-3/4"></div>
                  <div class="bg-gray-200 h-4 rounded w-1/2"></div>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            @for (product of featuredProducts; track product._id) {
              <app-product-card [product]="product"></app-product-card>
            }
          </div>
        }
      </div>
    </section>

    <!-- Features -->
    <section class="py-24 bg-white relative overflow-hidden">
      <!-- Decorative circles -->
      <div class="absolute top-0 left-0 w-64 h-64 bg-slate-50 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      <div class="absolute bottom-0 right-0 w-96 h-96 bg-primary-50/50 rounded-full translate-x-1/3 translate-y-1/3"></div>

      <div class="max-w-7xl mx-auto px-4 relative z-10">
        <div class="grid md:grid-cols-4 gap-8 lg:gap-12">
          <div class="text-center group p-6 rounded-2xl hover:bg-slate-50 transition-colors duration-300">
            <div class="w-20 h-20 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6 transform group-hover:rotate-6 transition-transform duration-300 text-4xl">
              🚚
            </div>
            <h3 class="font-bold text-xl mb-3 text-slate-900">Giao hàng siêu tốc</h3>
            <p class="text-slate-500 leading-relaxed">Nhận hàng trong 2h nội thành Hà Nội & TP.HCM</p>
          </div>
          <div class="text-center group p-6 rounded-2xl hover:bg-slate-50 transition-colors duration-300">
            <div class="w-20 h-20 bg-accent-100 rounded-2xl flex items-center justify-center mx-auto mb-6 transform group-hover:-rotate-6 transition-transform duration-300 text-4xl">
              ✅
            </div>
            <h3 class="font-bold text-xl mb-3 text-slate-900">Cam kết chính hãng</h3>
            <p class="text-slate-500 leading-relaxed">Phát hiện hàng giả đền bù gấp 10 lần giá trị</p>
          </div>
          <div class="text-center group p-6 rounded-2xl hover:bg-slate-50 transition-colors duration-300">
             <div class="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6 transform group-hover:rotate-6 transition-transform duration-300 text-4xl">
              🔄
            </div>
            <h3 class="font-bold text-xl mb-3 text-slate-900">30 ngày đổi trả</h3>
            <p class="text-slate-500 leading-relaxed">Lỗi là đổi mới, thủ tục đơn giản nhanh chóng</p>
          </div>
          <div class="text-center group p-6 rounded-2xl hover:bg-slate-50 transition-colors duration-300">
             <div class="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 transform group-hover:-rotate-6 transition-transform duration-300 text-4xl">
              💬
            </div>
            <h3 class="font-bold text-xl mb-3 text-slate-900">Hỗ trợ tận tâm</h3>
            <p class="text-slate-500 leading-relaxed">Đội ngũ kỹ thuật hỗ trợ 24/7 trọn đời sản phẩm</p>
          </div>
        </div>
      </div>
    </section>
  `
})
export class HomeComponent implements OnInit {
  featuredProducts: Product[] = [];
  brands: string[] = [];
  loading = true;
  
  // Slide Logic
  currentSlide = 0;
  slideInterval: any;
  
  slides: any[] = [
    {
      type: 'banner',
      image: './assets/images/hero-banner.png',
      alt: 'iPhone - Sức mạnh tương lai'
    },
    {
      type: 'banner',
      image: './assets/images/banner-slide-2.png',
      alt: 'Samsung Galaxy - Thiết kế sang trọng'
    },
    {
      type: 'banner',
      image: './assets/images/banner-slide-3.png',
      alt: 'Bộ sưu tập điện thoại cao cấp'
    }
  ];

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadFeaturedProducts();
    this.loadBrands();
    this.startSlideShow();
  }
  
  ngOnDestroy() {
    this.stopSlideShow();
  }

  startSlideShow() {
    if (this.slides.length <= 1) return;
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, 10000); // 10 seconds
  }
  
  stopSlideShow() {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  nextSlide() {
    if (this.slides.length <= 1) return;
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }
  
  prevSlide() {
    if (this.slides.length <= 1) return;
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
  }
  
  setSlide(index: number) {
    this.currentSlide = index;
    // Reset timer when manually interacting
    if (this.slides.length > 1) {
      this.stopSlideShow();
      this.startSlideShow();
    }
  }

  loadFeaturedProducts() {
    this.productService.getFeaturedProducts().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.featuredProducts = res.data.products;
        }
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  loadBrands() {
    this.productService.getBrands().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.brands = res.data;
        }
      }
    });
  }
}
