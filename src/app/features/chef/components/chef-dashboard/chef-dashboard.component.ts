// features/chef/components/chef-dashboard/chef-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { ProjetService } from '../../../../core/services/projet.service';
import { TacheService } from '../../../../core/services/tache.service';
import { User } from '../../../../core/models/user.model';
import { Projet, StatutProjet } from '../../../../core/models/projet.model';
import { Tache, StatutTache, Priorite } from '../../../../core/models/tache.model';
import { ChartConfiguration, ChartData } from 'chart.js';
import { ThemePalette } from '@angular/material/core';

interface StatItem {
  label: string;
  value: number;
  icon: string;
  color: ThemePalette;
  progress?: number;
}

@Component({
  selector: 'app-chef-dashboard',
  template: `
    <div class="dashboard-container">
      <!-- Welcome Section -->
      <div class="welcome-section">
        <div class="welcome-content">
          <h1 class="dashboard-title">
            <i class="fas fa-user-tie"></i>
            Tableau de Bord Chef
          </h1>
          <p class="welcome-message" *ngIf="currentUser">
            Bienvenue, <strong>{{ currentUser.nom }}</strong> !
            Gérez vos projets et équipes efficacement.
          </p>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-section" fxLayout="row wrap" fxLayoutGap="20px" fxLayoutAlign="start stretch">
        <div fxFlex="100" fxFlex.gt-sm="25" *ngFor="let stat of stats">
          <mat-card class="stat-card" [ngClass]="getCardClass(stat.color)">
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
              <div class="stat-progress" *ngIf="stat.progress !== undefined">
                <mat-progress-bar
                  mode="determinate"
                  [value]="stat.progress"
                  [color]="stat.color">
                </mat-progress-bar>
                <span class="progress-text">{{ stat.progress }}% de progression</span>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts-section" fxLayout="row wrap" fxLayoutGap="20px">
        <!-- Tasks by Priority -->
        <div fxFlex="100" fxFlex.gt-md="50">
          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>
                <i class="fas fa-exclamation-triangle"></i>
                Tâches par Priorité
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="chart-container" *ngIf="priorityChartData.labels?.length">
                <canvas baseChart
                  [data]="priorityChartData"
                  [type]="'doughnut'"
                  [options]="chartOptions">
                </canvas>
              </div>
              <div class="no-data" *ngIf="!priorityChartData.labels?.length">
                <i class="fas fa-chart-pie"></i>
                <p>Aucune tâche disponible</p>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Project Progress -->
        <div fxFlex="100" fxFlex.gt-md="50">
          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>
                <i class="fas fa-chart-line"></i>
                Progression des Projets
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="projects-progress" *ngIf="myProjects.length > 0">
                <div class="project-progress-item" *ngFor="let project of myProjects.slice(0, 5)">
                  <div class="project-info">
                    <div class="project-name">{{ project.nom }}</div>
                    <div class="project-status">
                      <app-status-chip [status]="project.statut" type="status"></app-status-chip>
                    </div>
                  </div>
                  <div class="progress-info">
                    <mat-progress-bar
                      mode="determinate"
                      [value]="getProjectProgress(project)"
                      color="primary">
                    </mat-progress-bar>
                    <span class="progress-text">{{ getProjectProgress(project) }}%</span>
                  </div>
                </div>
              </div>
              <div class="no-data" *ngIf="myProjects.length === 0">
                <i class="fas fa-project-diagram"></i>
                <p>Aucun projet assigné</p>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="actions-section">
        <mat-card class="actions-card">
          <mat-card-header>
            <mat-card-title>
              <i class="fas fa-bolt"></i>
              Actions Rapides
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="actions-grid" fxLayout="row wrap" fxLayoutGap="15px">
              <button mat-raised-button
                      color="primary"
                      routerLink="/chef/taches/create"
                      class="action-btn">
                <mat-icon><i class="fas fa-plus-square"></i></mat-icon>
                Nouvelle Tâche
              </button>

              <button mat-raised-button
                      routerLink="/chef/projets"
                      class="action-btn">
                <mat-icon><i class="fas fa-folder-open"></i></mat-icon>
                Mes Projets
              </button>

              <button mat-raised-button
                      routerLink="/chef/taches"
                      class="action-btn">
                <mat-icon><i class="fas fa-tasks"></i></mat-icon>
                Toutes les Tâches
              </button>

              <button mat-raised-button
                      routerLink="/chef/rapports"
                      class="action-btn">
                <mat-icon><i class="fas fa-chart-bar"></i></mat-icon>
                Rapports
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Recent Tasks -->
      <div class="recent-section">
        <mat-card class="recent-card">
          <mat-card-header>
            <mat-card-title>
              <i class="fas fa-clock"></i>
              Tâches Récentes
            </mat-card-title>
            <div class="header-actions">
              <button mat-button routerLink="/chef/taches" color="primary">
                Voir tout
                <mat-icon><i class="fas fa-arrow-right"></i></mat-icon>
              </button>
            </div>
          </mat-card-header>
          <mat-card-content>
            <div class="tasks-list" *ngIf="recentTasks.length > 0">
              <div class="task-item" *ngFor="let task of recentTasks">
                <div class="task-priority">
                  <app-status-chip [status]="task.priorite" type="priority" [showIcon]="false"></app-status-chip>
                </div>
                <div class="task-content">
                  <div class="task-name">{{ task.nom }}</div>
                  <div class="task-project" *ngIf="task.projet">
                    <i class="fas fa-project-diagram"></i>
                    {{ task.projet.nom }}
                  </div>
                  <div class="task-assignee" *ngIf="task.utilisateur">
                    <i class="fas fa-user"></i>
                    {{ task.utilisateur.nom }}
                  </div>
                </div>
                <div class="task-status">
                  <app-status-chip [status]="task.statut" type="status"></app-status-chip>
                </div>
                <div class="task-deadline">
                  <i class="fas fa-calendar"></i>
                  {{ task.dateEcheance | date:'dd/MM' }}
                </div>
              </div>
            </div>
            <div class="no-data" *ngIf="recentTasks.length === 0">
              <i class="fas fa-tasks"></i>
              <p>Aucune tâche récente</p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .welcome-section {
      margin-bottom: 30px;
      padding: 30px;
      background: linear-gradient(135deg, #6a1b9a, #8e24aa);
      border-radius: 15px;
      color: white;
      box-shadow: 0 8px 25px rgba(106, 27, 154, 0.3);
    }

    .dashboard-title {
      margin: 0 0 10px 0;
      font-size: 2.2rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .welcome-message {
      margin: 0;
      font-size: 1.1rem;
      opacity: 0.9;
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
    .card-warn { border-left: 5px solid #ff9800; }
    .card-success { border-left: 5px solid #4caf50; }

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

    .stat-progress {
      margin-top: 15px;
    }

    .progress-text {
      font-size: 0.8rem;
      color: #666;
      margin-top: 5px;
      display: block;
    }

    .charts-section {
      margin-bottom: 30px;
    }

    .chart-card {
      border-radius: 12px;
      overflow: hidden;
    }

    .chart-container {
      height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .projects-progress {
      max-height: 300px;
      overflow-y: auto;
    }

    .project-progress-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 15px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .project-progress-item:last-child {
      border-bottom: none;
    }

    .project-info {
      flex: 1;
      margin-right: 20px;
    }

    .project-name {
      font-weight: 600;
      color: #333;
      margin-bottom: 5px;
    }

    .progress-info {
      width: 150px;
      text-align: right;
    }

    .progress-info mat-progress-bar {
      margin-bottom: 5px;
    }

    .progress-text {
      font-size: 0.85rem;
      color: #666;
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

    .actions-section,
    .recent-section {
      margin-bottom: 30px;
    }

    .actions-card,
    .recent-card {
      border-radius: 12px;
    }

    ::ng-deep .recent-card .mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    ::ng-deep .header-actions {
      margin-left: auto;
    }

    .actions-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
    }

    .action-btn {
      min-width: 180px;
      height: 48px;
      border-radius: 24px;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .action-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    }

    .tasks-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .task-item {
      display: grid;
      grid-template-columns: auto 1fr auto auto auto;
      gap: 15px;
      align-items: center;
      padding: 15px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .task-item:last-child {
      border-bottom: none;
    }

    .task-content {
      flex: 1;
    }

    .task-name {
      font-weight: 600;
      color: #333;
      margin-bottom: 5px;
    }

    .task-project,
    .task-assignee {
      font-size: 0.85rem;
      color: #666;
      margin-bottom: 2px;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .task-deadline {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 0.85rem;
      color: #666;
      white-space: nowrap;
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 10px;
      }

      .dashboard-title {
        font-size: 1.8rem;
      }

      .stat-value {
        font-size: 2rem;
      }

      .action-btn {
        min-width: 140px;
      }

      .task-item {
        grid-template-columns: 1fr;
        gap: 10px;
        text-align: center;
      }
    }
  `]
})
export class ChefDashboardComponent implements OnInit {
  currentUser: User | null = null;
  loading = false;
  myProjects: Projet[] = [];
  recentTasks: Tache[] = [];

  stats: StatItem[] = [
    { label: 'Mes Projets', value: 0, icon: 'fas fa-project-diagram', color: 'primary', progress: 0 },
    { label: 'Tâches Assignées', value: 0, icon: 'fas fa-tasks', color: 'accent', progress: 0 },
    { label: 'Tâches Terminées', value: 0, icon: 'fas fa-check-circle', color: 'primary', progress: 0 },
    { label: 'Échéances Proches', value: 0, icon: 'fas fa-clock', color: 'warn', progress: 0 }
  ];

  priorityChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [
        '#4caf50',  // Basse
        '#ff9800',  // Moyenne
        '#e91e63',  // Haute
        '#f44336'   // Urgente
      ]
    }]
  };

  chartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  constructor(
    private authService: AuthService,
    private projetService: ProjetService,
    private tacheService: TacheService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardData();
  }

  getCardClass(color: ThemePalette): string {
    switch (color) {
      case 'primary': return 'card-primary';
      case 'accent': return 'card-accent';
      case 'warn': return 'card-warn';
      default: return 'card-primary';
    }
  }

  private loadDashboardData(): void {
    this.loading = true;
    this.loadMyProjects();
    this.loadMyTasks();
  }

  private loadMyProjects(): void {
    this.projetService.getMesProjets().subscribe({
      next: (projects) => {
        this.myProjects = projects;
        this.stats[0].value = projects.length;

        // Calculer progression moyenne
        const totalProgress = projects.reduce((sum, project) => sum + this.getProjectProgress(project), 0);
        this.stats[0].progress = projects.length > 0 ? Math.round(totalProgress / projects.length) : 0;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des projets:', error);
      }
    });
  }

  private loadMyTasks(): void {
    this.tacheService.getAllTaches().subscribe({
      next: (tasks) => {
        this.recentTasks = tasks.slice(0, 10); // Les 10 plus récentes

        // Statistiques des tâches
        this.stats[1].value = tasks.length;

        const completedTasks = tasks.filter(t => t.statut === StatutTache.TERMINEE).length;
        this.stats[2].value = completedTasks;
        this.stats[2].progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

        // Tâches avec échéance proche (7 jours)
        const upcomingDeadlines = tasks.filter(task => {
          const deadline = new Date(task.dateEcheance);
          const today = new Date();
          const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 3600 * 24));
          return diffDays <= 7 && diffDays >= 0 && task.statut !== StatutTache.TERMINEE;
        }).length;

        this.stats[3].value = upcomingDeadlines;

        // Données pour le graphique des priorités
        const priorityCounts: { [key: string]: number } = {};
        tasks.forEach(task => {
          priorityCounts[task.priorite] = (priorityCounts[task.priorite] || 0) + 1;
        });

        this.priorityChartData = {
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
            data: Object.values(priorityCounts),
            backgroundColor: [
              '#4caf50',  // Basse
              '#ff9800',  // Moyenne
              '#e91e63',  // Haute
              '#f44336'   // Urgente
            ]
          }]
        };

        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        console.error('Erreur lors du chargement des tâches:', error);
      }
    });
  }

  getProjectProgress(project: Projet): number {
    if (!project.taches || project.taches.length === 0) {
      return project.statut === StatutProjet.TERMINE ? 100 : 0;
    }

    const completedTasks = project.taches.filter(t => t.statut === StatutTache.TERMINEE).length;
    return Math.round((completedTasks / project.taches.length) * 100);
  }
}
