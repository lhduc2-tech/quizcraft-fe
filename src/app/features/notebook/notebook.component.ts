import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuizStateService } from '../../core/services/quiz-state.service';
import { AudioService } from '../../core/services/audio.service';
import { QuizApiService } from '../../core/services/quiz-api.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { ActiveDeck } from '../../core/models/quiz.model';
import { QuizHistoryItem } from '../../core/models/history.model';

@Component({
  selector: 'app-notebook',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="space-y-8 animate-fadeIn">
      
      <!-- Notebook Inspiration Banner -->
      <div class="text-center max-w-2xl mx-auto space-y-3 pt-2">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300/60 dark:border-amber-800/40 text-amber-800 dark:text-amber-200 text-xs font-bold">
          <i class="ph-fill ph-coffee"></i> Không gian tự học yên tĩnh
        </div>
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-paper-900 dark:text-paper-50 tracking-tight leading-tight">
          Biến bài học thành <span class="highlight-brush">bộ câu hỏi khắc sâu</span>
        </h1>
        <p class="text-paper-800/80 dark:text-paper-300 text-sm sm:text-base font-medium max-w-xl mx-auto">
          Dán các nội dung bạn vừa ghi chép từ tài liệu. Hệ thống sẽ trích lọc luận điểm chính và tạo bài trắc nghiệm kèm mẹo nhớ.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <!-- Left: Physical Notebook Area (8 Cols) -->
        <div class="lg:col-span-8 relative">
          <!-- Decorative paper clip -->
          <div class="paper-clip"></div>

          <div class="bg-white dark:bg-[#201D18] rounded-3xl border-2 border-paper-300/80 dark:border-paper-800 shadow-xl shadow-paper-900/5 p-6 sm:p-7 relative overflow-hidden">
            
            <!-- Sticky header of the notepad -->
            <div class="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-paper-200 dark:border-paper-800/80">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-terracotta-500"></span>
                <span class="w-3 h-3 rounded-full bg-amber-400"></span>
                <span class="w-3 h-3 rounded-full bg-sage-500"></span>
                <h2 class="font-serif font-bold text-lg text-paper-900 dark:text-paper-100 ml-2">Trang ghi chép bài học</h2>
              </div>

              <!-- Recent Quizzes Pill Tags (Replaces hard-coded samples) -->
              <div class="flex items-center gap-1.5 text-xs">
                <span class="font-hand text-sm text-paper-500 dark:text-paper-400 font-bold mr-1">Gần đây:</span>
                @if (recentQuizzes().length > 0) {
                  @for (item of recentQuizzes(); track item.id || item.deckTitle) {
                    <button 
                      type="button"
                      (click)="loadRecentQuiz(item)" 
                      [title]="item.deckTitle"
                      class="px-2.5 py-1 rounded-lg bg-paper-100 hover:bg-paper-200 dark:bg-paper-800 dark:hover:bg-paper-700 text-paper-800 dark:text-paper-200 font-semibold border border-paper-300/60 dark:border-paper-700 transition cursor-pointer max-w-[140px] truncate text-left"
                    >
                      {{ item.deckTitle }}
                    </button>
                  }
                } @else {
                  <span class="text-[11px] text-paper-400 dark:text-paper-500 italic">Chưa có nhật ký</span>
                }
              </div>
            </div>

            <!-- Real Lined Textarea (No example placeholder) -->
            <div class="mt-4 relative">
              <textarea 
                [ngModel]="note()"
                (ngModelChange)="onNoteChange($event)"
                rows="12" 
                placeholder="Dán hoặc ghi chép nội dung bài học của bạn vào đây..." 
                class="notepad-lines w-full bg-transparent focus:outline-none text-paper-900 dark:text-paper-100 text-sm sm:text-base font-sans resize-y placeholder:text-paper-400 dark:placeholder:text-paper-600 outline-none"
              ></textarea>
            </div>

            <!-- Footer of Notebook: Counters & Clear button -->
            <div class="mt-4 pt-3 border-t border-dashed border-paper-200 dark:border-paper-800 flex items-center justify-between text-xs text-paper-400 font-mono">
              <div class="flex items-center gap-4">
                <span>{{ wordCount() }} từ</span>
                <span>•</span>
                <span>{{ note().length }} ký tự</span>
              </div>
              <button 
                type="button"
                (click)="clearNote()" 
                class="text-paper-400 hover:text-terracotta-600 dark:hover:text-terracotta-400 flex items-center gap-1 transition font-sans font-semibold cursor-pointer"
              >
                <i class="ph-bold ph-eraser"></i> Xoá trang
              </button>
            </div>
          </div>
        </div>

        <!-- Right: Settings Panel (4 Cols) -->
        <div class="lg:col-span-4 space-y-6">
          <div class="bg-paper-100/70 dark:bg-[#23201A] rounded-3xl border-2 border-paper-300/80 dark:border-paper-800 p-6 shadow-sm space-y-5">
            
            <div class="flex items-center justify-between">
              <h3 class="font-serif font-bold text-lg text-paper-900 dark:text-paper-50 flex items-center gap-2">
                <i class="ph-bold ph-faders text-terracotta-600"></i> Thiết lập đề ôn tập
              </h3>
              <span class="washi-tape px-2 py-0.5 text-[10px] font-bold text-amber-900 uppercase tracking-widest rounded-sm">Study Deck</span>
            </div>

            <!-- Question Quantity (3 câu, 10 câu, tự nhập max 30) -->
            <div class="space-y-2.5">
              <div class="flex items-center justify-between">
                <label class="text-xs font-bold uppercase tracking-wider text-paper-800 dark:text-paper-300 block">Số lượng thẻ bài</label>
                <span class="text-[11px] font-medium text-paper-400 dark:text-paper-500">Tối đa 30 câu</span>
              </div>
              <div class="grid grid-cols-3 gap-2">
                <!-- 3 câu -->
                <button 
                  type="button" 
                  (click)="setPresetCount(3)" 
                  [class]="state.questionCount() === 3 && !isCustomCountActive 
                    ? 'count-chip active py-2.5 px-3 rounded-xl border-2 border-terracotta-600 bg-terracotta-50 dark:bg-terracotta-900/30 text-xs font-extrabold text-terracotta-700 dark:text-terracotta-300 shadow-sm transition cursor-pointer text-center'
                    : 'count-chip py-2.5 px-3 rounded-xl border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 text-xs font-bold text-paper-800 dark:text-paper-200 hover:border-terracotta-500 transition cursor-pointer text-center'"
                >
                  3 câu
                </button>

                <!-- 10 câu -->
                <button 
                  type="button" 
                  (click)="setPresetCount(10)" 
                  [class]="state.questionCount() === 10 && !isCustomCountActive 
                    ? 'count-chip active py-2.5 px-3 rounded-xl border-2 border-terracotta-600 bg-terracotta-50 dark:bg-terracotta-900/30 text-xs font-extrabold text-terracotta-700 dark:text-terracotta-300 shadow-sm transition cursor-pointer text-center'
                    : 'count-chip py-2.5 px-3 rounded-xl border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 text-xs font-bold text-paper-800 dark:text-paper-200 hover:border-terracotta-500 transition cursor-pointer text-center'"
                >
                  10 câu
                </button>

                <!-- Tự nhập (max 30, no 'câu' text) -->
                <div 
                  [class]="isCustomCountActive
                    ? 'rounded-xl border-2 border-terracotta-600 bg-terracotta-50 dark:bg-terracotta-900/30 transition flex items-center justify-center px-3 py-1.5'
                    : 'rounded-xl border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 hover:border-terracotta-500 transition flex items-center justify-center px-3 py-1.5'"
                >
                  <input 
                    type="number" 
                    min="1" 
                    max="30" 
                    [ngModel]="customCountVal" 
                    (ngModelChange)="onCustomCountChange($event)"
                    (focus)="onCustomCountFocus()"
                    placeholder="Tự nhập" 
                    class="w-full bg-transparent text-xs font-bold text-paper-900 dark:text-paper-100 focus:outline-none placeholder:text-paper-400 dark:placeholder:text-paper-500 placeholder:font-normal text-center"
                  />
                </div>
              </div>

              <!-- Real-time dynamic helper text -->
              @if (isCustomCountActive) {
                @if (customCountVal !== null && customCountVal > 0) {
                  <div class="text-[12px] text-sage-700 dark:text-sage-400 font-semibold flex items-center gap-1.5 pt-0.5">
                    <i class="ph-fill ph-check-circle"></i> Sẽ tạo {{ customCountVal }} câu hỏi (1 - {{ customCountVal }})
                  </div>
                } @else {
                  <div class="text-[12px] text-terracotta-600 dark:text-terracotta-400 font-semibold flex items-center gap-1.5 pt-0.5">
                    <i class="ph-bold ph-pencil-simple-line"></i> Vui lòng nhập số câu hỏi (từ 1 đến 30)
                  </div>
                }
              }
            </div>

            <!-- Difficulty Level -->
            <div class="space-y-2">
              <label class="text-xs font-bold uppercase tracking-wider text-paper-800 dark:text-paper-300 block">Mức độ thử thách</label>
              <div class="grid grid-cols-3 gap-2">
                <button 
                  type="button" 
                  (click)="setDifficulty('Nhớ nhanh')" 
                  [class]="state.difficulty() === 'Nhớ nhanh'
                    ? 'diff-chip active py-2 px-2 rounded-xl border-2 border-sage-600 bg-sage-50 dark:bg-sage-900/30 text-xs font-extrabold text-sage-700 dark:text-sage-300 shadow-sm transition cursor-pointer'
                    : 'diff-chip py-2 px-2 rounded-xl border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 text-xs font-bold text-paper-800 dark:text-paper-200 hover:border-sage-600 transition cursor-pointer'"
                >
                  Cơ bản
                </button>
                <button 
                  type="button" 
                  (click)="setDifficulty('Hiểu sâu')" 
                  [class]="state.difficulty() === 'Hiểu sâu'
                    ? 'diff-chip active py-2 px-2 rounded-xl border-2 border-sage-600 bg-sage-50 dark:bg-sage-900/30 text-xs font-extrabold text-sage-700 dark:text-sage-300 shadow-sm transition cursor-pointer'
                    : 'diff-chip py-2 px-2 rounded-xl border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 text-xs font-bold text-paper-800 dark:text-paper-200 hover:border-sage-600 transition cursor-pointer'"
                >
                  Vừa vặn
                </button>
                <button 
                  type="button" 
                  (click)="setDifficulty('Tư duy phản biện')" 
                  [class]="state.difficulty() === 'Tư duy phản biện'
                    ? 'diff-chip active py-2 px-2 rounded-xl border-2 border-sage-600 bg-sage-50 dark:bg-sage-900/30 text-xs font-extrabold text-sage-700 dark:text-sage-300 shadow-sm transition cursor-pointer'
                    : 'diff-chip py-2 px-2 rounded-xl border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 text-xs font-bold text-paper-800 dark:text-paper-200 hover:border-sage-600 transition cursor-pointer'"
                >
                  Sâu sắc
                </button>
              </div>
            </div>

            <!-- Practice Mode: Flashcard vs Full Exam -->
            <div class="space-y-2">
              <label class="text-xs font-bold uppercase tracking-wider text-paper-800 dark:text-paper-300 block">Hình thức học</label>
              <div class="grid grid-cols-2 gap-2">
                <button 
                  type="button" 
                  (click)="setMode('flashcard')" 
                  [class]="state.playMode() === 'flashcard'
                    ? 'mode-chip active p-2.5 rounded-xl border-2 border-terracotta-600 bg-white dark:bg-paper-800 text-left transition cursor-pointer'
                    : 'mode-chip p-2.5 rounded-xl border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 text-left transition cursor-pointer'"
                >
                  <div 
                    [class]="state.playMode() === 'flashcard' ? 'text-terracotta-700 dark:text-terracotta-300' : 'text-paper-700 dark:text-paper-300'"
                    class="font-bold text-xs flex items-center gap-1.5"
                  >
                    <i class="ph-bold ph-cards"></i> Flashcard
                  </div>
                  <div class="text-[10px] text-paper-400 mt-0.5">Từng câu & giải thích liền</div>
                </button>

                <button 
                  type="button" 
                  (click)="setMode('standard')" 
                  [class]="state.playMode() === 'standard'
                    ? 'mode-chip active p-2.5 rounded-xl border-2 border-terracotta-600 bg-white dark:bg-paper-800 text-left transition cursor-pointer'
                    : 'mode-chip p-2.5 rounded-xl border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 text-left transition cursor-pointer'"
                >
                  <div 
                    [class]="state.playMode() === 'standard' ? 'text-terracotta-700 dark:text-terracotta-300' : 'text-paper-700 dark:text-paper-300'"
                    class="font-bold text-xs flex items-center gap-1.5"
                  >
                    <i class="ph-bold ph-pencil-line"></i> Bài kiểm tra
                  </div>
                  <div class="text-[10px] text-paper-400 mt-0.5">Chấm điểm tổng quát</div>
                </button>
              </div>
            </div>

            <!-- Craft Action Button -->
            <button 
              type="button"
              (click)="craftQuiz()" 
              [disabled]="isLoading" 
              class="btn-tactile w-full py-4 px-5 rounded-2xl bg-terracotta-600 hover:bg-terracotta-500 text-white font-bold text-base flex items-center justify-center gap-2.5 shadow-lg shadow-terracotta-600/30 transition cursor-pointer disabled:opacity-50"
            >
              @if (isLoading) {
                <i class="ph-bold ph-spinner animate-spin text-xl text-amber-300"></i>
                <span>Đang chuẩn bị đề ôn tập...</span>
              } @else {
                <i class="ph-bold ph-sparkle text-xl text-amber-300"></i>
                <span>Tạo bộ câu hỏi ngay</span>
              }
            </button>
          </div>

          <!-- Handcrafted Learning Quote -->
          <div class="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs text-paper-800 dark:text-paper-300 flex items-start gap-3">
            <i class="ph-fill ph-lightbulb text-amber-600 text-xl shrink-0 mt-0.5"></i>
            <div>
              <span class="font-bold block text-amber-900 dark:text-amber-200">Mẹo học:</span>
              Đừng vội chọn đáp án. Hãy cố gắng gợi nhớ lại từ ghi chú trước khi chọn để có thể nhớ lâu hơn.
            </div>
          </div>

        </div>

      </div>
    </section>
  `
})
export class NotebookComponent {
  readonly state = inject(QuizStateService);
  readonly audioService = inject(AudioService);
  readonly apiService = inject(QuizApiService);
  readonly toast = inject(ToastService);
  readonly authService = inject(AuthService);

  isLoading = false;

  readonly note = this.state.noteText;
  readonly wordCount = computed(() => {
    const val = this.note().trim();
    return val.length > 0 ? val.split(/\s+/).length : 0;
  });

  readonly recentQuizzes = computed(() => {
    return this.state.historyList().slice(0, 3);
  });

  customCountVal: number | null = null;
  isCustomCountActive = false;

  onNoteChange(val: string): void {
    this.state.noteText.set(val);
  }

  clearNote(): void {
    this.state.noteText.set('');
    this.audioService.play('type');
  }

  loadRecentQuiz(item: QuizHistoryItem): void {
    this.state.noteText.set(item.deckTitle);
    this.audioService.play('paper');
    this.toast.show(`Đã điền chủ đề: "${item.deckTitle}"!`, 'check');
  }

  setPresetCount(count: number): void {
    this.isCustomCountActive = false;
    this.customCountVal = null;
    this.state.questionCount.set(count);
    this.audioService.play('type');
  }

  onCustomCountFocus(): void {
    this.isCustomCountActive = true;
  }

  onCustomCountChange(val: any): void {
    this.isCustomCountActive = true;
    if (val === '' || val === null || val === undefined) {
      this.customCountVal = null;
      return;
    }
    let num = parseInt(val, 10);
    if (isNaN(num)) {
      this.customCountVal = null;
      return;
    }
    if (num > 30) {
      num = 30;
      this.customCountVal = 30;
      this.toast.show('Số lượng thẻ bài tối đa là 30 câu nhé!', 'info');
    } else if (num < 1) {
      num = 1;
      this.customCountVal = 1;
    } else {
      this.customCountVal = num;
    }
    this.state.questionCount.set(num);
    this.audioService.play('type');
  }

  setDifficulty(d: string): void {
    this.state.difficulty.set(d);
    this.audioService.play('type');
  }

  setMode(m: 'flashcard' | 'standard'): void {
    this.state.playMode.set(m);
    this.audioService.play('type');
  }

  craftQuiz(): void {
    const rawNote = this.state.noteText().trim();
    if (!rawNote) {
      this.toast.show('Vui lòng ghi một vài dòng kiến thức trước nhé!', 'warning');
      return;
    }

    if (rawNote.length < 25) {
      this.toast.show('Nội dung hơi ngắn. Hãy dán thêm ý chính để bài quiz chuẩn hơn!', 'warning');
      return;
    }

    if (this.isCustomCountActive && (!this.customCountVal || this.customCountVal < 1)) {
      this.toast.show('Vui lòng nhập số câu hỏi mong muốn (từ 1 đến 30)!', 'warning');
      return;
    }

    let count = this.isCustomCountActive && this.customCountVal ? this.customCountVal : this.state.questionCount();
    if (!count || count < 1) {
      count = 3;
      this.state.questionCount.set(3);
    } else if (count > 30) {
      count = 30;
      this.state.questionCount.set(30);
    }

    this.isLoading = true;
    this.audioService.play('type');

    this.apiService.generateQuiz({
      note: rawNote,
      difficulty: this.state.difficulty(),
      questionCount: count
    }).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res && res.questions && res.questions.length > 0) {
          const newDeck: ActiveDeck = {
            id: 'deck_' + Date.now(),
            title: res.topic || 'Bộ câu hỏi ôn tập',
            createdAt: new Date().toISOString(),
            difficulty: this.state.difficulty(),
            playMode: this.state.playMode(),
            noteSnippet: rawNote.slice(0, 100) + '...',
            questions: res.questions
          };
          this.state.startQuizDeck(newDeck);
          this.toast.show('Đã biên soạn xong bộ thẻ ôn tập từ QuizCraft AI!', 'check');
        } else {
          this.fallbackDeck(rawNote);
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.warn('Backend API error:', err);
        if (err?.error?.requiresLogin) {
          this.toast.show(err.error.message || 'Khách vãng lai tối đa chỉ được tạo 30 câu hỏi. Vui lòng đăng nhập để tiếp tục!', 'warning');
          this.authService.openAuthModal();
          return;
        }
        this.toast.show('Không thể kết nối Quiz-Service. Chuyển sang bộ câu hỏi dự phòng...', 'warning');
        this.fallbackDeck(rawNote);
      }
    });
  }

  private fallbackDeck(note: string): void {
    const fallback: ActiveDeck = {
      id: 'deck_' + Date.now(),
      title: 'Củng cố kiến thức ghi chú',
      createdAt: new Date().toISOString(),
      difficulty: this.state.difficulty(),
      playMode: this.state.playMode(),
      noteSnippet: note.slice(0, 100) + '...',
      questions: [
        {
          question: 'Bản chất của phương pháp Active Recall khi ôn lại nội dung này là gì?',
          options: [
            'Đọc lại nhiều lần đến khi mặt chữ quen mắt',
            'Chủ động bắt não bộ truy xuất thông tin để tạo liên kết thần kinh LTP',
            'Viết lại nguyên văn câu chữ của bài học bằng nét chữ đẹp',
            'Ghi âm giọng đọc và nghe lại một cách thụ động'
          ],
          correctIndex: 1,
          explanation: 'Chủ động truy hồi kiến thức ép các nơ-ron phải tái kích hoạt, biến trí nhớ ngắn hạn thành dài hạn bền vững hơn gấp nhiều lần.',
          optionExplanations: [
            'Sai. Đọc thụ động chỉ tạo cảm giác nhận diện giả vờ (Fluency illusion) mà không tạo liên kết thần kinh sâu.',
            'Đúng. Não bộ buộc phải tìm kiếm lại đường mòn thần kinh, kích thích tái củng cố ký ức.',
            'Sai. Chép lại máy móc không đòi hỏi tư duy giải quyết vấn đề hay truy hồi.',
            'Sai. Nghe thụ động não bộ rất dễ mất tập trung và không tạo sự kết nối nơ-ron chủ động.'
          ],
          memoryHook: '💡 Não bộ giống cơ bắp: Chỉ khi bạn "nâng tạ" (truy xuất) thì cơ bắp mới phát triển!'
        },
        {
          question: 'Làm thế nào để kiến thức trong ghi chú không bị lãng quên theo thời gian?',
          options: [
            'Kết hợp chu kỳ Spaced Repetition (Lặp lại ngắt quãng 1 ngày, 3 ngày, 7 ngày)',
            'Chỉ học 1 lần thật kỹ rồi không bao giờ mở lại nữa',
            'Học thâu đêm không ngủ để thông tin in sâu vào não',
            'Cố nhớ toàn bộ chi tiết vụn vặt thay vì hiểu ý tưởng cốt lõi'
          ],
          correctIndex: 0,
          explanation: 'Spaced Repetition triệt tiêu đường cong quên lãng Ebbinghaus, nhắc nhở não bộ đúng lúc trước khi ký ức phai nhạt hoàn toàn.',
          optionExplanations: [
            'Đúng. Lặp lại ngắt quãng củng cố trí nhớ đúng điểm rơi đường cong quên lãng.',
            'Sai. Ký ức sẽ phai nhạt tới 80% sau vài ngày nếu không có sự lặp lại.',
            'Sai. Thiếu ngủ làm gián đoạn quá trình đồng hóa dữ liệu của đồi hải mã sang vỏ não.',
            'Sai. Cần nắm chắc mô hình tư duy cốt lõi trước khi nhớ các chi tiết phụ trợ.'
          ],
          memoryHook: '💡 Tưới cây đúng lúc: Đừng đợi cây héo rũ mới tưới nước một lần ngập úng.'
        }
      ]
    };

    this.state.startQuizDeck(fallback);
  }
}
