import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="auth-container">
      <div class="auth-wrapper">
        <div class="auth-header">
          <h1 class="auth-title">
            <i class="fas fa-graduation-cap me-2"></i>
            Smart E-Learning
          </h1>
          <p class="auth-subtitle">Your personalized learning journey starts here</p>
        </div>
        <div class="auth-content">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .auth-wrapper {
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
      overflow: hidden;
      max-width: 500px;
      width: 100%;
    }

    .auth-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }

    .auth-title {
      font-size: 2rem;
      font-weight: bold;
      margin-bottom: 10px;
    }

    .auth-subtitle {
      font-size: 1.1rem;
      opacity: 0.9;
      margin: 0;
    }

    .auth-content {
      padding: 40px 30px;
    }

    @media (max-width: 768px) {
      .auth-container {
        padding: 10px;
      }

      .auth-header {
        padding: 30px 20px;
      }

      .auth-title {
        font-size: 1.5rem;
      }

      .auth-content {
        padding: 30px 20px;
      }
    }
  `]
})
export class AuthComponent {}