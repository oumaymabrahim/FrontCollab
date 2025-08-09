// features/membre/components/membre-tasks/membre-tasks.component.ts
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

import { TacheService } from '../../../../core/services/tache.service';
import { Tache, StatutTache, Priorite } from '../../../../core/models/tache.model';
import { TableColumn, TableAction } from '../../../../shared/components/data-table/data-table.component';
import {TaskDetailsDialogComponent} from "../../../chef/components/chef-tasks/chef-tasks.component";

@Component({
  selector: 'app-membre-tasks',
  template: `
    <div class="membre-tasks-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">
            <i class="fas fa-user-check"></i>
            Mes Tâches
          </h1>
          <p class="page-description">
            Gérez vos tâches assignées et suivez votre progression
          </p>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="quick-stats" fxLayout="row wrap" fxLayoutGap="15px" fxLayoutAlign="start stretch">
        <mat-card class="quick-stat-card" *ngFor="let stat of quickStats">
          <mat-card-content>
            <div class="quick-stat-content" fxLayout="row" fxLayoutAlign="space-between center">
              <div class="quick-stat-info">
                <div class="quick-stat-value">{{ stat.value }}</div>
                <div class="quick-stat-label">{{ stat.label }}</div>
              </div>
              <div class="quick-stat-icon" [ngClass]="'icon-' + stat.color">
                <i [class]="stat.icon"></i>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
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
        loadingMessage="Chargement de vos tâches..."
        noDataMessage="Aucune tâche assignée"
        (actionClicked)="onTableAction($event)"
        (rowClicked)="onRowClick($event)">
      </app-data-table>
    </div>
  `,
  styles: [`
    .membre-tasks-container {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
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

    .quick-stats {
      margin-bottom: 30px;
    }

    .quick-stat-card {
      border-radius: 12px;
      overflow: hidden;
      transition: transform 0.3s ease;
      min-width: 200px;
      flex: 1;
    }

    .quick-stat-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(106, 27, 154, 0.15);
    }

    .quick-stat-content {
      padding: 5px 0;
    }

    .quick-stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: #333;
      line-height: 1;
    }

    .quick-stat-label {
      font-size: 0.85rem;
      color: #666;
      font-weight: 500;
      margin-top: 5px;
    }

    .quick-stat-icon {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.3rem;
    }

    .icon-primary { background: linear-gradient(45deg, #6a1b9a, #8e24aa); }
    .icon-accent { background: linear-gradient(45deg, #e91e63, #f06292); }
    .icon-success { background: linear-gradient(45deg, #4caf50, #66bb6a); }
    .icon-warning { background: linear-gradient(45deg, #ff9800, #ffb74d); }

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

    ::ng-deep .mat-form-field-outline {
      color: #e1bee7;
    }

    ::ng-deep .mat-form-field-label {
      color: #6a1b9a;
    }

    @media (max-width: 768px) {
      .membre-tasks-container {
        padding: 10px;
      }

      .page-title {
        font-size: 1.6rem;
      }

      .quick-stats {
        flex-direction: column;
      }

      .quick-stat-card {
        min-width: auto;
      }

      .filters-row {
        flex-direction: column;
        align-items: stretch;
      }

      .stats-info {
        justify-content: center;
      }
    }
  `]
})
export class MembreTasksComponent implements OnInit {
  tasks: Tache[] = [];
  filteredTasks: Tache[] = [];
  loading = false;
  selectedStatus: StatutTache | '' = '';
  selectedPriority: Priorite | '' = '';
  statusEnum = StatutTache;
  priorityEnum = Priorite;

  quickStats = [
    { label: 'En Attente', value: 0, icon: 'fas fa-clock', color: 'warning' },
    { label: 'En Cours', value: 0, icon: 'fas fa-play', color: 'accent' },
    { label: 'Terminées', value: 0, icon: 'fas fa-check', color: 'success' },
    { label: 'En Retard', value: 0, icon: 'fas fa-exclamation', color: 'primary' }
  ];

  tableColumns: TableColumn[] = [
    { key: 'nom', label: 'Nom de la Tâche', type: 'text', sortable: true },
    { key: 'projet.nom', label: 'Projet', type: 'text', sortable: true, width: '180px' },
    { key: 'priorite', label: 'Priorité', type: 'priority', sortable: true, width: '110px' },
    { key: 'statut', label: 'Statut', type: 'status', sortable: true, width: '120px' },
    { key: 'dateEcheance', label: 'Échéance', type: 'date', sortable: true, width: '130px' },
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
      icon: 'fas fa-play',
      tooltip: 'Marquer en cours',
      color: 'accent',
      action: 'start',
      condition: (task: Tache) => task.statut === StatutTache.EN_ATTENTE
    },
    {
      icon: 'fas fa-check',
      tooltip: 'Marquer terminée',
      color: 'primary',
      action: 'complete',
      condition: (task: Tache) => task.statut !== StatutTache.TERMINEE
    }
  ];

  constructor(
    private tacheService: TacheService,
    private dialog: MatDialog,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading = true;
    this.tacheService.getMesTaches().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.updateQuickStats();
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.toastr.error('Erreur lors du chargement de vos tâches', 'Erreur');
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

  private updateQuickStats(): void {
    this.quickStats[0].value = this.tasks.filter(t => t.statut === StatutTache.EN_ATTENTE).length;
    this.quickStats[1].value = this.tasks.filter(t => t.statut === StatutTache.EN_COURS).length;
    this.quickStats[2].value = this.tasks.filter(t => t.statut === StatutTache.TERMINEE).length;

    // Tâches en retard
    const overdueTasks = this.tasks.filter(task => {
      const deadline = new Date(task.dateEcheance);
      const today = new Date();
      return deadline < today && task.statut !== StatutTache.TERMINEE;
    }).length;
    this.quickStats[3].value = overdueTasks;
  }

  onTableAction(event: { action: string, element: Tache }): void {
    const { action, element } = event;

    switch (action) {
      case 'view':
        this.viewTask(element);
        break;
      case 'start':
        this.updateTaskStatus(element, StatutTache.EN_COURS);
        break;
      case 'complete':
        this.updateTaskStatus(element, StatutTache.TERMINEE);
        break;
    }
  }

  onRowClick(task: Tache): void {
    this.viewTask(task);
  }

  viewTask(task: Tache): void {
    this.dialog.open(TaskDetailsDialogComponent, {
      width: '600px',
      data: task
    });
  }

  updateTaskStatus(task: Tache, newStatus: StatutTache): void {
    this.tacheService.updateTacheStatut(task.id, newStatus).subscribe({
      next: () => {
        const statusText = newStatus === StatutTache.EN_COURS ? 'en cours' : 'terminée';
        this.toastr.success(`Tâche marquée comme ${statusText}`, 'Succès');
        this.loadTasks();
      },
      error: (error) => {
        this.toastr.error('Erreur lors de la mise à jour du statut', 'Erreur');
        console.error('Erreur:', error);
      }
    });
  }
}
