
// features/admin/components/projects-management/projects-management.component.ts
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { ProjetService } from '../../../../core/services/projet.service';
import { Projet, StatutProjet } from '../../../../core/models/projet.model';
import { TableColumn, TableAction } from '../../../../shared/components/data-table/data-table.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-projects-management',
  template: `
    <div class="projects-management-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">
            <i class="fas fa-project-diagram"></i>
            Gestion des Projets
          </h1>
          <p class="page-description">
            Gérez tous les projets de la plateforme
          </p>
        </div>
        <div class="header-actions">
          <button mat-raised-button
                  color="primary"
                  routerLink="/admin/projets/create"
                  class="create-btn">
            <mat-icon><i class="fas fa-plus-circle"></i></mat-icon>
            Nouveau Projet
          </button>
        </div>
      </div>

      <!-- Filters -->
      <mat-card class="filters-card">
        <mat-card-content>
          <div class="filters-row" fxLayout="row wrap" fxLayoutGap="20px" fxLayoutAlign="start center">
            <mat-form-field appearance="outline" fxFlex="200px">
              <mat-label>Filtrer par statut</mat-label>
              <mat-select [(value)]="selectedStatus" (selectionChange)="onStatusFilterChange()">
                <mat-option value="">Tous les statuts</mat-option>
                <mat-option [value]="statusEnum.PLANIFIE">Planifié</mat-option>
                <mat-option [value]="statusEnum.EN_COURS">En Cours</mat-option>
                <mat-option [value]="statusEnum.TERMINE">Terminé</mat-option>
                <mat-option [value]="statusEnum.SUSPENDU">Suspendu</mat-option>
                <mat-option [value]="statusEnum.ANNULE">Annulé</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-button
                    color="primary"
                    (click)="refreshData()"
                    [disabled]="loading">
              <mat-icon><i class="fas fa-sync-alt" [class.fa-spin]="loading"></i></mat-icon>
              Actualiser
            </button>

            <span class="spacer"></span>

            <div class="stats-info" *ngIf="!loading">
              <span class="stat-item">
                <i class="fas fa-project-diagram"></i>
                <strong>{{ filteredProjects.length }}</strong> projet(s)
              </span>
              <span class="stat-item">
                <i class="fas fa-play text-warning"></i>
                <strong>{{ getActiveProjectsCount() }}</strong> actif(s)
              </span>
              <span class="stat-item">
                <i class="fas fa-check text-success"></i>
                <strong>{{ getCompletedProjectsCount() }}</strong> terminé(s)
              </span>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Data Table -->
      <app-data-table
        title=""
        [columns]="tableColumns"
        [data]="filteredProjects"
        [actions]="tableActions"
        [loading]="loading"
        [searchable]="true"
        [selectable]="false"
        [pageable]="true"
        [pageSize]="10"
        [pageSizeOptions]="[5, 10, 20, 50]"
        loadingMessage="Chargement des projets..."
        noDataMessage="Aucun projet trouvé"
        (actionClicked)="onTableAction($event)"
        (rowClicked)="onRowClick($event)">
      </app-data-table>
    </div>
  `,
  styles: [`
    .projects-management-container {
      padding: 20px;
      max-width: 1400px;
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

    .create-btn {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 25px;
      padding: 8px 24px;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .create-btn:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    }

    .filters-card {
      margin-bottom: 20px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(106, 27, 154, 0.1);
    }

    .filters-row {
      min-height: 60px;
    }

    .spacer {
      flex: 1;
    }

    .stats-info {
      display: flex;
      gap: 20px;
      color: #6a1b9a;
      font-size: 0.9rem;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .text-warning { color: #ff9800; }
    .text-success { color: #4caf50; }

    ::ng-deep .mat-form-field-outline {
      color: #e1bee7;
    }

    ::ng-deep .mat-form-field-label {
      color: #6a1b9a;
    }

    @media (max-width: 768px) {
      .projects-management-container {
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

      .filters-row {
        flex-direction: column;
        align-items: stretch;
      }

      .stats-info {
        flex-direction: column;
        gap: 10px;
      }
    }
  `]
})
export class ProjectsManagementComponent implements OnInit {
  projects: Projet[] = [];
  filteredProjects: Projet[] = [];
  loading = false;
  selectedStatus: StatutProjet | '' = '';
  statusEnum = StatutProjet;

  tableColumns: TableColumn[] = [
    { key: 'id', label: 'ID', type: 'text', width: '80px' },
    { key: 'nom', label: 'Nom du Projet', type: 'text', sortable: true },
    { key: 'description', label: 'Description', type: 'text', width: '200px' },
    { key: 'dateCreation', label: 'Date Création', type: 'date', sortable: true, width: '130px' },
    { key: 'dateEcheance', label: 'Date Échéance', type: 'date', sortable: true, width: '130px' },
    { key: 'statut', label: 'Statut', type: 'status', sortable: true, width: '120px' },
    { key: 'budget', label: 'Budget', type: 'text', sortable: true, width: '100px' },
    { key: 'actions', label: 'Actions', type: 'actions', width: '150px' }
  ];

  tableActions: TableAction[] = [
    {
      icon: 'fas fa-eye',
      tooltip: 'Voir détails',
      color: 'primary',
      action: 'view'
    },
    {
      icon: 'fas fa-edit',
      tooltip: 'Modifier',
      color: 'accent',
      action: 'edit'
    },
    {
      icon: 'fas fa-trash',
      tooltip: 'Supprimer',
      color: 'warn',
      action: 'delete'
    }
  ];

  constructor(
    private projetService: ProjetService,
    private dialog: MatDialog,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.loading = true;
    this.projetService.getAllProjets().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.toastr.error('Erreur lors du chargement des projets', 'Erreur');
        console.error('Erreur:', error);
      }
    });
  }

  refreshData(): void {
    this.loadProjects();
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    this.filteredProjects = this.projects.filter(project => {
      if (this.selectedStatus && project.statut !== this.selectedStatus) {
        return false;
      }
      return true;
    });
  }

  getActiveProjectsCount(): number {
    return this.filteredProjects.filter(p => p.statut === StatutProjet.EN_COURS).length;
  }

  getCompletedProjectsCount(): number {
    return this.filteredProjects.filter(p => p.statut === StatutProjet.TERMINE).length;
  }

  onTableAction(event: { action: string, element: Projet }): void {
    const { action, element } = event;

    switch (action) {
      case 'view':
        this.viewProject(element);
        break;
      case 'edit':
        this.editProject(element);
        break;
      case 'delete':
        this.deleteProject(element);
        break;
    }
  }

  onRowClick(project: Projet): void {
    console.log('Project clicked:', project);
  }

  viewProject(project: Projet): void {
    this.dialog.open(ProjectDetailsDialogComponent, {
      width: '600px',
      data: project
    });
  }

  editProject(project: Projet): void {
    this.router.navigate(['/admin/projets/edit', project.id]);
  }

  deleteProject(project: Projet): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmer la suppression',
        message: `Êtes-vous sûr de vouloir supprimer le projet "${project.nom}" ?`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.projetService.deleteProjet(project.id).subscribe({
          next: () => {
            this.toastr.success('Projet supprimé avec succès', 'Succès');
            this.loadProjects();
          },
          error: (error) => {
            this.loading = false;
            this.toastr.error('Erreur lors de la suppression', 'Erreur');
            console.error('Erreur:', error);
          }
        });
      }
    });
  }
}

// Project Details Dialog Component

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-project-details-dialog',
  template: `
    <div class="project-details-dialog">
      <div class="dialog-header">
        <h2 mat-dialog-title>
          <i class="fas fa-project-diagram"></i>
          Détails du Projet
        </h2>
        <button mat-icon-button (click)="close()">
          <mat-icon><i class="fas fa-times"></i></mat-icon>
        </button>
      </div>

      <mat-dialog-content class="dialog-content">
        <div class="project-info">
          <div class="info-section">
            <h3><i class="fas fa-info-circle"></i> Informations Générales</h3>

            <div class="info-row">
              <span class="label">ID:</span>
              <span class="value">{{ data.id }}</span>
            </div>

            <div class="info-row">
              <span class="label">Nom:</span>
              <span class="value">{{ data.nom }}</span>
            </div>

            <div class="info-row">
              <span class="label">Description:</span>
              <span class="value">{{ data.description || 'Aucune description' }}</span>
            </div>

            <div class="info-row">
              <span class="label">Statut:</span>
              <span class="value">
                <app-status-chip [status]="data.statut" type="status"></app-status-chip>
              </span>
            </div>

            <div class="info-row">
              <span class="label">Budget:</span>
              <span class="value">{{ data.budget ? (data.budget | currency:'EUR':'symbol':'1.0-0') : 'Non défini' }}</span>
            </div>
          </div>

          <div class="info-section">
            <h3><i class="fas fa-calendar"></i> Dates</h3>

            <div class="info-row">
              <span class="label">Création:</span>
              <span class="value">{{ data.dateCreation | date:'dd/MM/yyyy' }}</span>
            </div>

            <div class="info-row">
              <span class="label">Échéance:</span>
              <span class="value">{{ data.dateEcheance | date:'dd/MM/yyyy' }}</span>
            </div>
          </div>

          <div class="info-section" *ngIf="data.participants && data.participants.length > 0">
            <h3><i class="fas fa-users"></i> Participants ({{ data.participants.length }})</h3>

            <div class="participants-list">
              <div class="participant-item" *ngFor="let participant of data.participants">
                <div class="participant-avatar">
                  <i class="fas fa-user"></i>
                </div>
                <div class="participant-info">
                  <div class="participant-name">{{ participant.nom }}</div>
                  <div class="participant-role">{{ participant.role | role }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="info-section" *ngIf="data.taches && data.taches.length > 0">
            <h3><i class="fas fa-tasks"></i> Tâches ({{ data.taches.length }})</h3>

            <div class="tasks-summary">
              <div class="task-stat">
                <span class="stat-label">En attente:</span>
                <span class="stat-value">{{ getTasksByStatus('EN_ATTENTE') }}</span>
              </div>
              <div class="task-stat">
                <span class="stat-label">En cours:</span>
                <span class="stat-value">{{ getTasksByStatus('EN_COURS') }}</span>
              </div>
              <div class="task-stat">
                <span class="stat-label">Terminées:</span>
                <span class="stat-value">{{ getTasksByStatus('TERMINEE') }}</span>
              </div>
            </div>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="close()">Fermer</button>
        <button mat-raised-button color="primary" (click)="edit()">
          <mat-icon><i class="fas fa-edit"></i></mat-icon>
          Modifier
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .project-details-dialog {
      min-width: 550px;
      max-width: 90vw;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px 10px;
      background: linear-gradient(90deg, #6a1b9a, #8e24aa);
      color: white;
      margin: -24px -24px 0 -24px;
    }

    .dialog-header h2 {
      margin: 0;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .dialog-content {
      padding: 20px 24px;
      max-height: 70vh;
      overflow-y: auto;
    }

    .info-section {
      margin-bottom: 25px;
      padding-bottom: 20px;
      border-bottom: 1px solid #f0f0f0;
    }

    .info-section:last-child {
      border-bottom: none;
      margin-bottom: 0;
    }

    .info-section h3 {
      color: #6a1b9a;
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0 0 15px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .info-row {
      display: flex;
      margin-bottom: 12px;
      align-items: flex-start;
    }

    .label {
      font-weight: 600;
      color: #6a1b9a;
      min-width: 100px;
      margin-right: 15px;
    }

    .value {
      flex: 1;
      color: #333;
      word-break: break-word;
    }

    .participants-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 12px;
    }

    .participant-item {
      display: flex;
      align-items: center;
      padding: 10px;
      background: #f8f9ff;
      border-radius: 8px;
      border-left: 3px solid #6a1b9a;
    }

    .participant-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(45deg, #6a1b9a, #8e24aa);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      margin-right: 10px;
      font-size: 0.9rem;
    }

    .participant-name {
      font-weight: 500;
      color: #333;
      font-size: 0.9rem;
    }

    .participant-role {
      font-size: 0.8rem;
      color: #666;
    }

    .tasks-summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
    }

    .task-stat {
      padding: 15px;
      background: #f8f9ff;
      border-radius: 8px;
      text-align: center;
      border-left: 3px solid #8e24aa;
    }

    .stat-label {
      display: block;
      font-size: 0.85rem;
      color: #666;
      margin-bottom: 5px;
    }

    .stat-value {
      display: block;
      font-size: 1.5rem;
      font-weight: 700;
      color: #6a1b9a;
    }

    .dialog-actions {
      padding: 10px 24px 20px;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }

    @media (max-width: 600px) {
      .project-details-dialog {
        min-width: auto;
        width: 95vw;
      }

      .participants-list {
        grid-template-columns: 1fr;
      }

      .tasks-summary {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProjectDetailsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ProjectDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Projet
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  edit(): void {
    this.dialogRef.close();
    // Navigation sera gérée par le parent
  }

  getTasksByStatus(status: string): number {
    if (!this.data.taches) return 0;
    return this.data.taches.filter(task => task.statut === status).length;
  }
}
