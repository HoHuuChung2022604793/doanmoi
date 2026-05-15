import { Component, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { staggerAnimation } from '../../../core/animations/route.animations';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NgOptimizedImage, ProductCardComponent],
  animations: [staggerAnimation],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="flex flex-col md:flex-row gap-8">
        <!-- Filters Sidebar -->
        <aside class="w-full md:w-64 flex-shrink-0">
          <div class="card p-4 sticky top-20">
            <h3 class="font-semibold mb-4">Bộ lọc</h3>

            <!-- Brands -->
            <div class="mb-8">
              <h4 class="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                <span>Thương hiệu</span>
                <span class="w-full h-[1px] bg-slate-100 flex-1"></span>
              </h4>
              <div class="flex flex-wrap gap-2">
                <button 
                  (click)="selectAllBrands()"
                  [class]="selectedBrands.length === 0 ? 'bg-primary-600 text-white shadow-primary-500/30 shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                  class="px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105"
                >
                  Tất cả
                </button>
                @for (brand of brands; track brand) {
                  <button 
                    (click)="toggleBrand(brand)"
                    [class]="selectedBrands.includes(brand) ? 'bg-primary-600 text-white shadow-primary-500/30 shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                    class="px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105"
                  >
                    {{ brand }}
                  </button>
                }
              </div>
            </div>

            <!-- Price Range -->
            <div class="mb-6">
              <h4 class="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                <span>Mức giá</span>
                <span class="w-full h-[1px] bg-slate-100 flex-1"></span>
              </h4>
              <div class="space-y-2">
                <button 
                  (click)="setPriceRange('')"
                  [class]="priceRange === '' ? 'border-primary-600 ring-1 ring-primary-600 bg-primary-50 text-primary-700' : 'border-slate-200 hover:border-slate-300 text-slate-600'"
                  class="w-full text-left px-4 py-2.5 rounded-xl border text-sm font-medium transition-all flex items-center justify-between group"
                >
                  <span>Tất cả mức giá</span>
                  @if (priceRange === '') { <span class="text-primary-600">✓</span> }
                </button>
                <button 
                  (click)="setPriceRange('0-5000000')"
                  [class]="priceRange === '0-5000000' ? 'border-primary-600 ring-1 ring-primary-600 bg-primary-50 text-primary-700' : 'border-slate-200 hover:border-slate-300 text-slate-600'"
                  class="w-full text-left px-4 py-2.5 rounded-xl border text-sm font-medium transition-all flex items-center justify-between group"
                >
                  <span>Dưới 5 triệu</span>
                  @if (priceRange === '0-5000000') { <span class="text-primary-600">✓</span> }
                </button>
                <button 
                  (click)="setPriceRange('5000000-10000000')"
                  [class]="priceRange === '5000000-10000000' ? 'border-primary-600 ring-1 ring-primary-600 bg-primary-50 text-primary-700' : 'border-slate-200 hover:border-slate-300 text-slate-600'"
                  class="w-full text-left px-4 py-2.5 rounded-xl border text-sm font-medium transition-all flex items-center justify-between group"
                >
                  <span>5 - 10 triệu</span>
                  @if (priceRange === '5000000-10000000') { <span class="text-primary-600">✓</span> }
                </button>
                <button 
                  (click)="setPriceRange('10000000-20000000')"
                  [class]="priceRange === '10000000-20000000' ? 'border-primary-600 ring-1 ring-primary-600 bg-primary-50 text-primary-700' : 'border-slate-200 hover:border-slate-300 text-slate-600'"
                  class="w-full text-left px-4 py-2.5 rounded-xl border text-sm font-medium transition-all flex items-center justify-between group"
                >
                  <span>10 - 20 triệu</span>
                  @if (priceRange === '10000000-20000000') { <span class="text-primary-600">✓</span> }
                </button>
                <button 
                  (click)="setPriceRange('20000000-30000000')"
                  [class]="priceRange === '20000000-30000000' ? 'border-primary-600 ring-1 ring-primary-600 bg-primary-50 text-primary-700' : 'border-slate-200 hover:border-slate-300 text-slate-600'"
                  class="w-full text-left px-4 py-2.5 rounded-xl border text-sm font-medium transition-all flex items-center justify-between group"
                >
                  <span>20 - 30 triệu</span>
                  @if (priceRange === '20000000-30000000') { <span class="text-primary-600">✓</span> }
                </button>
                <button 
                  (click)="setPriceRange('30000000-')"
                  [class]="priceRange === '30000000-' ? 'border-primary-600 ring-1 ring-primary-600 bg-primary-50 text-primary-700' : 'border-slate-200 hover:border-slate-300 text-slate-600'"
                  class="w-full text-left px-4 py-2.5 rounded-xl border text-sm font-medium transition-all flex items-center justify-between group"
                >
                  <span>Trên 30 triệu</span>
                  @if (priceRange === '30000000-') { <span class="text-primary-600">✓</span> }
                </button>
              </div>
            </div>

            <button (click)="clearFilters()" class="btn btn-secondary w-full">Xóa bộ lọc</button>
          </div>
        </aside>

        <!-- Products -->
        <main class="flex-1">
          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <div>
              <h1 class="text-2xl font-bold">Điện thoại</h1>
              <p class="text-gray-600">{{ pagination?.total || 0 }} sản phẩm</p>
            </div>
            <select 
              [(ngModel)]="sortBy" 
              (change)="applyFilters()"
              class="input w-auto"
            >
              <option value="-createdAt">Mới nhất</option>
              <option value="price">Giá thấp → cao</option>
              <option value="-price">Giá cao → thấp</option>
              <option value="-sold">Bán chạy</option>
            </select>
          </div>

          <!-- Search Result -->
          @if (searchQuery) {
            <div class="mb-4 p-3 bg-blue-50 rounded-lg">
              Kết quả tìm kiếm cho: <strong>"{{ searchQuery }}"</strong>
              <button (click)="clearSearch()" class="ml-2 text-primary-600 hover:underline">Xóa</button>
            </div>
          }

          <!-- Loading -->
          @if (loading) {
            <div class="grid grid-cols-2 md:grid-cols-3 gap-6">
              @for (i of [1,2,3,4,5,6]; track i) {
                <div class="card p-4 animate-pulse">
                  <div class="bg-gray-200 aspect-square rounded-lg mb-4"></div>
                  <div class="bg-gray-200 h-4 rounded mb-2"></div>
                  <div class="bg-gray-200 h-4 rounded w-2/3"></div>
                </div>
              }
            </div>
          } @else if (products.length === 0) {
            <div class="text-center py-12">
              <div class="text-6xl mb-4">📱</div>
              <p class="text-gray-600">Không tìm thấy sản phẩm nào</p>
            </div>
          } @else {
            <div class="grid grid-cols-2 md:grid-cols-3 gap-6" [@staggerAnimation]="products.length">
              @for (product of products; track product._id) {
                <app-product-card [product]="product"></app-product-card>
              }
            </div>

            <!-- Pagination -->
            @if (pagination && pagination.pages > 1) {
              <div class="flex justify-center mt-8 gap-2">
                @for (page of getPages(); track page) {
                  <button 
                    (click)="goToPage(page)"
                    [class]="page === pagination.current ? 'btn btn-primary' : 'btn btn-secondary'"
                  >
                    {{ page }}
                  </button>
                }
              </div>
            }
          }
        </main>
      </div>
    </div>
  `
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  brands: string[] = [];
  selectedBrands: string[] = [];
  priceRange = '';
  sortBy = '-createdAt';
  searchQuery = '';
  loading = true;
  pagination: any;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadBrands();
    
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['search'] || '';
      if (params['brand']) {
        this.selectedBrands = params['brand'].split(',');
      }
      this.applyFilters();
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

  applyFilters(page: number = 1) {
    this.loading = true;
    
    const params: any = { 
      sort: this.sortBy,
      page: page,
      limit: 12
    };
    
    if (this.selectedBrands.length > 0) {
      params.brand = this.selectedBrands.join(',');
    }
    
    if (this.priceRange) {
      const [min, max] = this.priceRange.split('-');
      if (min) params.minPrice = Number(min);
      if (max) params.maxPrice = Number(max);
    }
    
    if (this.searchQuery) {
      params.search = this.searchQuery;
    }

    this.productService.getProducts(params).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.products = res.data.products;
          this.pagination = res.data.pagination;
          // Smooth scroll to top
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  toggleBrand(brand: string) {
    const index = this.selectedBrands.indexOf(brand);
    if (index > -1) {
      this.selectedBrands.splice(index, 1);
    } else {
      this.selectedBrands.push(brand);
    }
    this.applyFilters(1);
  }

  selectAllBrands() {
    this.selectedBrands = [];
    this.applyFilters(1);
  }

  setPriceRange(range: string) {
    this.priceRange = this.priceRange === range ? '' : range;
    this.applyFilters(1);
  }

  clearFilters() {
    this.selectedBrands = [];
    this.priceRange = '';
    this.sortBy = '-createdAt';
    this.applyFilters(1);
  }

  clearSearch() {
    this.searchQuery = '';
    this.applyFilters(1);
  }

  goToPage(page: number) {
    this.applyFilters(page);
  }

  getPages(): number[] {
    const pages = [];
    for (let i = 1; i <= this.pagination.pages; i++) {
      pages.push(i);
    }
    return pages;
  }
}
