import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Coupon {
  _id?: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  startDate: string | Date;
  endDate: string | Date;
  usageLimit: number;
  usedCount?: number;
  isActive: boolean;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CouponService {
  private apiUrl = `${environment.apiUrl}/coupons`;

  constructor(private http: HttpClient) {}

  getCoupons(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  createCoupon(coupon: Coupon): Observable<any> {
    return this.http.post<any>(this.apiUrl, coupon);
  }

  updateCoupon(id: string, coupon: Coupon): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, coupon);
  }

  deleteCoupon(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  applyCoupon(code: string, orderAmount: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/apply`, { code, orderAmount });
  }
}
