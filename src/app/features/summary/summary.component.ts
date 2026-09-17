import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuizStateService } from '../../core/services/quiz-state.service';
import { AudioService } from '../../core/services/audio.service';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (state.quizResult(); as res) {
      <section class="max-w-xl mx-auto space-y-6 animate-fadeIn">
        
        <!-- Vintage Certificate Card -->
        <div class="bg-white dark:bg-[#201D18] rounded-3xl border-2 border-paper-300 dark:border-paper-800 p-7 sm:p-9 shadow-xl relative overflow-hidden text-center space-y-6">
          
          <!-- Ribbon sticker -->
          <div class="washi-tape absolute -top-1 left-1/2 -translate-x-1/2 px-6 py-1 text-[11px] font-bold text-amber-900 tracking-wider uppercase">
            Phiếu Đánh Giá Ôn Tập
          </div>

          <!-- Grade Stamp Badge -->
          <div [class]="getStampClass(res.percentage)">
            <span class="text-xs uppercase font-bold tracking-widest">Độ Nhớ</span>
            <span class="text-3xl font-extrabold leading-none">{{ res.percentage }}%</span>
          </div>

          <div class="space-y-2">
            <h2 class="font-serif font-bold text-2xl sm:text-3xl text-paper-900 dark:text-paper-50">
              {{ getTitle(res.percentage) }}
            </h2>
            <p class="text-xs sm:text-sm text-paper-800/80 dark:text-paper-300 font-medium">
              {{ getSubtitle(res.percentage, res.correct, res.total) }}
            </p>
          </div>

          <!-- Score metrics table -->
          <div class="grid grid-cols-3 gap-3 py-2">
            <div class="p-3.5 rounded-2xl bg-paper-100/80 dark:bg-paper-800/50 border border-paper-200 dark:border-paper-800">
              <div class="text-[10px] font-bold uppercase tracking-wider text-paper-400 mb-1">Số câu đúng</div>
              <div class="font-serif font-extrabold text-xl text-sage-600 dark:text-sage-400">{{ res.correct }}/{{ res.total }}</div>
            </div>
            <div class="p-3.5 rounded-2xl bg-paper-100/80 dark:bg-paper-800/50 border border-paper-200 dark:border-paper-800">
              <div class="text-[10px] font-bold uppercase tracking-wider text-paper-400 mb-1">Thời gian</div>
              <div class="font-serif font-extrabold text-xl text-amber-700 dark:text-amber-400">{{ formattedTime(res.timeSpent) }}</div>
            </div>
            <div class="p-3.5 rounded-2xl bg-paper-100/80 dark:bg-paper-800/50 border border-paper-200 dark:border-paper-800">
              <div class="text-[10px] font-bold uppercase tracking-wider text-paper-400 mb-1">Cần ôn lại</div>
              <div class="font-serif font-extrabold text-xl text-terracotta-600 dark:text-terracotta-400">{{ res.wrongIndices.length }}</div>
            </div>
          </div>

          <!-- Organic feedback card -->
          <div class="p-4 rounded-2xl bg-paper-100/70 dark:bg-paper-800/40 border border-paper-200 dark:border-paper-800 text-left text-xs leading-relaxed text-paper-800 dark:text-paper-200 flex items-start gap-3">
            <i class="ph-bold ph-chats-circle text-terracotta-600 text-xl shrink-0 mt-0.5"></i>
            <div>
              <div class="font-bold mb-0.5">Nhận xét từ gia sư AI:</div>
              <p class="text-paper-600 dark:text-paper-400">{{ getFeedbackText(res.percentage) }}</p>
            </div>
          </div>

          <!-- Call to actions -->
          <div class="space-y-3 pt-2">
            @if (res.wrongIndices.length > 0) {
              <button 
                type="button"
                (click)="retryWrong()"
                class="btn-tactile w-full py-3.5 px-4 rounded-2xl bg-terracotta-600 hover:bg-terracotta-500 text-white font-bold text-sm shadow-md shadow-terracotta-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <i class="ph-bold ph-repeat text-lg"></i>
                <span>Chỉ luyện lại câu sai ({{ res.wrongIndices.length }} câu)</span>
              </button>
            }

            <div class="grid grid-cols-2 gap-3">
              <button 
                type="button"
                (click)="retakeAll()"
                class="btn-tactile py-3 px-4 rounded-2xl border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 text-paper-800 dark:text-paper-200 font-bold text-xs hover:bg-paper-100 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <i class="ph-bold ph-arrows-clockwise text-base"></i> Làm lại từ đầu
              </button>
              <button 
                type="button"
                (click)="backToNotebook()"
                class="btn-tactile py-3 px-4 rounded-2xl bg-paper-900 dark:bg-paper-100 text-paper-50 dark:text-paper-900 font-bold text-xs hover:bg-paper-800 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <i class="ph-bold ph-pencil-line text-base"></i> Ghi chú mới
              </button>
            </div>
          </div>

        </div>

      </section>
    }
  `
})
export class SummaryComponent {
  readonly state = inject(QuizStateService);
  readonly audioService = inject(AudioService);

  formattedTime(seconds: number): string {
    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  }

  getStampClass(pct: number): string {
    if (pct === 100) {
      return 'w-24 h-24 mx-auto rounded-full border-4 border-dashed border-sage-600 flex flex-col items-center justify-center font-serif text-sage-600 dark:text-sage-400 p-2 transform rotate-2 mt-4';
    }
    if (pct >= 70) {
      return 'w-24 h-24 mx-auto rounded-full border-4 border-dashed border-amber-500 flex flex-col items-center justify-center font-serif text-amber-700 dark:text-amber-400 p-2 transform -rotate-3 mt-4';
    }
    return 'w-24 h-24 mx-auto rounded-full border-4 border-dashed border-terracotta-500 flex flex-col items-center justify-center font-serif text-terracotta-600 dark:text-terracotta-400 p-2 transform rotate-3 mt-4';
  }

  getTitle(pct: number): string {
    if (pct === 100) return 'Tuyệt đỉnh nhớ sâu!';
    if (pct >= 70) return 'Nắm bắt rất tốt!';
    return 'Cần củng cố thêm một chút!';
  }

  getSubtitle(pct: number, correct: number, total: number): string {
    if (pct === 100) return 'Bộ não của bạn đã hoàn thành xuất sắc lượt truy xuất kiến thức này.';
    if (pct >= 70) return `Bạn đã trả lời đúng ${correct}/${total} câu hỏi.`;
    return 'Sai lầm chính là khoảnh khắc não bộ mở rộng dung lượng tốt nhất.';
  }

  getFeedbackText(pct: number): string {
    if (pct === 100) {
      return 'Xuất sắc! Não bộ của bạn đã khắc ghi rất tốt. Hãy lên lịch ôn lại sau 3 ngày để kiến thức chuyển hẳn vào trí nhớ vĩnh viễn.';
    }
    if (pct >= 70) {
      return 'Chỉ còn một vài chi tiết nhỏ chưa kịp gợi nhớ. Hãy bấm nút "Chỉ luyện lại câu sai" để làm quen nốt nhé.';
    }
    return 'Đừng nản lòng! Đọc kỹ phần giải thích của từng câu sai rồi bấm thử lại, bạn sẽ thấy mọi thứ trở nên sáng tỏ tức thì.';
  }

  retryWrong(): void {
    this.state.retryWrongOnly();
  }

  retakeAll(): void {
    this.state.retakeEntireDeck();
  }

  backToNotebook(): void {
    this.state.setView('notebook');
    this.audioService.play('paper');
  }
}
