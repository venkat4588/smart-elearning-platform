import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="home-page">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="container">
          <div class="row align-items-center">
            <div class="col-lg-6">
              <h1 class="hero-title">
                Personalized Learning <br>
                <span class="text-gradient">Powered by AI</span>
              </h1>
              <p class="hero-subtitle">
                Discover courses tailored to your learning style, interests, and goals.
                Our AI-driven platform recommends the perfect content to accelerate your learning journey.
              </p>
              <div class="hero-buttons">
                <a routerLink="/auth/signup" class="btn btn-primary btn-lg me-3">
                  <i class="fas fa-rocket me-2"></i>Get Started Free
                </a>
                <a routerLink="/courses" class="btn btn-outline-primary btn-lg">
                  <i class="fas fa-book me-2"></i>Browse Courses
                </a>
              </div>
            </div>
            <div class="col-lg-6">
              <div class="hero-image">
                <img src="https://placehold.co/600x400/667eea/ffffff?text=AI+Learning" alt="AI Learning" class="img-fluid rounded">
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="features-section py-5">
        <div class="container">
          <div class="row text-center mb-5">
            <div class="col-12">
              <h2 class="section-title">Why Choose Smart E-Learning?</h2>
              <p class="section-subtitle">Experience the future of online education</p>
            </div>
          </div>
          <div class="row g-4">
            <div class="col-md-4">
              <div class="feature-card">
                <div class="feature-icon">
                  <i class="fas fa-brain"></i>
                </div>
                <h4>AI-Powered Recommendations</h4>
                <p>Get personalized course suggestions based on your learning history, performance, and interests.</p>
              </div>
            </div>
            <div class="col-md-4">
              <div class="feature-card">
                <div class="feature-icon">
                  <i class="fas fa-chart-line"></i>
                </div>
                <h4>Progress Tracking</h4>
                <p>Monitor your learning progress with detailed analytics and insights to improve your performance.</p>
              </div>
            </div>
            <div class="col-md-4">
              <div class="feature-card">
                <div class="feature-icon">
                  <i class="fas fa-users"></i>
                </div>
                <h4>Interactive Learning</h4>
                <p>Engage with quizzes, assignments, and collaborative learning experiences.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Popular Courses Section -->
      <section class="courses-section py-5 bg-light" *ngIf="popularCourses.length > 0">
        <div class="container">
          <div class="row mb-4">
            <div class="col-12 d-flex justify-content-between align-items-center">
              <div>
                <h2 class="section-title">Popular Courses</h2>
                <p class="section-subtitle">Start your learning journey with these trending courses</p>
              </div>
              <a routerLink="/courses" class="btn btn-outline-primary">
                View All Courses <i class="fas fa-arrow-right ms-2"></i>
              </a>
            </div>
          </div>
          <div class="row g-4">
            <div class="col-md-4" *ngFor="let course of popularCourses">
              <div class="course-card card h-100">
                <img [src]="course.thumbnail || 'https://placehold.co/400x250/667eea/ffffff?text=Course'" class="card-img-top" [alt]="course.title">
                <div class="card-body d-flex flex-column">
                  <h5 class="card-title">{{ course.title }}</h5>
                  <p class="card-text text-muted">{{ course.description | slice:0:100 }}...</p>
                  <div class="mt-auto">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <span class="badge bg-primary">{{ course.category }}</span>
                      <span class="badge bg-secondary">{{ course.level }}</span>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                      <small class="text-muted">
                        <i class="fas fa-users me-1"></i>{{ course.totalStudents || 0 }} students
                      </small>
                      <small class="text-warning">
                        <i class="fas fa-star me-1"></i>{{ course.averageRating || 0 }}/5
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Stats Section -->
      <section class="stats-section py-5">
        <div class="container">
          <div class="row text-center">
            <div class="col-md-3">
              <div class="stat-item">
                <div class="stat-number">10,000+</div>
                <div class="stat-label">Students</div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="stat-item">
                <div class="stat-number">500+</div>
                <div class="stat-label">Courses</div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="stat-item">
                <div class="stat-number">50+</div>
                <div class="stat-label">Instructors</div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="stat-item">
                <div class="stat-number">95%</div>
                <div class="stat-label">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="cta-section py-5 bg-primary text-white">
        <div class="container text-center">
          <h2 class="mb-4">Ready to Transform Your Learning Experience?</h2>
          <p class="mb-4 lead">Join thousands of learners who are already benefiting from our AI-powered platform.</p>
          <a routerLink="/auth/signup" class="btn btn-light btn-lg">
            <i class="fas fa-user-plus me-2"></i>Start Learning Today
          </a>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .hero-section {
      padding: 80px 0;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    .hero-title {
      font-size: 3.5rem;
      font-weight: bold;
      color: #333;
      margin-bottom: 20px;
      line-height: 1.2;
    }

    .text-gradient {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero-subtitle {
      font-size: 1.25rem;
      color: #666;
      margin-bottom: 30px;
      line-height: 1.6;
    }

    .hero-buttons .btn {
      margin-bottom: 10px;
    }

    .hero-image {
      text-align: center;
    }

    .features-section {
      background: white;
    }

    .section-title {
      font-size: 2.5rem;
      font-weight: bold;
      color: #333;
      margin-bottom: 10px;
    }

    .section-subtitle {
      font-size: 1.1rem;
      color: #666;
    }

    .feature-card {
      text-align: center;
      padding: 40px 20px;
      background: white;
      border-radius: 15px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
      transition: transform 0.3s ease;
    }

    .feature-card:hover {
      transform: translateY(-5px);
    }

    .feature-icon {
      font-size: 3rem;
      color: #667eea;
      margin-bottom: 20px;
    }

    .feature-card h4 {
      font-size: 1.25rem;
      font-weight: bold;
      margin-bottom: 15px;
      color: #333;
    }

    .courses-section {
      background: #f8f9fa;
    }

    .course-card {
      transition: transform 0.3s ease;
    }

    .course-card:hover {
      transform: translateY(-5px);
    }

    .stats-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .stat-item {
      padding: 40px 20px;
    }

    .stat-number {
      font-size: 3rem;
      font-weight: bold;
      margin-bottom: 10px;
    }

    .stat-label {
      font-size: 1.1rem;
      opacity: 0.9;
    }

    .cta-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    @media (max-width: 768px) {
      .hero-title {
        font-size: 2.5rem;
      }

      .hero-subtitle {
        font-size: 1.1rem;
      }

      .section-title {
        font-size: 2rem;
      }

      .feature-card {
        margin-bottom: 20px;
      }

      .stat-number {
        font-size: 2.5rem;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  popularCourses: any[] = [];

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    // Check if user is logged in and redirect to dashboard
    const token = localStorage.getItem('token');
    if (token) {
      this.router.navigate(['/dashboard']);
      return;
    }

    // Load some sample courses for display
    this.loadPopularCourses();
  }

  loadPopularCourses() {
    // For demo purposes, we'll show some placeholder courses
    // In a real app, this would come from the API
    this.popularCourses = [
      {
        title: 'Introduction to JavaScript',
        description: 'Learn the fundamentals of JavaScript programming language',
        category: 'programming',
        level: 'beginner',
        totalStudents: 1250,
        averageRating: 4.5,
        thumbnail: 'https://placehold.co/400x250/667eea/ffffff?text=JavaScript'
      },
      {
        title: 'Advanced React Development',
        description: 'Master advanced React concepts and build complex applications',
        category: 'programming',
        level: 'advanced',
        totalStudents: 890,
        averageRating: 4.7,
        thumbnail: 'https://placehold.co/400x250/764ba2/ffffff?text=React'
      },
      {
        title: 'Data Science Fundamentals',
        description: 'Introduction to data science, statistics, and machine learning',
        category: 'data-science',
        level: 'intermediate',
        totalStudents: 675,
        averageRating: 4.3,
        thumbnail: 'https://placehold.co/400x250/667eea/ffffff?text=Data+Science'
      }
    ];
  }
}