import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './features/shared/header/header.component';
import { ToastComponent } from './features/shared/toast/toast.component';
import { NotebookComponent } from './features/notebook/notebook.component';
import { StudyDeckComponent } from './features/study-deck/study-deck.component';
import { SummaryComponent } from './features/summary/summary.component';
import { HistoryComponent } from './features/history/history.component';
import { ReviewDeckComponent } from './features/history/review-deck.component';
import { QuizStateService } from './core/services/quiz-state.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    ToastComponent,
    NotebookComponent,
    StudyDeckComponent,
    SummaryComponent,
    HistoryComponent,
    ReviewDeckComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  readonly state = inject(QuizStateService);
}
