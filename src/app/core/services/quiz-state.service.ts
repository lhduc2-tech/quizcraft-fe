import { Injectable, computed, inject, signal, effect } from '@angular/core';
import confetti from 'canvas-confetti';
import { ActiveDeck, QuestionItem } from '../models/quiz.model';
import { QuizHistoryItem } from '../models/history.model';
import { AudioService } from './audio.service';
import { QuizApiService } from './quiz-api.service';
import { ToastService } from './toast.service';
import { AuthService } from './auth.service';

export type AppView = 'notebook' | 'loading' | 'study' | 'summary' | 'history' | 'review';

export interface QuizResult {
  total: number;
  correct: number;
  wrongIndices: number[];
  percentage: number;
  timeSpent: number;
}

@Injectable({
  providedIn: 'root'
})
export class QuizStateService {
  private readonly audioService = inject(AudioService);
  private readonly apiService = inject(QuizApiService);
  private readonly toast = inject(ToastService);
  private readonly authService = inject(AuthService);

  readonly currentView = signal<AppView>('notebook');

  // Notebook inputs
  readonly noteText = signal<string>('');
  readonly difficulty = signal<string>('Hiểu sâu');
  readonly questionCount = signal<number>(3);
  readonly playMode = signal<'flashcard' | 'standard'>('flashcard');

  // Active quiz session
  readonly activeDeck = signal<ActiveDeck | null>(null);
  readonly currentQuestionIndex = signal<number>(0);
  readonly userAnswers = signal<Record<number, number>>({});
  readonly revealedFlashcards = signal<Record<number, boolean>>({});
  readonly timerSeconds = signal<number>(0);
  private timerIntervalId: ReturnType<typeof setInterval> | null = null;

  // Results
  readonly quizResult = signal<QuizResult | null>(null);

  // History & Review
  readonly historyList = signal<QuizHistoryItem[]>([]);
  readonly historyCount = computed(() => this.historyList().length);
  readonly selectedReviewRecord = signal<QuizHistoryItem | null>(null);
  readonly isHistoryDrawerOpen = signal<boolean>(false);

  toggleHistoryDrawer(open?: boolean): void {
    const nextVal = open !== undefined ? open : !this.isHistoryDrawerOpen();
    this.isHistoryDrawerOpen.set(nextVal);
    this.audioService.play('paper');
  }

  constructor() {
    // Automatically load history when user logs in, and clear when logged out
    effect(() => {
      const loggedIn = this.authService.isLoggedIn();
      if (loggedIn) {
        this.fetchHistory();
      } else {
        this.historyList.set([]);
      }
    });
  }

  fetchHistory(): void {
    if (!this.authService.isLoggedIn()) {
      this.historyList.set([]);
      return;
    }

    this.apiService.getHistory().subscribe({
      next: (list) => {
        this.historyList.set(list || []);
      },
      error: (err) => {
        console.warn('Failed to load history from backend:', err);
      }
    });
  }

  deleteHistoryItem(id?: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (!id) return;

    this.apiService.deleteHistory(id).subscribe({
      next: () => {
        this.historyList.update(list => list.filter(item => item.id !== id));
        this.toast.show('Đã xóa bản ghi nhật ký.', 'check');
        this.audioService.play('click');
      },
      error: (err) => {
        console.error('Lỗi khi xóa bản ghi:', err);
        this.toast.show('Không thể xóa bản ghi.', 'warning');
      }
    });
  }

  clearAllHistory(): void {
    if (this.historyList().length === 0) return;

    this.apiService.clearAllHistory().subscribe({
      next: () => {
        this.historyList.set([]);
        this.toast.show('Đã xóa toàn bộ nhật ký ôn tập.', 'check');
        this.audioService.play('click');
      },
      error: (err) => {
        console.error('Lỗi khi xóa tất cả nhật ký:', err);
        this.toast.show('Không thể xóa nhật ký.', 'warning');
      }
    });
  }

  setView(view: AppView): void {
    this.currentView.set(view);
  }

  startQuizDeck(deck: ActiveDeck, resetTimer: boolean = true): void {
    this.activeDeck.set(deck);
    this.userAnswers.set({});
    this.revealedFlashcards.set({});
    this.currentQuestionIndex.set(0);
    this.quizResult.set(null);

    if (resetTimer) {
      this.timerSeconds.set(0);
      this.startTimer();
    }

    this.audioService.play('paper');
    this.setView('study');
  }

  selectOption(questionIdx: number, optionIdx: number): void {
    const current = { ...this.userAnswers() };
    current[questionIdx] = optionIdx;
    this.userAnswers.set(current);

    const deck = this.activeDeck();
    if (!deck) return;

    const q = deck.questions[questionIdx];
    const isCorrect = optionIdx === q.correctIndex;

    if (deck.playMode === 'flashcard') {
      const revealed = { ...this.revealedFlashcards() };
      revealed[questionIdx] = true;
      this.revealedFlashcards.set(revealed);

      if (isCorrect) {
        this.audioService.play('correct');
      } else {
        this.audioService.play('wrong');
      }
    } else {
      this.audioService.play('click');
    }
  }

  nextQuestion(): void {
    const deck = this.activeDeck();
    if (!deck) return;

    if (this.currentQuestionIndex() < deck.questions.length - 1) {
      this.currentQuestionIndex.update(idx => idx + 1);
      this.audioService.play('type');
    }
  }

  prevQuestion(): void {
    if (this.currentQuestionIndex() > 0) {
      this.currentQuestionIndex.update(idx => idx - 1);
      this.audioService.play('type');
    }
  }

  goToQuestion(idx: number): void {
    const deck = this.activeDeck();
    if (deck && idx >= 0 && idx < deck.questions.length) {
      this.currentQuestionIndex.set(idx);
      this.audioService.play('type');
    }
  }

  finishQuiz(): void {
    this.stopTimer();

    const deck = this.activeDeck();
    if (!deck) return;

    let correct = 0;
    const wrongIndices: number[] = [];
    const answers = this.userAnswers();

    deck.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctIndex) {
        correct++;
      } else {
        wrongIndices.push(idx);
      }
    });

    const total = deck.questions.length;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    const timeSpent = this.timerSeconds();

    const result: QuizResult = {
      total,
      correct,
      wrongIndices,
      percentage,
      timeSpent
    };

    this.quizResult.set(result);
    this.setView('summary');

    if (percentage === 100) {
      this.audioService.play('complete');
      this.triggerWarmConfetti();
    } else if (percentage >= 70) {
      this.audioService.play('correct');
    } else {
      this.audioService.play('wrong');
    }

    // Save history to backend
    const historyItem: QuizHistoryItem = {
      deckTitle: deck.title,
      difficulty: deck.difficulty,
      playMode: deck.playMode,
      totalQuestions: total,
      correctAnswers: correct,
      scorePercentage: percentage,
      timeSpentSeconds: timeSpent,
      noteSnippet: deck.noteSnippet || this.noteText().slice(0, 200),
      detailJson: JSON.stringify({
        topic: deck.title,
        questions: deck.questions,
        userAnswers: answers,
        completedAt: new Date().toISOString()
      })
    };

    if (this.authService.isLoggedIn()) {
      this.apiService.saveHistory(historyItem).subscribe({
        next: () => {
          this.fetchHistory();
        },
        error: (err) => console.warn('Failed to save quiz history:', err)
      });
    }
  }

  retryWrongOnly(): void {
    const deck = this.activeDeck();
    const res = this.quizResult();
    if (!deck || !res || res.wrongIndices.length === 0) return;

    const wrongQuestions = res.wrongIndices.map(i => deck.questions[i]);
    const retryDeck: ActiveDeck = {
      id: 'deck_' + Date.now(),
      title: `${deck.title} (Luyện câu sai)`,
      createdAt: new Date().toISOString(),
      difficulty: deck.difficulty,
      playMode: deck.playMode,
      noteSnippet: deck.noteSnippet,
      questions: wrongQuestions
    };

    this.startQuizDeck(retryDeck, true);
    this.toast.show(`Bắt đầu luyện tập lại ${wrongQuestions.length} câu chưa đúng!`, 'info');
  }

  retakeEntireDeck(): void {
    const deck = this.activeDeck();
    if (!deck) return;
    this.startQuizDeck({ ...deck }, true);
    this.toast.show('Bắt đầu làm lại bài! Cố gắng đạt 100% nhé.', 'check');
  }

  openReviewDeck(record: QuizHistoryItem): void {
    this.isHistoryDrawerOpen.set(false);
    this.selectedReviewRecord.set(record);
    this.setView('review');
    this.audioService.play('paper');
  }

  retakeFromReview(record: QuizHistoryItem): void {
    let questions: QuestionItem[] = [];
    if (typeof record.detailJson === 'string') {
      try {
        const parsed = JSON.parse(record.detailJson);
        questions = parsed.questions || [];
      } catch (e) {
        console.error('Failed to parse detailJson', e);
      }
    } else if (record.detailJson && record.detailJson.questions) {
      questions = record.detailJson.questions;
    }

    if (questions.length === 0) {
      this.toast.show('Không tìm thấy danh sách câu hỏi để làm lại!', 'warning');
      return;
    }

    const retakeDeck: ActiveDeck = {
      id: 'deck_' + Date.now(),
      title: record.deckTitle || 'Bộ câu hỏi ôn tập',
      createdAt: new Date().toISOString(),
      difficulty: record.difficulty || this.difficulty(),
      playMode: (record.playMode as 'flashcard' | 'standard') || 'flashcard',
      noteSnippet: record.noteSnippet || '',
      questions
    };

    this.startQuizDeck(retakeDeck, true);
    this.toast.show('Bắt đầu làm lại bộ đề! Kết quả mới sẽ được ghi lại sau khi nộp bài.', 'check');
  }

  private startTimer(): void {
    this.stopTimer();
    this.timerIntervalId = setInterval(() => {
      this.timerSeconds.update(s => s + 1);
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerIntervalId) {
      clearInterval(this.timerIntervalId);
      this.timerIntervalId = null;
    }
  }

  private triggerWarmConfetti(): void {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#E06D53', '#F59E0B', '#5F8265', '#D97706', '#FBBF24']
      });
    } catch (e) {
      console.debug('Confetti error:', e);
    }
  }
}
