import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Notification, ApiResponse } from '../models';
import { io, Socket } from 'socket.io-client';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;
  private socket: Socket | null = null;
  
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);
  
  notifications$ = this.notificationsSubject.asObservable();
  unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  connect(): void {
    if (this.socket?.connected) return;
    
    const token = this.authService.token;
    if (!token) return;

    this.socket = io(environment.socketUrl, {
      auth: { token }
    });

    this.socket.on('new_notification', (notification: Notification) => {
      const notifications = this.notificationsSubject.value;
      this.notificationsSubject.next([notification, ...notifications]);
      this.unreadCountSubject.next(this.unreadCountSubject.value + 1);
    });

    this.socket.on('order_status', (data: any) => {
      console.log('Order status updated:', data);
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  getNotifications(page = 1, unreadOnly = false): Observable<ApiResponse<{ notifications: Notification[]; unreadCount: number; pagination: any }>> {
    let params = new HttpParams().set('page', page);
    if (unreadOnly) params = params.set('unreadOnly', 'true');
    
    return this.http.get<ApiResponse<{ notifications: Notification[]; unreadCount: number; pagination: any }>>(this.apiUrl, { params }).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.notificationsSubject.next(res.data.notifications);
          this.unreadCountSubject.next(res.data.unreadCount);
        }
      })
    );
  }

  markAsRead(id: string): Observable<ApiResponse<Notification>> {
    return this.http.put<ApiResponse<Notification>>(`${this.apiUrl}/${id}/read`, {}).pipe(
      tap(() => {
        this.unreadCountSubject.next(Math.max(0, this.unreadCountSubject.value - 1));
      })
    );
  }

  markAllAsRead(): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.apiUrl}/read-all`, {}).pipe(
      tap(() => this.unreadCountSubject.next(0))
    );
  }

  deleteNotification(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
