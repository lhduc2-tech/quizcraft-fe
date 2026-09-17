export interface QuestionItem {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  optionExplanations?: string[];
  memoryHook?: string;
}

export interface QuizGenerateRequest {
  note: string;
  difficulty: string;
  questionCount: number;
}

export interface QuizResponse {
  topic: string;
  questions: QuestionItem[];
}

export interface ActiveDeck {
  id: string;
  title: string;
  createdAt: string;
  difficulty: string;
  playMode: 'flashcard' | 'standard';
  noteSnippet: string;
  questions: QuestionItem[];
}
