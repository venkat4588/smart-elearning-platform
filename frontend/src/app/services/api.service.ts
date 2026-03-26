import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) { }

  // Auth endpoints
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, credentials);
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, userData);
  }

  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.baseUrl}/auth/me`);
  }

  updateProfile(userData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/auth/updatedetails`, userData);
  }

  // Course endpoints
  getCourses(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get(`${this.baseUrl}/courses`, { params: httpParams });
  }

  getCourse(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/courses/${id}`);
  }

  createCourse(courseData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/courses`, courseData);
  }

  updateCourse(id: string, courseData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/courses/${id}`, courseData);
  }

  deleteCourse(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/courses/${id}`);
  }

  enrollInCourse(courseId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/courses/${courseId}/enroll`, {});
  }

  addCourseReview(courseId: string, review: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/courses/${courseId}/reviews`, review);
  }

  // Quiz endpoints
  getQuizzes(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get(`${this.baseUrl}/quizzes`, { params: httpParams });
  }

  getQuiz(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/quizzes/${id}`);
  }

  createQuiz(quizData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/quizzes`, quizData);
  }

  updateQuiz(id: string, quizData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/quizzes/${id}`, quizData);
  }

  deleteQuiz(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/quizzes/${id}`);
  }

  submitQuizAttempt(quizId: string, attempt: { answers: any; timeSpent?: any }): Observable<any> {
    return this.http.post(`${this.baseUrl}/quizzes/${quizId}/attempt`, attempt);
  }

  getQuizResults(quizId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/quizzes/${quizId}/results`);
  }

  // Analytics endpoints
  getUserAnalytics(): Observable<any> {
    return this.http.get(`${this.baseUrl}/analytics/user`);
  }

  getCourseAnalytics(courseId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/analytics/courses/${courseId}`);
  }

  getQuizAnalytics(quizId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/analytics/quizzes/${quizId}`);
  }

  getLearningInsights(): Observable<any> {
    return this.http.get(`${this.baseUrl}/analytics/insights`);
  }

  // Leaderboard endpoints
  getLeaderboard(type?: string, limit?: number): Observable<any> {
    let params = new HttpParams();
    if (type) params = params.set('type', type);
    if (limit) params = params.set('limit', limit.toString());
    return this.http.get(`${this.baseUrl}/leaderboard`, { params });
  }

  getUserRank(): Observable<any> {
    return this.http.get(`${this.baseUrl}/leaderboard/rank`);
  }

  // Progress endpoints
  getUserProgress(): Observable<any> {
    return this.http.get(`${this.baseUrl}/progress`);
  }

  getCourseProgress(courseId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/progress/${courseId}`);
  }

  updateLessonProgress(courseId: string, lessonId: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/progress/${courseId}/lesson`, { lessonId });
  }

  markLessonComplete(courseId: string, lessonId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/progress/${courseId}/lessons/${lessonId}`, {});
  }

  updateCourseProgress(courseId: string, progress: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/progress/${courseId}`, progress);
  }

  markLessonCompleted(courseId: string, lessonId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/progress/${courseId}/lessons/${lessonId}`, {});
  }

  // Recommendations endpoints
  getCourseRecommendations(): Observable<any> {
    return this.http.get(`${this.baseUrl}/recommendations/courses`);
  }

  getQuizRecommendations(): Observable<any> {
    return this.http.get(`${this.baseUrl}/recommendations/quizzes`);
  }

  getTopicRecommendations(): Observable<any> {
    return this.http.get(`${this.baseUrl}/recommendations/topics`);
  }

  updateRecommendationPreferences(preferences: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/recommendations/preferences`, preferences);
  }
}
