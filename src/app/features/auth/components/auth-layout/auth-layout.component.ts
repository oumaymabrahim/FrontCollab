// features/auth/components/auth-layout/auth-layout.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-auth-layout',
  template: `
    <div class="auth-container">
      <div class="auth-content">
        <div class="auth-card">
          <div class="auth-header">
            <div class="logo">
              <i class="fas fa-project-diagram"></i>
              <h1>CollabManager</h1>
            </div>
            <p class="tagline">Gérez vos projets collaboratifs en toute simplicité</p>
          </div>

          <div class="auth-body">
            <router-outlet></router-outlet>
          </div>
        </div>

        <div class="auth-footer">
          <p>&copy; 2024 CollabManager. Tous droits réservés.</p>
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

    .auth-content {
      width: 100%;
      max-width: 450px;
    }

    .auth-card {
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      overflow: hidden;
      animation: slideUp 0.6s ease-out;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(50px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .auth-header {
      background: linear-gradient(135deg, #6a1b9a, #8e24aa);
      color: white;
      padding: 40px 30px 30px;
      text-align: center;
    }

    .logo {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 10px;
    }

    .logo i {
      font-size: 3rem;
      margin-bottom: 10px;
      color: #e1bee7;
    }

    .logo h1 {
      margin: 0;
      font-size: 2rem;
      font-weight: 700;
    }

    .tagline {
      margin: 0;
      opacity: 0.9;
      font-size: 1rem;
    }

    .auth-body {
      padding: 30px;
    }

    .auth-footer {
      text-align: center;
      margin-top: 20px;
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.9rem;
    }

    @media (max-width: 480px) {
      .auth-card {
        margin: 10px;
        border-radius: 15px;
      }

      .auth-header {
        padding: 30px 20px 20px;
      }

      .auth-body {
        padding: 20px;
      }

      .logo h1 {
        font-size: 1.6rem;
      }
    }
  `]
})
export class AuthLayoutComponent { }
