// features/chef/components/chef-reports/chef-reports.component.ts
import { Component, OnInit } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { ThemePalette } from '@angular/material/core';

import { ProjetService } from '../../../../core/services/projet.service';
import { TacheService } from '../../../../core/services/tache.service';
import { Projet, StatutProjet } from '../../../../core/models/projet.model';
import { Tache, StatutTache, Priorite } from '../../../../core/models/tache.model';

@Component({
  selector: 'app-chef-reports',
  template: `
    <div class="chef-reports-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">
            <i class="fas fa-chart-bar"></i>
            Rapports et Analyses
          </h1>
          <p class="page-description">
            Analysez les performances de vos projets et équipes
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
          <button mat-raised-button
                  color="primary"
                  (click)="exportReport()"
                  class="export-btn">
            <mat-icon><i class="fas fa-download"></i></mat-icon>
            Exporter
          </button>
        </div>
      </div>

      <!-- Key Metrics -->
      <div class="metrics-section" fxLayout="row wrap" fxLayoutGap="20px" fxLayoutAlign="start stretch">
        <div fxFlex="100" fxFlex.gt-sm="25" *ngFor="let metric of keyMetrics">
          <mat-card class="metric-card" [ngClass]="'card-' + metric.color">
            <mat-card-content>
              <div class="metric-content" fxLayout="row" fxLayoutAlign="space-between center">
                <div class="metric-info">
                  <div class="metric-value">{{ metric.value }}</div>
                  <div class="metric-label">{{ metric.label }}</div>
                  <div class="metric-change" [ngClass]="metric.trend">
                    <i [class]="metric.trendIcon"></i>
                    {{ metric.change }}
                  </div>
                </div>
                <div class="metric-icon">
                  <i [class]="metric.icon"></i>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts-section" fxLayout="row wrap" fxLayoutGap="20px">

        <!-- Project Status Chart -->
        <div fxFlex="100" fxFlex.gt-md="50">
          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>
                <i class="fas fa-project-diagram"></i>
                Statut des Projets
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="chart-container" *ngIf="projectStatusChartData.labels?.length">
                <canvas baseChart
                  [data]="projectStatusChartData"
                  [type]="'doughnut'"
                  [options]="doughnutOptions">
                </canvas>
              </div>
              <div class="no-data" *ngIf="!projectStatusChartData.labels?.length">
                <i class="fas fa-chart-pie"></i>
                <p>Aucune donnée disponible</p>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Task Priority Chart -->
        <div fxFlex="100" fxFlex.gt-md="50">
          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>
                <i class="fas fa-exclamation-triangle"></i>
                Répartition par Priorité
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="chart-container" *ngIf="taskPriorityChartData.labels?.length">
                <canvas baseChart
                  [data]="taskPriorityChartData"
                  [type]="'bar'"
                  [options]="barOptions">
                </canvas>
              </div>
              <div class="no-data" *ngIf="!taskPriorityChartData.labels?.length">
                <i class="fas fa-chart-bar"></i>
                <p>Aucune donnée disponible</p>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Task Completion Trend -->
        <div fxFlex="100">
          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>
                <i class="fas fa-chart-line"></i>
                Évolution des Tâches Terminées
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="chart-container" *ngIf="taskCompletionChartData.labels?.length">
                <canvas baseChart
                  [data]="taskCompletionChartData"
                  [type]="'line'"
                  [options]="lineOptions">
                </canvas>
              </div>
              <div class="no-data" *ngIf="!taskCompletionChartData.labels?.length">
                <i class="fas fa-chart-line"></i>
                <p>Aucune donnée disponible</p>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>

      <!-- Performance Summary -->
      <div class="performance-section">
        <mat-card class="performance-card">
          <mat-card-header>
            <mat-card-title>
              <i class="fas fa-tachometer-alt"></i>
              Résumé des Performances
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="performance-grid" fxLayout="row wrap" fxLayoutGap="30px">

              <!-- Project Performance -->
              <div fxFlex="100" fxFlex.gt-sm="50" class="performance-section-item">
                <h3><i class="fas fa-project-diagram"></i> Projets</h3>

                <div class="performance-item" *ngFor="let project of topProjects">
                  <div class="performance-info">
                    <div class="performance-name">{{ project.nom }}</div>
                    <div class="performance-details">
                      <span class="detail-item">
                        <i class="fas fa-calendar"></i>
                        {{ project.dateEcheance | date:'dd/MM/yyyy' }}
                      </span>
                      <span class="detail-item">
                        <app-status-chip [status]="project.statut" type="status" [showIcon]="false"></app-status-chip>
                      </span>
                    </div>
                  </div>
                  <div class="performance-progress">
                    <div class="progress-value">{{ getProjectProgress(project) }}%</div>
                    <mat-progress-bar
                      mode="determinate"
                      [value]="getProjectProgress(project)"
                      [color]="getProgressColor(getProjectProgress(project))">
                    </mat-progress-bar>
                  </div>
                </div>
              </div>

              <!-- Team Performance -->
              <div fxFlex="100" fxFlex.gt-sm="50" class="performance-section-item">
                <h3><i class="fas fa-users"></i> Performance de l'Équipe</h3>

                <div class="team-stats">
                  <div class="team-stat-item">
                    <div class="team-stat-label">Tâches assignées</div>
                    <div class="team-stat-value">{{ teamStats.totalTasks }}</div>
                  </div>

                  <div class="team-stat-item">
                    <div class="team-stat-label">Taux de completion</div>
                    <div class="team-stat-value">{{ teamStats.completionRate }}%</div>
                  </div>

                  <div class="team-stat-item">
                    <div class="team-stat-label">Tâches en retard</div>
                    <div class="team-stat-value warning">{{ teamStats.overdueTasks }}</div>
                  </div>

                  <div class="team-stat-item">
                    <div class="team-stat-label">Moyenne par membre</div>
                    <div class="team-stat-value">{{ teamStats.averageTasksPerMember }}</div>
                  </div>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Recent Activity -->
      <div class="activity-section">
        <mat-card class="activity-card">
          <mat-card-header>
            <mat-card-title>
              <i class="fas fa-history"></i>
              Activités Récentes
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="activity-list" *ngIf="recentActivities.length > 0">
              <div class="activity-item" *ngFor="let activity of recentActivities">
                <div class="activity-icon" [ngClass]="'activity-' + activity.type">
                  <i [class]="activity.icon"></i>
                </div>
                <div class="activity-content">
                  <div class="activity-title">{{ activity.title }}</div>
                  <div class="activity-description">{{ activity.description }}</div>
                  <div class="activity-time">{{ activity.timestamp | date:'dd/MM/yyyy HH:mm' }}</div>
                </div>
              </div>
            </div>
            <div class="no-data" *ngIf="recentActivities.length === 0">
              <i class="fas fa-history"></i>
              <p>Aucune activité récente</p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .chef-reports-container {
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

    .header-actions {
      display: flex;
      gap: 15px;
      align-items: center;
    }

    .refresh-btn, .export-btn {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 25px;
      padding: 8px 20px;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .refresh-btn:hover, .export-btn:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-2px);
    }

    .export-btn {
      background: linear-gradient(45deg, #e91e63, #f06292);
      border-color: transparent;
    }

    .metrics-section {
      margin-bottom: 30px;
    }

    .metric-card {
      border-radius: 12px;
      overflow: hidden;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .metric-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    }

    .card-primary { border-left: 5px solid #6a1b9a; }
    .card-accent { border-left: 5px solid #e91e63; }
    .card-success { border-left: 5px solid #4caf50; }
    .card-warning { border-left: 5px solid #ff9800; }

    .metric-content {
      padding: 10px 0;
    }

    .metric-value {
      font-size: 2.5rem;
      font-weight: 700;
      color: #333;
      line-height: 1;
    }

    .metric-label {
      font-size: 0.9rem;
      color: #666;
      font-weight: 500;
      margin: 5px 0;
    }

    .metric-change {
      font-size: 0.8rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .metric-change.positive { color: #4caf50; }
    .metric-change.negative { color: #f44336; }
    .metric-change.neutral { color: #666; }

    .metric-icon {
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

    .charts-section, .performance-section, .activity-section {
      margin-bottom: 30px;
    }

    .chart-card, .performance-card, .activity-card {
      border-radius: 12px;
      overflow: visible;
    }

    ::ng-deep .chart-card .mat-card-header,
    ::ng-deep .performance-card .mat-card-header,
    ::ng-deep .activity-card .mat-card-header {
      background: linear-gradient(90deg, #f8f9ff, #fff);
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

    .chart-container {
      height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .no-data {
      text-align: center;
      padding: 60px 20px;
      color: #999;
    }

    .no-data i {
      font-size: 3rem;
      margin-bottom: 15px;
      color: #ddd;
    }

    .performance-grid {
      margin-top: 20px;
    }

    .performance-section-item h3 {
      color: #6a1b9a;
      font-size: 1.2rem;
      font-weight: 600;
      margin: 0 0 20px 0;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .performance-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 15px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .performance-item:last-child {
      border-bottom: none;
    }

    .performance-info {
      flex: 1;
      margin-right: 20px;
    }

    .performance-name {
      font-weight: 600;
      color: #333;
      margin-bottom: 5px;
    }

    .performance-details {
      display: flex;
      gap: 15px;
      align-items: center;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 0.85rem;
      color: #666;
    }

    .performance-progress {
      width: 120px;
      text-align: right;
    }

    .progress-value {
      font-weight: 600;
      color: #6a1b9a;
      font-size: 0.9rem;
      margin-bottom: 5px;
    }

    .team-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 20px;
    }

    .team-stat-item {
      text-align: center;
      padding: 20px;
      background: #f8f9ff;
      border-radius: 10px;
      border-top: 3px solid #6a1b9a;
    }

    .team-stat-label {
      font-size: 0.85rem;
      color: #666;
      margin-bottom: 8px;
    }

    .team-stat-value {
      font-size: 1.8rem;
      font-weight: 700;
      color: #6a1b9a;
    }

    .team-stat-value.warning {
      color: #ff9800;
    }

    .activity-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .activity-item {
      display: flex;
      align-items: flex-start;
      padding: 15px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .activity-item:last-child {
      border-bottom: none;
    }

    .activity-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      margin-right: 15px;
      flex-shrink: 0;
    }

    .activity-project { background: linear-gradient(45deg, #6a1b9a, #8e24aa); }
    .activity-task { background: linear-gradient(45deg, #e91e63, #f06292); }
    .activity-team { background: linear-gradient(45deg, #4caf50, #66bb6a); }

    .activity-content {
      flex: 1;
    }

    .activity-title {
      font-weight: 600;
      color: #333;
      margin-bottom: 5px;
    }

    .activity-description {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 5px;
    }

    .activity-time {
      color: #999;
      font-size: 0.8rem;
    }

    @media (max-width: 768px) {
      .chef-reports-container {
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

      .header-actions {
        flex-direction: column;
        width: 100%;
        gap: 10px;
      }

      .refresh-btn, .export-btn {
        width: 100%;
      }

      .performance-grid {
        flex-direction: column;
      }

      .team-stats {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class ChefReportsComponent implements OnInit {
  loading = false;
  projects: Projet[] = [];
  tasks: Tache[] = [];
  topProjects: Projet[] = [];

  keyMetrics = [
    {
      label: 'Projets Actifs',
      value: 0,
      change: '+5%',
      trend: 'positive',
      trendIcon: 'fas fa-arrow-up',
      icon: 'fas fa-project-diagram',
      color: 'primary'
    },
    {
      label: 'Tâches Terminées',
      value: 0,
      change: '+12%',
      trend: 'positive',
      trendIcon: 'fas fa-arrow-up',
      icon: 'fas fa-check-circle',
      color: 'success'
    },
    {
      label: 'Taux de Réussite',
      value: '0%',
      change: '+3%',
      trend: 'positive',
      trendIcon: 'fas fa-arrow-up',
      icon: 'fas fa-percentage',
      color: 'accent'
    },
    {
      label: 'Échéances Proches',
      value: 0,
      change: '-2%',
      trend: 'positive',
      trendIcon: 'fas fa-arrow-down',
      icon: 'fas fa-clock',
      color: 'warning'
    }
  ];

  teamStats = {
    totalTasks: 0,
    completionRate: 0,
    overdueTasks: 0,
    averageTasksPerMember: 0
  };

  recentActivities: any[] = [];

  // Chart data
  projectStatusChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [
        '#6a1b9a',  // Planifié
        '#2196f3',  // En cours
        '#4caf50',  // Terminé
        '#ff9800',  // Suspendu
        '#f44336'   // Annulé
      ]
    }]
  };

  taskPriorityChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      label: 'Nombre de tâches',
      data: [],
      backgroundColor: [
        '#4caf50',  // Basse
        '#ff9800',  // Moyenne
        '#e91e63',  // Haute
        '#f44336'   // Urgente
      ]
    }]
  };

  taskCompletionChartData: ChartData<'line'> = {
    labels: [],
    datasets: [{
      label: 'Tâches terminées',
      data: [],
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
      legend: {
        position: 'bottom'
      }
    }
  };

  barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  lineOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  constructor(
    private projetService: ProjetService,
    private tacheService: TacheService
  ) {}

  ngOnInit(): void {
    this.loadReportData();
  }

  loadReportData(): void {
    this.loading = true;
    this.loadProjects();
    this.loadTasks();
  }

  refreshData(): void {
    this.loadReportData();
  }

  exportReport(): void {
    // Implémenter l'export des rapports
    console.log('Export report functionality');
  }

  private loadProjects(): void {
    this.projetService.getMesProjets().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.topProjects = projects.slice(0, 5); // Top 5 projets
        this.updateProjectMetrics();
        this.updateProjectStatusChart();
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des projets:', error);
        this.checkLoadingComplete();
      }
    });
  }

  private loadTasks(): void {
    this.tacheService.getAllTaches().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.updateTaskMetrics();
        this.updateTaskPriorityChart();
        this.updateTaskCompletionChart();
        this.updateRecentActivities();
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des tâches:', error);
        this.checkLoadingComplete();
      }
    });
  }

  private checkLoadingComplete(): void {
    if (this.projects.length >= 0 && this.tasks.length >= 0) {
      this.loading = false;
    }
  }

  private updateProjectMetrics(): void {
    this.keyMetrics[0].value = this.projects.filter(p =>
      p.statut === StatutProjet.EN_COURS || p.statut === StatutProjet.PLANIFIE
    ).length;
  }

  private updateTaskMetrics(): void {
    const completedTasks = this.tasks.filter(t => t.statut === StatutTache.TERMINEE).length;
    this.keyMetrics[1].value = completedTasks;

    const completionRate = this.tasks.length > 0 ?
      Math.round((completedTasks / this.tasks.length) * 100) : 0;
    this.keyMetrics[2].value = completionRate + '%';

    // Échéances proches (7 jours)
    const now = new Date();
    const upcomingDeadlines = this.tasks.filter(task => {
      const deadline = new Date(task.dateEcheance);
      const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 3600 * 24));
      return diffDays <= 7 && diffDays >= 0 && task.statut !== StatutTache.TERMINEE;
    }).length;
    this.keyMetrics[3].value = upcomingDeadlines;

    // Team stats
    this.teamStats.totalTasks = this.tasks.length;
    this.teamStats.completionRate = completionRate;
    this.teamStats.overdueTasks = this.tasks.filter(task => {
      const deadline = new Date(task.dateEcheance);
      return deadline < now && task.statut !== StatutTache.TERMINEE;
    }).length;

    const uniqueMembers = new Set(this.tasks.map(t => t.utilisateur?.id).filter(Boolean));
    this.teamStats.averageTasksPerMember = uniqueMembers.size > 0 ?
      Math.round(this.tasks.length / uniqueMembers.size) : 0;
  }

  private updateProjectStatusChart(): void {
    const statusCounts: { [key: string]: number } = {};

    Object.values(StatutProjet).forEach(status => {
      statusCounts[status] = this.projects.filter(p => p.statut === status).length;
    });

    this.projectStatusChartData = {
      labels: Object.keys(statusCounts).map(status => {
        switch (status) {
          case StatutProjet.PLANIFIE: return 'Planifié';
          case StatutProjet.EN_COURS: return 'En Cours';
          case StatutProjet.TERMINE: return 'Terminé';
          case StatutProjet.SUSPENDU: return 'Suspendu';
          case StatutProjet.ANNULE: return 'Annulé';
          default: return status;
        }
      }),
      datasets: [{
        data: Object.values(statusCounts),
        backgroundColor: [
          '#6a1b9a',  // Planifié
          '#2196f3',  // En cours
          '#4caf50',  // Terminé
          '#ff9800',  // Suspendu
          '#f44336'   // Annulé
        ]
      }]
    };
  }

  private updateTaskPriorityChart(): void {
    const priorityCounts: { [key: string]: number } = {};

    Object.values(Priorite).forEach(priority => {
      priorityCounts[priority] = this.tasks.filter(t => t.priorite === priority).length;
    });

    this.taskPriorityChartData = {
      labels: Object.keys(priorityCounts).map(priority => {
        switch (priority) {
          case Priorite.BASSE: return 'Basse';
          case Priorite.MOYENNE: return 'Moyenne';
          case Priorite.HAUTE: return 'Haute';
          case Priorite.URGENTE: return 'Urgente';
          default: return priority;
        }
      }),
      datasets: [{
        label: 'Nombre de tâches',
        data: Object.values(priorityCounts),
        backgroundColor: [
          '#4caf50',  // Basse
          '#ff9800',  // Moyenne
          '#e91e63',  // Haute
          '#f44336'   // Urgente
        ]
      }]
    };
  }

  private updateTaskCompletionChart(): void {
    // Simuler des données de tendance sur 7 jours
    const last7Days = [];
    const completionData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      last7Days.push(date.toLocaleDateString('fr-FR', { weekday: 'short' }));

      // Simuler des données (remplacer par vraies données si disponible)
      completionData.push(Math.floor(Math.random() * 10) + 1);
    }

    this.taskCompletionChartData = {
      labels: last7Days,
      datasets: [{
        label: 'Tâches terminées',
        data: completionData,
        borderColor: '#6a1b9a',
        backgroundColor: 'rgba(106, 27, 154, 0.1)',
        tension: 0.4
      }]
    };
  }

  private updateRecentActivities(): void {
    this.recentActivities = [
      {
        type: 'project',
        icon: 'fas fa-project-diagram',
        title: 'Nouveau projet créé',
        description: 'Le projet "Application Mobile" a été créé',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2h ago
      },
      {
        type: 'task',
        icon: 'fas fa-check',
        title: 'Tâche terminée',
        description: 'La tâche "Interface utilisateur" a été complétée',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4h ago
      },
      {
        type: 'team',
        icon: 'fas fa-user-plus',
        title: 'Nouveau membre assigné',
        description: 'Jean Dupont a été assigné au projet',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6h ago
      }
    ].slice(0, 10); // Limiter à 10 activités
  }

  getProjectProgress(project: Projet): number {
    if (!project.taches || project.taches.length === 0) {
      return project.statut === StatutProjet.TERMINE ? 100 : 0;
    }

    const completedTasks = project.taches.filter(t => t.statut === StatutTache.TERMINEE).length;
    return Math.round((completedTasks / project.taches.length) * 100);
  }

  getProgressColor(progress: number): ThemePalette {
    if (progress >= 80) return 'primary';
    if (progress >= 60) return 'accent';
    if (progress >= 40) return 'warn';
    return 'warn';
  }
}
