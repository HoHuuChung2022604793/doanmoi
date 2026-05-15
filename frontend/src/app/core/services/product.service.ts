import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product, ApiResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getProducts(params?: {
    page?: number;
    limit?: number;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    sort?: string;
    featured?: boolean;
  }): Observable<ApiResponse<{ products: Product[]; pagination: any }>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<ApiResponse<{ products: Product[]; pagination: any }>>(this.apiUrl, { params: httpParams });
  }

  getProduct(id: string): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`${this.apiUrl}/${id}`);
  }

  getBrands(): Observable<ApiResponse<string[]>> {
    return this.http.get<ApiResponse<string[]>>(`${this.apiUrl}/brands`);
  }

  getFeaturedProducts(): Observable<ApiResponse<{ products: Product[]; pagination: any }>> {
    return this.getProducts({ featured: true, limit: 8 });
  }

  searchProducts(query: string): Observable<ApiResponse<{ products: Product[]; pagination: any }>> {
    return this.getProducts({ search: query });
  }

  // Admin methods
  getAllProducts(page = 1, limit = 20, search?: string): Observable<ApiResponse<{ products: Product[]; pagination: any }>> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) params = params.set('search', search);
    return this.http.get<ApiResponse<{ products: Product[]; pagination: any }>>(`${this.apiUrl}/admin/all`, { params });
  }

  createProduct(product: Partial<Product>): Observable<ApiResponse<Product>> {
    return this.http.post<ApiResponse<Product>>(this.apiUrl, product);
  }

  updateProduct(id: string, product: Partial<Product>): Observable<ApiResponse<Product>> {
    return this.http.put<ApiResponse<Product>>(`${this.apiUrl}/${id}`, product);
  }

  deleteProduct(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  uploadImages(files: File[]): Observable<ApiResponse<string[]>> {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    return this.http.post<ApiResponse<string[]>>(`${this.apiUrl}/upload`, formData);
  }

  createReview(productId: string, data: { rating: number, comment: string }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${productId}/reviews`, data);
  }
}
