import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface Lesson {
  _id: string;
  title: string;
  description?: string;
  videoUrl?: string;
  duration?: number;
  order: number;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  progress: {
    completedLessons: string[];
    nextLessonId: string | null;
    percentage: number;
  };
}

@Component({
  selector: 'app-course-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './course-player.html',
  styleUrls: ['./course-player.css']
})
export class CoursePlayerComponent implements OnInit, OnDestroy {
  course: Course | null = null;
  currentLesson: Lesson | null = null;
  loading = false;
  error = '';
  courseId = '';
  videoUrl: SafeResourceUrl | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.courseId = this.route.snapshot.params['id'];
    this.loadCourse();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  loadCourse(): void {
    this.loading = true;
    this.error = '';

    this.apiService.getCourse(this.courseId).subscribe({
      next: (response) => {
        this.course = {
          ...response.data,
          lessons: [...(response.data.lessons || [])].sort((left, right) => (left.order || 0) - (right.order || 0)),
          progress: {
            completedLessons: [],
            nextLessonId: null,
            percentage: 0
          }
        };
        this.loadCourseProgress();
      },
      error: (error) => {
        this.error = 'Failed to load course. Please try again.';
        this.loading = false;
        console.error('Error loading course:', error);
      }
    });
  }

  loadCourseProgress(): void {
    this.apiService.getCourseProgress(this.courseId).subscribe({
      next: (response) => {
        if (this.course) {
          this.course.progress = {
            completedLessons: (response.data.completedLessons || []).map((lesson: any) =>
              lesson.lesson?.toString?.() || lesson.lesson || lesson.toString?.()
            ),
            nextLessonId: response.data.nextLesson?.id?.toString?.() || response.data.nextLesson?.id || null,
            percentage: Math.round(response.data.progress || 0)
          };
        }

        this.setCurrentLesson();
        this.loading = false;
      },
      error: () => {
        this.setCurrentLesson();
        this.loading = false;
      }
    });
  }

  setCurrentLesson(): void {
    if (!this.course) return;

    const currentLessonId = this.course.progress?.nextLessonId ||
      this.course.lessons.find(lesson => !this.isLessonCompleted(lesson._id))?._id ||
      this.course.lessons[0]?._id;

    if (currentLessonId) {
      this.selectLesson(currentLessonId);
    }
  }

  selectLesson(lessonId: string): void {
    if (!this.course) return;

    const lesson = this.course.lessons.find(l => l._id === lessonId);
    if (lesson) {
      this.currentLesson = lesson;

      // Handle video URL
      if (this.getLessonType(lesson) === 'video' && lesson.videoUrl) {
        this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(lesson.videoUrl);
      } else {
        this.videoUrl = null;
      }
    }
  }

  markLessonComplete(): void {
    if (!this.currentLesson || !this.course) return;

    this.apiService.markLessonComplete(this.courseId, this.currentLesson._id).subscribe({
      next: (response) => {
        if (this.course) {
          this.course.progress = {
            ...this.course.progress,
            completedLessons: (response.data.completedLessons || []).map((lesson: any) =>
              lesson.lesson?.toString?.() || lesson.lesson || lesson.toString?.()
            ),
            percentage: Math.round(response.data.progress || 0)
          };
        }
        this.moveToNextLesson();
      },
      error: (error) => {
        console.error('Error marking lesson complete:', error);
      }
    });
  }

  moveToNextLesson(): void {
    if (!this.course || !this.currentLesson) return;

    const currentIndex = this.course.lessons.findIndex(l => l._id === this.currentLesson!._id);
    const nextLesson = this.course.lessons[currentIndex + 1];

    if (nextLesson) {
      this.selectLesson(nextLesson._id);
    } else {
      // Course completed
      alert('Congratulations! You have completed the course.');
      this.router.navigate(['/courses']);
    }
  }

  isLessonCompleted(lessonId: string): boolean {
    return this.course?.progress?.completedLessons?.includes(lessonId) || false;
  }

  isCurrentLesson(lessonId: string): boolean {
    return this.currentLesson?._id === lessonId;
  }

  getLessonIcon(type: string): string {
    switch (type) {
      case 'video': return 'fas fa-video';
      case 'quiz': return 'fas fa-question-circle';
      default: return 'fas fa-file-alt';
    }
  }

  getProgressPercentage(): number {
    return this.course?.progress?.percentage || 0;
  }

  getLessonType(lesson: Lesson | null): string {
    if (!lesson) {
      return 'text';
    }

    return lesson.videoUrl ? 'video' : 'text';
  }

  goBack(): void {
    this.router.navigate(['/courses']);
  }
}
