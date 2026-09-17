import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuizStateService } from '../../core/services/quiz-state.service';
import { AudioService } from '../../core/services/audio.service';
import { QuizHistoryItem } from '../../core/models/history.model';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Overlay -->
    <div 
      [class.hidden]="!state.isHistoryDrawerOpen()"
      (click)="state.toggleHistoryDrawer(false)"
      class="fixed inset-0 bg-paper-900/40 dark:bg-black/60 backdrop-blur-sm z-40 transition-opacity"
    ></div>

    <!-- Slide-out Sidebar Drawer -->
    <aside 
      [class.translate-x-full]="!state.isHistoryDrawerOpen()"
      [class.translate-x-0]="state.isHistoryDrawerOpen()"
      class="fixed top-0 right-0 bottom-0 w-full sm:w-96 bg-paper-50 dark:bg-[#1E1B16] z-50 border-l-2 border-paper-300 dark:border-paper-800 shadow-2xl transition-transform duration-300 flex flex-col"
    >
      
      <!-- Drawer Header -->
      <div class="p-5 border-b border-paper-200 dark:border-paper-800 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <i class="ph-bold ph-notebook text-terracotta-600 text-xl"></i>
          <h3 class="font-serif font-bold text-lg text-paper-900 dark:text-paper-50">Nhật ký ôn tập</h3>
        </div>
        <button 
          type="button"
          (click)="state.toggleHistoryDrawer(false)" 
          class="p-2 rounded-xl hover:bg-paper-200 dark:hover:bg-paper-800 text-paper-500 transition cursor-pointer"
        >
          <i class="ph-bold ph-x text-lg"></i>
        </button>
      </div>

      <!-- History card items -->
      <div class="flex-1 overflow-y-auto p-4 space-y-3">
        @if (state.historyList().length === 0) {
          <div class="text-center py-16 text-paper-400 space-y-2">
            <i class="ph-thin ph-bookmark-simple text-4xl block mx-auto"></i>
            <p class="text-xs">Chưa có đề ôn tập nào được lưu lại.</p>
          </div>
        } @else {
          @for (d of state.historyList(); track d.id || $index) {
            <div 
              (click)="openReview(d)"
              class="p-3.5 rounded-2xl border border-paper-300 dark:border-paper-800 bg-white dark:bg-paper-800/40 hover:border-terracotta-400 transition space-y-2 cursor-pointer group shadow-sm"
            >
              <div class="flex items-start justify-between gap-2">
                <h4 class="font-serif font-bold text-sm text-paper-900 dark:text-paper-100 group-hover:text-terracotta-600 transition line-clamp-1">
                  {{ d.deckTitle }}
                </h4>
                <span 
                  [class]="d.scorePercentage >= 80 
                    ? 'bg-sage-100 text-sage-800 dark:bg-sage-900/60 dark:text-sage-300' 
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'"
                  class="text-[10px] font-extrabold px-2 py-0.5 rounded font-mono shrink-0"
                >
                  {{ d.scorePercentage }}% ({{ d.correctAnswers }}/{{ d.totalQuestions }})
                </span>
              </div>
              <p class="text-xs text-paper-400 line-clamp-2 font-sans">
                {{ d.noteSnippet }}
              </p>
              <div class="flex items-center justify-between text-[11px] text-paper-400 pt-1 font-mono">
                <span>{{ formatDate(d.createdAt) }}</span>
                <div class="flex items-center gap-2">
                  <button 
                    type="button"
                    (click)="deleteItem(d.id, $event)"
                    class="p-1 text-paper-400 hover:text-terracotta-600 dark:hover:text-terracotta-400 transition cursor-pointer" 
                    title="Xóa bản ghi này"
                  >
                    <i class="ph-bold ph-trash"></i>
                  </button>
                  <span class="text-terracotta-600 dark:text-terracotta-400 font-sans font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Xem lại <i class="ph-bold ph-arrow-right"></i>
                  </span>
                </div>
              </div>
            </div>
          }
        }
      </div>

      <!-- Clear all history footer -->
      @if (state.historyList().length > 0) {
        <div class="p-4 border-t border-paper-200 dark:border-paper-800">
          <button 
            type="button"
            (click)="promptClearAll()" 
            class="btn-tactile w-full py-2.5 rounded-xl border border-dashed border-terracotta-300 dark:border-terracotta-800 text-terracotta-600 dark:text-terracotta-400 hover:bg-terracotta-50 dark:hover:bg-terracotta-950/30 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <i class="ph-bold ph-trash"></i> Xóa tất cả nhật ký
          </button>
        </div>
      }

    </aside>

    <!-- Custom Animated Confirmation Modal -->
    @if (isConfirmClearOpen()) {
      <div class="fixed inset-0 bg-paper-900/50 dark:bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
        <div class="bg-white dark:bg-[#201D18] rounded-3xl max-w-sm w-full border-2 border-paper-300 dark:border-paper-800 shadow-2xl p-6 sm:p-7 text-center space-y-5 relative animate-fadeIn">
          
          <!-- Decorative Stamp Icon -->
          <div class="w-16 h-16 mx-auto rounded-2xl bg-terracotta-50 dark:bg-terracotta-950/50 border-2 border-terracotta-200 dark:border-terracotta-800 text-terracotta-600 dark:text-terracotta-400 flex items-center justify-center shadow-sm transform -rotate-2">
            <i class="ph-bold ph-trash-simple text-3xl"></i>
          </div>

          <!-- Description -->
          <div class="space-y-2">
            <h4 class="font-serif font-bold text-xl text-paper-900 dark:text-paper-50">
              Dọn sạch nhật ký?
            </h4>
            <p class="text-xs text-paper-500 dark:text-paper-400 leading-relaxed">
              Tất cả các bản ghi điểm số và câu hỏi đã lưu sẽ bị xóa hoàn toàn khỏi cơ sở dữ liệu.
            </p>
          </div>

          <!-- Buttons -->
          <div class="grid grid-cols-2 gap-3 pt-1">
            <button 
              type="button"
              (click)="cancelClearAll()"
              class="py-2.5 px-4 rounded-xl border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 text-paper-700 dark:text-paper-300 font-bold text-xs hover:bg-paper-100 dark:hover:bg-paper-700 transition cursor-pointer"
            >
              Giữ lại
            </button>
            <button 
              type="button"
              (click)="confirmClearAll()"
              class="btn-tactile py-2.5 px-4 rounded-xl bg-terracotta-600 hover:bg-terracotta-500 text-white font-bold text-xs shadow-md shadow-terracotta-600/20 transition cursor-pointer"
            >
              Xác nhận xóa
            </button>
          </div>

        </div>
      </div>
    }
  `
})
export class HistoryComponent {
  readonly state = inject(QuizStateService);
  readonly audioService = inject(AudioService);

  readonly isConfirmClearOpen = signal<boolean>(false);

  formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN', {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  }

  openReview(item: QuizHistoryItem): void {
    this.state.openReviewDeck(item);
  }

  deleteItem(id?: number, event?: Event): void {
    this.state.deleteHistoryItem(id, event);
  }

  promptClearAll(): void {
    this.audioService.play('paper');
    this.isConfirmClearOpen.set(true);
  }

  cancelClearAll(): void {
    this.audioService.play('click');
    this.isConfirmClearOpen.set(false);
  }

  confirmClearAll(): void {
    this.isConfirmClearOpen.set(false);
    this.state.clearAllHistory();
  }
}
