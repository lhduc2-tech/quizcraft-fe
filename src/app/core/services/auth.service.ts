import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, GoogleLoginPayload, LoginPayload, RegisterPayload, UserProfile } from '../models/user.model';
import { ToastService } from './toast.service';
import { AudioService } from './audio.service';

const TOKEN_KEY = 'quizcraft_token';
const USER_KEY = 'quizcraft_user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastService);
  private readonly audioService = inject(AudioService);

  private readonly baseUrl = environment.apiUrl || 'http://localhost:8080/api';

  readonly token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  readonly currentUser = signal<UserProfile | null>(this.loadStoredUser());
  readonly isLoggedIn = computed(() => !!this.currentUser());
  readonly isAuthModalOpen = signal<boolean>(false);
  readonly googleClientId = signal<string>('');

  constructor() {
    this.fetchAuthConfig().subscribe({
      error: (err) => console.warn('Failed to load auth config from backend:', err)
    });
    if (this.token()) {
      this.fetchCurrentUser();
    }
  }

  fetchAuthConfig(): Observable<{ googleClientId?: string }> {
    return this.http.get<{ googleClientId?: string }>(`${this.baseUrl}/auth/config`).pipe(
      tap((cfg) => {
        if (cfg && cfg.googleClientId) {
          this.googleClientId.set(cfg.googleClientId);
        }
      })
    );
  }

  private loadStoredUser(): UserProfile | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserProfile;
    } catch {
      return null;
    }
  }

  openAuthModal(): void {
    this.audioService.play('paper');
    this.isAuthModalOpen.set(true);
  }

  closeAuthModal(): void {
    this.audioService.play('click');
    this.isAuthModalOpen.set(false);
  }

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, payload).pipe(
      tap((res) => {
        this.handleAuthSuccess(res, 'Đăng nhập thành công! Chào mừng bạn trở lại.');
      })
    );
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, payload).pipe(
      tap((res) => {
        this.handleAuthSuccess(res, 'Đăng ký tài khoản thành công! Bắt đầu ôn tập nhé.');
      })
    );
  }

  loginWithGoogle(idToken: string): Observable<AuthResponse> {
    const body: GoogleLoginPayload = { idToken };
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/google`, body).pipe(
      tap((res) => {
        this.handleAuthSuccess(res, 'Đăng nhập Google thành công!');
      })
    );
  }

  logout(): void {
    const currentToken = this.token();
    if (currentToken) {
      this.http.post(`${this.baseUrl}/auth/logout`, {}).subscribe({
        next: () => {},
        error: () => {}
      });
    }

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.token.set(null);
    this.currentUser.set(null);
    this.audioService.play('paper');
    this.toast.show('Đã đăng xuất tài khoản.', 'info');
  }

  fetchCurrentUser(): void {
    this.http.get<UserProfile>(`${this.baseUrl}/auth/me`).subscribe({
      next: (user) => {
        this.currentUser.set(user);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      },
      error: () => {
        // Token expired or blacklisted
        this.clearSession();
      }
    });
  }

  clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.token.set(null);
    this.currentUser.set(null);
  }

  private handleAuthSuccess(res: AuthResponse, successMessage: string): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this.token.set(res.token);
    this.currentUser.set(res.user);
    this.isAuthModalOpen.set(false);
    this.audioService.play('complete');
    this.toast.show(successMessage, 'check');
  }
}
