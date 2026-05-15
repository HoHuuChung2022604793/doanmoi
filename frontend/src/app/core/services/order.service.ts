import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order, ApiResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  getOrders(page = 1, limit = 10, status?: string): Observable<ApiResponse<{ orders: Order[]; pagination: any }>> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (status) params = params.set('status', status);
    return this.http.get<ApiResponse<{ orders: Order[]; pagination: any }>>(this.apiUrl, { params });
  }

  getOrder(id: string): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(`${this.apiUrl}/${id}`);
  }

  createOrder(order: {
    shippingAddress: Order['shippingAddress'];
    paymentMethod?: string;
    note?: string;
    couponCode?: string;
  }): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(this.apiUrl, order);
  }

  updatePaymentProof(id: string, paymentProof: string): Observable<ApiResponse<Order>> {
    return this.http.put<ApiResponse<Order>>(`${this.apiUrl}/${id}/payment`, { paymentProof });
  }

  cancelOrder(id: string): Observable<ApiResponse<Order>> {
    return this.http.put<ApiResponse<Order>>(`${this.apiUrl}/${id}/cancel`, {});
  }

  // Admin methods
  getAllOrders(page = 1, limit = 20, status?: string, search?: string): Observable<ApiResponse<{ orders: Order[]; pagination: any }>> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (status) params = params.set('status', status);
    if (search) params = params.set('search', search);
    return this.http.get<ApiResponse<{ orders: Order[]; pagination: any }>>(`${this.apiUrl}/admin/all`, { params });
  }

  updateOrderStatus(id: string, status?: string, paymentStatus?: string): Observable<ApiResponse<Order>> {
    return this.http.put<ApiResponse<Order>>(`${this.apiUrl}/admin/${id}/status`, { status, paymentStatus });
  }

  getOrderStats(period: string = '7d'): Observable<ApiResponse<any>> {
    const params = new HttpParams().set('period', period);
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/admin/stats`, { params });
  }

  verifyVnPayPayment(params: any): Observable<ApiResponse<Order>> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      httpParams = httpParams.set(key, params[key]);
    });
    return this.http.get<ApiResponse<Order>>(`${this.apiUrl}/vnpay-return`, { params: httpParams });
  }
}

