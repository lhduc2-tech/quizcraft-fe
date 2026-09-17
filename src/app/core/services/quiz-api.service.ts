import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { QuizGenerateRequest, QuizResponse } from '../models/quiz.model';
import { QuizHistoryItem } from '../models/history.model';

@Injectable({
  providedIn: 'root'
})
export class QuizApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl || 'http://localhost:8080/api';

  generateQuiz(request: QuizGenerateRequest): Observable<QuizResponse> {
    return this.http.post<QuizResponse>(`${this.baseUrl}/quiz/generate`, request);
  }

  saveHistory(historyItem: QuizHistoryItem): Observable<QuizHistoryItem> {
    return this.http.post<QuizHistoryItem>(`${this.baseUrl}/history`, historyItem);
  }

  getHistory(): Observable<QuizHistoryItem[]> {
    return this.http.get<QuizHistoryItem[]>(`${this.baseUrl}/history`);
  }

  deleteHistory(id: number): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/history/${id}`);
  }

  clearAllHistory(): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/history`);
  }
}
