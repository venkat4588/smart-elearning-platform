import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

interface Question {
  _id: string;
  question: string;
  type: 'mcq' | 'msq' | 'true-false' | 'essay' | 'fill-blank';
  options?: string[];
  correctAnswer: string | string[] | boolean;
  points: number;
}

interface Quiz {
  _id: string;
  title: string;
  description: string;
  questions: Question[];
  totalPoints: number;
  settings?: {
    timeLimit?: number;
    passingScore?: number;
  };
}

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quiz.html',
  styleUrls: ['./quiz.css']
})
export class QuizComponent implements OnInit, OnDestroy {
  quiz: Quiz | null = null;
  currentQuestionIndex = 0;
  answers: { [questionId: string]: string | string[] } = {};
  timeRemaining = 0;
  timeLimit = 0;
  quizStarted = false;
  quizCompleted = false;
  loading = false;
  error = '';
  quizId = '';
  startTime = 0;
  results: any = null;
  timerId: ReturnType<typeof setInterval> | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.quizId = this.route.snapshot.params['id'];
    this.loadQuiz();
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  loadQuiz(): void {
    this.loading = true;
    this.error = '';

    this.apiService.getQuiz(this.quizId).subscribe({
      next: (response) => {
        this.quiz = response.data;
        this.timeLimit = this.quiz.settings?.timeLimit || 0;
        this.timeRemaining = this.timeLimit * 60; // Convert to seconds
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load quiz. Please try again.';
        this.loading = false;
        console.error('Error loading quiz:', error);
      }
    });
  }

  startQuiz(): void {
    this.quizStarted = true;
    this.startTime = Date.now();

    if (this.timeLimit > 0) {
      this.startTimer();
    }
  }

  startTimer(): void {
    this.clearTimer();

    this.timerId = setInterval(() => {
      this.timeRemaining--;
      if (this.timeRemaining <= 0) {
        this.clearTimer();
        this.submitQuiz();
      }
    }, 1000);
  }

  clearTimer(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  getCurrentQuestion(): Question | null {
    return this.quiz?.questions[this.currentQuestionIndex] || null;
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < (this.quiz?.questions.length || 0) - 1) {
      this.currentQuestionIndex++;
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  goToQuestion(index: number): void {
    if (index >= 0 && index < (this.quiz?.questions.length || 0)) {
      this.currentQuestionIndex = index;
    }
  }

  updateAnswer(questionId: string, answer: string | string[]): void {
    this.answers[questionId] = answer;
  }

  toggleMultiSelectAnswer(questionId: string, option: string): void {
    const currentAnswers = Array.isArray(this.answers[questionId])
      ? [...this.answers[questionId] as string[]]
      : [];
    const optionIndex = currentAnswers.indexOf(option);

    if (optionIndex >= 0) {
      currentAnswers.splice(optionIndex, 1);
    } else {
      currentAnswers.push(option);
    }

    this.answers[questionId] = currentAnswers;
  }

  isAnswered(questionId: string): boolean {
    const answer = this.answers[questionId];

    if (Array.isArray(answer)) {
      return answer.length > 0;
    }

    return typeof answer === 'string' ? answer.trim().length > 0 : answer !== undefined;
  }

  getQuestionStatus(index: number): string {
    const question = this.quiz?.questions[index];
    if (!question) return '';

    if (this.isAnswered(question._id)) {
      return 'answered';
    }
    return 'unanswered';
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  submitQuiz(): void {
    if (!this.quiz) return;

    this.clearTimer();

    const timeSpent = Math.max(0, Math.floor((Date.now() - this.startTime) / 1000));
    const orderedAnswers = this.quiz.questions.map(question => this.answers[question._id] ?? null);

    this.apiService.submitQuizAttempt(this.quizId, {
      answers: orderedAnswers,
      timeSpent
    }).subscribe({
      next: (response) => {
        this.results = response.data;
        this.quizCompleted = true;
      },
      error: (error) => {
        console.error('Error submitting quiz:', error);
        alert('Failed to submit quiz. Please try again.');
      }
    });
  }

  canSubmit(): boolean {
    if (!this.quiz) return false;
    return this.quiz.questions.every(q => this.isAnswered(q._id));
  }

  retakeQuiz(): void {
    this.clearTimer();
    this.quizStarted = false;
    this.quizCompleted = false;
    this.currentQuestionIndex = 0;
    this.answers = {};
    this.results = null;
    this.timeRemaining = this.timeLimit * 60;
  }

  goBack(): void {
    this.router.navigate(['/courses']);
  }

  getScorePercentage(): number {
    if (!this.results) return 0;
    return Math.round(this.results.percentage || 0);
  }

  isPassed(): boolean {
    return !!this.results?.passed;
  }

  getAnsweredCount(): number {
    if (!this.quiz) return 0;
    return this.quiz.questions.filter(q => this.isAnswered(q._id)).length;
  }

  getPassMessage(): string {
    if (this.isPassed()) {
      return 'You passed the quiz!';
    }
    return `You need ${this.getPassingScore()}% to pass. Try again!`;
  }

  getPassingScore(): number {
    return this.quiz?.settings?.passingScore || 70;
  }

  getTotalPoints(): number {
    return this.quiz?.totalPoints || 0;
  }

  getCorrectAnswers(): number {
    return this.results?.result?.correctAnswers || 0;
  }

  isMultiSelectOptionSelected(questionId: string, option: string): boolean {
    const answer = this.answers[questionId];
    return Array.isArray(answer) ? answer.includes(option) : false;
  }

  getOptionLabel(index: number): string {
    return String.fromCharCode(65 + index);
  }
}
