// features/auth/components/register/register.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Role } from '../../../../core/models/user.model';

@Component({
  selector: 'app-register',
  template: `
    <div class="register-form">
      <h2 class="form-title">Inscription</h2>

      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nom complet</mat-label>
          <mat-icon matPrefix><i class="fas fa-user"></i></mat-icon>
          <input matInput
                 type="text"
                 formControlName="nom"
                 placeholder="Votre nom complet">
          <mat-error *ngIf="registerForm.get('nom')?.hasError('required')">
            Le nom est requis
          </mat-error>
          <mat-error *ngIf="registerForm.get('nom')?.hasError('minlength')">
            Le nom doit contenir au moins 2 caractères
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Email</mat-label>
          <mat-icon matPrefix><i class="fas fa-envelope"></i></mat-icon>
          <input matInput
                 type="email"
                 formControlName="email"
                 placeholder="votre@email.com">
          <mat-error *ngIf="registerForm.get('email')?.hasError('required')">
            L'email est requis
          </mat-error>
          <mat-error *ngIf="registerForm.get('email')?.hasError('email')">
            Format d'email invalide
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Rôle</mat-label>
          <mat-icon matPrefix><i class="fas fa-user-tag"></i></mat-icon>
          <mat-select formControlName="role">
            <mat-option [value]="roleEnum.MEMBRE_EQUIPE">
              Membre d'équipe
            </mat-option>
            <mat-option [value]="roleEnum.CHEF_DE_PROJECT">
              Chef de projet
            </mat-option>
          </mat-select>
          <mat-error *ngIf="registerForm.get('role')?.hasError('required')">
            Le rôle est requis
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
          <mat-error *ngIf="registerForm.get('motDePasse')?.hasError('required')">
            Le mot de passe est requis
          </mat-error>
          <mat-error *ngIf="registerForm.get('motDePasse')?.hasError('minlength')">
            Le mot de passe doit contenir au moins 6 caractères
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Confirmer le mot de passe</mat-label>
          <mat-icon matPrefix><i class="fas fa-lock"></i></mat-icon>
          <input matInput
                 [type]="hideConfirmPassword ? 'password' : 'text'"
                 formControlName="confirmPassword"
                 placeholder="Confirmez votre mot de passe">
          <button mat-icon-button
                  matSuffix
                  type="button"
                  (click)="hideConfirmPassword = !hideConfirmPassword">
            <mat-icon>
              <i [class]="hideConfirmPassword ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
            </mat-icon>
          </button>
          <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('required')">
            La confirmation est requise
          </mat-error>
          <mat-error *ngIf="registerForm.hasError('mismatch')">
            Les mots de passe ne correspondent pas
          </mat-error>
        </mat-form-field>

        <div class="form-actions">
          <button mat-raised-button
                  type="submit"
                  class="register-btn full-width"
                  [disabled]="registerForm.invalid || loading">
            <mat-icon *ngIf="loading"><i class="fas fa-spinner fa-spin"></i></mat-icon>
            <span *ngIf="!loading">S'inscrire</span>
            <span *ngIf="loading">Inscription...</span>
          </button>
        </div>

        <div class="form-footer">
          <p>Déjà un compte ?
            <a routerLink="/auth/login" class="login-link">Se connecter</a>
          </p>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .register-form {
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

    .register-btn {
      height: 48px;
      background: linear-gradient(45deg, #6a1b9a, #8e24aa);
      color: white;
      font-size: 1.1rem;
      font-weight: 600;
      border-radius: 24px;
      transition: all 0.3s ease;
    }

    .register-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(106, 27, 154, 0.3);
    }

    .register-btn:disabled {
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

    .login-link {
      color: #6a1b9a;
      text-decoration: none;
      font-weight: 600;
      transition: color 0.3s ease;
    }

    .login-link:hover {
      color: #8e24aa;
      text-decoration: underline;
    }
  `]
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  loading = false;
  hidePassword = true;
  hideConfirmPassword = true;
  roleEnum = Role;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.registerForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      role: [Role.MEMBRE_EQUIPE, [Validators.required]],
      motDePasse: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Rediriger si déjà connecté
    if (this.authService.isAuthenticated()) {
      this.authService.redirectByRole();
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('motDePasse');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { mismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading = true;

      const { confirmPassword, ...registerData } = this.registerForm.value;

      this.authService.register(registerData).subscribe({
        next: (response) => {
          this.loading = false;
          this.toastr.success('Inscription réussie !', 'Bienvenue');
          this.authService.redirectByRole();
        },
        error: (error) => {
          this.loading = false;
          this.toastr.error(error.message || 'Erreur d\'inscription', 'Erreur');
        }
      });
    }
  }
}
