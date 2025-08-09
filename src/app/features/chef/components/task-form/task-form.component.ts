// features/chef/components/task-form/task-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

import { TacheService } from '../../../../core/services/tache.service';
import { ProjetService } from '../../../../core/services/projet.service';
import { UserService } from '../../../../core/services/user.service';
import { Tache, StatutTache, Priorite } from '../../../../core/models/tache.model';
import { Projet } from '../../../../core/models/projet.model';
import { User, Role } from '../../../../core/models/user.model';

@Component({
  selector: 'app-task-form',
  template: `
    <div class="task-form-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">
            <i class="fas fa-plus-square" *ngIf="!isEditMode"></i>
            <i class="fas fa-edit" *ngIf="isEditMode"></i>
            {{ isEditMode ? 'Modifier la Tâche' : 'Nouvelle Tâche' }}
          </h1>
          <p class="page-description">
            {{ isEditMode ? 'Modifiez les informations de la tâche' : 'Créez une nouvelle tâche pour votre équipe' }}
          </p>
        </div>
        <div class="header-actions">
          <button mat-button
                  routerLink="/chef/taches"
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
            Informations de la Tâche
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="taskForm" (ngSubmit)="onSubmit()" class="task-form">

            <!-- Informations générales -->
            <div class="form-section">
              <h3 class="section-title">
                <i class="fas fa-clipboard-list"></i>
                Informations Générales
              </h3>

              <div class="form-row" fxLayout="column" fxLayoutGap="20px">
                <!-- Nom de la tâche -->
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Nom de la tâche *</mat-label>
                  <input matInput
                         formControlName="nom"
                         placeholder="Entrez le nom de la tâche"
                         maxlength="100">
                  <mat-hint align="end">{{ taskForm.get('nom')?.value?.length || 0 }}/100</mat-hint>
                  <mat-error *ngIf="taskForm.get('nom')?.hasError('required')">
                    Le nom de la tâche est obligatoire
                  </mat-error>
                  <mat-error *ngIf="taskForm.get('nom')?.hasError('minlength')">
                    Le nom doit contenir au moins 3 caractères
                  </mat-error>
                </mat-form-field>

                <!-- Description -->
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Description</mat-label>
                  <textarea matInput
                            formControlName="description"
                            placeholder="Décrivez la tâche en détail..."
                            rows="4"
                            maxlength="500"></textarea>
                  <mat-hint align="end">{{ taskForm.get('description')?.value?.length || 0 }}/500</mat-hint>
                </mat-form-field>
              </div>
            </div>

            <!-- Assignation -->
            <div class="form-section">
              <h3 class="section-title">
                <i class="fas fa-users"></i>
                Assignation
              </h3>

              <div class="form-row" fxLayout="row wrap" fxLayoutGap="20px">
                <!-- Projet -->
                <mat-form-field appearance="outline" fxFlex="100" fxFlex.gt-sm="48">
                  <mat-label>Projet *</mat-label>
                  <mat-select formControlName="projetId" (selectionChange)="onProjectChange()">
                    <mat-option value="">Sélectionnez un projet</mat-option>
                    <mat-option *ngFor="let projet of projects" [value]="projet.id">
                      <div class="project-option">
                        <div class="project-name">{{ projet.nom }}</div>
                        <div class="project-status">
                          <app-status-chip [status]="projet.statut" type="status" [showIcon]="false"></app-status-chip>
                        </div>
                      </div>
                    </mat-option>
                  </mat-select>
                  <mat-error *ngIf="taskForm.get('projetId')?.hasError('required')">
                    Le projet est obligatoire
                  </mat-error>
                </mat-form-field>

                <!-- Utilisateur assigné -->
                <mat-form-field appearance="outline" fxFlex="100" fxFlex.gt-sm="48">
                  <mat-label>Assigné à</mat-label>
                  <mat-select formControlName="utilisateurId">
                    <mat-option value="">Non assigné</mat-option>
                    <mat-option *ngFor="let user of availableUsers" [value]="user.id">
                      <div class="user-option">
                        <div class="user-avatar">
                          <i class="fas fa-user"></i>
                        </div>
                        <div class="user-info">
                          <div class="user-name">{{ user.nom }}</div>
                          <div class="user-email">{{ user.email }}</div>
                        </div>
                        <div class="user-role">
                          <app-status-chip [status]="user.role" type="role" [showIcon]="false"></app-status-chip>
                        </div>
                      </div>
                    </mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
            </div>

            <!-- Priorité et Statut -->
            <div class="form-section">
              <h3 class="section-title">
                <i class="fas fa-cog"></i>
                Priorité et Statut
              </h3>

              <div class="form-row" fxLayout="row wrap" fxLayoutGap="20px">
                <!-- Priorité -->
                <mat-form-field appearance="outline" fxFlex="100" fxFlex.gt-sm="48">
                  <mat-label>Priorité *</mat-label>
                  <mat-select formControlName="priorite">
                    <mat-option [value]="priorityEnum.BASSE">
                      <div class="priority-option priority-basse">
                        <i class="fas fa-chevron-down"></i>
                        <span>Basse</span>
                      </div>
                    </mat-option>
                    <mat-option [value]="priorityEnum.MOYENNE">
                      <div class="priority-option priority-moyenne">
                        <i class="fas fa-minus"></i>
                        <span>Moyenne</span>
                      </div>
                    </mat-option>
                    <mat-option [value]="priorityEnum.HAUTE">
                      <div class="priority-option priority-haute">
                        <i class="fas fa-chevron-up"></i>
                        <span>Haute</span>
                      </div>
                    </mat-option>
                    <mat-option [value]="priorityEnum.URGENTE">
                      <div class="priority-option priority-urgente">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>Urgente</span>
                      </div>
                    </mat-option>
                  </mat-select>
                  <mat-error *ngIf="taskForm.get('priorite')?.hasError('required')">
                    La priorité est obligatoire
                  </mat-error>
                </mat-form-field>

                <!-- Statut -->
                <mat-form-field appearance="outline" fxFlex="100" fxFlex.gt-sm="48">
                  <mat-label>Statut *</mat-label>
                  <mat-select formControlName="statut">
                    <mat-option [value]="statusEnum.EN_ATTENTE">
                      <div class="status-option status-en-attente">
                        <i class="fas fa-clock"></i>
                        <span>En Attente</span>
                      </div>
                    </mat-option>
                    <mat-option [value]="statusEnum.EN_COURS">
                      <div class="status-option status-en-cours">
                        <i class="fas fa-play"></i>
                        <span>En Cours</span>
                      </div>
                    </mat-option>
                    <mat-option [value]="statusEnum.TERMINEE">
                      <div class="status-option status-terminee">
                        <i class="fas fa-check"></i>
                        <span>Terminée</span>
                      </div>
                    </mat-option>
                  </mat-select>
                  <mat-error *ngIf="taskForm.get('statut')?.hasError('required')">
                    Le statut est obligatoire
                  </mat-error>
                </mat-form-field>
              </div>
            </div>

            <!-- Dates -->
            <div class="form-section">
              <h3 class="section-title">
                <i class="fas fa-calendar"></i>
                Dates
              </h3>

              <div class="form-row" fxLayout="row wrap" fxLayoutGap="20px">
                <!-- Date d'échéance -->
                <mat-form-field appearance="outline" fxFlex="100" fxFlex.gt-sm="48">
                  <mat-label>Date d'échéance *</mat-label>
                  <input matInput
                         [matDatepicker]="picker"
                         formControlName="dateEcheance"
                         placeholder="Sélectionnez une date">
                  <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                  <mat-datepicker #picker></mat-datepicker>
                  <mat-error *ngIf="taskForm.get('dateEcheance')?.hasError('required')">
                    La date d'échéance est obligatoire
                  </mat-error>
                  <mat-error *ngIf="taskForm.get('dateEcheance')?.hasError('pastDate')">
                    La date d'échéance ne peut pas être dans le passé
                  </mat-error>
                </mat-form-field>

                <div fxFlex="100" fxFlex.gt-sm="48" class="date-info" *ngIf="taskForm.get('dateEcheance')?.value">
                  <div class="info-card">
                    <div class="info-header">
                      <i class="fas fa-info-circle"></i>
                      <span>Informations sur l'échéance</span>
                    </div>
                    <div class="info-content">
                      <div class="info-item">
                        <span class="label">Jours restants:</span>
                        <span class="value" [ngClass]="getDaysRemainingClass()">
                          {{ getDaysRemaining() }} jour(s)
                        </span>
                      </div>
                      <div class="info-item">
                        <span class="label">Urgence:</span>
                        <span class="value">
                          <i [class]="getUrgencyIcon()" [ngClass]="getUrgencyClass()"></i>
                          {{ getUrgencyText() }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="form-actions" fxLayout="row" fxLayoutGap="15px" fxLayoutAlign="end center">
              <button type="button"
                      mat-button
                      (click)="onCancel()"
                      class="cancel-btn">
                <mat-icon><i class="fas fa-times"></i></mat-icon>
                Annuler
              </button>

              <button type="submit"
                      mat-raised-button
                      color="primary"
                      [disabled]="taskForm.invalid || loading"
                      class="submit-btn">
                <mat-icon><i class="fas fa-spinner fa-spin" *ngIf="loading"></i></mat-icon>
                <mat-icon><i class="fas fa-save" *ngIf="!loading"></i></mat-icon>
                {{ loading ? 'Enregistrement...' : (isEditMode ? 'Modifier' : 'Créer') }}
              </button>
            </div>

          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .task-form-container {
      padding: 20px;
      max-width: 1000px;
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

    .form-card mat-card-header {
      background: linear-gradient(90deg, #f8f9ff, #f0f4ff);
      padding: 20px 24px;
      margin: -16px -16px 0 -16px;
      border-bottom: 2px solid #e1bee7;
    }

    .form-card mat-card-title {
      color: #6a1b9a;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .task-form {
      padding: 20px 0;
    }

    .form-section {
      margin-bottom: 35px;
      padding-bottom: 25px;
      border-bottom: 2px dashed #e1bee7;
    }

    .form-section:last-of-type {
      border-bottom: none;
      margin-bottom: 20px;
    }

    .section-title {
      color: #6a1b9a;
      font-size: 1.2rem;
      font-weight: 600;
      margin: 0 0 20px 0;
      display: flex;
      align-items: center;
      gap: 10px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e1bee7;
    }

    .form-row {
      margin-bottom: 20px;
    }

    .full-width {
      width: 100%;
    }

    /* Options personnalisées */
    .project-option {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .project-name {
      font-weight: 500;
      color: #333;
    }

    .user-option {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 8px 0;
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(45deg, #6a1b9a, #8e24aa);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 0.9rem;
    }

    .user-info {
      flex: 1;
    }

    .user-name {
      font-weight: 500;
      color: #333;
      font-size: 0.9rem;
    }

    .user-email {
      font-size: 0.8rem;
      color: #666;
    }

    .priority-option, .status-option {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
    }

    .priority-basse { color: #4caf50; }
    .priority-moyenne { color: #ff9800; }
    .priority-haute { color: #e91e63; }
    .priority-urgente { color: #f44336; }

    .status-en-attente { color: #ff9800; }
    .status-en-cours { color: #2196f3; }
    .status-terminee { color: #4caf50; }

    /* Date info card */
    .date-info {
      display: flex;
      align-items: center;
    }

    .info-card {
      background: linear-gradient(135deg, #f8f9ff, #f0f4ff);
      border: 2px solid #e1bee7;
      border-radius: 12px;
      padding: 15px;
      width: 100%;
    }

    .info-header {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #6a1b9a;
      font-weight: 600;
      margin-bottom: 10px;
    }

    .info-content {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .info-item .label {
      color: #666;
      font-size: 0.9rem;
    }

    .info-item .value {
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .days-normal { color: #4caf50; }
    .days-warning { color: #ff9800; }
    .days-urgent { color: #f44336; }

    .urgency-low { color: #4caf50; }
    .urgency-medium { color: #ff9800; }
    .urgency-high { color: #f44336; }

    /* Actions */
    .form-actions {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #f0f0f0;
    }

    .cancel-btn {
      padding: 10px 25px;
      border: 2px solid #ccc;
      border-radius: 25px;
      font-weight: 600;
    }

    .submit-btn {
      padding: 10px 30px;
      border-radius: 25px;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .submit-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(106, 27, 154, 0.3);
    }

    .submit-btn:disabled {
      opacity: 0.6;
      transform: none;
      box-shadow: none;
    }

    /* Form field customizations */
    ::ng-deep .mat-form-field-outline {
      color: #e1bee7 !important;
    }

    ::ng-deep .mat-form-field-label {
      color: #6a1b9a !important;
    }

    ::ng-deep .mat-form-field.mat-focused .mat-form-field-outline-thick {
      color: #6a1b9a !important;
    }

    ::ng-deep .mat-form-field.mat-focused .mat-form-field-label {
      color: #6a1b9a !important;
    }

    ::ng-deep .mat-datepicker-toggle {
      color: #6a1b9a !important;
    }

    ::ng-deep .mat-select-arrow {
      color: #6a1b9a !important;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .task-form-container {
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
        flex-direction: column;
        align-items: stretch;
      }

      .cancel-btn,
      .submit-btn {
        margin: 5px 0;
      }

      .user-option {
        flex-direction: column;
        align-items: flex-start;
        gap: 5px;
      }
    }
  `]
})
export class TaskFormComponent implements OnInit {
  taskForm!: FormGroup;
  isEditMode = false;
  taskId?: number;
  loading = false;

  projects: Projet[] = [];
  availableUsers: User[] = [];

  priorityEnum = Priorite;
  statusEnum = StatutTache;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private tacheService: TacheService,
    private projetService: ProjetService,
    private userService: UserService,
    private toastr: ToastrService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.checkEditMode();
    this.loadProjects();
    this.loadUsers();
  }

  private initForm(): void {
    this.taskForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      projetId: ['', [Validators.required]],
      utilisateurId: [''],
      priorite: [Priorite.MOYENNE, [Validators.required]],
      statut: [StatutTache.EN_ATTENTE, [Validators.required]],
      dateEcheance: ['', [Validators.required, this.futureDateValidator]]
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.taskId = +id;
      this.loadTask();
    }
  }

  private loadTask(): void {
    if (!this.taskId) return;

    this.loading = true;
    this.tacheService.getTacheById(this.taskId).subscribe({
      next: (task) => {
        this.patchForm(task);
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.toastr.error('Erreur lors du chargement de la tâche', 'Erreur');
        console.error('Erreur:', error);
        this.router.navigate(['/chef/taches']);
      }
    });
  }

  private patchForm(task: Tache): void {
    this.taskForm.patchValue({
      nom: task.nom,
      description: task.description,
      projetId: task.projet?.id,
      utilisateurId: task.utilisateur?.id,
      priorite: task.priorite,
      statut: task.statut,
      dateEcheance: new Date(task.dateEcheance)
    });
  }

  private loadProjects(): void {
    this.projetService.getMesProjets().subscribe({
      next: (projects) => {
        this.projects = projects.filter(p => p.statut !== 'TERMINE' && p.statut !== 'ANNULE');
      },
      error: (error) => {
        console.error('Erreur lors du chargement des projets:', error);
      }
    });
  }

  private loadUsers(): void {
    this.userService.getUsersByRole(Role.MEMBRE_EQUIPE).subscribe({
      next: (users) => {
        this.availableUsers = users;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des utilisateurs:', error);
      }
    });
  }

  onProjectChange(): void {
    // Logique pour filtrer les utilisateurs selon le projet sélectionné
    // peut être implémentée plus tard si nécessaire
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      this.loading = true;
      const formValue = this.taskForm.value;

      const taskData: Tache = {
        id: this.taskId || 0,
        nom: formValue.nom,
        description: formValue.description,
        dateCreation: this.isEditMode ? '' : new Date().toISOString(),
        dateEcheance: formValue.dateEcheance.toISOString(),
        statut: formValue.statut,
        priorite: formValue.priorite,
        projet: this.projects.find(p => p.id === formValue.projetId),
        utilisateur: this.availableUsers.find(u => u.id === formValue.utilisateurId)
      };

      const request = this.isEditMode
        ? this.tacheService.updateTache(this.taskId!, taskData)
        : this.tacheService.createTache(taskData);

      request.subscribe({
        next: () => {
          const message = this.isEditMode
            ? 'Tâche modifiée avec succès'
            : 'Tâche créée avec succès';

          this.toastr.success(message, 'Succès');
          this.router.navigate(['/chef/taches']);
        },
        error: (error) => {
          this.loading = false;
          const message = this.isEditMode
            ? 'Erreur lors de la modification'
            : 'Erreur lors de la création';

          this.toastr.error(message, 'Erreur');
          console.error('Erreur:', error);
        }
      });
    } else {
      this.markFormGroupTouched();
      this.toastr.warning('Veuillez corriger les erreurs du formulaire', 'Formulaire invalide');
    }
  }

  onCancel(): void {
    this.router.navigate(['/chef/taches']);
  }

  // Validators
  private futureDateValidator(control: any) {
    if (!control.value) return null;

    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return { pastDate: true };
    }

    return null;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.taskForm.controls).forEach(key => {
      const control = this.taskForm.get(key);
      control?.markAsTouched();
    });
  }

  // Utility methods for date info
  getDaysRemaining(): number {
    const deadlineValue = this.taskForm.get('dateEcheance')?.value;
    if (!deadlineValue) return 0;

    const deadline = new Date(deadlineValue);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);

    const diffTime = deadline.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getDaysRemainingClass(): string {
    const days = this.getDaysRemaining();

    if (days <= 2) return 'days-urgent';
    if (days <= 7) return 'days-warning';
    return 'days-normal';
  }

  getUrgencyText(): string {
    const days = this.getDaysRemaining();

    if (days <= 1) return 'Très urgent';
    if (days <= 3) return 'Urgent';
    if (days <= 7) return 'Modéré';
    return 'Normal';
  }

  getUrgencyClass(): string {
    const days = this.getDaysRemaining();

    if (days <= 3) return 'urgency-high';
    if (days <= 7) return 'urgency-medium';
    return 'urgency-low';
  }

  getUrgencyIcon(): string {
    const days = this.getDaysRemaining();

    if (days <= 1) return 'fas fa-exclamation-triangle';
    if (days <= 3) return 'fas fa-clock';
    if (days <= 7) return 'fas fa-calendar-alt';
    return 'fas fa-calendar-check';
  }
}
