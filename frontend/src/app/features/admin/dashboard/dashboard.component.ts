import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, BaseChartDirective, FormsModule],
  template: `
    <div class="dashboard-wrapper">

      <!-- Welcome Banner -->
      <div class="relative overflow-hidden rounded-2xl mb-8 p-8" style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 30%, #4338ca 60%, #6366f1 100%);">
        <div class="absolute top-0 right-0 w-80 h-80 rounded-full" style="background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%); transform: translate(30%, -40%);"></div>
        <div class="absolute bottom-0 left-1/3 w-60 h-60 rounded-full" style="background: radial-gradient(circle, rgba(129,140,248,0.15) 0%, transparent 70%); transform: translateY(50%);"></div>
        <div class="relative z-10 flex items-center justify-between">
          <div>
            <p class="text-indigo-200 text-sm font-medium mb-1">👋 Xin chào!</p>
            <h2 class="text-2xl font-extrabold text-white tracking-tight mb-2">Chào mừng trở lại, Admin</h2>
            <p class="text-indigo-200/80 text-sm max-w-md">Theo dõi tổng quan hoạt động kinh doanh của <span class="text-white font-semibold">Chung Mobile</span> ngay hôm nay.</p>
          </div>
          <div class="hidden lg:flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/10">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50"></span>
            <span class="text-xs text-indigo-100 font-medium">{{ currentTime }}</span>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

        <!-- Tổng đơn hàng -->
        <div class="stat-card group relative overflow-hidden rounded-2xl bg-white p-5 ring-1 ring-slate-900/[0.04] shadow-sm hover:shadow-xl hover:shadow-blue-500/[0.08] hover:-translate-y-1.5 transition-all duration-500 cursor-default">
          <div class="absolute -top-6 -right-6 w-24 h-24 bg-blue-500/[0.07] rounded-full group-hover:scale-[2] transition-transform duration-700 ease-out"></div>
          <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-b-2xl scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500"></div>
          <div class="relative z-10">
            <div class="flex items-start justify-between mb-4">
              <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-110 group-hover:shadow-blue-500/40 transition-all duration-500">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
              </div>
              <span class="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/50">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>
                12%
              </span>
            </div>
            <p class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Tổng đơn hàng</p>
            <p class="text-3xl font-black text-slate-900 tabular-nums tracking-tight">{{ stats.totalOrders || 0 }}</p>
          </div>
        </div>

        <!-- Doanh thu -->
        <div class="stat-card group relative overflow-hidden rounded-2xl bg-white p-5 ring-1 ring-slate-900/[0.04] shadow-sm hover:shadow-xl hover:shadow-emerald-500/[0.08] hover:-translate-y-1.5 transition-all duration-500 cursor-default">
          <div class="absolute -top-6 -right-6 w-24 h-24 bg-emerald-500/[0.07] rounded-full group-hover:scale-[2] transition-transform duration-700 ease-out"></div>
          <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-b-2xl scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500"></div>
          <div class="relative z-10">
            <div class="flex items-start justify-between mb-4">
              <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-110 group-hover:shadow-emerald-500/40 transition-all duration-500">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <span class="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/50">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>
                8.5%
              </span>
            </div>
            <p class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Doanh thu</p>
            <p class="text-2xl font-black text-slate-900 tabular-nums tracking-tight truncate">{{ formatPrice(stats.totalRevenue || 0) }}</p>
          </div>
        </div>

        <!-- Chờ xử lý -->
        <div class="stat-card group relative overflow-hidden rounded-2xl bg-white p-5 ring-1 ring-slate-900/[0.04] shadow-sm hover:shadow-xl hover:shadow-amber-500/[0.08] hover:-translate-y-1.5 transition-all duration-500 cursor-default">
          <div class="absolute -top-6 -right-6 w-24 h-24 bg-amber-500/[0.07] rounded-full group-hover:scale-[2] transition-transform duration-700 ease-out"></div>
          <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-b-2xl scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500"></div>
          <div class="relative z-10">
            <div class="flex items-start justify-between mb-4">
              <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:scale-110 group-hover:shadow-amber-500/40 transition-all duration-500">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <span *ngIf="getPendingCount() > 0" class="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-600 ring-1 ring-amber-200/50 animate-pulse">
                ⚡ Cần xử lý
              </span>
              <span *ngIf="getPendingCount() === 0" class="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/50">
                ✓ OK
              </span>
            </div>
            <p class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Chờ xử lý</p>
            <p class="text-3xl font-black tabular-nums tracking-tight" [class]="getPendingCount() > 0 ? 'text-amber-600' : 'text-slate-900'">{{ getPendingCount() }}</p>
          </div>
        </div>

        <!-- Khách hàng -->
        <div class="stat-card group relative overflow-hidden rounded-2xl bg-white p-5 ring-1 ring-slate-900/[0.04] shadow-sm hover:shadow-xl hover:shadow-violet-500/[0.08] hover:-translate-y-1.5 transition-all duration-500 cursor-default">
          <div class="absolute -top-6 -right-6 w-24 h-24 bg-violet-500/[0.07] rounded-full group-hover:scale-[2] transition-transform duration-700 ease-out"></div>
          <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-purple-500 rounded-b-2xl scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500"></div>
          <div class="relative z-10">
            <div class="flex items-start justify-between mb-4">
              <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:scale-110 group-hover:shadow-violet-500/40 transition-all duration-500">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
              </div>
              <span class="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-violet-50 text-violet-600 ring-1 ring-violet-200/50">
                +5 mới
              </span>
            </div>
            <p class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Khách hàng</p>
            <p class="text-3xl font-black text-slate-900 tabular-nums tracking-tight">{{ userStats.totalUsers || 0 }}</p>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <!-- Revenue Chart -->
        <div class="lg:col-span-2 bg-white rounded-2xl ring-1 ring-slate-900/[0.04] shadow-sm overflow-hidden">
          <div class="px-6 py-5 border-b border-slate-100/80 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
              </div>
              <div>
                <h3 class="font-bold text-sm text-slate-900">Biểu đồ doanh thu</h3>
                <p class="text-[11px] text-slate-400">Theo dõi xu hướng kinh doanh</p>
              </div>
            </div>
            <div class="flex items-center bg-slate-100/70 p-0.5 rounded-xl ring-1 ring-slate-200/50">
              <button *ngFor="let p of periods"
                      (click)="selectedPeriod = p.value; loadStats()"
                      [class]="selectedPeriod === p.value ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700'"
                      class="px-3 py-1.5 text-[11px] font-bold rounded-[10px] transition-all duration-200">
                {{ p.label }}
              </button>
            </div>
          </div>
          <div class="p-6">
            <div class="h-80 w-full">
              <canvas baseChart [data]="barChartData" [options]="barChartOptions" [type]="barChartType"></canvas>
            </div>
          </div>
        </div>

        <!-- Order Chart -->
        <div class="lg:col-span-1 bg-white rounded-2xl ring-1 ring-slate-900/[0.04] shadow-sm overflow-hidden flex flex-col">
          <div class="px-6 py-5 border-b border-slate-100/80">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/20">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
              </div>
              <h3 class="font-bold text-sm text-slate-900">Đơn hàng</h3>
            </div>
            <div class="flex bg-slate-100/70 p-0.5 rounded-xl ring-1 ring-slate-200/50 w-full">
              <button (click)="activeOrderChart = 'line'"
                      [class]="activeOrderChart === 'line' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700'"
                      class="flex-1 px-3 py-1.5 text-[11px] font-bold rounded-[10px] transition-all duration-200 flex items-center justify-center gap-1.5">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4"/></svg>
                Xu hướng
              </button>
              <button (click)="activeOrderChart = 'pie'"
                      [class]="activeOrderChart === 'pie' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700'"
                      class="flex-1 px-3 py-1.5 text-[11px] font-bold rounded-[10px] transition-all duration-200 flex items-center justify-center gap-1.5">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/></svg>
                Trạng thái
              </button>
            </div>
          </div>
          <div class="p-6 flex-grow flex items-center justify-center">
            <div class="h-72 w-full">
              <ng-container [ngSwitch]="activeOrderChart">
                <canvas *ngSwitchCase="'line'" baseChart [data]="orderTrendsData" [options]="lineChartOptions" [type]="'line'"></canvas>
                <canvas *ngSwitchCase="'pie'" baseChart [data]="pieChartData" [options]="pieChartOptions" [type]="'pie'"></canvas>
              </ng-container>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="mb-6">
        <div class="flex items-center gap-3 mb-5">
          <h3 class="font-bold text-sm text-slate-900">Thao tác nhanh</h3>
          <div class="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent"></div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <a routerLink="/admin/products" class="group relative overflow-hidden rounded-2xl bg-white p-5 ring-1 ring-slate-900/[0.04] shadow-sm hover:shadow-xl hover:shadow-blue-500/[0.06] hover:-translate-y-1 transition-all duration-500 flex items-center gap-4 cursor-pointer">
            <div class="absolute inset-0 bg-gradient-to-r from-blue-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div class="relative w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
            </div>
            <div class="relative flex-1">
              <p class="font-bold text-sm text-slate-900 group-hover:text-blue-700 transition-colors">Sản phẩm</p>
              <p class="text-[11px] text-slate-400 mt-0.5">Quản lý kho hàng</p>
            </div>
            <svg class="w-4 h-4 text-slate-300 group-hover:text-blue-400 transition-all duration-300 group-hover:translate-x-1 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </a>
          <a routerLink="/admin/orders" class="group relative overflow-hidden rounded-2xl bg-white p-5 ring-1 ring-slate-900/[0.04] shadow-sm hover:shadow-xl hover:shadow-emerald-500/[0.06] hover:-translate-y-1 transition-all duration-500 flex items-center gap-4 cursor-pointer">
            <div class="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div class="relative w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
            </div>
            <div class="relative flex-1">
              <p class="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">Đơn hàng</p>
              <p class="text-[11px] text-slate-400 mt-0.5">Xử lý đơn mới</p>
            </div>
            <svg class="w-4 h-4 text-slate-300 group-hover:text-emerald-400 transition-all duration-300 group-hover:translate-x-1 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </a>
          <a routerLink="/admin/users" class="group relative overflow-hidden rounded-2xl bg-white p-5 ring-1 ring-slate-900/[0.04] shadow-sm hover:shadow-xl hover:shadow-violet-500/[0.06] hover:-translate-y-1 transition-all duration-500 flex items-center gap-4 cursor-pointer">
            <div class="absolute inset-0 bg-gradient-to-r from-violet-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div class="relative w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            </div>
            <div class="relative flex-1">
              <p class="font-bold text-sm text-slate-900 group-hover:text-violet-700 transition-colors">Người dùng</p>
              <p class="text-[11px] text-slate-400 mt-0.5">Quản lý tài khoản</p>
            </div>
            <svg class="w-4 h-4 text-slate-300 group-hover:text-violet-400 transition-all duration-300 group-hover:translate-x-1 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </a>
          <a routerLink="/admin/chat" class="group relative overflow-hidden rounded-2xl bg-white p-5 ring-1 ring-slate-900/[0.04] shadow-sm hover:shadow-xl hover:shadow-rose-500/[0.06] hover:-translate-y-1 transition-all duration-500 flex items-center gap-4 cursor-pointer">
            <div class="absolute inset-0 bg-gradient-to-r from-rose-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div class="relative w-11 h-11 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-md shadow-rose-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
            </div>
            <div class="relative flex-1">
              <p class="font-bold text-sm text-slate-900 group-hover:text-rose-700 transition-colors">Hỗ trợ</p>
              <p class="text-[11px] text-slate-400 mt-0.5">Chat với khách hàng</p>
            </div>
            <svg class="w-4 h-4 text-slate-300 group-hover:text-rose-400 transition-all duration-300 group-hover:translate-x-1 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-wrapper {
      animation: fadeIn 0.6s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats: any = {};
  userStats: any = {};
  selectedPeriod: string = '7d';
  activeOrderChart: 'line' | 'pie' = 'line';
  currentTime: string = '';

  periods = [
    { value: '7d', label: '7 Ngày' },
    { value: '30d', label: '30 Ngày' },
    { value: '1y', label: 'Năm' }
  ];

  constructor(
    private orderService: OrderService,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.loadStats();
    this.updateTime();
    setInterval(() => this.updateTime(), 60000);
  }

  updateTime() {
    const now = new Date();
    this.currentTime = now.toLocaleString('vi-VN', {
      hour: '2-digit', minute: '2-digit',
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  }

  loadStats() {
    this.orderService.getOrderStats(this.selectedPeriod).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.stats = res.data;
          this.updateCharts();
        }
      }
    });

    this.http.get<any>(`${environment.apiUrl}/users/stats/overview`).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.userStats = res.data;
        }
      }
    });
  }

  getPendingCount(): number {
    const pending = this.stats.statusStats?.find((s: any) => s._id === 'pending');
    return pending?.count || 0;
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      pending: 'Chờ xử lý', confirmed: 'Đã xác nhận', shipping: 'Đang giao', delivered: 'Đã giao', cancelled: 'Đã hủy'
    };
    return map[status] || status;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  }

  // Charts
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { size: 13, weight: 'bold', family: 'Outfit' },
        bodyFont: { size: 12, family: 'Outfit' },
        padding: { top: 10, bottom: 10, left: 14, right: 14 },
        cornerRadius: 12,
        displayColors: false,
        callbacks: {
          label: (ctx: any) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(ctx.raw)
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { size: 11, family: 'Outfit' } },
        border: { display: false }
      },
      y: {
        grid: { color: 'rgba(148, 163, 184, 0.06)', drawTicks: false },
        ticks: {
          color: '#94a3b8',
          font: { size: 11, family: 'Outfit' },
          padding: 8,
          callback: (val: any) => {
            if (val >= 1000000) return (val / 1000000).toFixed(0) + 'M';
            if (val >= 1000) return (val / 1000).toFixed(0) + 'K';
            return val;
          }
        },
        border: { display: false, dash: [4, 4] }
      }
    }
  };
  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = { labels: [], datasets: [] };

  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 24,
          usePointStyle: true,
          pointStyle: 'circle',
          font: { size: 12, weight: 'bold', family: 'Outfit' },
          color: '#475569'
        }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { size: 13, weight: 'bold', family: 'Outfit' },
        bodyFont: { size: 12, family: 'Outfit' },
        padding: 12,
        cornerRadius: 12
      }
    }
  };
  public pieChartType: ChartType = 'pie';
  public pieChartData: ChartData<'pie'> = { labels: [], datasets: [] };

  public orderTrendsData: ChartData<'line'> = { labels: [], datasets: [] };
  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { size: 13, weight: 'bold', family: 'Outfit' },
        bodyFont: { size: 12, family: 'Outfit' },
        padding: 12,
        cornerRadius: 12,
        displayColors: false
      }
    },
    elements: {
      line: { tension: 0.4 },
      point: { radius: 4, hoverRadius: 8 }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { size: 10, family: 'Outfit' } },
        border: { display: false }
      },
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, color: '#94a3b8', font: { size: 10, family: 'Outfit' }, padding: 8 },
        grid: { color: 'rgba(148, 163, 184, 0.06)', drawTicks: false },
        border: { display: false }
      }
    }
  };

  updateCharts() {
    // Pie Chart
    if (this.stats.statusStats) {
      const groupedData: Record<string, number> = { 'Đang xử lý': 0, 'Đã giao': 0, 'Đã hủy': 0 };
      this.stats.statusStats.forEach((s: any) => {
        if (['pending', 'confirmed', 'shipping'].includes(s._id)) groupedData['Đang xử lý'] += s.count;
        else if (s._id === 'delivered') groupedData['Đã giao'] += s.count;
        else if (s._id === 'cancelled') groupedData['Đã hủy'] += s.count;
      });

      this.pieChartData = {
        labels: Object.keys(groupedData),
        datasets: [{
          data: Object.values(groupedData),
          backgroundColor: ['rgba(99, 102, 241, 0.85)', 'rgba(16, 185, 129, 0.85)', 'rgba(244, 63, 94, 0.85)'],
          hoverBackgroundColor: ['#6366f1', '#10b981', '#f43f5e'],
          hoverOffset: 10,
          borderWidth: 3,
          borderColor: '#ffffff'
        }]
      };
    }

    // Bar + Line Charts
    if (this.stats.revenueStats) {
      const { labels, values, orderCounts } = this.fillChartGaps(this.stats.revenueStats, this.selectedPeriod);

      this.barChartData = {
        labels,
        datasets: [{
          data: values,
          label: 'Doanh thu',
          backgroundColor: (ctx: any) => {
            const chart = ctx.chart;
            const { ctx: c, chartArea } = chart;
            if (!chartArea) return 'rgba(99, 102, 241, 0.7)';
            const g = c.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
            g.addColorStop(0, 'rgba(99, 102, 241, 0.2)');
            g.addColorStop(1, 'rgba(99, 102, 241, 0.75)');
            return g;
          },
          hoverBackgroundColor: 'rgba(99, 102, 241, 0.9)',
          borderRadius: 8,
          borderSkipped: false,
          borderWidth: 0,
          maxBarThickness: 40
        }]
      };

      this.orderTrendsData = {
        labels,
        datasets: [{
          data: orderCounts,
          label: 'Số đơn hàng',
          borderColor: '#10b981',
          backgroundColor: (ctx: any) => {
            const chart = ctx.chart;
            const { ctx: c, chartArea } = chart;
            if (!chartArea) return 'rgba(16, 185, 129, 0.05)';
            const g = c.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
            g.addColorStop(0, 'rgba(16, 185, 129, 0)');
            g.addColorStop(1, 'rgba(16, 185, 129, 0.15)');
            return g;
          },
          fill: true,
          pointBackgroundColor: '#fff',
          pointBorderColor: '#10b981',
          pointBorderWidth: 2.5,
          pointHoverBackgroundColor: '#10b981',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 3,
          tension: 0.4,
          borderWidth: 2.5
        }]
      };
    }
  }

  private fillChartGaps(rawStats: any[], period: string): { labels: string[], values: number[], orderCounts: number[], customerCounts: number[] } {
    const labels: string[] = [];
    const values: number[] = [];
    const orderCounts: number[] = [];
    const customerCounts: number[] = [];
    const now = new Date();
    const statsMap = new Map(rawStats.map(s => [s._id, s]));

    if (period === '1d') {
      for (let i = 23; i >= 0; i--) {
        const d = new Date(now); d.setHours(now.getHours() - i);
        const key = d.toISOString().slice(0, 13) + ':00';
        labels.push(d.getHours() + ':00');
        const s = statsMap.get(key) as any;
        values.push(s?.revenue || 0); orderCounts.push(s?.orderCount || 0); customerCounts.push(s?.customerCount || 0);
      }
    } else if (period === '7d' || period === '30d') {
      const days = period === '7d' ? 6 : 29;
      for (let i = days; i >= 0; i--) {
        const d = new Date(now); d.setDate(now.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        labels.push(`${d.getDate()}/${d.getMonth() + 1}`);
        const s = statsMap.get(key) as any;
        values.push(s?.revenue || 0); orderCounts.push(s?.orderCount || 0); customerCounts.push(s?.customerCount || 0);
      }
    } else if (period === '1y') {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now); d.setMonth(now.getMonth() - i);
        const key = d.toISOString().slice(0, 7);
        labels.push('T' + (d.getMonth() + 1));
        const s = statsMap.get(key) as any;
        values.push(s?.revenue || 0); orderCounts.push(s?.orderCount || 0); customerCounts.push(s?.customerCount || 0);
      }
    }
    return { labels, values, orderCounts, customerCounts };
  }
}
