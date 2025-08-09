// features/auth/components/login/login.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  template: `
    <div class="login-form">
      <h2 class="form-title">Connexion</h2>

      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Email</mat-label>
          <mat-icon matPrefix><i class="fas fa-envelope"></i></mat-icon>
          <input matInput
                 type="email"
                 formControlName="email"
                 placeholder="votre@email.com">
          <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
            L'email est requis
          </mat-error>
          <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
            Format d'email invalide
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Mot de passe</mat-label>
          <mat-icon matPrefix><i class="fas fa-lock"></i></mat-icon>
          <input matInput
                 [type]="hidePassword ? 'password' : 'text'"
                 formControlName="motDePasse"
                 placeholder="Votre mot de passe">
          <button mat-icon-button
                  matSuffix
                  type="button"
                  (click)="hidePassword = !hidePassword">
            <mat-icon>
              <i [class]="hidePassword ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
            </mat-icon>
          </button>
          <mat-error *ngIf="loginForm.get('motDePasse')?.hasError('required')">
            Le mot de passe est requis
          </mat-error>
          <mat-error *ngIf="loginForm.get('motDePasse')?.hasError('minlength')">
            Le mot de passe doit contenir au moins 6 caractères
          </mat-error>
        </mat-form-field>

        <div class="form-actions">
          <button mat-raised-button
                  type="submit"
                  class="login-btn full-width"
                  [disabled]="loginForm.invalid || loading">
            <mat-icon *ngIf="loading"><i class="fas fa-spinner fa-spin"></i></mat-icon>
            <span *ngIf="!loading">Se connecter</span>
            <span *ngIf="loading">Connexion...</span>
          </button>
        </div>

        <div class="form-footer">
          <p>Pas encore de compte ?
            <a routerLink="/auth/register" class="register-link">S'inscrire</a>
          </p>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .login-form {
      width: 100%;
    }

    .form-title {
      text-align: center;
      margin: 0 0 30px 0;
      font-size: 1.8rem;
      font-weight: 600;
      color: #6a1b9a;
    }

    .full-width {
      width: 100%;
      margin-bottom: 20px;
    }

    ::ng-deep .mat-form-field-outline {
      color: #e1bee7;
    }

    ::ng-deep .mat-form-field-label {
      color: #6a1b9a;
    }

    ::ng-deep .mat-icon {
      color: #8e24aa;
    }

    .form-actions {
      margin: 30px 0 20px 0;
    }

    .login-btn {
      height: 48px;
      background: linear-gradient(45deg, #6a1b9a, #8e24aa);
      color: white;
      font-size: 1.1rem;
      font-weight: 600;
      border-radius: 24px;
      transition: all 0.3s ease;
    }

    .login-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(106, 27, 154, 0.3);
    }

    .login-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .form-footer {
      text-align: center;
      margin-top: 20px;
    }

    .form-footer p {
      color: #666;
      margin: 0;
    }

    .register-link {
      color: #6a1b9a;
      text-decoration: none;
      font-weight: 600;
      transition: color 0.3s ease;
    }

    .register-link:hover {
      color: #8e24aa;
      text-decoration: underline;
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Rediriger si déjà connecté
    if (this.authService.isAuthenticated()) {
      this.authService.redirectByRole();
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.loading = false;
          this.toastr.success('Connexion réussie !', 'Bienvenue');
          this.authService.redirectByRole();
        },
        error: (error) => {
          this.loading = false;
          this.toastr.error(error.message || 'Erreur de connexion', 'Erreur');
        }
      });
    }
  }
}
