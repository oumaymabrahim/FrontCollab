// features/chef/components/chef-projects/chef-projects.component.ts
import { Component, OnInit,Inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

import { ProjetService } from '../../../../core/services/projet.service';
import { Projet, StatutProjet } from '../../../../core/models/projet.model';
import { TableColumn, TableAction } from '../../../../shared/components/data-table/data-table.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-chef-projects',
  template: `
    <div class="chef-projects-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">
            <i class="fas fa-project-diagram"></i>
            Mes Projets
          </h1>
          <p class="page-description">
            Gérez et suivez tous vos projets assignés
          </p>
        </div>
        <div class="header-actions">
          <button mat-button
                  (click)="refreshData()"
                  [disabled]="loading"
                  class="refresh-btn">
            <mat-icon><i class="fas fa-sync-alt" [class.fa-spin]="loading"></i></mat-icon>
            Actualiser
          </button>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="stats-section" fxLayout="row wrap" fxLayoutGap="20px" fxLayoutAlign="start stretch">
        <div fxFlex="100" fxFlex.gt-sm="25" *ngFor="let stat of stats">
          <mat-card class="stat-card" [ngClass]="'card-' + stat.color">
            <mat-card-content>
              <div class="stat-content" fxLayout="row" fxLayoutAlign="space-between center">
                <div class="stat-info">
                  <div class="stat-value">{{ stat.value }}</div>
                  <div class="stat-label">{{ stat.label }}</div>
                </div>
                <div class="stat-icon">
                  <i [class]="stat.icon"></i>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>

      <!-- Filters -->
      <mat-card class="filters-card">
        <mat-card-content>
          <div class="filters-row" fxLayout="row wrap" fxLayoutGap="20px" fxLayoutAlign="start center">
            <mat-form-field appearance="outline" fxFlex="180px">
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

            <span class="spacer"></span>

            <div class="stats-info" *ngIf="!loading">
              <span class="stat-item">
                <i class="fas fa-folder"></i>
                <strong>{{ filteredProjects.length }}</strong> projet(s)
              </span>
              <span class="stat-item">
                <i class="fas fa-play text-info"></i>
                <strong>{{ getProjectsByStatus(statusEnum.EN_COURS) }}</strong> en cours
              </span>
              <span class="stat-item">
                <i class="fas fa-check text-success"></i>
                <strong>{{ getProjectsByStatus(statusEnum.TERMINE) }}</strong> terminé(s)
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
    .chef-projects-container {
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

    .refresh-btn {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 25px;
      padding: 8px 20px;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .refresh-btn:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-2px);
    }

    .stats-section {
      margin-bottom: 30px;
    }

    .stat-card {
      border-radius: 12px;
      overflow: hidden;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    }

    .card-primary { border-left: 5px solid #6a1b9a; }
    .card-accent { border-left: 5px solid #e91e63; }
    .card-success { border-left: 5px solid #4caf50; }
    .card-warning { border-left: 5px solid #ff9800; }

    .stat-content {
      padding: 10px 0;
    }

    .stat-value {
      font-size: 2.5rem;
      font-weight: 700;
      color: #333;
      line-height: 1;
    }

    .stat-label {
      font-size: 0.9rem;
      color: #666;
      font-weight: 500;
      margin-top: 5px;
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(45deg, #6a1b9a, #8e24aa);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.5rem;
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
      flex-wrap: wrap;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 5px;
      white-space: nowrap;
    }

    .text-info { color: #2196f3; }
    .text-success { color: #4caf50; }

    ::ng-deep .mat-form-field-outline {
      color: #e1bee7;
    }

    ::ng-deep .mat-form-field-label {
      color: #6a1b9a;
    }

    @media (max-width: 768px) {
      .chef-projects-container {
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
export class ChefProjectsComponent implements OnInit {
  projects: Projet[] = [];
  filteredProjects: Projet[] = [];
  loading = false;
  selectedStatus: StatutProjet | '' = '';
  statusEnum = StatutProjet;

  stats = [
    { label: 'Total Projets', value: 0, icon: 'fas fa-folder', color: 'primary' },
    { label: 'En Cours', value: 0, icon: 'fas fa-play', color: 'accent' },
    { label: 'Terminés', value: 0, icon: 'fas fa-check', color: 'success' },
    { label: 'En Retard', value: 0, icon: 'fas fa-clock', color: 'warning' }
  ];

  tableColumns: TableColumn[] = [
    { key: 'id', label: 'ID', type: 'text', width: '80px' },
    { key: 'nom', label: 'Nom du Projet', type: 'text', sortable: true },
    { key: 'description', label: 'Description', type: 'text', width: '200px' },
    { key: 'statut', label: 'Statut', type: 'status', sortable: true, width: '120px' },
    { key: 'dateCreation', label: 'Date Création', type: 'date', sortable: true, width: '130px' },
    { key: 'dateEcheance', label: 'Échéance', type: 'date', sortable: true, width: '130px' },
    { key: 'budget', label: 'Budget', type: 'currency', sortable: true, width: '120px' },
    { key: 'actions', label: 'Actions', type: 'actions', width: '120px' }
  ];

  tableActions: TableAction[] = [
    {
      icon: 'fas fa-eye',
      tooltip: 'Voir détails',
      color: 'primary',
      action: 'view'
    },
    {
      icon: 'fas fa-tasks',
      tooltip: 'Voir tâches',
      color: 'accent',
      action: 'tasks'
    }
  ];

  constructor(
    private projetService: ProjetService,
    private dialog: MatDialog,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.loading = true;
    this.projetService.getMesProjets().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.applyFilters();
        this.updateStats();
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

  private updateStats(): void {
    this.stats[0].value = this.projects.length;
    this.stats[1].value = this.projects.filter(p => p.statut === StatutProjet.EN_COURS).length;
    this.stats[2].value = this.projects.filter(p => p.statut === StatutProjet.TERMINE).length;

    // Calculer les projets en retard
    const now = new Date();
    const overdueProjects = this.projects.filter(p => {
      if (p.statut === StatutProjet.TERMINE) return false;
      const deadline = new Date(p.dateEcheance);
      return deadline < now;
    }).length;
    this.stats[3].value = overdueProjects;
  }

  getProjectsByStatus(status: StatutProjet): number {
    return this.filteredProjects.filter(p => p.statut === status).length;
  }

  onTableAction(event: { action: string, element: Projet }): void {
    const { action, element } = event;

    switch (action) {
      case 'view':
        this.viewProject(element);
        break;
      case 'tasks':
        this.viewProjectTasks(element);
        break;
    }
  }

  onRowClick(project: Projet): void {
    console.log('Project clicked:', project);
  }

  viewProject(project: Projet): void {
    this.dialog.open(ProjectDetailsDialogComponent, {
      width: '700px',
      data: project
    });
  }

  viewProjectTasks(project: Projet): void {
    // Naviguer vers les tâches du projet
    console.log('View tasks for project:', project);
    // Implémenter la navigation ou ouvrir un dialog
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
          <!-- Informations générales -->
          <div class="info-section">
            <h3><i class="fas fa-info-circle"></i> Informations Générales</h3>

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

            <div class="info-row" *ngIf="data.budget">
              <span class="label">Budget:</span>
              <span class="value budget">{{ data.budget | currency:'EUR':'symbol':'1.2-2' }}</span>
            </div>
          </div>

          <!-- Dates -->
          <div class="info-section">
            <h3><i class="fas fa-calendar"></i> Planning</h3>

            <div class="info-row">
              <span class="label">Date de création:</span>
              <span class="value">{{ data.dateCreation | date:'dd/MM/yyyy' }}</span>
            </div>

            <div class="info-row">
              <span class="label">Date d'échéance:</span>
              <span class="value">{{ data.dateEcheance | date:'dd/MM/yyyy' }}</span>
            </div>

            <div class="info-row">
              <span class="label">Durée:</span>
              <span class="value">{{ getProjectDuration() }} jours</span>
            </div>
          </div>

          <!-- Participants -->
          <div class="info-section" *ngIf="data.participants && data.participants.length > 0">
            <h3><i class="fas fa-users"></i> Équipe ({{ data.participants.length || 0 }})</h3>

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

          <!-- Tâches -->
          <div class="info-section" *ngIf="data.taches && data.taches.length > 0">
            <h3><i class="fas fa-tasks"></i> Tâches ({{ data.taches.length || 0 }})</h3>

            <div class="tasks-summary">
              <div class="task-stat">
                <span class="task-count">{{ getTasksByStatus('EN_ATTENTE') }}</span>
                <span class="task-label">En attente</span>
              </div>
              <div class="task-stat">
                <span class="task-count">{{ getTasksByStatus('EN_COURS') }}</span>
                <span class="task-label">En cours</span>
              </div>
              <div class="task-stat">
                <span class="task-count">{{ getTasksByStatus('TERMINEE') }}</span>
                <span class="task-label">Terminées</span>
              </div>
            </div>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="close()">Fermer</button>
        <button mat-raised-button color="primary">
          <mat-icon><i class="fas fa-tasks"></i></mat-icon>
          Voir les tâches
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .project-details-dialog {
      min-width: 600px;
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
      min-width: 130px;
      margin-right: 15px;
    }

    .value {
      flex: 1;
      color: #333;
      word-break: break-word;
    }

    .budget {
      font-weight: 600;
      color: #4caf50;
      font-size: 1.1rem;
    }

    .participants-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 15px;
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
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }

    .task-stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 15px;
      background: #f8f9ff;
      border-radius: 8px;
      border-top: 3px solid #6a1b9a;
      min-width: 80px;
    }

    .task-count {
      font-size: 1.5rem;
      font-weight: 700;
      color: #6a1b9a;
    }

    .task-label {
      font-size: 0.8rem;
      color: #666;
      text-align: center;
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
        justify-content: space-around;
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

  getProjectDuration(): number {
    if (!this.data.dateCreation || !this.data.dateEcheance) return 0;

    const start = new Date(this.data.dateCreation);
    const end = new Date(this.data.dateEcheance);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getTasksByStatus(status: string): number {
    if (!this.data.taches) return 0;
    return this.data.taches.filter(task => task.statut === status).length;
  }
}
