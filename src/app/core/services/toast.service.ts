import { Injectable, signal } from '@angular/core';

export interface ToastInfo {
  message: string;
  type: 'check' | 'warning' | 'info';
  visible: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  readonly currentToast = signal<ToastInfo>({
    message: '',
    type: 'info',
    visible: false
  });

  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  show(message: string, type: 'check' | 'warning' | 'info' = 'info'): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.currentToast.set({
      message,
      type,
      visible: true
    });

    this.timeoutId = setTimeout(() => {
      this.currentToast.update(t => ({ ...t, visible: false }));
    }, 3200);
  }
}
