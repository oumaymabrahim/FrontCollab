// features/membre/components/membre-projects/membre-projects.component.ts
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { ProjetService } from '../../../../core/services/projet.service';
import { Projet, StatutProjet } from '../../../../core/models/projet.model';
import { TableColumn } from '../../../../shared/components/data-table/data-table.component';

@Component({
  selector: 'app-membre-projects',
  template: `
    <div class="membre-projects-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">
            <i class="fas fa-folder-open"></i>
            Mes Projets
          </h1>
          <p class="page-description">
            Consultez tous les projets auxquels vous participez
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

      <!-- Data Table -->
      <app-data-table
        title="Mes Projets Assignés"
        [columns]="tableColumns"
        [data]="myProjects"
        [loading]="loading"
        [searchable]="true"
        [selectable]="false"
        [pageable]="true"
        [pageSize]="10"
        [pageSizeOptions]="[5, 10, 20]"
        loadingMessage="Chargement de vos projets..."
        noDataMessage="Aucun projet assigné"
        (rowClicked)="onRowClick($event)">
      </app-data-table>
    </div>
  `,
  styles: [`
    .membre-projects-container {
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

    @media (max-width: 768px) {
      .membre-projects-container {
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
    }
  `]
})
export class MembreProjectsComponent implements OnInit {
  myProjects: Projet[] = [];
  loading = false;

  quickStats = [
    { label: 'Total Projets', value: 0, icon: 'fas fa-folder', color: 'primary' },
    { label: 'En Cours', value: 0, icon: 'fas fa-play', color: 'accent' },
    { label: 'Terminés', value: 0, icon: 'fas fa-check', color: 'success' },
    { label: 'Planifiés', value: 0, icon: 'fas fa-calendar', color: 'warning' }
  ];

  tableColumns: TableColumn[] = [
    { key: 'nom', label: 'Nom du Projet', type: 'text', sortable: true },
    { key: 'description', label: 'Description', type: 'text', width: '250px' },
    { key: 'statut', label: 'Statut', type: 'status', sortable: true, width: '120px' },
    { key: 'dateCreation', label: 'Date Création', type: 'date', sortable: true, width: '130px' },
    { key: 'dateEcheance', label: 'Date Échéance', type: 'date', sortable: true, width: '130px' },
    { key: 'budget', label: 'Budget', type: 'text', sortable: true, width: '100px' }
  ];

  constructor(
    private projetService: ProjetService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadMyProjects();
  }

  loadMyProjects(): void {
    this.loading = true;
    this.projetService.getMesProjets().subscribe({
      next: (projects) => {
        this.myProjects = projects;
        this.updateQuickStats();
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        console.error('Erreur lors du chargement des projets:', error);
      }
    });
  }

  private updateQuickStats(): void {
    this.quickStats[0].value = this.myProjects.length;
    this.quickStats[1].value = this.myProjects.filter(p => p.statut === StatutProjet.EN_COURS).length;
    this.quickStats[2].value = this.myProjects.filter(p => p.statut === StatutProjet.TERMINE).length;
    this.quickStats[3].value = this.myProjects.filter(p => p.statut === StatutProjet.PLANIFIE).length;
  }

  onRowClick(project: Projet): void {
    // Ouvrir les détails du projet (réutiliser le composant existant)
    console.log('Project clicked:', project);
  }
}
