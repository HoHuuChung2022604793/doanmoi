import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Message, Notification, ApiResponse } from '../models';
import { io, Socket } from 'socket.io-client';
import { AuthService } from './auth.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = `${environment.apiUrl}/chat`;
  private socket: Socket | null = null;
  
  private messageSubject = new Subject<Message>();
  messageReceived$ = this.messageSubject.asObservable();

  private openChatSubject = new Subject<{ user: any, initialMessage?: string, context?: any }>();
  openChat$ = this.openChatSubject.asObservable();

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

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('receive_message', (message: Message) => {
      this.messageSubject.next(message);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  getConversations(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/conversations`);
  }

  getMessages(userId: string, page = 1): Observable<ApiResponse<Message[]>> {
    const params = new HttpParams().set('page', page);
    return this.http.get<ApiResponse<Message[]>>(`${this.apiUrl}/${userId}`, { params });
  }

  sendMessage(receiverId: string, content: string, context?: any): Observable<ApiResponse<Message>> {
    return this.http.post<ApiResponse<Message>>(this.apiUrl, { receiverId, content, context });
  }

  markAsRead(userId: string): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.apiUrl}/${userId}/read`, {});
  }

  deleteConversation(partnerId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/conversations/${partnerId}`);
  }

  getAdmins(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/admins/list`);
  }

  triggerOpenChat(user: any, initialMessage?: string, context?: any) {
    this.openChatSubject.next({ user, initialMessage, context });
  }

  emitTyping(receiverId: string): void {
    this.socket?.emit('typing', { receiverId });
  }

  emitStopTyping(receiverId: string): void {
    this.socket?.emit('stop_typing', { receiverId });
  }

  onUserTyping(callback: (data: any) => void): void {
    this.socket?.on('user_typing', callback);
  }

  onUserStopTyping(callback: (data: any) => void): void {
    this.socket?.on('user_stop_typing', callback);
  }
}
