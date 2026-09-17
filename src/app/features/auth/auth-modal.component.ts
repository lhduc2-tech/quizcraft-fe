import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { AudioService } from '../../core/services/audio.service';
import { ToastService } from '../../core/services/toast.service';
import { environment } from '../../../environments/environment';

declare const google: any;

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (authService.isAuthModalOpen()) {
      <div 
        class="fixed inset-0 z-50 bg-paper-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
        (click)="onBackdropClick($event)"
      >
        <div 
          class="bg-paper-50 dark:bg-[#201D18] w-full max-w-md rounded-3xl border-2 border-paper-300 dark:border-paper-700 shadow-2xl p-6 sm:p-8 relative space-y-5"
          (click)="$event.stopPropagation()"
        >
          <!-- Washi tape accent -->
          <div class="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
            <span class="washi-tape px-4 py-1 text-[11px] font-bold text-amber-900 uppercase tracking-widest rounded-sm shadow-xs">
              QuizCraft Account
            </span>
          </div>

          <!-- Close button -->
          <button 
            type="button" 
            (click)="close()"
            class="absolute top-4 right-4 text-paper-400 hover:text-terracotta-600 transition p-1.5 rounded-full hover:bg-paper-100 dark:hover:bg-paper-800 cursor-pointer"
            title="Đóng"
          >
            <i class="ph-bold ph-x text-lg"></i>
          </button>

          <!-- Modal Header -->
          <div class="text-center pt-2 space-y-1">
            <div class="w-12 h-12 mx-auto rounded-2xl bg-terracotta-500 text-white flex items-center justify-center shadow-md shadow-terracotta-500/20 transform -rotate-3 mb-2">
              <i class="ph-bold ph-user-circle text-2xl"></i>
            </div>
            <h3 class="font-serif font-bold text-2xl text-paper-900 dark:text-paper-50">
              {{ activeTab() === 'login' ? 'Chào mừng bạn trở lại' : 'Tạo tài khoản QuizCraft' }}
            </h3>
            <p class="text-xs text-paper-500 dark:text-paper-400 font-medium">
              {{ activeTab() === 'login' 
                ? 'Đăng nhập để đồng bộ nhật ký và lưu giữ bộ đề ôn tập' 
                : 'Lưu trữ không giới hạn bộ câu hỏi và theo dõi tiến độ' }}
            </p>
          </div>

          <!-- Tab Switcher -->
          <div class="grid grid-cols-2 p-1 bg-paper-200/70 dark:bg-paper-800/60 rounded-xl text-xs font-bold">
            <button 
              type="button"
              (click)="switchTab('login')"
              [class]="activeTab() === 'login' 
                ? 'bg-white dark:bg-paper-900 text-terracotta-600 dark:text-terracotta-400 shadow-sm py-2 rounded-lg transition cursor-pointer' 
                : 'text-paper-600 dark:text-paper-400 hover:text-paper-900 py-2 rounded-lg transition cursor-pointer'"
            >
              Đăng nhập
            </button>
            <button 
              type="button"
              (click)="switchTab('register')"
              [class]="activeTab() === 'register' 
                ? 'bg-white dark:bg-paper-900 text-terracotta-600 dark:text-terracotta-400 shadow-sm py-2 rounded-lg transition cursor-pointer' 
                : 'text-paper-600 dark:text-paper-400 hover:text-paper-900 py-2 rounded-lg transition cursor-pointer'"
            >
              Đăng ký
            </button>
          </div>

          <!-- Google Sign-In Option -->
          <div class="space-y-2">
            <div id="googleBtnContainer" class="w-full flex justify-center"></div>

            @if (!isGoogleRendered()) {
              <button 
                type="button" 
                (click)="handleGoogleSignInClick()"
                class="w-full py-3 px-4 rounded-xl border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 hover:bg-paper-50 dark:hover:bg-paper-700/80 text-paper-900 dark:text-paper-100 text-xs font-bold flex items-center justify-center gap-2.5 transition shadow-sm cursor-pointer"
              >
                <!-- Google G Logo SVG -->
                <svg class="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Tiếp tục với Google</span>
              </button>
            }

            <div class="relative flex py-2 items-center">
              <div class="flex-grow border-t border-paper-200 dark:border-paper-800"></div>
              <span class="flex-shrink mx-3 text-[11px] text-paper-400 font-semibold uppercase tracking-wider">hoặc</span>
              <div class="flex-grow border-t border-paper-200 dark:border-paper-800"></div>
            </div>
          </div>

          <!-- Error Callout -->
          @if (errorMessage()) {
            <div class="p-3 rounded-xl bg-terracotta-50 dark:bg-terracotta-900/30 border border-terracotta-300 dark:border-terracotta-800 text-terracotta-700 dark:text-terracotta-300 text-xs font-semibold flex items-center gap-2">
              <i class="ph-bold ph-warning-circle text-base shrink-0"></i>
              <span>{{ errorMessage() }}</span>
            </div>
          }

          <!-- Form Fields -->
          <form (ngSubmit)="onSubmit()" class="space-y-3.5">
            <!-- Username field -->
            <div class="space-y-1">
              <label class="text-xs font-bold text-paper-800 dark:text-paper-300 block">
                {{ activeTab() === 'login' ? 'Tên đăng nhập hoặc Email' : 'Tên đăng nhập' }}
              </label>
              <div class="relative">
                <i class="ph-bold ph-user absolute left-3 top-1/2 -translate-y-1/2 text-paper-400"></i>
                <input 
                  type="text"
                  [(ngModel)]="username"
                  name="username"
                  required
                  placeholder="Ví dụ: haiduc26"
                  class="w-full pl-9 pr-3 py-2.5 rounded-xl border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 text-paper-900 dark:text-paper-100 text-xs font-semibold focus:outline-none focus:border-terracotta-500 transition placeholder:text-paper-400"
                />
              </div>
            </div>

            <!-- Full Name (Register only) -->
            @if (activeTab() === 'register') {
              <div class="space-y-1">
                <label class="text-xs font-bold text-paper-800 dark:text-paper-300 block">Họ và tên</label>
                <div class="relative">
                  <i class="ph-bold ph-identification-badge absolute left-3 top-1/2 -translate-y-1/2 text-paper-400"></i>
                  <input 
                    type="text"
                    [(ngModel)]="fullName"
                    name="fullName"
                    placeholder="Ví dụ: Lê Hải Đức"
                    class="w-full pl-9 pr-3 py-2.5 rounded-xl border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 text-paper-900 dark:text-paper-100 text-xs font-semibold focus:outline-none focus:border-terracotta-500 transition placeholder:text-paper-400"
                  />
                </div>
              </div>

              <!-- Email (Register only) -->
              <div class="space-y-1">
                <label class="text-xs font-bold text-paper-800 dark:text-paper-300 block">Email</label>
                <div class="relative">
                  <i class="ph-bold ph-envelope-simple absolute left-3 top-1/2 -translate-y-1/2 text-paper-400"></i>
                  <input 
                    type="email"
                    [(ngModel)]="email"
                    name="email"
                    placeholder="name@example.com"
                    class="w-full pl-9 pr-3 py-2.5 rounded-xl border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 text-paper-900 dark:text-paper-100 text-xs font-semibold focus:outline-none focus:border-terracotta-500 transition placeholder:text-paper-400"
                  />
                </div>
              </div>
            }

            <!-- Password field -->
            <div class="space-y-1">
              <label class="text-xs font-bold text-paper-800 dark:text-paper-300 block">Mật khẩu</label>
              <div class="relative">
                <i class="ph-bold ph-lock-key absolute left-3 top-1/2 -translate-y-1/2 text-paper-400"></i>
                <input 
                  [type]="showPassword ? 'text' : 'password'"
                  [(ngModel)]="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  class="w-full pl-9 pr-10 py-2.5 rounded-xl border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 text-paper-900 dark:text-paper-100 text-xs font-semibold focus:outline-none focus:border-terracotta-500 transition placeholder:text-paper-400"
                />
                <button 
                  type="button"
                  (click)="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-paper-400 hover:text-paper-600 transition cursor-pointer"
                >
                  <i [class]="showPassword ? 'ph-bold ph-eye-slash' : 'ph-bold ph-eye'"></i>
                </button>
              </div>
            </div>

            <!-- Submit Button -->
            <button 
              type="submit"
              [disabled]="isSubmitting"
              class="btn-tactile w-full py-3 px-4 rounded-xl bg-terracotta-600 hover:bg-terracotta-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-terracotta-600/30 transition cursor-pointer disabled:opacity-50 mt-2"
            >
              @if (isSubmitting) {
                <i class="ph-bold ph-spinner animate-spin text-lg"></i>
                <span>Đang xử lý...</span>
              } @else {
                <i [class]="activeTab() === 'login' ? 'ph-bold ph-sign-in' : 'ph-bold ph-user-plus'" class="text-lg"></i>
                <span>{{ activeTab() === 'login' ? 'Đăng nhập ngay' : 'Đăng ký tài khoản' }}</span>
              }
            </button>
          </form>

        </div>
      </div>
    }
  `
})
export class AuthModalComponent implements OnInit {
  readonly authService = inject(AuthService);
  readonly audioService = inject(AudioService);
  readonly toast = inject(ToastService);

  activeTab = signal<'login' | 'register'>('login');
  errorMessage = signal<string | null>(null);
  isGoogleRendered = signal<boolean>(false);
  isSubmitting = false;
  showPassword = false;

  username = '';
  password = '';
  email = '';
  fullName = '';

  constructor() {
    effect(() => {
      const isOpen = this.authService.isAuthModalOpen();
      const clientId = this.getEffectiveGoogleClientId();
      if (isOpen && clientId) {
        setTimeout(() => this.initGoogleClient(), 100);
      }
    });
  }

  ngOnInit(): void {
    this.initGoogleClient();
  }

  private getEffectiveGoogleClientId(): string {
    return this.authService.googleClientId() || environment.googleClientId || '';
  }

  private initGoogleClient(): void {
    const clientId = this.getEffectiveGoogleClientId();
    if (!clientId) return;

    // Load Google Identity Services script dynamically if not present
    if (typeof google === 'undefined' || !google.accounts) {
      if (!document.getElementById('google-jssdk')) {
        const script = document.createElement('script');
        script.id = 'google-jssdk';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => this.setupGooglePrompt(clientId);
        document.head.appendChild(script);
      }
    } else {
      this.setupGooglePrompt(clientId);
    }
  }

  private setupGooglePrompt(clientId: string): void {
    try {
      google.accounts.id.initialize({
        client_id: clientId,
        callback: (res: any) => this.handleGoogleCredentialResponse(res)
      });

      const container = document.getElementById('googleBtnContainer');
      if (container) {
        container.innerHTML = '';
        google.accounts.id.renderButton(container, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          shape: 'rectangular',
          text: 'continue_with',
          logo_alignment: 'left',
          width: 360
        });
        this.isGoogleRendered.set(true);
      }
    } catch (e) {
      console.warn('Google Identity Services init error:', e);
    }
  }

  handleGoogleSignInClick(): void {
    this.audioService.play('click');
    let clientId = this.getEffectiveGoogleClientId();
    if (!clientId) {
      this.toast.show('Đang tải cấu hình Google từ máy chủ...', 'info');
      this.authService.fetchAuthConfig().subscribe({
        next: (cfg) => {
          if (cfg?.googleClientId) {
            this.setupGooglePrompt(cfg.googleClientId);
            this.triggerGooglePrompt();
          } else {
            this.toast.show('Chưa cấu hình GOOGLE_CLIENT_ID trong quiz-service/.env!', 'warning');
          }
        },
        error: () => {
          this.toast.show('Không thể kết nối đến máy chủ để lấy cấu hình đăng nhập!', 'warning');
        }
      });
      return;
    }

    if (typeof google !== 'undefined' && google.accounts?.id) {
      this.setupGooglePrompt(clientId);
      this.triggerGooglePrompt();
    } else {
      this.toast.show('Đang khởi tạo dịch vụ Google...', 'info');
      this.initGoogleClient();
    }
  }

  private triggerGooglePrompt(): void {
    try {
      google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed()) {
          console.warn('Google One Tap suppressed:', notification.getNotDisplayedReason());
        }
      });
    } catch (e) {
      console.warn('Google prompt invocation error:', e);
    }
  }

  private handleGoogleCredentialResponse(response: any): void {
    if (response && response.credential) {
      this.isSubmitting = true;
      this.authService.loginWithGoogle(response.credential).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.close();
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error('Google login failed:', err);
          this.errorMessage.set(err?.error?.message || 'Đăng nhập Google thất bại!');
        }
      });
    }
  }

  switchTab(tab: 'login' | 'register'): void {
    this.activeTab.set(tab);
    this.errorMessage.set(null);
    this.audioService.play('type');
  }

  close(): void {
    this.authService.closeAuthModal();
    this.errorMessage.set(null);
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  onSubmit(): void {
    this.errorMessage.set(null);

    if (!this.username.trim() || !this.password.trim()) {
      this.errorMessage.set('Vui lòng điền đầy đủ tên đăng nhập và mật khẩu!');
      return;
    }

    this.isSubmitting = true;
    this.audioService.play('type');

    if (this.activeTab() === 'login') {
      this.authService.login({
        username: this.username.trim(),
        password: this.password.trim()
      }).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.username = '';
          this.password = '';
        },
        error: (err) => {
          this.isSubmitting = false;
          console.warn('Login error:', err);
          const msg = err?.error?.message || 'Tên đăng nhập hoặc mật khẩu không chính xác!';
          this.errorMessage.set(msg);
          this.toast.show(msg, 'warning');
        }
      });
    } else {
      this.authService.register({
        username: this.username.trim(),
        password: this.password.trim(),
        email: this.email.trim() || undefined,
        fullName: this.fullName.trim() || undefined
      }).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.username = '';
          this.password = '';
          this.email = '';
          this.fullName = '';
        },
        error: (err) => {
          this.isSubmitting = false;
          console.warn('Register error:', err);
          const msg = err?.error?.message || 'Không thể đăng ký tài khoản!';
          this.errorMessage.set(msg);
          this.toast.show(msg, 'warning');
        }
      });
    }
  }
}
