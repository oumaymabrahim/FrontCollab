
// features/admin/components/statistics/statistics.component.ts
import { Component, OnInit } from '@angular/core';
import { ThemePalette } from '@angular/material/core'; // ✅ Import ajouté
import { UserService } from '../../../../core/services/user.service';
import { ProjetService } from '../../../../core/services/projet.service';
import { ChartConfiguration, ChartData } from 'chart.js';

// ✅ Interface pour les métriques avec ThemePalette correct
interface PerformanceMetric {
  label: string;
  value: number;
  unit: string;
  percentage: number;
  color: ThemePalette;
}

@Component({
  selector: 'app-statistics',
  template: `
    <div class="statistics-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">
            <i class="fas fa-chart-bar"></i>
            Statistiques Globales
          </h1>
          <p class="page-description">
            Analysez les performances de votre plateforme
          </p>
        </div>
      </div>

      <!-- Global Stats -->
      <div class="global-stats" fxLayout="row wrap" fxLayoutGap="20px" fxLayoutAlign="start stretch">
        <div fxFlex="100" fxFlex.gt-sm="25" *ngFor="let stat of globalStats">
          <mat-card class="stat-card gradient-card" [ngClass]="'card-' + stat.color">
            <mat-card-content>
              <div class="stat-content">
                <div class="stat-header">
                  <div class="stat-icon">
                    <i [class]="stat.icon"></i>
                  </div>
                  <div class="stat-value">{{ stat.value }}</div>
                </div>
                <div class="stat-label">{{ stat.label }}</div>
                <div class="stat-change" *ngIf="stat.change">
                  <i [class]="stat.change > 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
                  {{ Math.abs(stat.change) }}% ce mois
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>

      <!-- Charts Grid -->
      <div class="charts-grid" fxLayout="row wrap" fxLayoutGap="20px">
        <!-- Users by Role Chart -->
        <div fxFlex="100" fxFlex.gt-md="33">
          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>
                <i class="fas fa-users"></i>
                Répartition des Utilisateurs
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="chart-container">
                <canvas baseChart
                  [data]="usersChartData"
                  [type]="'doughnut'"
                  [options]="doughnutOptions">
                </canvas>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Projects by Status Chart -->
        <div fxFlex="100" fxFlex.gt-md="33">
          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>
                <i class="fas fa-project-diagram"></i>
                Statut des Projets
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="chart-container">
                <canvas baseChart
                  [data]="projectsChartData"
                  [type]="'bar'"
                  [options]="barOptions">
                </canvas>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Tasks Progress Chart -->
        <div fxFlex="100" fxFlex.gt-md="33">
          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>
                <i class="fas fa-tasks"></i>
                Progression des Tâches
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="chart-container">
                <canvas baseChart
                  [data]="tasksProgressData"
                  [type]="'line'"
                  [options]="lineOptions">
                </canvas>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>

      <!-- Detailed Tables -->
      <div class="tables-section" fxLayout="row wrap" fxLayoutGap="20px">
        <!-- Top Projects -->
        <div fxFlex="100" fxFlex.gt-md="50">
          <mat-card class="table-card">
            <mat-card-header>
              <mat-card-title>
                <i class="fas fa-trophy"></i>
                Projets les Plus Actifs
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="top-projects" *ngIf="topProjects.length > 0">
                <div class="project-item" *ngFor="let project of topProjects; let i = index">
                  <div class="project-rank">{{ i + 1 }}</div>
                  <div class="project-info">
                    <div class="project-name">{{ project.nom }}</div>
                    <div class="project-details">
                      <span class="detail-item">
                        <i class="fas fa-users"></i>
                        {{ project.participants?.length || 0 }} participants
                      </span>
                      <span class="detail-item">
                        <i class="fas fa-tasks"></i>
                        {{ project.taches?.length || 0 }} tâches
                      </span>
                    </div>
                  </div>
                  <div class="project-status">
                    <app-status-chip [status]="project.statut" type="status"></app-status-chip>
                  </div>
                </div>
              </div>
              <div class="no-data" *ngIf="topProjects.length === 0">
                <i class="fas fa-inbox"></i>
                <p>Aucun projet disponible</p>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Performance Metrics -->
        <div fxFlex="100" fxFlex.gt-md="50">
          <mat-card class="table-card">
            <mat-card-header>
              <mat-card-title>
                <i class="fas fa-chart-line"></i>
                Métriques de Performance
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="metrics-list">
                <div class="metric-item" *ngFor="let metric of performanceMetrics">
                  <div class="metric-label">{{ metric.label }}</div>
                  <div class="metric-value">
                    <span class="value">{{ metric.value }}{{ metric.unit }}</span>
                    <div class="metric-bar">
                      <mat-progress-bar
                        mode="determinate"
                        [value]="metric.percentage"
                        [color]="metric.color">
                      </mat-progress-bar>
                    </div>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .statistics-container {
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

    .global-stats {
      margin-bottom: 30px;
    }

    .stat-card {
      border-radius: 15px;
      overflow: hidden;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      color: white;
      position: relative;
    }

    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
    }

    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.1);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .stat-card:hover::before {
      opacity: 1;
    }

    .card-primary { background: linear-gradient(135deg, #6a1b9a, #8e24aa); }
    .card-accent { background: linear-gradient(135deg, #e91e63, #f06292); }
    .card-success { background: linear-gradient(135deg, #4caf50, #66bb6a); }
    .card-warning { background: linear-gradient(135deg, #ff9800, #ffb74d); }

    .stat-content {
      position: relative;
      z-index: 2;
    }

    .stat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .stat-icon {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    .stat-value {
      font-size: 2.5rem;
      font-weight: 700;
      line-height: 1;
    }

    .stat-label {
      font-size: 0.9rem;
      opacity: 0.9;
      font-weight: 500;
    }

    .stat-change {
      font-size: 0.8rem;
      opacity: 0.8;
      margin-top: 5px;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .charts-grid,
    .tables-section {
      margin-bottom: 30px;
    }

    .chart-card,
    .table-card {
      border-radius: 15px;
      overflow: hidden;
      box-shadow: 0 8px 25px rgba(106, 27, 154, 0.1);
    }

    .chart-container {
      height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px 0;
    }

    .top-projects {
      max-height: 350px;
      overflow-y: auto;
    }

    .project-item {
      display: flex;
      align-items: center;
      padding: 15px 0;
      border-bottom: 1px solid #f0f0f0;
      transition: background 0.2s ease;
    }

    .project-item:hover {
      background: #f8f9ff;
      margin: 0 -15px;
      padding: 15px;
      border-radius: 8px;
    }

    .project-item:last-child {
      border-bottom: none;
    }

    .project-rank {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: linear-gradient(45deg, #6a1b9a, #8e24aa);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      margin-right: 15px;
    }

    .project-info {
      flex: 1;
    }

    .project-name {
      font-weight: 600;
      color: #333;
      margin-bottom: 5px;
    }

    .project-details {
      display: flex;
      gap: 15px;
    }

    .detail-item {
      font-size: 0.85rem;
      color: #666;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .metrics-list {
      padding: 10px 0;
    }

    .metric-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .metric-item:last-child {
      border-bottom: none;
    }

    .metric-label {
      font-weight: 500;
      color: #333;
    }

    .metric-value {
      text-align: right;
      min-width: 120px;
    }

    .value {
      font-weight: 600;
      color: #6a1b9a;
      display: block;
      margin-bottom: 5px;
    }

    .metric-bar {
      width: 100px;
    }

    .no-data {
      text-align: center;
      padding: 40px 20px;
      color: #999;
    }

    .no-data i {
      font-size: 2.5rem;
      margin-bottom: 15px;
      color: #ddd;
    }

    @media (max-width: 768px) {
      .statistics-container {
        padding: 10px;
      }

      .page-title {
        font-size: 1.6rem;
      }

      .global-stats,
      .charts-grid,
      .tables-section {
        flex-direction: column;
      }

      .project-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
      }

      .project-details {
        flex-direction: column;
        gap: 5px;
      }

      .metric-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
      }

      .metric-value {
        text-align: left;
        width: 100%;
      }
    }
  `]
})
export class StatisticsComponent implements OnInit {
  globalStats = [
    { label: 'Total Utilisateurs', value: 0, icon: 'fas fa-users', color: 'primary', change: 12 },
    { label: 'Projets Actifs', value: 0, icon: 'fas fa-project-diagram', color: 'accent', change: 8 },
    { label: 'Tâches Terminées', value: 0, icon: 'fas fa-check-circle', color: 'success', change: 15 },
    { label: 'Taux de Réussite', value: '0%', icon: 'fas fa-trophy', color: 'warning', change: 5 }
  ];

  topProjects: any[] = [];

  // ✅ Correction avec valeurs ThemePalette valides uniquement
  performanceMetrics: PerformanceMetric[] = [
    { label: 'Projets Terminés', value: 12, unit: '', percentage: 75, color: 'primary' },
    { label: 'Taux de Complétion', value: 84, unit: '%', percentage: 84, color: 'accent' },
    { label: 'Productivité Équipe', value: 92, unit: '%', percentage: 92, color: 'warn' },
    { label: 'Satisfaction Client', value: 88, unit: '%', percentage: 88, color: 'primary' }
  ];

  // Chart data
  usersChartData: ChartData<'doughnut'> = {
    labels: ['Admins', 'Chefs de Projet', 'Membres'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ['#6a1b9a', '#8e24aa', '#ab47bc']
    }]
  };

  projectsChartData: ChartData<'bar'> = {
    labels: ['Planifiés', 'En Cours', 'Terminés', 'Suspendus'],
    datasets: [{
      label: 'Nombre de projets',
      data: [0, 0, 0, 0],
      backgroundColor: ['#2196f3', '#ff9800', '#4caf50', '#f44336']
    }]
  };

  tasksProgressData: ChartData<'line'> = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
    datasets: [{
      label: 'Tâches terminées',
      data: [0, 0, 0, 0, 0, 0],
      borderColor: '#6a1b9a',
      backgroundColor: 'rgba(106, 27, 154, 0.1)',
      tension: 0.4
    }]
  };

  // Chart options
  doughnutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' }
    }
  };

  barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  lineOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  constructor(
    private userService: UserService,
    private projetService: ProjetService
  ) {}

  ngOnInit(): void {
    this.loadStatistics();
  }

  private loadStatistics(): void {
    this.loadUsers();
    this.loadProjects();
    this.loadPerformanceMetrics();
  }

  private loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.globalStats[0].value = users.length;

        const adminCount = users.filter(u => u.role === 'ADMIN').length;
        const chefCount = users.filter(u => u.role === 'CHEF_DE_PROJECT').length;
        const membreCount = users.filter(u => u.role === 'MEMBRE_EQUIPE').length;

        this.usersChartData = {
          ...this.usersChartData,
          datasets: [{
            ...this.usersChartData.datasets[0],
            data: [adminCount, chefCount, membreCount]
          }]
        };
      },
      error: (error) => {
        console.error('Erreur lors du chargement des utilisateurs:', error);
      }
    });
  }

  private loadProjects(): void {
    this.projetService.getAllProjets().subscribe({
      next: (projects) => {
        const activeProjects = projects.filter(p => p.statut === 'EN_COURS').length;
        const completedProjects = projects.filter(p => p.statut === 'TERMINE').length;

        this.globalStats[1].value = activeProjects;
        this.globalStats[2].value = completedProjects;

        const successRate = projects.length > 0 ? Math.round((completedProjects / projects.length) * 100) : 0;
        this.globalStats[3].value = `${successRate}%`;

        this.topProjects = projects
          .sort((a, b) => {
            const aScore = (a.taches?.length || 0) + (a.participants?.length || 0);
            const bScore = (b.taches?.length || 0) + (b.participants?.length || 0);
            return bScore - aScore;
          })
          .slice(0, 8);

        const planifies = projects.filter(p => p.statut === 'PLANIFIE').length;
        const enCours = projects.filter(p => p.statut === 'EN_COURS').length;
        const termines = projects.filter(p => p.statut === 'TERMINE').length;
        const suspendus = projects.filter(p => p.statut === 'SUSPENDU').length;

        this.projectsChartData = {
          ...this.projectsChartData,
          datasets: [{
            ...this.projectsChartData.datasets[0],
            data: [planifies, enCours, termines, suspendus]
          }]
        };
      },
      error: (error) => {
        console.error('Erreur lors du chargement des projets:', error);
      }
    });
  }

  private loadPerformanceMetrics(): void {
    // Simulation de données de performance
    this.performanceMetrics = [
      { label: 'Projets Terminés', value: 12, unit: '', percentage: 75, color: 'primary' },
      { label: 'Taux de Complétion', value: 84, unit: '%', percentage: 84, color: 'accent' },
      { label: 'Productivité Équipe', value: 92, unit: '%', percentage: 92, color: 'warn' },
      { label: 'Satisfaction Client', value: 88, unit: '%', percentage: 88, color: 'primary' }
    ];

    this.tasksProgressData = {
      ...this.tasksProgressData,
      datasets: [{
        ...this.tasksProgressData.datasets[0],
        data: [45, 52, 61, 58, 67, 72]
      }]
    };
  }

  // Exposer Math pour le template
  Math = Math;
}
