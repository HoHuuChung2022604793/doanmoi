import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Promotion {
  _id?: string;
  name: string;
  discountPercentage: number;
  startDate: string | Date;
  endDate: string | Date;
  products: any[];
  isActive?: boolean;
  description?: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PromotionService {
  private apiUrl = `${environment.apiUrl}/promotions`;

  constructor(private http: HttpClient) {}

  getPromotions(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  createPromotion(promotion: Promotion): Observable<any> {
    return this.http.post<any>(this.apiUrl, promotion);
  }

  updatePromotion(id: string, promotion: Promotion): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, promotion);
  }

  deletePromotion(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
