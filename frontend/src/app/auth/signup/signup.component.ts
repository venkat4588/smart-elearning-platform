import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="signup-form">
      <h2 class="form-title">Create Account</h2>
      <p class="form-subtitle">Join our learning community today</p>

      <form [formGroup]="signupForm" (ngSubmit)="onSubmit()" class="fade-in">
        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label for="name" class="form-label">
                <i class="fas fa-user me-2"></i>Full Name
              </label>
              <input
                type="text"
                id="name"
                formControlName="name"
                class="form-control"
                placeholder="Enter your full name"
                [class.is-invalid]="submitted && signupForm.get('name')?.invalid"
              >
              <div class="invalid-feedback" *ngIf="submitted && signupForm.get('name')?.invalid">
                Full name is required.
              </div>
            </div>
          </div>
          <div class="col-md-6">
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
                [class.is-invalid]="submitted && signupForm.get('email')?.invalid"
              >
              <div class="invalid-feedback" *ngIf="submitted && signupForm.get('email')?.invalid">
                Please enter a valid email address.
              </div>
            </div>
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
            placeholder="Create a password"
            [class.is-invalid]="submitted && signupForm.get('password')?.invalid"
          >
          <div class="invalid-feedback" *ngIf="submitted && signupForm.get('password')?.invalid">
            Password must be at least 6 characters long.
          </div>
        </div>

        <div class="form-group">
          <label for="confirmPassword" class="form-label">
            <i class="fas fa-lock me-2"></i>Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            formControlName="confirmPassword"
            class="form-control"
            placeholder="Confirm your password"
            [class.is-invalid]="submitted && (signupForm.get('confirmPassword')?.invalid || passwordsDontMatch)"
          >
          <div class="invalid-feedback" *ngIf="submitted && signupForm.get('confirmPassword')?.invalid">
            Please confirm your password.
          </div>
          <div class="invalid-feedback" *ngIf="submitted && passwordsDontMatch">
            Passwords do not match.
          </div>
        </div>

        <div class="form-group">
          <label for="role" class="form-label">
            <i class="fas fa-user-tag me-2"></i>I am a
          </label>
          <select
            id="role"
            formControlName="role"
            class="form-control"
          >
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
          </select>
        </div>

        <div class="form-group" *ngIf="signupForm.get('role')?.value === 'student'">
          <label class="form-label">
            <i class="fas fa-brain me-2"></i>Learning Preferences (Optional)
          </label>
          <div class="row">
            <div class="col-md-6">
              <select
                formControlName="learningStyle"
                class="form-control mb-2"
              >
                <option value="">Select learning style</option>
                <option value="visual">Visual</option>
                <option value="auditory">Auditory</option>
                <option value="kinesthetic">Kinesthetic</option>
                <option value="reading">Reading/Writing</option>
              </select>
            </div>
            <div class="col-md-6">
              <select
                formControlName="preferredDifficulty"
                class="form-control mb-2"
              >
                <option value="">Select difficulty level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
          <input
            type="text"
            formControlName="interests"
            class="form-control"
            placeholder="Interests (comma separated, e.g., javascript, python, design)"
          >
        </div>

        <div class="form-group">
          <div class="form-check">
            <input
              class="form-check-input"
              type="checkbox"
              id="terms"
              formControlName="acceptTerms"
              [class.is-invalid]="submitted && signupForm.get('acceptTerms')?.invalid"
            >
            <label class="form-check-label" for="terms">
              I agree to the <a href="#" class="text-decoration-none">Terms of Service</a> and <a href="#" class="text-decoration-none">Privacy Policy</a>
            </label>
          </div>
          <div class="invalid-feedback" *ngIf="submitted && signupForm.get('acceptTerms')?.invalid">
            You must accept the terms and conditions.
          </div>
        </div>

        <button
          type="submit"
          class="btn btn-primary w-100"
          [disabled]="loading"
        >
          <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
          {{ loading ? 'Creating account...' : 'Create Account' }}
        </button>
      </form>

      <div class="text-center mt-4">
        <p class="mb-0">Already have an account?
          <a routerLink="/auth/login" class="text-decoration-none fw-bold">Sign in</a>
        </p>
      </div>

      <div class="alert alert-danger mt-3" *ngIf="error">
        {{ error }}
      </div>
    </div>
  `,
  styles: [`
    .signup-form {
      max-width: 500px;
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

    @media (max-width: 768px) {
      .signup-form {
        max-width: 100%;
      }

      .row {
        margin: 0;
      }

      .col-md-6 {
        padding: 0;
        margin-bottom: 15px;
      }
    }
  `]
})
export class SignupComponent {
  signupForm: FormGroup;
  submitted = false;
  loading = false;
  error = '';
  passwordsDontMatch = false;

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.signupForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      role: ['student'],
      learningStyle: [''],
      preferredDifficulty: [''],
      interests: [''],
      acceptTerms: [false, Validators.requiredTrue]
    });
  }

  onSubmit() {
    this.submitted = true;
    this.error = '';
    this.passwordsDontMatch = false;

    // Check if passwords match
    if (this.signupForm.get('password')?.value !== this.signupForm.get('confirmPassword')?.value) {
      this.passwordsDontMatch = true;
      return;
    }

    if (this.signupForm.invalid) {
      return;
    }

    this.loading = true;

    const formData = { ...this.signupForm.value };
    delete formData.confirmPassword;
    delete formData.acceptTerms;

    // Convert interests string to array
    if (formData.interests) {
      formData.interests = formData.interests.split(',').map((interest: string) => interest.trim());
    }

    this.apiService.register(formData).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          localStorage.setItem('token', response.token);
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}