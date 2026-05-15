import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold">Quản lý sản phẩm</h2>
        <button (click)="openModal()" class="btn btn-primary">+ Thêm sản phẩm</button>
      </div>

      <!-- Search -->
      <div class="mb-6">
        <input 
          type="text" 
          [(ngModel)]="searchQuery"
          (keyup.enter)="loadProducts()"
          class="input max-w-md" 
          placeholder="Tìm kiếm sản phẩm..."
        >
      </div>

      <!-- Table -->
      <!-- Table & Pagination -->
      <div class="card overflow-hidden shadow-lg border-0 ring-1 ring-slate-100">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-50 border-b border-slate-100">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Sản phẩm</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Hãng</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Giá bán</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Khuyến mãi</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Kho</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Đánh giá</th>
                <th class="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Nổi bật</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                <th class="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 bg-white">
              @for (product of products; track product._id) {
                <tr class="hover:bg-slate-50 transition-colors group">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-4">
                      <div class="w-12 h-12 rounded-lg bg-gray-100 p-1 border border-slate-200 shadow-sm flex-shrink-0">
                        <img [src]="getImageUrl(product.thumbnail)" class="w-full h-full object-contain">
                      </div>
                      <div>
                        <div class="font-bold text-slate-800 group-hover:text-primary-600 transition-colors line-clamp-1">{{ product.name }}</div>
                        <div class="text-xs text-slate-400 mt-0.5">ID: {{ product._id | slice:0:8 }}...</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span class="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">{{ product.brand }}</span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="font-semibold text-slate-700">{{ formatPrice(product.price) }}</div>
                    @if (product.originalPrice && product.originalPrice > product.price) {
                      <div class="text-[10px] text-slate-400 line-through decoration-red-400/50">{{ formatPrice(product.originalPrice) }}</div>
                    }
                  </td>
                  <td class="px-6 py-4">
                    @if (product.discountPercentage && product.discountPercentage > 0) {
                      <div class="flex flex-col gap-1">
                        <span class="px-2 py-0.5 rounded bg-red-500 text-white text-[10px] font-bold w-fit shadow-sm animate-pulse">FLASH SALE -{{ product.discountPercentage }}%</span>
                        <span class="text-[9px] text-slate-400 font-medium">Hết hạn: {{ product.flashSaleEnd | date:'dd/MM' }}</span>
                      </div>
                    } @else {
                      <span class="text-xs text-slate-300 italic">Không có</span>
                    }
                  </td>
                   <td class="px-6 py-4">
                     <div class="flex items-center gap-2">
                        <div class="w-16 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                          <div class="bg-primary-500 h-1.5 rounded-full" [style.width.%]="(product.stock / 100) * 100"></div>
                        </div>
                        <span class="text-xs font-medium text-slate-600">{{ product.stock }}</span>
                     </div>
                   </td>
                   <td class="px-6 py-4">
                     <div class="flex flex-col">
                       <div class="flex items-center gap-1 text-amber-500 text-xs font-bold">
                         <span>⭐</span>
                         <span>{{ product.rating | number:'1.1-1' }}</span>
                       </div>
                       <div class="text-[10px] text-slate-400 font-medium">{{ product.numReviews }} đánh giá</div>
                     </div>
                   </td>
                   <td class="px-6 py-4 text-center">
                     <button (click)="toggleFeatured(product)" class="focus:outline-none transition-transform active:scale-95" [title]="product.isFeatured ? 'Bỏ nổi bật' : 'Đặt làm nổi bật'">
                       <span class="text-xl filter drop-shadow-sm transition-colors" [class.grayscale]="!product.isFeatured" [class.opacity-30]="!product.isFeatured">
                         ⭐
                       </span>
                     </button>
                   </td>
                   <td class="px-6 py-4">
                     <span [class]="product.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'" class="px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 w-fit">
                       <span class="w-1.5 h-1.5 rounded-full" [class]="product.isActive ? 'bg-green-500' : 'bg-red-500'"></span>
                       {{ product.isActive ? 'Đang bán' : 'Ngừng bán' }}
                     </span>
                   </td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button (click)="editProduct(product)" class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors" title="Sửa">
                        ✏️
                      </button>
                      <button (click)="deleteProduct(product)" class="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors" title="Xóa">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        
        <!-- Pagination -->
        <div class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p class="text-sm text-slate-500">Hiển thị <span class="font-medium text-slate-900">{{ products.length }}</span> sản phẩm</p>
          <div class="flex gap-2">
             <button class="px-3 py-1 rounded border border-slate-300 bg-white text-slate-600 text-sm hover:bg-slate-50 disabled:opacity-50" disabled>Trước</button>
             <button class="px-3 py-1 rounded border border-slate-300 bg-white text-slate-600 text-sm hover:bg-slate-50 disabled:opacity-50" disabled>Sau</button>
          </div>
        </div>
      </div>

      <!-- Modal -->
      @if (showModal) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" (click)="closeModal()">
          <div class="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
            <h3 class="text-xl font-bold mb-4">{{ editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm' }}</h3>
            
            <form (ngSubmit)="saveProduct()">
              <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label class="block text-sm font-medium mb-1">Tên sản phẩm *</label>
                  <input type="text" [(ngModel)]="form.name" name="name" class="input" required>
                </div>
                <div>
                  <label class="block text-sm font-medium mb-1">Hãng *</label>
                  <input type="text" [(ngModel)]="form.brand" name="brand" class="input" required>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label class="block text-sm font-medium mb-1">Giá bán *</label>
                  <input type="number" [(ngModel)]="form.price" name="price" class="input" required>
                </div>
                <div>
                  <label class="block text-sm font-medium mb-1">Giá gốc</label>
                  <input type="number" [(ngModel)]="form.originalPrice" name="originalPrice" class="input">
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label class="block text-sm font-medium mb-1">Số lượng tồn kho *</label>
                  <input type="number" [(ngModel)]="form.stock" name="stock" class="input" required>
                </div>
                <div>
                  <label class="block text-sm font-medium mb-1">Màu sắc (cách nhau bởi dấu phẩy)</label>
                  <input type="text" [(ngModel)]="colorsInput" name="colors" class="input" placeholder="Đen, Trắng, Xanh">
                </div>
              </div>

              <div class="mb-4">
                <label class="block text-sm font-medium mb-1">Mô tả</label>
                <textarea [(ngModel)]="form.description" name="description" class="input" rows="3"></textarea>
              </div>

              <div class="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label class="block text-sm font-medium mb-1">Màn hình</label>
                  <input type="text" [(ngModel)]="form.specs.screen" name="screen" class="input">
                </div>
                <div>
                  <label class="block text-sm font-medium mb-1">CPU</label>
                  <input type="text" [(ngModel)]="form.specs.cpu" name="cpu" class="input">
                </div>
                <div>
                  <label class="block text-sm font-medium mb-1">RAM</label>
                  <input type="text" [(ngModel)]="form.specs.ram" name="ram" class="input">
                </div>
              </div>

              <div class="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label class="block text-sm font-medium mb-1">Bộ nhớ</label>
                  <input type="text" [(ngModel)]="form.specs.storage" name="storage" class="input">
                </div>
                <div>
                  <label class="block text-sm font-medium mb-1">Pin</label>
                  <input type="text" [(ngModel)]="form.specs.battery" name="battery" class="input">
                </div>
                <div>
                  <label class="block text-sm font-medium mb-1">Camera</label>
                  <input type="text" [(ngModel)]="form.specs.camera" name="camera" class="input">
                </div>
              </div>

              <div class="mb-4">
                <label class="block text-sm font-medium mb-2">Hình ảnh sản phẩm</label>
                
                <!-- Upload Button -->
                <div class="flex items-center gap-4 mb-4">
                  <label class="btn btn-secondary cursor-pointer gap-2">
                    <input type="file" multiple accept="image/*" class="hidden" (change)="onFileSelected($event)">
                    <span>📷 Chọn ảnh</span>
                  </label>
                  <span class="text-xs text-slate-500">
                    {{ uploading ? 'Đang tải lên...' : 'Chọn nhiều ảnh (JPG, PNG)' }}
                  </span>
                </div>

                <!-- Preview Grid -->
                @if (form.images.length > 0) {
                  <div class="grid grid-cols-5 gap-4">
                    @for (img of form.images; track img; let i = $index) {
                      <div class="relative group aspect-square rounded-lg border border-slate-200 overflow-hidden bg-white">
                        <img [src]="getImageUrl(img)" class="w-full h-full object-contain">
                        <button 
                          type="button" 
                          (click)="removeImage(i)"
                          class="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        >
                          ×
                        </button>
                        @if (form.thumbnail === img) {
                          <div class="absolute bottom-0 inset-x-0 bg-primary-600 text-white text-[10px] text-center py-0.5">
                            Ảnh bìa
                          </div>
                        } @else {
                          <button 
                            type="button" 
                            (click)="setThumbnail(img)"
                            class="absolute bottom-0 inset-x-0 bg-black/50 hover:bg-primary-600 text-white text-[10px] text-center py-0.5 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            Đặt làm ảnh bìa
                          </button>
                        }
                      </div>
                    }
                  </div>
                }
              </div>

              <!-- Video Upload -->
              <div class="mb-4">
                <label class="block text-sm font-medium mb-2">Video sản phẩm</label>
                
                <div class="flex items-center gap-4 mb-4">
                  <label class="btn btn-secondary cursor-pointer gap-2">
                    <input type="file" accept="video/mp4,video/webm,video/ogg" class="hidden" (change)="onVideoSelected($event)">
                    <span>🎥 Chọn Video</span>
                  </label>
                  <span class="text-xs text-slate-500">
                    {{ uploadingVideo ? 'Đang tải video...' : 'Chọn video (MP4, WEBM, OGG - Max 50MB)' }}
                  </span>
                </div>

                @if (form.video) {
                  <div class="relative group rounded-lg border border-slate-200 overflow-hidden bg-white max-w-sm">
                    <video [src]="getImageUrl(form.video)" controls class="w-full h-auto"></video>
                    <button 
                      type="button" 
                      (click)="form.video = ''"
                      class="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
                    >
                      ×
                    </button>
                  </div>
                }
              </div>

              <div class="flex items-center gap-4 mb-4">
                <label class="flex items-center gap-2">
                  <input type="checkbox" [(ngModel)]="form.isActive" name="isActive" class="rounded text-primary-600 focus:ring-primary-500">
                  <span>Đang bán</span>
                </label>
                <label class="flex items-center gap-2">
                  <input type="checkbox" [(ngModel)]="form.isFeatured" name="isFeatured" class="rounded text-primary-600 focus:ring-primary-500">
                  <span>Nổi bật</span>
                </label>
              </div>

              <div class="flex justify-end gap-4">
                <button type="button" (click)="closeModal()" class="btn btn-secondary">Hủy</button>
                <button type="submit" class="btn btn-primary" [disabled]="saving || uploading">
                  {{ saving ? 'Đang lưu...' : 'Lưu sản phẩm' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class AdminProductsComponent implements OnInit {
  protected Math = Math;
  products: Product[] = [];
  searchQuery = '';
  showModal = false;
  editingProduct: Product | null = null;
  saving = false;
  uploading = false;
  colorsInput = '';

  form: {
    name: string; brand: string; price: number; originalPrice: number; stock: number; description: string;
    specs: { screen?: string; cpu?: string; ram?: string; storage?: string; battery?: string; camera?: string; os?: string; };
    isActive: boolean; isFeatured: boolean; colors: string[]; images: string[]; thumbnail: string; video: string;
  } = {
    name: '', brand: '', price: 0, originalPrice: 0, stock: 0, description: '',
    specs: { screen: '', cpu: '', ram: '', storage: '', battery: '', camera: '', os: '' },
    isActive: true, isFeatured: false, colors: [], images: [], thumbnail: '', video: ''
  };

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getAllProducts(1, 100, this.searchQuery || undefined).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.products = res.data.products;
        }
      }
    });
  }

  openModal() {
    this.editingProduct = null;
    this.resetForm();
    this.showModal = true;
  }

  editProduct(product: Product) {
    this.editingProduct = product;
    this.form = {
      name: product.name,
      brand: product.brand,
      price: product.price,
      originalPrice: product.originalPrice || 0,
      stock: product.stock,
      description: product.description,
      specs: { ...product.specs },
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      colors: [...product.colors],
      images: [...product.images],
      thumbnail: product.thumbnail,
      video: product.video || ''
    };
    this.colorsInput = product.colors?.join(', ') || '';
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingProduct = null;
  }

  resetForm() {
    this.form = {
      name: '', brand: '', price: 0, originalPrice: 0, stock: 0, description: '',
      specs: { screen: '', cpu: '', ram: '', storage: '', battery: '', camera: '', os: '' },
      isActive: true, isFeatured: false, colors: [], images: [], thumbnail: '', video: ''
    };
    this.colorsInput = '';
  }

  saveProduct() {
    this.form.colors = this.colorsInput.split(',').map(c => c.trim()).filter(Boolean);
    this.saving = true;

    const request = this.editingProduct
      ? this.productService.updateProduct(this.editingProduct._id, this.form)
      : this.productService.createProduct(this.form);

    request.subscribe({
      next: (res) => {
        if (res.success) {
          this.closeModal();
          this.loadProducts();
        }
        this.saving = false;
      },
      error: () => this.saving = false
    });
  }

  deleteProduct(product: Product) {
    if (!confirm(`Bạn có chắc muốn xóa "${product.name}"?`)) return;
    this.productService.deleteProduct(product._id).subscribe({
      next: () => this.loadProducts()
    });
  }

  toggleFeatured(product: Product) {
    this.productService.updateProduct(product._id, { isFeatured: !product.isFeatured }).subscribe({
      next: (res) => {
        if (res.success) {
          product.isFeatured = !product.isFeatured;
        }
      }
    });
  }

  getImageUrl(path: string): string {
    if (!path) return 'https://via.placeholder.com/50';
    if (path.startsWith('http')) return path;
    return environment.apiUrl.replace('/api', '') + path;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  }

  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    if (files.length === 0) return;

    this.uploading = true;
    const fileArray: File[] = Array.from(files);

    this.productService.uploadImages(fileArray).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          // Add new images to form
          this.form.images = [...this.form.images, ...res.data];
          
          // Set first image as thumbnail if empty
          if (!this.form.thumbnail && this.form.images.length > 0) {
            this.form.thumbnail = this.form.images[0];
          }
        }
        this.uploading = false;
        // Reset input
        event.target.value = '';
      },
      error: (err) => {
        console.error('Upload error:', err);
        alert('Lỗi upload ảnh: ' + (err.error?.message || err.message));
        this.uploading = false;
      }
    });
  }

  removeImage(index: number) {
    const removedImage = this.form.images[index];
    this.form.images.splice(index, 1);
    
    // If thumbnail was removed, reset or pick another
    if (this.form.thumbnail === removedImage) {
      this.form.thumbnail = this.form.images.length > 0 ? this.form.images[0] : '';
    }
  }

  setThumbnail(img: string) {
    this.form.thumbnail = img;
  }
  uploadingVideo = false;

  onVideoSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // Check size < 50MB
    if (file.size > 50 * 1024 * 1024) {
      alert('Video quá lớn! Vui lòng chọn video dưới 50MB');
      return;
    }

    this.uploadingVideo = true;
    const fileArray = [file];

    this.productService.uploadImages(fileArray).subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.length > 0) {
          this.form.video = res.data[0];
        }
        this.uploadingVideo = false;
        event.target.value = '';
      },
      error: (err) => {
        console.error('Upload error:', err);
        alert('Lỗi upload video: ' + (err.error?.message || err.message));
        this.uploadingVideo = false;
      }
    });
  }
}
