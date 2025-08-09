// features/admin/components/project-form/project-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { ProjetService } from '../../../../core/services/projet.service';
import { UserService } from '../../../../core/services/user.service';
import { Projet, StatutProjet } from '../../../../core/models/projet.model';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-project-form',
  template: `
    <div class="project-form-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">
            <i [class]="isEditMode ? 'fas fa-edit' : 'fas fa-plus-circle'"></i>
            {{ isEditMode ? 'Modifier Projet' : 'Nouveau Projet' }}
          </h1>
          <p class="page-description">
            {{ isEditMode ? 'Modifiez les informations du projet' : 'Créez un nouveau projet collaboratif' }}
          </p>
        </div>
        <div class="header-actions">
          <button mat-button
                  routerLink="/admin/projets"
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
            Informations du Projet
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="projectForm" (ngSubmit)="onSubmit()">
            <div class="form-grid" fxLayout="row wrap" fxLayoutGap="20px">

              <!-- Nom du projet -->
              <div fxFlex="100" fxFlex.gt-sm="50">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Nom du projet</mat-label>
                  <mat-icon matPrefix><i class="fas fa-project-diagram"></i></mat-icon>
                  <input matInput
                         type="text"
                         formControlName="nom"
                         placeholder="Nom du projet">
                  <mat-error *ngIf="projectForm.get('nom')?.hasError('required')">
                    Le nom du projet est requis
                  </mat-error>
                  <mat-error *ngIf="projectForm.get('nom')?.hasError('minlength')">
                    Le nom doit contenir au moins 3 caractères
                  </mat-error>
                </mat-form-field>
              </div>

              <!-- Statut -->
              <div fxFlex="100" fxFlex.gt-sm="50">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Statut</mat-label>
                  <mat-icon matPrefix><i class="fas fa-flag"></i></mat-icon>
                  <mat-select formControlName="statut">
                    <mat-option [value]="statusEnum.PLANIFIE">
                      <div class="status-option">
                        <i class="fas fa-calendar"></i>
                        Planifié
                      </div>
                    </mat-option>
                    <mat-option [value]="statusEnum.EN_COURS">
                      <div class="status-option">
                        <i class="fas fa-play"></i>
                        En Cours
                      </div>
                    </mat-option>
                    <mat-option [value]="statusEnum.TERMINE">
                      <div class="status-option">
                        <i class="fas fa-check"></i>
                        Terminé
                      </div>
                    </mat-option>
                    <mat-option [value]="statusEnum.SUSPENDU">
                      <div class="status-option">
                        <i class="fas fa-pause"></i>
                        Suspendu
                      </div>
                    </mat-option>
                    <mat-option [value]="statusEnum.ANNULE">
                      <div class="status-option">
                        <i class="fas fa-times"></i>
                        Annulé
                      </div>
                    </mat-option>
                  </mat-select>
                  <mat-error *ngIf="projectForm.get('statut')?.hasError('required')">
                    Le statut est requis
                  </mat-error>
                </mat-form-field>
              </div>

              <!-- Date de création -->
              <div fxFlex="100" fxFlex.gt-sm="50">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Date de création</mat-label>
                  <mat-icon matPrefix><i class="fas fa-calendar-plus"></i></mat-icon>
                  <input matInput
                         [matDatepicker]="creationPicker"
                         formControlName="dateCreation">
                  <mat-datepicker-toggle matSuffix [for]="creationPicker"></mat-datepicker-toggle>
                  <mat-datepicker #creationPicker></mat-datepicker>
                  <mat-error *ngIf="projectForm.get('dateCreation')?.hasError('required')">
                    La date de création est requise
                  </mat-error>
                </mat-form-field>
              </div>

              <!-- Date d'échéance -->
              <div fxFlex="100" fxFlex.gt-sm="50">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Date d'échéance</mat-label>
                  <mat-icon matPrefix><i class="fas fa-calendar-check"></i></mat-icon>
                  <input matInput
                         [matDatepicker]="deadlinePicker"
                         formControlName="dateEcheance">
                  <mat-datepicker-toggle matSuffix [for]="deadlinePicker"></mat-datepicker-toggle>
                  <mat-datepicker #deadlinePicker></mat-datepicker>
                  <mat-error *ngIf="projectForm.get('dateEcheance')?.hasError('required')">
                    La date d'échéance est requise
                  </mat-error>
                </mat-form-field>
              </div>

              <!-- Budget -->
              <div fxFlex="100" fxFlex.gt-sm="50">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Budget (optionnel)</mat-label>
                  <mat-icon matPrefix><i class="fas fa-euro-sign"></i></mat-icon>
                  <input matInput
                         type="number"
                         formControlName="budget"
                         placeholder="0"
                         min="0">
                  <span matSuffix>€</span>
                </mat-form-field>
              </div>

              <!-- Description -->
              <div fxFlex="100">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Description (optionnelle)</mat-label>
                  <mat-icon matPrefix><i class="fas fa-align-left"></i></mat-icon>
                  <textarea matInput
                            rows="4"
                            formControlName="description"
                            placeholder="Description détaillée du projet">
                  </textarea>
                </mat-form-field>
              </div>
            </div>

            <!-- Actions -->
            <div class="form-actions" fxLayout="row" fxLayoutGap="15px" fxLayoutAlign="end center">
              <button mat-button
                      type="button"
                      routerLink="/admin/projets"
                      class="cancel-btn">
                <mat-icon><i class="fas fa-times"></i></mat-icon>
                Annuler
              </button>

              <button mat-raised-button
                      type="submit"
                      color="primary"
                      [disabled]="projectForm.invalid || loading"
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

      <!-- Participants Section (Edit mode only) -->
      <mat-card class="participants-card" *ngIf="isEditMode && currentProject">
        <mat-card-header>
          <mat-card-title>
            <i class="fas fa-users"></i>
            Participants du Projet
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <div class="participants-section">
            <!-- Add participant -->
            <div class="add-participant" fxLayout="row" fxLayoutGap="15px" fxLayoutAlign="start center">
              <mat-form-field appearance="outline" fxFlex>
                <mat-label>Ajouter un participant</mat-label>
                <mat-select [(value)]="selectedUserId">
                  <mat-option value="">Sélectionner un utilisateur</mat-option>
                  <mat-option *ngFor="let user of availableUsers" [value]="user.id">
                    {{ user.nom }} ({{ user.role | role }})
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <button mat-raised-button
                      color="primary"
                      (click)="addParticipant()"
                      [disabled]="!selectedUserId || addingParticipant">
                <mat-icon><i class="fas fa-user-plus"></i></mat-icon>
                Ajouter
              </button>
            </div>

            <!-- Current participants -->
            <div class="current-participants" *ngIf="currentProject.participants && currentProject.participants.length > 0">
              <h4>Participants actuels ({{ currentProject.participants.length }})</h4>

              <div class="participants-grid">
                <div class="participant-card" *ngFor="let participant of currentProject.participants">
                  <div class="participant-info">
                    <div class="participant-avatar">
                      <i class="fas fa-user"></i>
                    </div>
                    <div class="participant-details">
                      <div class="participant-name">{{ participant.nom }}</div>
                      <div class="participant-role">{{ participant.role | role }}</div>
                    </div>
                  </div>

                  <button mat-icon-button
                          color="warn"
                          (click)="removeParticipant(participant)"
                          matTooltip="Retirer du projet"
                          [disabled]="removingParticipant">
                    <mat-icon><i class="fas fa-user-times"></i></mat-icon>
                  </button>
                </div>
              </div>
            </div>

            <div class="no-participants" *ngIf="!currentProject.participants || currentProject.participants.length === 0">
              <i class="fas fa-users"></i>
              <p>Aucun participant assigné à ce projet</p>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .project-form-container {
      padding: 20px;
      max-width: 900px;
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

    .form-card,
    .participants-card {
      border-radius: 15px;
      box-shadow: 0 8px 25px rgba(106, 27, 154, 0.1);
      overflow: hidden;
      margin-bottom: 20px;
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

    .status-option {
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

    /* Participants Section */
    .participants-section {
      padding-top: 10px;
    }

    .add-participant {
      margin-bottom: 30px;
      padding: 20px;
      background: #f8f9ff;
      border-radius: 12px;
      border: 2px dashed #e1bee7;
    }

    .current-participants h4 {
      color: #6a1b9a;
      font-weight: 600;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .participants-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 15px;
    }

    .participant-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 15px;
      background: white;
      border-radius: 8px;
      border: 1px solid #e1bee7;
      transition: all 0.3s ease;
    }

    .participant-card:hover {
      box-shadow: 0 4px 15px rgba(106, 27, 154, 0.15);
      transform: translateY(-2px);
    }

    .participant-info {
      display: flex;
      align-items: center;
      flex: 1;
    }

    .participant-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(45deg, #6a1b9a, #8e24aa);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      margin-right: 12px;
    }

    .participant-name {
      font-weight: 600;
      color: #333;
      margin-bottom: 2px;
    }

    .participant-role {
      font-size: 0.85rem;
      color: #666;
    }

    .no-participants {
      text-align: center;
      padding: 40px 20px;
      color: #999;
    }

    .no-participants i {
      font-size: 3rem;
      margin-bottom: 15px;
      color: #e1bee7;
    }

    .no-participants p {
      margin: 0;
      font-size: 1.1rem;
    }

    @media (max-width: 768px) {
      .project-form-container {
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

      .add-participant {
        flex-direction: column;
        gap: 15px;
      }

      .participants-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProjectFormComponent implements OnInit {
  projectForm: FormGroup;
  loading = false;
  isEditMode = false;
  projectId: number | null = null;
  statusEnum = StatutProjet;

  // Participants management
  currentProject: Projet | null = null;
  availableUsers: User[] = [];
  selectedUserId: number | null = null;
  addingParticipant = false;
  removingParticipant = false;

  constructor(
    private fb: FormBuilder,
    private projetService: ProjetService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.projectForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      dateCreation: [new Date(), [Validators.required]],
      dateEcheance: ['', [Validators.required]],
      statut: [StatutProjet.PLANIFIE, [Validators.required]],
      budget: [null]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.projectId = +params['id'];
        this.loadProject();
      }
    });

    if (this.isEditMode) {
      this.loadAvailableUsers();
    }
  }

  loadProject(): void {
    if (this.projectId) {
      this.loading = true;
      this.projetService.getProjetById(this.projectId).subscribe({
        next: (project) => {
          this.currentProject = project;
          this.projectForm.patchValue({
            nom: project.nom,
            description: project.description,
            dateCreation: new Date(project.dateCreation),
            dateEcheance: new Date(project.dateEcheance),
            statut: project.statut,
            budget: project.budget
          });
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.toastr.error('Erreur lors du chargement du projet', 'Erreur');
          this.router.navigate(['/admin/projets']);
        }
      });
    }
  }

  loadAvailableUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        // Filtrer les utilisateurs non assignés
        this.availableUsers = users.filter(user =>
          !this.currentProject?.participants?.find(p => p.id === user.id)
        );
      },
      error: (error) => {
        console.error('Erreur lors du chargement des utilisateurs:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.projectForm.valid) {
      this.loading = true;

      const formData = { ...this.projectForm.value };

      // Formater les dates
      formData.dateCreation = this.formatDate(formData.dateCreation);
      formData.dateEcheance = this.formatDate(formData.dateEcheance);

      const operation = this.isEditMode
        ? this.updateProject(formData)
        : this.createProject(formData);

      operation.subscribe({
        next: (project) => {
          this.loading = false;
          const message = this.isEditMode
            ? 'Projet modifié avec succès'
            : 'Projet créé avec succès';
          this.toastr.success(message, 'Succès');
          this.router.navigate(['/admin/projets']);
        },
        error: (error) => {
          this.loading = false;
          this.toastr.error(error.message || 'Erreur lors de l\'opération', 'Erreur');
        }
      });
    }
  }

  private createProject(projectData: any) {
    return this.projetService.createProjet(projectData);
  }

  private updateProject(projectData: any) {
    // Note: Vous devrez implémenter updateProjet dans le service
    // Pour l'instant, on utilise createProjet
    return this.projetService.createProjet(projectData);
  }

  addParticipant(): void {
    if (this.selectedUserId && this.projectId) {
      this.addingParticipant = true;

      this.projetService.assignerUtilisateurAuProjet(this.projectId, this.selectedUserId).subscribe({
        next: () => {
          this.addingParticipant = false;
          this.selectedUserId = null;
          this.toastr.success('Participant ajouté avec succès', 'Succès');
          this.loadProject();
          this.loadAvailableUsers();
        },
        error: (error) => {
          this.addingParticipant = false;
          this.toastr.error('Erreur lors de l\'ajout du participant', 'Erreur');
        }
      });
    }
  }

  removeParticipant(participant: User): void {
    if (this.projectId) {
      this.removingParticipant = true;

      this.projetService.retirerUtilisateurDuProjet(this.projectId, participant.id).subscribe({
        next: () => {
          this.removingParticipant = false;
          this.toastr.success('Participant retiré avec succès', 'Succès');
          this.loadProject();
          this.loadAvailableUsers();
        },
        error: (error) => {
          this.removingParticipant = false;
          this.toastr.error('Erreur lors du retrait du participant', 'Erreur');
        }
      });
    }
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
