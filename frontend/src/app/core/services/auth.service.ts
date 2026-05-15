import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, ApiResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);

  currentUser$ = this.currentUserSubject.asObservable();
  token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadStoredAuth();
  }

  private loadStoredAuth(): void {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      this.tokenSubject.next(token);
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  register(data: { email: string; password: string; name: string; phone?: string }): Observable<ApiResponse<{ user: User; token: string }>> {
    return this.http.post<ApiResponse<{ user: User; token: string }>>(`${this.apiUrl}/auth/register`, data).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.setAuth(res.data.user, res.data.token);
        }
      })
    );
  }

  login(email: string, password: string): Observable<ApiResponse<{ user: User; token: string }>> {
    return this.http.post<ApiResponse<{ user: User; token: string }>>(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.setAuth(res.data.user, res.data.token);
        }
      })
    );
  }

  loginWithToken(token: string): Observable<ApiResponse<User>> {
    // Temporary set token to allow getProfile to work
    localStorage.setItem('token', token);
    
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/auth/profile`).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.setAuth(res.data, token);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.tokenSubject.next(null);
  }

  getProfile(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/auth/profile`);
  }

  updateProfile(data: Partial<User>): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.apiUrl}/auth/profile`, data).pipe(
      tap(res => {
        if (res.success && res.data) {
          localStorage.setItem('user', JSON.stringify(res.data));
          this.currentUserSubject.next(res.data);
        }
      })
    );
  }

  updateAvatar(file: File): Observable<ApiResponse<{ avatar: string }>> {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.http.post<ApiResponse<{ avatar: string }>>(`${this.apiUrl}/auth/profile/avatar`, formData).pipe(
      tap(res => {
        if (res.success && res.data && this.currentUserSubject.value) {
          const updatedUser = { ...this.currentUserSubject.value, avatar: res.data.avatar };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          this.currentUserSubject.next(updatedUser);
        }
      })
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.apiUrl}/auth/change-password`, { currentPassword, newPassword });
  }

  forgotPassword(email: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/auth/forgot-password`, { email });
  }

  resetPassword(token: string, password: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/auth/reset-password/${token}`, { password });
  }

  private setAuth(user: User, token: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.tokenSubject.next(token);
    this.currentUserSubject.next(user);
  }

  get isLoggedIn(): boolean {
    return !!this.tokenSubject.value;
  }

  get isAdmin(): boolean {
    return this.currentUserSubject.value?.role === 'admin';
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get token(): string | null {
    return this.tokenSubject.value;
  }
}
