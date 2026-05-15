import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cart, ApiResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = `${environment.apiUrl}/cart`;
  private cartSubject = new BehaviorSubject<Cart | null>(null);
  cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) {}

  getCart(): Observable<ApiResponse<Cart>> {
    return this.http.get<ApiResponse<Cart>>(this.apiUrl).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.cartSubject.next(res.data);
        }
      })
    );
  }

  addToCart(productId: string, quantity = 1, color?: string): Observable<ApiResponse<Cart>> {
    return this.http.post<ApiResponse<Cart>>(this.apiUrl, { productId, quantity, color }).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.cartSubject.next(res.data);
        }
      })
    );
  }

  updateQuantity(productId: string, quantity: number, color?: string): Observable<ApiResponse<Cart>> {
    return this.http.put<ApiResponse<Cart>>(`${this.apiUrl}/${productId}`, { quantity, color }).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.cartSubject.next(res.data);
        }
      })
    );
  }

  removeFromCart(productId: string): Observable<ApiResponse<Cart>> {
    return this.http.delete<ApiResponse<Cart>>(`${this.apiUrl}/${productId}`).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.cartSubject.next(res.data);
        }
      })
    );
  }

  clearCart(): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(this.apiUrl).pipe(
      tap(() => this.cartSubject.next(null))
    );
  }

  get cartItemCount(): number {
    const cart = this.cartSubject.value;
    return cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  }

  get cartTotal(): number {
    return this.cartSubject.value?.total || 0;
  }
}
