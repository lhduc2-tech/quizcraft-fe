import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuizStateService } from '../../core/services/quiz-state.service';
import { AudioService } from '../../core/services/audio.service';
import { QuestionItem } from '../../core/models/quiz.model';
import { QuizHistoryItem } from '../../core/models/history.model';

@Component({
  selector: 'app-review-deck',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (state.selectedReviewRecord(); as record) {
      <section class="max-w-3xl mx-auto space-y-6 animate-fadeIn">
        
        <!-- Top Review Header -->
        <div class="bg-white dark:bg-[#201D18] p-4 sm:p-5 rounded-2xl border border-paper-300/80 dark:border-paper-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
          
          <div class="flex items-center gap-3">
            <button 
              type="button"
              (click)="backToNotebook()" 
              title="Trở về bàn ghi chú" 
              class="p-2.5 rounded-xl border border-paper-200 dark:border-paper-800 hover:bg-paper-100 dark:hover:bg-paper-800 text-paper-700 dark:text-paper-300 transition cursor-pointer"
            >
              <i class="ph-bold ph-arrow-left text-lg"></i>
            </button>
            <div>
              <div class="flex items-center gap-2">
                <span class="washi-tape px-2 py-0.5 text-[10px] font-bold text-amber-900 uppercase tracking-widest rounded-sm">Xem lại bài ôn tập</span>
                <span class="text-xs text-paper-400 font-mono">{{ formatDate(record.createdAt) }}</span>
              </div>
              <h2 class="font-serif font-bold text-xl text-paper-900 dark:text-paper-50 mt-1 line-clamp-1">{{ record.deckTitle }}</h2>
            </div>
          </div>

          <div class="flex items-center gap-2.5">
            <div class="flex items-center gap-2">
              <span class="px-3 py-1.5 rounded-xl bg-sage-100 text-sage-800 dark:bg-sage-900/60 dark:text-sage-300 text-xs font-bold font-mono">
                {{ record.scorePercentage }}% ({{ record.correctAnswers }}/{{ record.totalQuestions }})
              </span>
              <span class="px-2.5 py-1.5 rounded-xl bg-paper-100 dark:bg-paper-800 text-paper-700 dark:text-paper-300 text-xs font-semibold">
                {{ record.difficulty }}
              </span>
            </div>
            <button 
              type="button"
              (click)="retake(record)" 
              class="btn-tactile px-4 py-2.5 rounded-xl bg-terracotta-600 hover:bg-terracotta-500 text-white text-xs font-bold shadow-md shadow-terracotta-600/20 transition flex items-center gap-1.5 cursor-pointer"
            >
              <i class="ph-bold ph-arrows-clockwise text-base"></i> Làm lại bài này
            </button>
          </div>
        </div>

        <!-- Question list container with user selected & correct options -->
        <div class="space-y-6">
          @for (q of parsedQuestions(); track $index) {
            @let idx = $index;
            @let selectedOpt = userAnswers()[idx];
            @let isAnswered = selectedOpt !== undefined && selectedOpt !== null;
            @let isRight = selectedOpt === q.correctIndex;

            <div class="bg-white dark:bg-[#201D18] rounded-3xl border-2 border-paper-300/80 dark:border-paper-800 p-6 sm:p-8 shadow-sm space-y-5">
              
              <!-- Card Header -->
              <div class="flex items-center justify-between pb-3 border-b border-paper-200 dark:border-paper-800">
                <div class="flex items-center gap-2">
                  <span 
                    [class]="isRight ? 'bg-sage-500' : (isAnswered ? 'bg-terracotta-500' : 'bg-paper-400')"
                    class="w-2.5 h-2.5 rounded-full"
                  ></span>
                  <span class="font-serif font-bold text-sm text-paper-900 dark:text-paper-100">
                    Câu hỏi {{ idx + 1 }} / {{ parsedQuestions().length }}
                  </span>
                </div>

                @if (isRight) {
                  <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sage-100 dark:bg-sage-950/60 text-sage-800 dark:text-sage-300 flex items-center gap-1 border border-sage-300 dark:border-sage-800">
                    <i class="ph-bold ph-check"></i> Đúng
                  </span>
                } @else if (isAnswered) {
                  <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-terracotta-100 dark:bg-terracotta-950/60 text-terracotta-800 dark:text-terracotta-300 flex items-center gap-1 border border-terracotta-300 dark:border-terracotta-800">
                    <i class="ph-bold ph-x"></i> Sai
                  </span>
                } @else {
                  <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-paper-200 dark:bg-paper-800 text-paper-600 dark:text-paper-400">
                    Chưa trả lời
                  </span>
                }
              </div>

              <!-- Question Text -->
              <h3 class="font-serif text-base sm:text-lg font-bold text-paper-900 dark:text-paper-50 leading-snug">
                {{ q.question }}
              </h3>

              <!-- Options List -->
              <div class="space-y-2.5 pt-1">
                @for (opt of q.options; track $index) {
                  @let optIdx = $index;
                  @let isCorrectAnswer = optIdx === q.correctIndex;
                  @let isUserChoice = optIdx === selectedOpt;

                  <div [class]="getReviewOptionClass(isCorrectAnswer, isUserChoice)" class="w-full p-3.5 rounded-2xl border text-left text-xs sm:text-sm font-medium transition flex items-start gap-3">
                    <span [class]="getReviewBadgeClass(isCorrectAnswer, isUserChoice)" class="w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0">
                      {{ letters[optIdx] }}
                    </span>
                    <span class="flex-1 pt-0.5 leading-relaxed">{{ opt }}</span>

                    @if (isCorrectAnswer && isUserChoice) {
                      <span class="ml-auto text-[11px] font-bold px-2.5 py-1 rounded-lg bg-sage-200 dark:bg-sage-800 text-sage-900 dark:text-sage-200 shrink-0 flex items-center gap-1">
                        <i class="ph-bold ph-check"></i> Bạn đã chọn (Đúng)
                      </span>
                    } @else if (isUserChoice && !isCorrectAnswer) {
                      <span class="ml-auto text-[11px] font-bold px-2.5 py-1 rounded-lg bg-terracotta-200 dark:bg-terracotta-800 text-terracotta-900 dark:text-terracotta-200 shrink-0 flex items-center gap-1">
                        <i class="ph-bold ph-x"></i> Bạn đã chọn (Sai)
                      </span>
                    } @else if (isCorrectAnswer) {
                      <span class="ml-auto text-[11px] font-bold px-2.5 py-1 rounded-lg bg-sage-100 dark:bg-sage-900 text-sage-800 dark:text-sage-300 shrink-0 flex items-center gap-1">
                        <i class="ph-bold ph-check"></i> Đáp án đúng
                      </span>
                    }
                  </div>
                }
              </div>

              <!-- Explanation Box -->
              <div 
                [class]="isRight 
                  ? 'bg-sage-50/80 dark:bg-sage-950/30 border-sage-300 dark:border-sage-800 text-sage-950 dark:text-sage-200' 
                  : 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200'"
                class="p-4 sm:p-5 rounded-2xl border text-xs sm:text-sm leading-relaxed space-y-3"
              >
                <!-- CRITICAL: Wrong answer explanation callout -->
                @if (!isRight && isAnswered && selectedOpt !== undefined && selectedOpt !== null && q.optionExplanations && q.optionExplanations[selectedOpt]) {
                  <div class="p-3 sm:p-3.5 rounded-xl bg-terracotta-50/90 dark:bg-terracotta-950/40 border border-terracotta-200 dark:border-terracotta-800/80 text-terracotta-950 dark:text-terracotta-100">
                    <div class="flex items-center gap-1.5 font-bold text-terracotta-700 dark:text-terracotta-300 text-xs mb-1">
                      <i class="ph-bold ph-warning-circle text-sm shrink-0"></i>
                      <span>Tại sao lựa chọn [{{ letters[selectedOpt] }}] của bạn chưa đúng:</span>
                    </div>
                    <p class="text-terracotta-900 dark:text-terracotta-200 font-sans leading-relaxed text-xs sm:text-xs">
                      {{ q.optionExplanations[selectedOpt] }}
                    </p>
                  </div>
                }

                <!-- Correct Explanation -->
                <div>
                  <div 
                    [class]="isRight ? 'text-sage-700 dark:text-sage-300' : 'text-amber-700 dark:text-amber-300'"
                    class="flex items-center gap-2 font-bold mb-1"
                  >
                    <i [class]="isRight ? 'ph-bold ph-check-circle' : 'ph-bold ph-book-bookmark'" class="text-base"></i>
                    <span>{{ isRight ? 'Lựa chọn chính xác!' : 'Giải thích luận điểm đúng:' }}</span>
                  </div>
                  <p class="text-paper-800 dark:text-paper-200 font-sans">{{ q.explanation }}</p>
                </div>

                <!-- Memory hook -->
                @if (q.memoryHook) {
                  <div class="pt-2 border-t border-dashed border-paper-300/60 dark:border-paper-700/60 font-hand text-base text-amber-800 dark:text-amber-300">
                    {{ q.memoryHook }}
                  </div>
                }
              </div>

            </div>
          }
        </div>

        <!-- Bottom Review Controls -->
        <div class="flex items-center justify-between pt-2">
          <button 
            type="button"
            (click)="backToNotebook()" 
            class="px-5 py-2.5 rounded-xl border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 text-paper-800 dark:text-paper-200 text-xs font-bold hover:bg-paper-100 transition flex items-center gap-1.5 cursor-pointer"
          >
            <i class="ph-bold ph-arrow-left text-sm"></i> Về bàn ghi chú
          </button>
          <button 
            type="button"
            (click)="retake(record)" 
            class="btn-tactile px-6 py-2.5 rounded-xl bg-terracotta-600 hover:bg-terracotta-500 text-white text-xs font-bold shadow-md shadow-terracotta-600/20 transition flex items-center gap-1.5 cursor-pointer"
          >
            <i class="ph-bold ph-arrows-clockwise text-base"></i> Luyện tập lại bài này
          </button>
        </div>

      </section>
    }
  `
})
export class ReviewDeckComponent {
  readonly state = inject(QuizStateService);
  readonly audioService = inject(AudioService);

  readonly letters = ['A', 'B', 'C', 'D'];

  readonly parsedQuestions = computed<QuestionItem[]>(() => {
    const r = this.state.selectedReviewRecord();
    if (!r) return [];
    if (typeof r.detailJson === 'string') {
      try {
        const parsed = JSON.parse(r.detailJson);
        return parsed.questions || [];
      } catch (e) {
        console.error('JSON parse error', e);
        return [];
      }
    } else if (r.detailJson && r.detailJson.questions) {
      return r.detailJson.questions;
    }
    return [];
  });

  readonly userAnswers = computed<Record<number, number>>(() => {
    const r = this.state.selectedReviewRecord();
    if (!r) return {};
    if (typeof r.detailJson === 'string') {
      try {
        const parsed = JSON.parse(r.detailJson);
        return parsed.userAnswers || {};
      } catch {
        return {};
      }
    } else if (r.detailJson && r.detailJson.userAnswers) {
      return r.detailJson.userAnswers;
    }
    return {};
  });

  formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  }

  retake(record: QuizHistoryItem): void {
    this.state.retakeFromReview(record);
  }

  backToNotebook(): void {
    this.state.setView('notebook');
    this.audioService.play('paper');
  }

  getReviewOptionClass(isCorrectAnswer: boolean, isUserChoice: boolean): string {
    if (isCorrectAnswer && isUserChoice) {
      return 'bg-sage-50 dark:bg-sage-950/40 border-2 border-sage-600 text-sage-950 dark:text-sage-100 shadow-sm';
    }
    if (isUserChoice && !isCorrectAnswer) {
      return 'bg-terracotta-50 dark:bg-terracotta-950/40 border-2 border-terracotta-600 text-terracotta-950 dark:text-terracotta-100 shadow-sm';
    }
    if (isCorrectAnswer) {
      return 'bg-sage-50/60 dark:bg-sage-950/30 border-2 border-dashed border-sage-500 text-sage-900 dark:text-sage-200';
    }
    return 'bg-paper-50/70 dark:bg-paper-900/30 border-paper-200 dark:border-paper-800/80 text-paper-700 dark:text-paper-400 opacity-75';
  }

  getReviewBadgeClass(isCorrectAnswer: boolean, isUserChoice: boolean): string {
    if (isCorrectAnswer && isUserChoice) {
      return 'bg-sage-600 text-white';
    }
    if (isUserChoice && !isCorrectAnswer) {
      return 'bg-terracotta-600 text-white';
    }
    if (isCorrectAnswer) {
      return 'bg-sage-500 text-white';
    }
    return 'bg-paper-200 dark:bg-paper-800 text-paper-600 dark:text-paper-400';
  }
}
