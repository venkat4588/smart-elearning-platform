import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-page">
      <div class="container">
        <div class="row mb-4">
          <div class="col-12">
            <h1 class="page-title">
              <i class="fas fa-tachometer-alt me-2"></i>Dashboard
            </h1>
            <p class="page-subtitle">Welcome back! Here's your learning overview.</p>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="row mb-4" *ngIf="userAnalytics">
          <div class="col-md-3">
            <div class="dashboard-card">
              <div class="card-body text-center">
                <div class="stat-number">{{ userAnalytics.enrolledCoursesCount }}</div>
                <div class="stat-label">Enrolled Courses</div>
                <i class="fas fa-book-open stat-icon"></i>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="dashboard-card">
              <div class="card-body text-center">
                <div class="stat-number">{{ userAnalytics.completedCoursesCount }}</div>
                <div class="stat-label">Completed Courses</div>
                <i class="fas fa-check-circle stat-icon"></i>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="dashboard-card">
              <div class="card-body text-center">
                <div class="stat-number">{{ userAnalytics.averageQuizScore }}%</div>
                <div class="stat-label">Avg Quiz Score</div>
                <i class="fas fa-chart-bar stat-icon"></i>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="dashboard-card">
              <div class="card-body text-center">
                <div class="stat-number">{{ userAnalytics.points }}</div>
                <div class="stat-label">Total Points</div>
                <i class="fas fa-star stat-icon"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="row">
          <!-- Continue Learning -->
          <div class="col-lg-8">
            <div class="dashboard-card">
              <div class="card-header">
                <h5 class="mb-0">
                  <i class="fas fa-play-circle me-2"></i>Continue Learning
                </h5>
              </div>
              <div class="card-body">
                <div *ngIf="enrolledCourses.length === 0" class="text-center py-5">
                  <i class="fas fa-book-open fa-3x text-muted mb-3"></i>
                  <h5 class="text-muted">No courses enrolled yet</h5>
                  <p class="text-muted">Browse our courses and start your learning journey!</p>
                  <a routerLink="/courses" class="btn btn-primary">
                    <i class="fas fa-search me-2"></i>Browse Courses
                  </a>
                </div>

                <div *ngIf="enrolledCourses.length > 0" class="course-list">
                  <div class="course-item" *ngFor="let course of enrolledCourses.slice(0, 3)">
                    <div class="d-flex align-items-center">
                      <img [src]="course.course?.thumbnail || 'https://via.placeholder.com/80x60/667eea/ffffff?text=Course'"
                           [alt]="course.course?.title" class="course-thumbnail me-3">
                      <div class="flex-grow-1">
                        <h6 class="mb-1">{{ course.course?.title }}</h6>
                        <div class="progress mb-2" style="height: 8px;">
                          <div class="progress-bar" [style.width.%]="course.progress"></div>
                        </div>
                        <small class="text-muted">{{ course.progress }}% complete</small>
                      </div>
                      <a [routerLink]="['/courses', course.course?._id]" class="btn btn-sm btn-outline-primary ms-3">
                        <i class="fas fa-play me-1"></i>Continue
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Recent Activity -->
            <div class="dashboard-card mt-4">
              <div class="card-header">
                <h5 class="mb-0">
                  <i class="fas fa-history me-2"></i>Recent Activity
                </h5>
              </div>
              <div class="card-body">
                <div *ngIf="!userAnalytics?.recentActivity?.quizzesTaken" class="text-center py-4">
                  <i class="fas fa-clock fa-2x text-muted mb-2"></i>
                  <p class="text-muted mb-0">No recent activity</p>
                </div>

                <div *ngIf="userAnalytics?.recentActivity?.quizzesTaken" class="activity-list">
                  <div class="activity-item">
                    <div class="activity-icon">
                      <i class="fas fa-question-circle"></i>
                    </div>
                    <div class="activity-content">
                      <p class="mb-0">Completed {{ userAnalytics.recentActivity.quizzesTaken }} quiz(es) this month</p>
                      <small class="text-muted">Average score: {{ userAnalytics.recentActivity.averageScore }}%</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="col-lg-4">
            <!-- AI Recommendations -->
            <div class="dashboard-card">
              <div class="card-header">
                <h5 class="mb-0">
                  <i class="fas fa-lightbulb me-2"></i>Recommended for You
                </h5>
              </div>
              <div class="card-body">
                <div *ngIf="recommendations.length === 0" class="text-center py-3">
                  <i class="fas fa-magic fa-2x text-muted mb-2"></i>
                  <p class="text-muted small mb-0">Complete more courses to get personalized recommendations</p>
                </div>

                <div *ngIf="recommendations.length > 0" class="recommendation-list">
                  <div class="recommendation-item" *ngFor="let rec of recommendations.slice(0, 3)">
                    <h6 class="mb-1">{{ rec.title }}</h6>
                    <p class="text-muted small mb-2">{{ rec.description | slice:0:60 }}...</p>
                    <span class="badge bg-primary">{{ rec.category }}</span>
                  </div>
                </div>

                <div class="text-center mt-3" *ngIf="recommendations.length > 0">
                  <a routerLink="/recommendations" class="btn btn-sm btn-outline-primary">
                    View All Recommendations
                  </a>
                </div>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="dashboard-card mt-4">
              <div class="card-header">
                <h5 class="mb-0">
                  <i class="fas fa-bolt me-2"></i>Quick Actions
                </h5>
              </div>
              <div class="card-body">
                <div class="d-grid gap-2">
                  <a routerLink="/courses" class="btn btn-outline-primary">
                    <i class="fas fa-search me-2"></i>Browse Courses
                  </a>
                  <a routerLink="/recommendations" class="btn btn-outline-success">
                    <i class="fas fa-question-circle me-2"></i>Find a Quiz
                  </a>
                  <a routerLink="/leaderboard" class="btn btn-outline-warning">
                    <i class="fas fa-trophy me-2"></i>View Leaderboard
                  </a>
                  <a routerLink="/progress" class="btn btn-outline-info">
                    <i class="fas fa-chart-line me-2"></i>Track Progress
                  </a>
                </div>
              </div>
            </div>

            <!-- Achievements -->
            <div class="dashboard-card mt-4" *ngIf="userAnalytics">
              <div class="card-header">
                <h5 class="mb-0">
                  <i class="fas fa-medal me-2"></i>Achievements
                </h5>
              </div>
              <div class="card-body">
                <div class="achievement-item">
                  <div class="achievement-icon">
                    <i class="fas fa-fire"></i>
                  </div>
                  <div>
                    <h6 class="mb-0">{{ userAnalytics.streak }} Day Streak</h6>
                    <small class="text-muted">Keep learning daily!</small>
                  </div>
                </div>
                <div class="achievement-item">
                  <div class="achievement-icon">
                    <i class="fas fa-level-up-alt"></i>
                  </div>
                  <div>
                    <h6 class="mb-0">Level {{ userAnalytics.currentLevel }}</h6>
                    <small class="text-muted">{{ userAnalytics.points }} points earned</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page {
      padding: 20px 0;
    }

    .page-title {
      font-size: 2.5rem;
      font-weight: bold;
      color: #333;
      margin-bottom: 10px;
    }

    .page-subtitle {
      color: #666;
      font-size: 1.1rem;
    }

    .dashboard-card {
      border: none;
      border-radius: 15px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }

    .dashboard-card .card-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 15px 15px 0 0 !important;
      border: none;
      padding: 20px;
    }

    .dashboard-card .card-body {
      padding: 25px;
    }

    .stat-number {
      font-size: 2.5rem;
      font-weight: bold;
      color: #667eea;
      margin-bottom: 5px;
    }

    .stat-label {
      color: #6c757d;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .stat-icon {
      font-size: 2rem;
      color: #667eea;
      margin-top: 10px;
    }

    .course-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .course-item {
      padding: 15px 0;
      border-bottom: 1px solid #e9ecef;
    }

    .course-item:last-child {
      border-bottom: none;
    }

    .course-thumbnail {
      width: 80px;
      height: 60px;
      object-fit: cover;
      border-radius: 8px;
    }

    .activity-list {
      max-height: 300px;
      overflow-y: auto;
    }

    .activity-item {
      display: flex;
      align-items: center;
      padding: 15px 0;
      border-bottom: 1px solid #e9ecef;
    }

    .activity-item:last-child {
      border-bottom: none;
    }

    .activity-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 15px;
      font-size: 1.2rem;
    }

    .recommendation-list {
      max-height: 300px;
      overflow-y: auto;
    }

    .recommendation-item {
      padding: 15px 0;
      border-bottom: 1px solid #e9ecef;
    }

    .recommendation-item:last-child {
      border-bottom: none;
    }

    .achievement-item {
      display: flex;
      align-items: center;
      padding: 15px 0;
      border-bottom: 1px solid #e9ecef;
    }

    .achievement-item:last-child {
      border-bottom: none;
    }

    .achievement-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 15px;
      font-size: 1.2rem;
    }

    @media (max-width: 768px) {
      .page-title {
        font-size: 2rem;
      }

      .stat-number {
        font-size: 2rem;
      }

      .dashboard-card .card-body {
        padding: 20px;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  userAnalytics: any = null;
  enrolledCourses: any[] = [];
  recommendations: any[] = [];

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.checkAuth();
    this.loadDashboardData();
  }

  checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/auth/login']);
      return;
    }
  }

  loadDashboardData() {
    // Load user analytics
    this.apiService.getUserAnalytics().subscribe({
      next: (response) => {
        if (response.success) {
          this.userAnalytics = {
            ...response.data,
            points: response.data.totalPoints ?? response.data.points ?? 0
          };
        }
      },
      error: (error) => {
        console.error('Error loading user analytics:', error);
      }
    });

    // Load enrolled courses
    this.apiService.getUserProgress().subscribe({
      next: (response) => {
        if (response.success) {
          this.enrolledCourses = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading enrolled courses:', error);
      }
    });

    // Load recommendations
    this.apiService.getCourseRecommendations().subscribe({
      next: (response) => {
        if (response.success) {
          // Combine different types of recommendations
          this.recommendations = [
            ...(response.data.contentBased || []),
            ...(response.data.collaborative || []),
            ...(response.data.performanceBased || []),
            ...(response.data.popular || [])
          ].slice(0, 5);
        }
      },
      error: (error) => {
        console.error('Error loading recommendations:', error);
      }
    });
  }
}
