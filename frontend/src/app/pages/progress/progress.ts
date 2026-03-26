import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';

interface CourseProgress {
  course: {
    _id: string;
    title: string;
    category: string;
  };
  progress: {
    completedLessons: number;
    totalLessons: number;
    percentage: number;
    timeSpent: number;
    lastAccessed: Date;
  };
}

interface UserProgress {
  totalCourses: number;
  completedCourses: number;
  totalLessons: number;
  completedLessons: number;
  overallProgress: number;
  totalTimeSpent: number;
  courses: CourseProgress[];
  recentActivity: any[];
}

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './progress.html',
  styleUrls: ['./progress.css']
})
export class ProgressComponent implements OnInit {
  progress: UserProgress | null = null;
  loading = false;
  error = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadProgress();
  }

  loadProgress(): void {
    this.loading = true;
    this.error = '';

    this.apiService.getUserProgress().subscribe({
      next: (response) => {
        this.progress = Array.isArray(response.data)
          ? this.transformProgress(response.data)
          : response.data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load progress. Please try again.';
        this.loading = false;
        console.error('Error loading progress:', error);
      }
    });
  }

  formatTime(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

  getProgressColor(percentage: number): string {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'info';
    if (percentage >= 40) return 'warning';
    return 'danger';
  }

  getProgressWidth(percentage: number): string {
    return `${Math.min(percentage, 100)}%`;
  }

  isCompleted(percentage: number): boolean {
    return percentage >= 100;
  }

  getCompletionStatus(percentage: number): string {
    if (percentage >= 100) return 'Completed';
    if (percentage >= 80) return 'Almost Done';
    if (percentage >= 50) return 'In Progress';
    return 'Just Started';
  }

  private transformProgress(enrolledCourses: any[]): UserProgress {
    const courses = enrolledCourses.map(enrollment => {
      const lessons = enrollment.course?.lessons || [];
      const completedLessonIds = (enrollment.completedLessons || []).map((lesson: any) =>
        lesson.lesson?.toString?.() || lesson.lesson || lesson.toString?.()
      );
      const completedLessonsCount = completedLessonIds.length;
      const totalLessons = lessons.length;
      const timeSpent = lessons
        .filter((lesson: any) => completedLessonIds.includes(lesson._id?.toString?.() || lesson._id))
        .reduce((sum: number, lesson: any) => sum + (lesson.duration || 0), 0);
      const lastAccessed = (enrollment.completedLessons || []).length > 0
        ? enrollment.completedLessons[enrollment.completedLessons.length - 1].completedAt
        : enrollment.enrolledAt;

      return {
        course: {
          _id: enrollment.course?._id,
          title: enrollment.course?.title,
          category: enrollment.course?.category
        },
        progress: {
          completedLessons: completedLessonsCount,
          totalLessons,
          percentage: Math.round(enrollment.progress || 0),
          timeSpent,
          lastAccessed
        }
      };
    });
    const totalCourses = courses.length;
    const completedCourses = courses.filter(course => course.progress.percentage >= 100).length;
    const totalLessons = courses.reduce((sum, course) => sum + course.progress.totalLessons, 0);
    const completedLessons = courses.reduce((sum, course) => sum + course.progress.completedLessons, 0);
    const totalTimeSpent = courses.reduce((sum, course) => sum + course.progress.timeSpent, 0);
    const overallProgress = totalLessons > 0
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;

    return {
      totalCourses,
      completedCourses,
      totalLessons,
      completedLessons,
      overallProgress,
      totalTimeSpent,
      courses,
      recentActivity: []
    };
  }
}
