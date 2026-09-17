import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (toastService.currentToast().visible) {
      <div 
        class="fixed bottom-6 right-6 z-50 transform transition-all duration-300 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl bg-paper-900 dark:bg-paper-50 text-paper-50 dark:text-paper-900 border border-paper-700 dark:border-paper-200 text-sm font-semibold"
      >
        <i 
          class="text-xl"
          [class.ph-check-circle]="toastService.currentToast().type === 'check'"
          [class.text-sage-400]="toastService.currentToast().type === 'check'"
          [class.ph-warning-circle]="toastService.currentToast().type === 'warning'"
          [class.text-terracotta-400]="toastService.currentToast().type === 'warning'"
          [class.ph-info]="toastService.currentToast().type === 'info'"
          [class.text-amber-400]="toastService.currentToast().type === 'info'"
          class="ph-fill"
        ></i>
        <span>{{ toastService.currentToast().message }}</span>
      </div>
    }
  `
})
export class ToastComponent {
  readonly toastService = inject(ToastService);
}
