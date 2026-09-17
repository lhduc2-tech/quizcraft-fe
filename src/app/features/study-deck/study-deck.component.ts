import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuizStateService } from '../../core/services/quiz-state.service';
import { AudioService } from '../../core/services/audio.service';
import { QuestionItem } from '../../core/models/quiz.model';

@Component({
  selector: 'app-study-deck',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (state.activeDeck(); as deck) {
      <section class="max-w-3xl mx-auto space-y-6 animate-fadeIn">
        
        <!-- Top Deck Header -->
        <div class="bg-white dark:bg-[#201D18] p-4 sm:p-5 rounded-2xl border border-paper-300/80 dark:border-paper-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
          
          <div class="flex items-center gap-3">
            <button 
              type="button"
              (click)="exitDeck()" 
              title="Trở về bàn ghi chú" 
              class="p-2.5 rounded-xl border border-paper-200 dark:border-paper-800 hover:bg-paper-100 dark:hover:bg-paper-800 text-paper-700 dark:text-paper-300 transition cursor-pointer"
            >
              <i class="ph-bold ph-arrow-left text-lg"></i>
            </button>
            <div>
              <h2 class="font-serif font-bold text-lg text-paper-900 dark:text-paper-50 line-clamp-1">{{ deck.title }}</h2>
              <div class="flex items-center gap-2 text-xs text-paper-400 font-medium mt-0.5">
                <span class="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 font-bold">
                  {{ deck.difficulty }}
                </span>
                <span>•</span>
                <span><i class="ph ph-stopwatch"></i> {{ formattedTime() }}</span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <!-- Card step indicator -->
            <div class="px-3 py-1 rounded-xl bg-paper-100 dark:bg-paper-800 border border-paper-300 dark:border-paper-700 text-xs font-bold text-paper-800 dark:text-paper-200 font-mono">
              @if (deck.playMode === 'flashcard') {
                Thẻ <span>{{ state.currentQuestionIndex() + 1 }}</span>/<span>{{ deck.questions.length }}</span>
              } @else {
                Đã làm <span>{{ answeredCount() }}</span>/<span>{{ deck.questions.length }}</span>
              }
            </div>
          </div>

        </div>

        <!-- Tea cup style progress bar -->
        <div class="w-full bg-paper-200 dark:bg-paper-800 h-2.5 rounded-full overflow-hidden p-0.5">
          <div 
            class="h-full bg-gradient-to-r from-amber-400 to-terracotta-500 rounded-full transition-all duration-300"
            [style.width.%]="deck.playMode === 'flashcard' 
              ? ((state.currentQuestionIndex() + 1) / deck.questions.length) * 100 
              : (answeredCount() / deck.questions.length) * 100"
          ></div>
        </div>

        <!-- Question list or Flashcard container -->
        <div class="space-y-6">
          @if (deck.playMode === 'flashcard') {
            @if (deck.questions[state.currentQuestionIndex()]; as q) {
              <ng-container *ngTemplateOutlet="cardTpl; context: { q: q, idx: state.currentQuestionIndex(), isFlashcard: true }"></ng-container>
            }
          } @else {
            @for (q of deck.questions; track $index) {
              <ng-container *ngTemplateOutlet="cardTpl; context: { q: q, idx: $index, isFlashcard: false }"></ng-container>
            }
          }
        </div>

        <!-- Bottom controls -->
        <div class="flex items-center justify-between pt-2">
          @if (deck.playMode === 'flashcard') {
            <button 
              type="button"
              (click)="state.prevQuestion()"
              [disabled]="state.currentQuestionIndex() === 0"
              class="px-5 py-2.5 rounded-xl border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 text-paper-800 dark:text-paper-200 text-xs font-bold hover:bg-paper-100 dark:hover:bg-paper-700 transition flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
            >
              <i class="ph-bold ph-caret-left text-sm"></i> Thẻ trước
            </button>

            <div class="flex items-center gap-3 ml-auto">
              @if (state.currentQuestionIndex() < deck.questions.length - 1) {
                <button 
                  type="button"
                  (click)="state.nextQuestion()"
                  class="btn-tactile px-6 py-2.5 rounded-xl bg-terracotta-600 hover:bg-terracotta-500 text-white text-xs font-bold shadow-md shadow-terracotta-600/20 transition flex items-center gap-1.5 cursor-pointer"
                >
                  Thẻ kế tiếp <i class="ph-bold ph-caret-right text-sm"></i>
                </button>
              } @else {
                <button 
                  type="button"
                  (click)="finish()"
                  class="btn-tactile px-7 py-3 rounded-xl bg-sage-600 hover:bg-sage-500 text-white text-xs font-bold shadow-md shadow-sage-600/20 transition flex items-center gap-2 cursor-pointer"
                >
                  <i class="ph-bold ph-check text-base"></i> Hoàn thành & Chấm điểm
                </button>
              }
            </div>
          } @else {
            <div class="w-full flex justify-end">
              <button 
                type="button"
                (click)="finish()"
                class="btn-tactile px-8 py-3 rounded-2xl bg-terracotta-600 hover:bg-terracotta-500 text-white font-bold text-sm shadow-md shadow-terracotta-600/20 transition flex items-center gap-2 cursor-pointer"
              >
                <i class="ph-bold ph-check text-base"></i> Hoàn thành & Chấm điểm
              </button>
            </div>
          }
        </div>

      </section>

      <!-- Card Template -->
      <ng-template #cardTpl let-q="q" let-idx="idx" let-isFlashcard="isFlashcard">
        <div class="bg-white dark:bg-[#201D18] rounded-3xl border-2 border-paper-300/80 dark:border-paper-800 p-6 sm:p-8 shadow-sm space-y-5">
          
          <!-- Card Header -->
          <div class="flex items-start gap-3">
            <span class="w-7 h-7 rounded-xl bg-paper-100 dark:bg-paper-800 text-paper-700 dark:text-paper-300 font-bold text-xs flex items-center justify-center shrink-0 border border-paper-300 dark:border-paper-700">
              {{ idx + 1 }}
            </span>
            <h3 class="font-serif font-bold text-base sm:text-lg text-paper-900 dark:text-paper-50 leading-snug pt-0.5">
              {{ q.question }}
            </h3>
          </div>

          <!-- Options List -->
          <div class="grid grid-cols-1 gap-3 pt-1">
            @for (opt of q.options; track $index) {
              @let optIdx = $index;
              @let selected = state.userAnswers()[idx];
              @let isRevealed = isFlashcard ? state.revealedFlashcards()[idx] : false;
              @let isChoice = selected === optIdx;
              @let isCorrect = optIdx === q.correctIndex;

              <button 
                type="button"
                (click)="selectOpt(idx, optIdx)"
                [disabled]="isRevealed && isFlashcard"
                [class]="getBtnClass(isRevealed, isChoice, isCorrect)"
              >
                <span [class]="getBadgeClass(isRevealed, isChoice, isCorrect)">
                  {{ letters[optIdx] }}
                </span>
                <span class="flex-1 pt-0.5 leading-relaxed">{{ opt }}</span>
                @if (isRevealed && isCorrect) {
                  <i class="ph-bold ph-check-circle text-sage-600 text-xl shrink-0"></i>
                }
                @if (isRevealed && isChoice && !isCorrect) {
                  <i class="ph-bold ph-x-circle text-terracotta-600 text-xl shrink-0"></i>
                }
              </button>
            }
          </div>

          <!-- Explanation (Flashcard mode when revealed) -->
          @if (isFlashcard && state.revealedFlashcards()[idx]) {
            @let selected = state.userAnswers()[idx];
            @let isRight = selected === q.correctIndex;

            <div 
              [class]="isRight 
                ? 'bg-sage-50/70 dark:bg-sage-950/30 border-sage-300 dark:border-sage-800 text-sage-950 dark:text-sage-200' 
                : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200'"
              class="p-4 sm:p-5 rounded-2xl border text-xs sm:text-sm leading-relaxed space-y-3 animate-fadeIn"
            >
              <!-- Wrong choice explanation -->
              @if (!isRight && selected !== undefined && selected !== null && q.optionExplanations && q.optionExplanations[selected]) {
                <div class="p-3 sm:p-3.5 rounded-xl bg-terracotta-50/90 dark:bg-terracotta-950/40 border border-terracotta-200 dark:border-terracotta-800/80 text-terracotta-950 dark:text-terracotta-100">
                  <div class="flex items-center gap-1.5 font-bold text-terracotta-700 dark:text-terracotta-300 text-xs mb-1">
                    <i class="ph-bold ph-warning-circle text-sm shrink-0"></i>
                    <span>Tại sao lựa chọn [{{ letters[selected] }}] của bạn chưa đúng:</span>
                  </div>
                  <p class="text-terracotta-900 dark:text-terracotta-200 font-sans leading-relaxed text-xs sm:text-xs">
                    {{ q.optionExplanations[selected] }}
                  </p>
                </div>
              }

              <!-- Correct explanation -->
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
          }

        </div>
      </ng-template>
    }
  `
})
export class StudyDeckComponent {
  readonly state = inject(QuizStateService);
  readonly audioService = inject(AudioService);

  readonly letters = ['A', 'B', 'C', 'D'];

  readonly formattedTime = computed(() => {
    const s = this.state.timerSeconds();
    const mins = String(Math.floor(s / 60)).padStart(2, '0');
    const secs = String(s % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  });

  readonly answeredCount = computed(() => {
    return Object.keys(this.state.userAnswers()).length;
  });

  selectOpt(questionIdx: number, optionIdx: number): void {
    this.state.selectOption(questionIdx, optionIdx);
  }

  finish(): void {
    this.state.finishQuiz();
  }

  exitDeck(): void {
    this.state.setView('notebook');
    this.audioService.play('paper');
  }

  getBtnClass(isRevealed: boolean, isChoice: boolean, isCorrect: boolean): string {
    let cls = 'btn-tactile group flex items-start gap-3.5 p-3.5 sm:p-4 rounded-2xl border text-xs sm:text-sm font-medium cursor-pointer transition text-left ';
    if (isRevealed) {
      if (isCorrect) {
        cls += 'bg-sage-50 dark:bg-sage-950/40 border-sage-500 text-sage-900 dark:text-sage-200 ring-2 ring-sage-500';
      } else if (isChoice && !isCorrect) {
        cls += 'bg-terracotta-50 dark:bg-terracotta-950/40 border-terracotta-500 text-terracotta-900 dark:text-terracotta-200 ring-2 ring-terracotta-500';
      } else {
        cls += 'bg-paper-50/50 dark:bg-paper-900/30 border-paper-200 dark:border-paper-800 text-paper-400 opacity-60';
      }
    } else {
      if (isChoice) {
        cls += 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-paper-900 dark:text-paper-100 ring-2 ring-amber-500';
      } else {
        cls += 'bg-paper-50 dark:bg-paper-900/40 border-paper-300 dark:border-paper-800 hover:border-amber-400 text-paper-800 dark:text-paper-200';
      }
    }
    return cls;
  }

  getBadgeClass(isRevealed: boolean, isChoice: boolean, isCorrect: boolean): string {
    let cls = 'w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ';
    if (isRevealed && isCorrect) {
      cls += 'bg-sage-600 text-white';
    } else if (isRevealed && isChoice && !isCorrect) {
      cls += 'bg-terracotta-600 text-white';
    } else if (isChoice) {
      cls += 'bg-amber-500 text-paper-950';
    } else {
      cls += 'bg-paper-200 dark:bg-paper-800 text-paper-700 dark:text-paper-300';
    }
    return cls;
  }
}
