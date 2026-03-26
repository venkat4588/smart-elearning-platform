import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="login-form">
      <h2 class="form-title">Welcome Back</h2>
      <p class="form-subtitle">Sign in to continue your learning journey</p>

      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="fade-in">
        <div class="form-group">
          <label for="email" class="form-label">
            <i class="fas fa-envelope me-2"></i>Email Address
          </label>
          <input
            type="email"
            id="email"
            formControlName="email"
            class="form-control"
            placeholder="Enter your email"
            [class.is-invalid]="submitted && loginForm.get('email')?.invalid"
          >
          <div class="invalid-feedback" *ngIf="submitted && loginForm.get('email')?.invalid">
            Please enter a valid email address.
          </div>
        </div>

        <div class="form-group">
          <label for="password" class="form-label">
            <i class="fas fa-lock me-2"></i>Password
          </label>
          <input
            type="password"
            id="password"
            formControlName="password"
            class="form-control"
            placeholder="Enter your password"
            [class.is-invalid]="submitted && loginForm.get('password')?.invalid"
          >
          <div class="invalid-feedback" *ngIf="submitted && loginForm.get('password')?.invalid">
            Password is required.
          </div>
        </div>

        <div class="form-group d-flex justify-content-between align-items-center">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" id="rememberMe">
            <label class="form-check-label" for="rememberMe">
              Remember me
            </label>
          </div>
          <a href="#" class="text-decoration-none">Forgot password?</a>
        </div>

        <button
          type="submit"
          class="btn btn-primary w-100"
          [disabled]="loading"
        >
          <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <div class="text-center mt-4">
        <p class="mb-0">Don't have an account?
          <a routerLink="/auth/signup" class="text-decoration-none fw-bold">Sign up</a>
        </p>
      </div>

      <div class="alert alert-danger mt-3" *ngIf="error">
        {{ error }}
      </div>
    </div>
  `,
  styles: [`
    .login-form {
      max-width: 400px;
      margin: 0 auto;
    }

    .form-title {
      font-size: 1.8rem;
      font-weight: bold;
      color: #333;
      margin-bottom: 10px;
      text-align: center;
    }

    .form-subtitle {
      color: #6c757d;
      text-align: center;
      margin-bottom: 30px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-label {
      font-weight: 600;
      color: #333;
      margin-bottom: 8px;
      display: block;
    }

    .form-control {
      border-radius: 10px;
      padding: 12px 15px;
      border: 2px solid #e9ecef;
      font-size: 1rem;
      transition: border-color 0.3s ease;
    }

    .form-control:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
    }

    .form-control.is-invalid {
      border-color: #dc3545;
    }

    .invalid-feedback {
      display: block;
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 5px;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      border-radius: 25px;
      padding: 12px;
      font-weight: 600;
      font-size: 1rem;
      transition: all 0.3s ease;
    }

    .btn-primary:hover:not(:disabled) {
      background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
      transform: translateY(-2px);
    }

    .btn-primary:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .fade-in {
      animation: fadeIn 0.5s ease-in-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  submitted = false;
  loading = false;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    this.submitted = true;
    this.error = '';

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    this.apiService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          localStorage.setItem('token', response.token);
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Login failed. Please try again.';
      }
    });
  }
}