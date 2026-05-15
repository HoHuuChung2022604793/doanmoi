import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PromotionService, Promotion } from '../../../core/services/promotion.service';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-promotions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-slate-800">Quản lý Khuyến mãi</h2>
          <p class="text-sm text-slate-500">Tạo các chương trình giảm giá và Flash Sale theo thời gian</p>
        </div>
        <button (click)="openModal()" class="btn btn-primary flex items-center gap-2">
          <span>➕</span> Tạo khuyến mãi mới
        </button>
      </div>

      <!-- Promotions List -->
      <div class="card overflow-hidden shadow-lg border-0 ring-1 ring-slate-100">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-50 border-b border-slate-100">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Chương trình</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Mức giảm</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Thời gian</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Số sản phẩm</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                <th class="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 bg-white">
              @for (promo of promotions; track promo._id) {
                <tr class="hover:bg-slate-50 transition-colors group">
                  <td class="px-6 py-4">
                    <div class="font-bold text-slate-800 group-hover:text-primary-600 transition-colors">{{ promo.name }}</div>
                    <div class="text-xs text-slate-400 mt-1 line-clamp-1">{{ promo.description || 'Không có mô tả' }}</div>
                  </td>
                  <td class="px-6 py-4">
                    <span class="px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-sm font-bold border border-red-100">
                      -{{ promo.discountPercentage }}%
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-xs text-slate-600">
                      <div class="flex items-center gap-1.5 mb-1">
                        <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        {{ promo.startDate | date:'dd/MM/yyyy HH:mm' }}
                      </div>
                      <div class="flex items-center gap-1.5">
                        <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        {{ promo.endDate | date:'dd/MM/yyyy HH:mm' }}
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span class="text-sm font-medium text-slate-600">{{ promo.products.length || 0 }} sản phẩm</span>
                  </td>
                  <td class="px-6 py-4">
                    @if (isCurrent(promo)) {
                      <span class="px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 text-xs font-bold">Đang diễn ra</span>
                    } @else if (isFuture(promo)) {
                      <span class="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">Sắp diễn ra</span>
                    } @else {
                      <span class="px-3 py-1 rounded-full bg-slate-50 text-slate-500 border border-slate-200 text-xs font-bold">Đã kết thúc</span>
                    }
                  </td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button (click)="editPromotion(promo)" class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors">✏️</button>
                      <button (click)="deletePromotion(promo)" class="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors">🗑️</button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Promotion Modal -->
      @if (showModal) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" (click)="closeModal()">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300" (click)="$event.stopPropagation()">
            <!-- Modal Header -->
            <div class="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 class="text-xl font-bold text-slate-800">{{ editingPromotion ? 'Cập nhật khuyến mãi' : 'Tạo khuyến mãi mới' }}</h3>
              <button (click)="closeModal()" class="w-10 h-10 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 transition-colors text-2xl">×</button>
            </div>

            <!-- Modal Body -->
            <div class="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              <div class="grid md:grid-cols-2 gap-8">
                <!-- Info Section -->
                <div class="space-y-6">
                  <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Tên chương trình *</label>
                    <input type="text" [(ngModel)]="form.name" class="input" placeholder="Ví dụ: Flash Sale Cuối Tuần">
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Mức giảm giá (%) *</label>
                    <div class="relative">
                      <input type="number" [(ngModel)]="form.discountPercentage" class="input pr-12" placeholder="0">
                      <span class="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">%</span>
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-bold text-slate-700 mb-2">Ngày bắt đầu *</label>
                      <input type="datetime-local" [(ngModel)]="form.startDate" class="input">
                    </div>
                    <div>
                      <label class="block text-sm font-bold text-slate-700 mb-2">Ngày kết thúc *</label>
                      <input type="datetime-local" [(ngModel)]="form.endDate" class="input">
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Mô tả chi tiết</label>
                    <textarea [(ngModel)]="form.description" class="input min-h-[100px]" placeholder="Nhập mô tả cho chương trình này..."></textarea>
                  </div>
                </div>

                <!-- Product Selection Section -->
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <label class="block text-sm font-bold text-slate-700">Sản phẩm áp dụng ({{ selectedProducts.length }})</label>
                    <button (click)="showProductSelector = true" class="text-primary-600 font-bold text-sm hover:underline">+ Thêm sản phẩm</button>
                  </div>
                  
                  <div class="bg-slate-50 rounded-xl p-4 border border-slate-100 min-h-[200px] max-h-[400px] overflow-y-auto space-y-3">
                    @if (selectedProducts.length === 0) {
                      <div class="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 py-12">
                        <span class="text-4xl">📱</span>
                        <p class="text-sm">Chưa có sản phẩm nào được chọn</p>
                      </div>
                    }
                    @for (product of selectedProducts; track product._id) {
                      <div class="flex items-center gap-3 p-2 bg-white rounded-lg shadow-sm border border-slate-200">
                        <img [src]="getImageUrl(product.thumbnail)" class="w-10 h-10 object-contain bg-slate-50 rounded">
                        <div class="flex-1 min-w-0">
                          <div class="text-xs font-bold text-slate-800 truncate">{{ product.name }}</div>
                          <div class="text-[10px] text-slate-400">{{ product.brand }}</div>
                        </div>
                        <button (click)="removeProduct(product)" class="text-red-500 hover:text-red-700 p-1">×</button>
                      </div>
                    }
                  </div>
                </div>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-4">
              <button (click)="closeModal()" class="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors">Hủy bỏ</button>
              <button (click)="savePromotion()" class="btn btn-primary px-8" [disabled]="saving">
                {{ saving ? 'Đang lưu...' : (editingPromotion ? 'Cập nhật' : 'Tạo khuyến mãi') }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Product Selector Modal Overlay -->
      @if (showProductSelector) {
        <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4" (click)="showProductSelector = false">
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[80vh]" (click)="$event.stopPropagation()">
            <div class="p-6 border-b border-slate-100 flex items-center justify-between">
              <h4 class="text-lg font-bold text-slate-800">Chọn sản phẩm</h4>
              <button (click)="showProductSelector = false" class="text-2xl text-slate-400">×</button>
            </div>
            <div class="p-4 border-b border-slate-100 bg-slate-50">
              <input type="text" [(ngModel)]="productSearch" (input)="filterProducts()" class="input" placeholder="Tìm tên sản phẩm hoặc hãng...">
            </div>
            <div class="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              @for (product of filteredProducts; track product._id) {
                <div class="flex items-center gap-4 p-3 hover:bg-primary-50 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-primary-100" (click)="toggleProductSelection(product)">
                  <div class="w-12 h-12 bg-white rounded-lg border border-slate-200 p-1">
                    <img [src]="getImageUrl(product.thumbnail)" class="w-full h-full object-contain">
                  </div>
                  <div class="flex-1">
                    <div class="text-sm font-bold text-slate-800">{{ product.name }}</div>
                    <div class="text-xs text-slate-400">{{ product.brand }} - {{ formatPrice(product.price) }}</div>
                  </div>
                  <input type="checkbox" [checked]="isProductSelected(product)" class="w-5 h-5 rounded-md text-primary-600">
                </div>
              }
            </div>
            <div class="p-4 border-t border-slate-100 flex justify-end">
              <button (click)="showProductSelector = false" class="btn btn-primary px-6">Xong</button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class AdminPromotionsComponent implements OnInit {
  promotions: Promotion[] = [];
  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
  selectedProducts: Product[] = [];
  
  showModal = false;
  showProductSelector = false;
  editingPromotion: Promotion | null = null;
  saving = false;
  
  productSearch = '';
  form = {
    name: '',
    discountPercentage: 0,
    startDate: '',
    endDate: '',
    description: '',
    products: [] as string[]
  };

  constructor(
    private promotionService: PromotionService,
    private productService: ProductService
  ) {}

  ngOnInit() {
    this.loadPromotions();
    this.loadProducts();
  }

  loadPromotions() {
    this.promotionService.getPromotions().subscribe(res => {
      if (res.success) this.promotions = res.data;
    });
  }

  loadProducts() {
    this.productService.getAllProducts(1, 500).subscribe(res => {
      if (res.success && res.data) {
        this.allProducts = res.data.products;
        this.filteredProducts = [...this.allProducts];
      }
    });
  }

  filterProducts() {
    const q = this.productSearch.toLowerCase();
    this.filteredProducts = this.allProducts.filter(p => 
      p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
    );
  }

  openModal() {
    this.editingPromotion = null;
    this.resetForm();
    this.showModal = true;
  }

  resetForm() {
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    
    this.form = {
      name: '',
      discountPercentage: 0,
      startDate: this.formatDateForInput(now),
      endDate: this.formatDateForInput(tomorrow),
      description: '',
      products: []
    };
    this.selectedProducts = [];
  }

  editPromotion(promo: Promotion) {
    this.editingPromotion = promo;
    this.form = {
      name: promo.name,
      discountPercentage: promo.discountPercentage,
      startDate: this.formatDateForInput(new Date(promo.startDate)),
      endDate: this.formatDateForInput(new Date(promo.endDate)),
      description: promo.description || '',
      products: Array.isArray(promo.products) 
        ? promo.products.map(p => typeof p === 'string' ? p : p._id) 
        : []
    };
    
    // Map product objects for display
    this.selectedProducts = Array.isArray(promo.products) 
      ? promo.products.map(p => typeof p === 'string' ? this.allProducts.find(prod => prod._id === p) : p).filter(Boolean) as Product[]
      : [];
      
    this.showModal = true;
  }

  savePromotion() {
    if (!this.form.name || !this.form.discountPercentage) {
      alert('Vui lòng nhập đầy đủ thông tin bắt buộc');
      return;
    }
    
    this.form.products = this.selectedProducts.map(p => p._id);
    this.saving = true;

    const request = this.editingPromotion 
      ? this.promotionService.updatePromotion(this.editingPromotion._id!, this.form as any)
      : this.promotionService.createPromotion(this.form as any);

    request.subscribe({
      next: (res) => {
        if (res.success) {
          this.loadPromotions();
          this.closeModal();
        }
        this.saving = false;
      },
      error: (err) => {
        alert('Lỗi: ' + (err.error?.message || 'Có lỗi xảy ra'));
        this.saving = false;
      }
    });
  }

  deletePromotion(promo: Promotion) {
    if (!confirm('Bạn có chắc muốn xóa chương trình này?')) return;
    this.promotionService.deletePromotion(promo._id!).subscribe(() => this.loadPromotions());
  }

  closeModal() {
    this.showModal = false;
    this.editingPromotion = null;
  }

  toggleProductSelection(product: Product) {
    const index = this.selectedProducts.findIndex(p => p._id === product._id);
    if (index > -1) {
      this.selectedProducts.splice(index, 1);
    } else {
      this.selectedProducts.push(product);
    }
  }

  removeProduct(product: Product) {
    this.selectedProducts = this.selectedProducts.filter(p => p._id !== product._id);
  }

  isProductSelected(product: Product): boolean {
    return this.selectedProducts.some(p => p._id === product._id);
  }

  formatDateForInput(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  isCurrent(promo: Promotion): boolean {
    const now = new Date();
    return now >= new Date(promo.startDate) && now <= new Date(promo.endDate);
  }

  isFuture(promo: Promotion): boolean {
    return new Date() < new Date(promo.startDate);
  }

  getImageUrl(path: string): string {
    if (!path) return 'https://via.placeholder.com/50';
    if (path.startsWith('http')) return path;
    const baseUrl = environment.apiUrl.replace('/api', '');
    return baseUrl + path;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  }
}
