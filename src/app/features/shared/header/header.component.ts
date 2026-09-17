import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';
import { AudioService } from '../../../core/services/audio.service';
import { QuizStateService } from '../../../core/services/quiz-state.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="border-b border-paper-300/80 dark:border-paper-800/80 bg-paper-50/90 dark:bg-paper-900/90 backdrop-blur-md sticky top-0 z-30">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 h-18 py-3 flex items-center justify-between">
        
        <!-- Brand & Study Badge -->
        <div 
          (click)="goHome()" 
          class="flex items-center gap-3 cursor-pointer group"
          title="Quay về Bàn ghi chú"
        >
          <div class="relative w-11 h-11 rounded-2xl bg-terracotta-500 text-white flex items-center justify-center shadow-md shadow-terracotta-500/20 transform -rotate-2 group-hover:rotate-0 transition-transform">
            <i class="ph-bold ph-book-open-text text-2xl"></i>
            <span class="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-white dark:border-paper-900"></span>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-serif font-bold text-2xl tracking-tight text-paper-900 dark:text-paper-50">QuizCraft</span>
              <span class="font-hand text-lg text-terracotta-600 dark:text-terracotta-400 font-bold hidden sm:inline-block">sổ tay tự học</span>
            </div>
            <p class="text-[11px] font-medium text-paper-400 dark:text-paper-400 tracking-wide uppercase">Ghi nhớ sâu</p>
          </div>
        </div>

        <!-- Controls: Audio, Study Log, User & Dark Mode -->
        <div class="flex items-center gap-2">
          <!-- Audio toggle -->
          <button 
            type="button"
            (click)="toggleSound()"
            title="Bật/Tắt âm thanh gõ bút" 
            class="p-2.5 rounded-xl border border-paper-300 dark:border-paper-800 bg-white dark:bg-paper-800/50 hover:bg-paper-100 dark:hover:bg-paper-800 text-paper-800 dark:text-paper-200 transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <i [class]="audioService.soundEnabled() ? 'ph-bold ph-speaker-high text-lg text-terracotta-600' : 'ph-bold ph-speaker-slash text-lg text-paper-400'"></i>
            <span class="hidden md:inline">Âm phím</span>
          </button>

          <!-- Study Log (History) -->
          <button 
            type="button"
            (click)="openHistory()"
            class="flex items-center gap-2 px-3 py-2 rounded-xl border border-paper-300 dark:border-paper-800 bg-white dark:bg-paper-800/50 hover:bg-paper-100 dark:hover:bg-paper-800 text-paper-800 dark:text-paper-200 text-xs font-bold transition cursor-pointer"
          >
            <i class="ph-bold ph-bookmark-simple text-base text-amber-600"></i>
            <span class="hidden sm:inline">Nhật ký</span>
            @if (state.historyCount() > 0) {
              <span class="px-1.5 py-0.5 text-[10px] rounded-full bg-terracotta-500 text-white font-bold">
                {{ state.historyCount() }}
              </span>
            }
          </button>

          <!-- User Authentication Section -->
          @if (!authService.isLoggedIn()) {
            <button 
              type="button"
              (click)="openLogin()"
              class="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-terracotta-600 hover:bg-terracotta-500 text-white text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <i class="ph-bold ph-user text-base"></i>
              <span>Đăng nhập</span>
            </button>
          } @else {
            <div class="relative">
              <button 
                type="button"
                (click)="toggleUserDropdown()"
                class="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 hover:bg-paper-100 dark:hover:bg-paper-700 text-paper-900 dark:text-paper-100 text-xs font-bold transition cursor-pointer"
              >
                @if (authService.currentUser()?.avatarUrl) {
                  <img [src]="authService.currentUser()?.avatarUrl" class="w-6 h-6 rounded-full object-cover border border-paper-300" alt="Avatar" />
                } @else {
                  <div class="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-[11px] font-extrabold uppercase">
                    {{ (authService.currentUser()?.fullName || authService.currentUser()?.username || 'U').slice(0, 1) }}
                  </div>
                }
                <span class="max-w-[100px] truncate hidden md:inline">{{ authService.currentUser()?.fullName || authService.currentUser()?.username }}</span>
                <i class="ph-bold ph-caret-down text-xs text-paper-400"></i>
              </button>

              <!-- Dropdown Menu -->
              @if (isUserDropdownOpen()) {
                <div 
                  class="absolute right-0 top-11 w-48 rounded-2xl border-2 border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-900 shadow-xl py-2 z-50 animate-fadeIn text-xs space-y-1"
                >
                  <div class="px-3 py-2 border-b border-paper-200 dark:border-paper-800">
                    <p class="font-bold text-paper-900 dark:text-paper-100 truncate">{{ authService.currentUser()?.fullName || authService.currentUser()?.username }}</p>
                    <p class="text-[10px] text-paper-400 truncate">{{ authService.currentUser()?.email || '@' + authService.currentUser()?.username }}</p>
                  </div>
                  <button 
                    type="button"
                    (click)="handleLogout()"
                    class="w-full text-left px-3 py-2 text-terracotta-600 hover:bg-terracotta-50 dark:hover:bg-terracotta-900/30 flex items-center gap-2 font-semibold transition cursor-pointer"
                  >
                    <i class="ph-bold ph-sign-out text-sm"></i>
                    <span>Đăng xuất</span>
                  </button>
                </div>
              }
            </div>
          }

          <!-- Theme Toggle -->
          <button 
            type="button"
            (click)="toggleTheme()"
            title="Đổi giao diện Ngày/Đêm" 
            class="p-2.5 rounded-xl border border-paper-300 dark:border-paper-800 bg-white dark:bg-paper-800/50 hover:bg-paper-100 dark:hover:bg-paper-800 text-paper-800 dark:text-paper-200 transition cursor-pointer"
          >
            <i [class]="themeService.isDarkMode() ? 'ph-bold ph-sun text-amber-400 text-lg' : 'ph-bold ph-moon-stars text-paper-800 dark:text-paper-200 text-lg'"></i>
          </button>
        </div>

      </div>
    </header>
  `
})
export class HeaderComponent {
  readonly themeService = inject(ThemeService);
  readonly audioService = inject(AudioService);
  readonly state = inject(QuizStateService);
  readonly toast = inject(ToastService);
  readonly authService = inject(AuthService);

  isUserDropdownOpen = signal<boolean>(false);

  toggleSound(): void {
    const isEnabled = this.audioService.toggleSound();
    this.toast.show(isEnabled ? 'Đã bật âm thanh gõ bút' : 'Đã tắt âm thanh', 'info');
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.audioService.play('type');
  }

  openHistory(): void {
    this.state.toggleHistoryDrawer(true);
  }

  goHome(): void {
    this.state.setView('notebook');
    this.audioService.play('type');
  }

  openLogin(): void {
    this.authService.openAuthModal();
  }

  toggleUserDropdown(): void {
    this.isUserDropdownOpen.update(v => !v);
  }

  handleLogout(): void {
    this.isUserDropdownOpen.set(false);
    this.authService.logout();
    this.state.fetchHistory();
  }
}
