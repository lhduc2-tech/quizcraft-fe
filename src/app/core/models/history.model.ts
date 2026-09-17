import { QuestionItem } from './quiz.model';

export interface HistoryDetail {
  topic: string;
  questions: QuestionItem[];
  userAnswers: Record<number, number>;
  completedAt: string;
}

export interface QuizHistoryItem {
  id?: number;
  deckTitle: string;
  difficulty: string;
  playMode: string;
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  timeSpentSeconds: number;
  noteSnippet: string;
  detailJson: string | HistoryDetail;
  createdAt?: string;
}
