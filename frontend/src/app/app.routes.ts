import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: '',
    loadComponent: () => import('./pages/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: 'home',
        loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'courses',
        loadComponent: () => import('./pages/courses/courses').then(m => m.CoursesComponent)
      },
      {
        path: 'courses/:id',
        loadComponent: () => import('./pages/course-player/course-player').then(m => m.CoursePlayerComponent)
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'quiz/:id',
        loadComponent: () => import('./pages/quiz/quiz').then(m => m.QuizComponent)
      },
      {
        path: 'leaderboard',
        loadComponent: () => import('./pages/leaderboard/leaderboard').then(m => m.LeaderboardComponent)
      },
      {
        path: 'progress',
        loadComponent: () => import('./pages/progress/progress').then(m => m.ProgressComponent)
      },
      {
        path: 'recommendations',
        loadComponent: () => import('./pages/recommendations/recommendations').then(m => m.RecommendationsComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile').then(m => m.ProfileComponent)
      },
      {
        path: 'badges',
        loadComponent: () => import('./pages/badges/badges').then(m => m.BadgesComponent)
      }
    ]
  },
  {
    path: 'auth',
    loadComponent: () => import('./auth/auth.component').then(m => m.AuthComponent),
    children: [
      {
        path: 'login',
        loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'signup',
        loadComponent: () => import('./auth/signup/signup.component').then(m => m.SignupComponent)
      }
    ]
  },
  { path: '**', redirectTo: '/home' }
];