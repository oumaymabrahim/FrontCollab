// features/admin/components/user-form/user-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { UserService } from '../../../../core/services/user.service';
import { User, Role } from '../../../../core/models/user.model';

@Component({
  selector: 'app-user-form',
  template: `
    <div class="user-form-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">
            <i [class]="isEditMode ? 'fas fa-user-edit' : 'fas fa-user-plus'"></i>
            {{ isEditMode ? 'Modifier Utilisateur' : 'Nouvel Utilisateur' }}
          </h1>
          <p class="page-description">
          </p>
        </div>
        <div class="header-actions">
          <button mat-button
                  routerLink="/admin/utilisateurs"
                  class="back-btn">
            <mat-icon><i class="fas fa-arrow-left"></i></mat-icon>
            Retour
          </button>
        </div>
      </div>

      <!-- Form Card -->
      <mat-card class="form-card">
        <mat-card-header>
          <mat-card-title>
            <i class="fas fa-info-circle"></i>
            Informations Utilisateur
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
            <div class="form-grid" fxLayout="row wrap" fxLayoutGap="20px">

              <!-- Nom -->
              <div fxFlex="100" fxFlex.gt-sm="50">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Nom complet</mat-label>
                  <mat-icon matPrefix><i class="fas fa-user"></i></mat-icon>
                  <input matInput
                         type="text"
                         formControlName="nom"
                         placeholder="Nom et prénom">
                  <mat-error *ngIf="userForm.get('nom')?.hasError('required')">
                    Le nom est requis
                  </mat-error>
                  <mat-error *ngIf="userForm.get('nom')?.hasError('minlength')">
                    Le nom doit contenir au moins 2 caractères
                  </mat-error>
                </mat-form-field>
              </div>

              <!-- Email -->
              <div fxFlex="100" fxFlex.gt-sm="50">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Email</mat-label>
                  <mat-icon matPrefix><i class="fas fa-envelope"></i></mat-icon>
                  <input matInput
                         type="email"
                         formControlName="email"
                         placeholder="utilisateur@email.com">
                  <mat-error *ngIf="userForm.get('email')?.hasError('required')">
                    L'email est requis
                  </mat-error>
                  <mat-error *ngIf="userForm.get('email')?.hasError('email')">
                    Format d'email invalide
                  </mat-error>
                </mat-form-field>
              </div>

              <!-- Rôle -->
              <div fxFlex="100" fxFlex.gt-sm="50">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Rôle</mat-label>
                  <mat-icon matPrefix><i class="fas fa-user-tag"></i></mat-icon>
                  <mat-select formControlName="role">
                    <mat-option [value]="roleEnum.ADMIN">
                      <div class="role-option">
                        <i class="fas fa-crown"></i>
                        Administrateur
                      </div>
                    </mat-option>
                    <mat-option [value]="roleEnum.CHEF_DE_PROJECT">
                      <div class="role-option">
                        <i class="fas fa-user-tie"></i>
                        Chef de Projet
                      </div>
                    </mat-option>
                    <mat-option [value]="roleEnum.MEMBRE_EQUIPE">
                      <div class="role-option">
                        <i class="fas fa-user"></i>
                        Membre d'Équipe
                      </div>
                    </mat-option>
                  </mat-select>
                  <mat-error *ngIf="userForm.get('role')?.hasError('required')">
                    Le rôle est requis
                  </mat-error>
                </mat-form-field>
              </div>

              <!-- Mot de passe (seulement en création) -->
              <div fxFlex="100" fxFlex.gt-sm="50" *ngIf="!isEditMode">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Mot de passe</mat-label>
                  <mat-icon matPrefix><i class="fas fa-lock"></i></mat-icon>
                  <input matInput
                         [type]="hidePassword ? 'password' : 'text'"
                         formControlName="motDePasse"
                         placeholder="Mot de passe">
                  <button mat-icon-button
                          matSuffix
                          type="button"
                          (click)="hidePassword = !hidePassword">
                    <mat-icon>
                      <i [class]="hidePassword ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
                    </mat-icon>
                  </button>
                  <mat-error *ngIf="userForm.get('motDePasse')?.hasError('required')">
                    Le mot de passe est requis
                  </mat-error>
                  <mat-error *ngIf="userForm.get('motDePasse')?.hasError('minlength')">
                    Le mot de passe doit contenir au moins 6 caractères
                  </mat-error>
                </mat-form-field>
              </div>
            </div>

            <!-- Actions -->
            <div class="form-actions" fxLayout="row" fxLayoutGap="15px" fxLayoutAlign="end center">
              <button mat-button
                      type="button"
                      routerLink="/admin/utilisateurs"
                      class="cancel-btn">
                <mat-icon><i class="fas fa-times"></i></mat-icon>
                Annuler
              </button>

              <button mat-raised-button
                      type="submit"
                      color="primary"
                      [disabled]="userForm.invalid || loading"
                      class="save-btn">
                <mat-icon *ngIf="loading"><i class="fas fa-spinner fa-spin"></i></mat-icon>
                <mat-icon *ngIf="!loading"><i class="fas fa-save"></i></mat-icon>
                <span *ngIf="!loading">{{ isEditMode ? 'Modifier' : 'Créer' }}</span>
                <span *ngIf="loading">{{ isEditMode ? 'Modification...' : 'Création...' }}</span>
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .user-form-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 30px;
      padding: 30px;
      background: linear-gradient(135deg, #6a1b9a, #8e24aa);
      border-radius: 15px;
      color: white;
      box-shadow: 0 8px 25px rgba(106, 27, 154, 0.3);
    }

    .page-title {
      margin: 0 0 10px 0;
      font-size: 2rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .page-description {
      margin: 0;
      opacity: 0.9;
      font-size: 1.1rem;
    }

    .back-btn {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 25px;
      padding: 8px 20px;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .back-btn:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-2px);
    }

    .form-card {
      border-radius: 15px;
      box-shadow: 0 8px 25px rgba(106, 27, 154, 0.1);
      overflow: hidden;
    }

    ::ng-deep .mat-card-header {
      background: linear-gradient(90deg, #f8f9ff, #fff);
      padding: 20px 24px;
      border-bottom: 1px solid #e0e0e0;
    }

    ::ng-deep .mat-card-title {
      color: #6a1b9a;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0;
    }

    .form-grid {
      margin-top: 20px;
    }

    .full-width {
      width: 100%;
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

    .role-option {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .form-actions {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
    }

    .cancel-btn {
      color: #666;
      border: 1px solid #ddd;
      border-radius: 25px;
      padding: 8px 20px;
    }

    .save-btn {
      background: linear-gradient(45deg, #6a1b9a, #8e24aa);
      color: white;
      border-radius: 25px;
      padding: 8px 24px;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .save-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(106, 27, 154, 0.3);
    }

    .save-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .user-form-container {
        padding: 10px;
      }

      .page-header {
        flex-direction: column;
        gap: 20px;
        text-align: center;
      }

      .page-title {
        font-size: 1.6rem;
      }

      .form-actions {
        flex-direction: column-reverse;
        gap: 10px;
      }

      .cancel-btn,
      .save-btn {
        width: 100%;
      }
    }
  `]
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  loading = false;
  isEditMode = false;
  userId: number | null = null;
  hidePassword = true;
  roleEnum = Role;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.userForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      role: [Role.MEMBRE_EQUIPE, [Validators.required]],
      motDePasse: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.userId = +params['id'];
        this.loadUser();
        // En mode édition, le mot de passe n'est pas requis
        this.userForm.get('motDePasse')?.clearValidators();
        this.userForm.get('motDePasse')?.updateValueAndValidity();
      }
    });
  }

  loadUser(): void {
    if (this.userId) {
      this.loading = true;
      this.userService.getUserById(this.userId).subscribe({
        next: (user) => {
          this.userForm.patchValue({
            nom: user.nom,
            email: user.email,
            role: user.role
          });
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.toastr.error('Erreur lors du chargement de l\'utilisateur', 'Erreur');
          this.router.navigate(['/admin/utilisateurs']);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.loading = true;

      const formData = { ...this.userForm.value };

      // Si en mode édition et pas de nouveau mot de passe, le supprimer
      if (this.isEditMode && !formData.motDePasse) {
        delete formData.motDePasse;
      }

      const operation = this.isEditMode
        ? this.userService.updateUserByAdmin(this.userId!, formData)
        : this.userService.createUser(formData);

      operation.subscribe({
        next: (user) => {
          this.loading = false;
          const message = this.isEditMode
            ? 'Utilisateur modifié avec succès'
            : 'Utilisateur créé avec succès';
          this.toastr.success(message, 'Succès');
          this.router.navigate(['/admin/utilisateurs']);
        },
        error: (error) => {
          this.loading = false;
          this.toastr.error(error.message || 'Erreur lors de l\'opération', 'Erreur');
        }
      });
    }
  }
}
