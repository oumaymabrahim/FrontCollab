// features/chef/components/chef-tasks/chef-tasks.component.ts
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { TacheService } from '../../../../core/services/tache.service';
import { Tache, StatutTache, Priorite } from '../../../../core/models/tache.model';
import { TableColumn, TableAction } from '../../../../shared/components/data-table/data-table.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-chef-tasks',
  template: `
    <div class="tasks-management-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">
            <i class="fas fa-tasks"></i>
            Gestion des Tâches
          </h1>
          <p class="page-description">
            Gérez toutes les tâches de vos projets
          </p>
        </div>
        <div class="header-actions">
          <button mat-raised-button
                  color="primary"
                  routerLink="/chef/taches/create"
                  class="create-btn">
            <mat-icon><i class="fas fa-plus-square"></i></mat-icon>
            Nouvelle Tâche
          </button>
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
                <mat-option [value]="statusEnum.EN_ATTENTE">En Attente</mat-option>
                <mat-option [value]="statusEnum.EN_COURS">En Cours</mat-option>
                <mat-option [value]="statusEnum.TERMINEE">Terminée</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" fxFlex="180px">
              <mat-label>Filtrer par priorité</mat-label>
              <mat-select [(value)]="selectedPriority" (selectionChange)="onPriorityFilterChange()">
                <mat-option value="">Toutes les priorités</mat-option>
                <mat-option [value]="priorityEnum.BASSE">Basse</mat-option>
                <mat-option [value]="priorityEnum.MOYENNE">Moyenne</mat-option>
                <mat-option [value]="priorityEnum.HAUTE">Haute</mat-option>
                <mat-option [value]="priorityEnum.URGENTE">Urgente</mat-option>
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
                <i class="fas fa-tasks"></i>
                <strong>{{ filteredTasks.length }}</strong> tâche(s)
              </span>
              <span class="stat-item">
                <i class="fas fa-play text-warning"></i>
                <strong>{{ getTasksByStatus(statusEnum.EN_COURS) }}</strong> en cours
              </span>
              <span class="stat-item">
                <i class="fas fa-check text-success"></i>
                <strong>{{ getTasksByStatus(statusEnum.TERMINEE) }}</strong> terminée(s)
              </span>
              <span class="stat-item">
                <i class="fas fa-exclamation text-danger"></i>
                <strong>{{ getUrgentTasks() }}</strong> urgente(s)
              </span>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Data Table -->
      <app-data-table
        title=""
        [columns]="tableColumns"
        [data]="filteredTasks"
        [actions]="tableActions"
        [loading]="loading"
        [searchable]="true"
        [selectable]="false"
        [pageable]="true"
        [pageSize]="15"
        [pageSizeOptions]="[10, 15, 25, 50]"
        loadingMessage="Chargement des tâches..."
        noDataMessage="Aucune tâche trouvée"
        (actionClicked)="onTableAction($event)"
        (rowClicked)="onRowClick($event)">
      </app-data-table>
    </div>
  `,
  styles: [`
    .tasks-management-container {
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
      flex-wrap: wrap;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 5px;
      white-space: nowrap;
    }

    .text-warning { color: #ff9800; }
    .text-success { color: #4caf50; }
    .text-danger { color: #f44336; }

    ::ng-deep .mat-form-field-outline {
      color: #e1bee7;
    }

    ::ng-deep .mat-form-field-label {
      color: #6a1b9a;
    }

    @media (max-width: 768px) {
      .tasks-management-container {
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
export class ChefTasksComponent implements OnInit {
  tasks: Tache[] = [];
  filteredTasks: Tache[] = [];
  loading = false;
  selectedStatus: StatutTache | '' = '';
  selectedPriority: Priorite | '' = '';
  statusEnum = StatutTache;
  priorityEnum = Priorite;

  tableColumns: TableColumn[] = [
    { key: 'id', label: 'ID', type: 'text', width: '80px' },
    { key: 'nom', label: 'Nom de la Tâche', type: 'text', sortable: true },
    { key: 'projet.nom', label: 'Projet', type: 'text', sortable: true, width: '150px' },
    { key: 'utilisateur.nom', label: 'Assigné à', type: 'text', sortable: true, width: '130px' },
    { key: 'priorite', label: 'Priorité', type: 'priority', sortable: true, width: '100px' },
    { key: 'statut', label: 'Statut', type: 'status', sortable: true, width: '120px' },
    { key: 'dateEcheance', label: 'Échéance', type: 'date', sortable: true, width: '120px' },
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
    private tacheService: TacheService,
    private dialog: MatDialog,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading = true;
    this.tacheService.getAllTaches().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.toastr.error('Erreur lors du chargement des tâches', 'Erreur');
        console.error('Erreur:', error);
      }
    });
  }

  refreshData(): void {
    this.loadTasks();
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  onPriorityFilterChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    this.filteredTasks = this.tasks.filter(task => {
      if (this.selectedStatus && task.statut !== this.selectedStatus) {
        return false;
      }
      if (this.selectedPriority && task.priorite !== this.selectedPriority) {
        return false;
      }
      return true;
    });
  }

  getTasksByStatus(status: StatutTache): number {
    return this.filteredTasks.filter(t => t.statut === status).length;
  }

  getUrgentTasks(): number {
    return this.filteredTasks.filter(t => t.priorite === Priorite.URGENTE).length;
  }

  onTableAction(event: { action: string, element: Tache }): void {
    const { action, element } = event;

    switch (action) {
      case 'view':
        this.viewTask(element);
        break;
      case 'edit':
        this.editTask(element);
        break;
      case 'delete':
        this.deleteTask(element);
        break;
    }
  }

  onRowClick(task: Tache): void {
    console.log('Task clicked:', task);
  }

  viewTask(task: Tache): void {
    this.dialog.open(TaskDetailsDialogComponent, {
      width: '600px',
      data: task
    });
  }

  editTask(task: Tache): void {
    this.router.navigate(['/chef/taches/edit', task.id]);
  }

  deleteTask(task: Tache): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmer la suppression',
        message: `Êtes-vous sûr de vouloir supprimer la tâche "${task.nom}" ?`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.tacheService.deleteTache(task.id).subscribe({
          next: () => {
            this.toastr.success('Tâche supprimée avec succès', 'Succès');
            this.loadTasks();
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

// Task Details Dialog Component
@Component({
  selector: 'app-task-details-dialog',
  template: `
    <div class="task-details-dialog">
      <div class="dialog-header">
        <h2 mat-dialog-title>
          <i class="fas fa-tasks"></i>
          Détails de la Tâche
        </h2>
        <button mat-icon-button (click)="close()">
          <mat-icon><i class="fas fa-times"></i></mat-icon>
        </button>
      </div>

      <mat-dialog-content class="dialog-content">
        <div class="task-info">
          <!-- Informations principales -->
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
              <span class="label">Priorité:</span>
              <span class="value">
                <app-status-chip [status]="data.priorite" type="priority"></app-status-chip>
              </span>
            </div>
          </div>

          <!-- Dates -->
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

            <div class="info-row" *ngIf="getDaysUntilDeadline() !== null">
              <span class="label">Temps restant:</span>
              <span class="value" [ngClass]="getDeadlineClass()">
                <i [class]="getDeadlineIcon()"></i>
                {{ getDeadlineText() }}
              </span>
            </div>
          </div>

          <!-- Assignation -->
          <div class="info-section">
            <h3><i class="fas fa-user"></i> Assignation</h3>

            <div class="info-row" *ngIf="data.projet">
              <span class="label">Projet:</span>
              <span class="value">
                <div class="project-info">
                  <i class="fas fa-project-diagram"></i>
                  {{ data.projet.nom }}
                </div>
              </span>
            </div>

            <div class="info-row" *ngIf="data.utilisateur">
              <span class="label">Assigné à:</span>
              <span class="value">
                <div class="assignee-info">
                  <div class="assignee-avatar">
                    <i class="fas fa-user"></i>
                  </div>
                  <div class="assignee-details">
                    <div class="assignee-name">{{ data.utilisateur.nom }}</div>
                    <div class="assignee-role">{{ data.utilisateur.role | role }}</div>
                  </div>
                </div>
              </span>
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
    .task-details-dialog {
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
      min-width: 120px;
      margin-right: 15px;
    }

    .value {
      flex: 1;
      color: #333;
      word-break: break-word;
    }

    .project-info {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: #f8f9ff;
      border-radius: 6px;
      border-left: 3px solid #6a1b9a;
    }

    .assignee-info {
      display: flex;
      align-items: center;
      padding: 8px 12px;
      background: #f8f9ff;
      border-radius: 6px;
      border-left: 3px solid #8e24aa;
    }

    .assignee-avatar {
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

    .assignee-name {
      font-weight: 500;
      color: #333;
      font-size: 0.9rem;
    }

    .assignee-role {
      font-size: 0.8rem;
      color: #666;
    }

    .deadline-urgent { color: #f44336; font-weight: 600; }
    .deadline-soon { color: #ff9800; font-weight: 500; }
    .deadline-normal { color: #4caf50; }
    .deadline-overdue { color: #f44336; font-weight: 700; }

    .dialog-actions {
      padding: 10px 24px 20px;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }

    @media (max-width: 600px) {
      .task-details-dialog {
        min-width: auto;
        width: 95vw;
      }
    }
  `]
})
export class TaskDetailsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<TaskDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Tache
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  edit(): void {
    this.dialogRef.close();
  }

  getDaysUntilDeadline(): number | null {
    if (!this.data.dateEcheance) return null;

    const deadline = new Date(this.data.dateEcheance);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }

  getDeadlineText(): string {
    const days = this.getDaysUntilDeadline();
    if (days === null) return '';

    if (days < 0) {
      return `${Math.abs(days)} jour(s) de retard`;
    } else if (days === 0) {
      return 'Aujourd\'hui';
    } else if (days === 1) {
      return 'Demain';
    } else {
      return `${days} jour(s) restant(s)`;
    }
  }

  getDeadlineClass(): string {
    const days = this.getDaysUntilDeadline();
    if (days === null) return 'deadline-normal';

    if (days < 0) return 'deadline-overdue';
    if (days <= 2) return 'deadline-urgent';
    if (days <= 7) return 'deadline-soon';
    return 'deadline-normal';
  }

  getDeadlineIcon(): string {
    const days = this.getDaysUntilDeadline();
    if (days === null) return 'fas fa-calendar';

    if (days < 0) return 'fas fa-exclamation-triangle';
    if (days <= 2) return 'fas fa-clock';
    if (days <= 7) return 'fas fa-calendar-alt';
    return 'fas fa-calendar-check';
  }
}
