import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { forkJoin } from 'rxjs';

interface CourseRecommendation {
  _id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  rating: number;
  enrolledCount: number;
  reason: string;
  matchScore: number;
}

interface QuizRecommendation {
  _id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  estimatedTime: number;
  reason: string;
  matchScore: number;
}

interface Recommendations {
  courses: CourseRecommendation[];
  quizzes: QuizRecommendation[];
  topics: string[];
}

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './recommendations.html',
  styleUrls: ['./recommendations.css']
})
export class RecommendationsComponent implements OnInit {
  recommendations: Recommendations | null = null;
  loading = false;
  error = '';
  activeTab = 'courses';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadRecommendations();
  }

  loadRecommendations(): void {
    this.loading = true;
    this.error = '';

    forkJoin({
      courseResponse: this.apiService.getCourseRecommendations(),
      quizResponse: this.apiService.getQuizRecommendations(),
      topicResponse: this.apiService.getTopicRecommendations()
    }).subscribe({
      next: ({ courseResponse, quizResponse, topicResponse }) => {
        this.recommendations = {
          courses: this.normalizeCourseRecommendations(courseResponse.data),
          quizzes: this.normalizeQuizRecommendations(quizResponse.data),
          topics: this.normalizeTopicRecommendations(topicResponse.data)
        };
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load recommendations. Please try again.';
        this.loading = false;
        console.error('Error loading recommendations:', error);
      }
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  getDifficultyColor(level: string): string {
    switch (level.toLowerCase()) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'danger';
      default: return 'secondary';
    }
  }

  getMatchScoreColor(score: number): string {
    if (score >= 90) return 'success';
    if (score >= 70) return 'info';
    if (score >= 50) return 'warning';
    return 'danger';
  }

  getMatchScoreText(score: number): string {
    if (score >= 90) return 'Excellent Match';
    if (score >= 70) return 'Good Match';
    if (score >= 50) return 'Fair Match';
    return 'Poor Match';
  }

  private normalizeCourseRecommendations(data: any): CourseRecommendation[] {
    const buckets = [
      {
        items: data?.contentBased || [],
        reason: 'Matches the interests in your learning profile.',
        matchScore: 92
      },
      {
        items: data?.collaborative || [],
        reason: 'Popular with learners who share similar interests.',
        matchScore: 84
      },
      {
        items: data?.performanceBased || [],
        reason: 'Suggested to strengthen concepts where you need more practice.',
        matchScore: 88
      },
      {
        items: data?.popular || [],
        reason: 'Trending across the platform right now.',
        matchScore: 75
      }
    ];
    const seen = new Set<string>();

    return buckets.flatMap(bucket =>
      (bucket.items as any[]).map(course => ({
        _id: course._id,
        title: course.title,
        description: course.description,
        category: course.category,
        level: course.level,
        rating: course.averageRating || 0,
        enrolledCount: course.totalStudents || 0,
        reason: bucket.reason,
        matchScore: bucket.matchScore
      }))
    ).filter(course => {
      if (!course._id || seen.has(course._id)) {
        return false;
      }

      seen.add(course._id);
      return true;
    });
  }

  private normalizeQuizRecommendations(data: any): QuizRecommendation[] {
    const buckets = [
      {
        items: data?.revisionQuizzes || [],
        reason: 'Recommended to revisit topics where your performance dipped.',
        matchScore: 90
      },
      {
        items: data?.courseQuizzes || [],
        reason: 'Available in courses you are already enrolled in.',
        matchScore: 78
      }
    ];
    const seen = new Set<string>();

    return buckets.flatMap(bucket =>
      (bucket.items as any[]).map(quiz => ({
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        category: quiz.course?.title || 'General',
        difficulty: this.mapQuizDifficulty(quiz.difficulty),
        estimatedTime: quiz.estimatedTime || quiz.settings?.timeLimit || 0,
        reason: bucket.reason,
        matchScore: bucket.matchScore
      }))
    ).filter(quiz => {
      if (!quiz._id || seen.has(quiz._id)) {
        return false;
      }

      seen.add(quiz._id);
      return true;
    });
  }

  private normalizeTopicRecommendations(data: any): string[] {
    const topics = [
      ...(data?.weakTopics || []),
      ...(data?.nextTopics || [])
    ];

    return Array.from(new Set(topics)).map(topic =>
      topic
        .split('-')
        .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
    );
  }

  private mapQuizDifficulty(difficulty: number | string | undefined): string {
    if (typeof difficulty === 'string') {
      return difficulty;
    }

    if (typeof difficulty !== 'number') {
      return 'Intermediate';
    }

    if (difficulty <= 3) return 'Beginner';
    if (difficulty <= 7) return 'Intermediate';
    return 'Advanced';
  }
}
