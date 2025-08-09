// features/membre/components/membre-dashboard/membre-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { AuthService } from '../../../../core/services/auth.service';
import { ProjetService } from '../../../../core/services/projet.service';
import { TacheService } from '../../../../core/services/tache.service';
import { User } from '../../../../core/models/user.model';
import { Projet, StatutProjet } from '../../../../core/models/projet.model';
import { Tache, StatutTache, Priorite } from '../../../../core/models/tache.model';
import { ChartConfiguration, ChartData } from 'chart.js';

interface StatCard {
  label: string;
  value: number;
  icon: string;
  color: ThemePalette;
  progress?: number;
}

@Component({
  selector: 'app-membre-dashboard',
  template: `
    <div class="dashboard-container">
      <!-- Welcome Section -->
      <div class="welcome-section">
        <div class="welcome-content">
          <h1 class="dashboard-title">
            <i class="fas fa-user"></i>
            Mon Espace de Travail
          </h1>
          <p class="welcome-message" *ngIf="currentUser">
            Bienvenue, <strong>{{ currentUser.nom }}</strong> !
            Voici vos tâches et projets en cours.
          </p>
        </div>
      </div>

      <!-- Stats Cards -->
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
              <div class="stat-progress" *ngIf="stat.progress !== undefined">
                <mat-progress-bar
                  mode="determinate"
                  [value]="stat.progress"
                  [color]="stat.color">
                </mat-progress-bar>
                <span class="progress-text">{{ stat.progress }}% complétées</span>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>

      <!-- Charts and Quick View -->
      <div class="content-section" fxLayout="row wrap" fxLayoutGap="20px">
        <!-- Task Priority Chart -->
        <div fxFlex="100" fxFlex.gt-md="40">
          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>
                <i class="fas fa-chart-pie"></i>
                Mes Tâches par Priorité
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
                <p>Aucune tâche assignée</p>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Upcoming Deadlines -->
        <div fxFlex="100" fxFlex.gt-md="60">
          <mat-card class="deadlines-card">
            <mat-card-header>
              <mat-card-title>
                <i class="fas fa-calendar-exclamation"></i>
                Échéances Importantes
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="deadlines-list" *ngIf="upcomingDeadlines.length > 0">
                <div class="deadline-item" *ngFor="let task of upcomingDeadlines">
                  <div class="deadline-priority">
                    <app-status-chip [status]="task.priorite" type="priority" [showIcon]="false"></app-status-chip>
                  </div>
                  <div class="deadline-content">
                    <div class="task-name">{{ task.nom }}</div>
                    <div class="task-project" *ngIf="task.projet">
                      <i class="fas fa-project-diagram"></i>
                      {{ task.projet.nom }}
                    </div>
                  </div>
                  <div class="deadline-info">
                    <div class="deadline-date">
                      <i class="fas fa-calendar"></i>
                      {{ task.dateEcheance | date:'dd/MM' }}
                    </div>
                    <div class="deadline-status" [ngClass]="getDeadlineStatusClass(task)">
                      {{ getDeadlineText(task) }}
                    </div>
                  </div>
                  <div class="deadline-action">
                    <button mat-icon-button
                            color="primary"
                            routerLink="/membre/taches"
                            matTooltip="Voir les détails">
                      <mat-icon><i class="fas fa-eye"></i></mat-icon>
                    </button>
                  </div>
                </div>
              </div>
              <div class="no-data" *ngIf="upcomingDeadlines.length === 0">
                <i class="fas fa-calendar-check"></i>
                <p>Aucune échéance proche</p>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>

      <!-- My Projects -->
      <div class="projects-section">
        <mat-card class="projects-card">
          <mat-card-header>
            <mat-card-title>
              <i class="fas fa-folder-open"></i>
              Mes Projets
            </mat-card-title>
            <div class="header-actions">
              <button mat-button routerLink="/membre/projets" color="primary">
                Voir tout
                <mat-icon><i class="fas fa-arrow-right"></i></mat-icon>
              </button>
            </div>
          </mat-card-header>
          <mat-card-content>
            <div class="projects-grid" *ngIf="myProjects.length > 0">
              <div class="project-card" *ngFor="let project of myProjects.slice(0, 6)">
                <div class="project-header">
                  <div class="project-name">{{ project.nom }}</div>
                  <app-status-chip [status]="project.statut" type="status"></app-status-chip>
                </div>
                <div class="project-description" *ngIf="project.description">
                  {{ project.description | slice:0:80 }}{{ project.description.length > 80 ? '...' : '' }}
                </div>
                <div class="project-footer">
                  <div class="project-deadline">
                    <i class="fas fa-calendar"></i>
                    {{ project.dateEcheance | date:'dd/MM/yyyy' }}
                  </div>
                  <div class="project-tasks" *ngIf="project.taches">
                    <i class="fas fa-tasks"></i>
                    {{ getCompletedTasksCount(project) }}/{{ project.taches.length }}
                  </div>
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
                      routerLink="/membre/taches"
                      class="action-btn">
                <mat-icon><i class="fas fa-list-check"></i></mat-icon>
                Mes Tâches
              </button>

              <button mat-raised-button
                      routerLink="/membre/projets"
                      class="action-btn">
                <mat-icon><i class="fas fa-folder-open"></i></mat-icon>
                Mes Projets
              </button>

              <button mat-raised-button
                      (click)="updateTaskStatus()"
                      class="action-btn"
                      [disabled]="!hasInProgressTasks()">
                <mat-icon><i class="fas fa-check-circle"></i></mat-icon>
                Terminer Tâche
              </button>
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
    .card-success { border-left: 5px solid #4caf50; }
    .card-warn { border-left: 5px solid #ff9800; }

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

    .content-section {
      margin-bottom: 30px;
    }

    .chart-card,
    .deadlines-card,
    .projects-card,
    .actions-card {
      border-radius: 12px;
    }

    .chart-container {
      height: 250px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .deadlines-list {
      max-height: 300px;
      overflow-y: auto;
    }

    .deadline-item {
      display: grid;
      grid-template-columns: auto 1fr auto auto;
      gap: 15px;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .deadline-item:last-child {
      border-bottom: none;
    }

    .deadline-content {
      flex: 1;
    }

    .task-name {
      font-weight: 600;
      color: #333;
      margin-bottom: 4px;
    }

    .task-project {
      font-size: 0.85rem;
      color: #666;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .deadline-info {
      text-align: right;
    }

    .deadline-date {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 0.9rem;
      color: #666;
      margin-bottom: 2px;
    }

    .deadline-status {
      font-size: 0.8rem;
      font-weight: 600;
    }

    .deadline-urgent { color: #f44336; }
    .deadline-soon { color: #ff9800; }
    .deadline-normal { color: #4caf50; }

    .projects-section {
      margin-bottom: 30px;
    }

    ::ng-deep .projects-card .mat-card-header,
    ::ng-deep .deadlines-card .mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    ::ng-deep .header-actions {
      margin-left: auto;
    }

    .projects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
    }

    .project-card {
      border: 1px solid #e1bee7;
      border-radius: 12px;
      padding: 20px;
      background: #f8f9ff;
      transition: all 0.3s ease;
    }

    .project-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(106, 27, 154, 0.15);
    }

    .project-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .project-name {
      font-weight: 600;
      color: #333;
      font-size: 1.1rem;
    }

    .project-description {
      color: #666;
      font-size: 0.9rem;
      line-height: 1.4;
      margin-bottom: 15px;
    }

    .project-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.85rem;
      color: #666;
    }

    .project-deadline,
    .project-tasks {
      display: flex;
      align-items: center;
      gap: 5px;
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

    .actions-section {
      margin-bottom: 30px;
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

    .action-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    }

    .action-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
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

      .projects-grid {
        grid-template-columns: 1fr;
      }

      .deadline-item {
        grid-template-columns: 1fr;
        text-align: center;
        gap: 10px;
      }

      .action-btn {
        min-width: 140px;
        width: 100%;
      }
    }
  `]
})
export class MembreDashboardComponent implements OnInit {
  currentUser: User | null = null;
  loading = false;
  myProjects: Projet[] = [];
  myTasks: Tache[] = [];
  upcomingDeadlines: Tache[] = [];

  stats: StatCard[] = [
    { label: 'Mes Tâches', value: 0, icon: 'fas fa-tasks', color: 'primary', progress: 0 },
    { label: 'En Cours', value: 0, icon: 'fas fa-play', color: 'accent' },
    { label: 'Terminées', value: 0, icon: 'fas fa-check-circle', color: undefined },
    { label: 'À Venir', value: 0, icon: 'fas fa-clock', color: 'warn' }
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

  private loadDashboardData(): void {
    this.loading = true;
    this.loadMyProjects();
    this.loadMyTasks();
  }

  private loadMyProjects(): void {
    this.projetService.getMesProjets().subscribe({
      next: (projects) => {
        this.myProjects = projects;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des projets:', error);
      }
    });
  }

  private loadMyTasks(): void {
    this.tacheService.getMesTaches().subscribe({
      next: (tasks) => {
        this.myTasks = tasks;

        // Statistiques des tâches
        this.stats[0].value = tasks.length;

        const inProgressTasks = tasks.filter(t => t.statut === StatutTache.EN_COURS).length;
        this.stats[1].value = inProgressTasks;

        const completedTasks = tasks.filter(t => t.statut === StatutTache.TERMINEE).length;
        this.stats[2].value = completedTasks;
        this.stats[0].progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

        const pendingTasks = tasks.filter(t => t.statut === StatutTache.EN_ATTENTE).length;
        this.stats[3].value = pendingTasks;

        // Échéances proches (7 jours)
        this.upcomingDeadlines = tasks.filter(task => {
          const deadline = new Date(task.dateEcheance);
          const today = new Date();
          const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 3600 * 24));
          return diffDays <= 7 && diffDays >= -1 && task.statut !== StatutTache.TERMINEE;
        }).sort((a, b) => new Date(a.dateEcheance).getTime() - new Date(b.dateEcheance).getTime());

        // Données pour le graphique des priorités
        const priorityCounts: { [key: string]: number } = {};
        tasks.filter(t => t.statut !== StatutTache.TERMINEE).forEach(task => {
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

  getCompletedTasksCount(project: Projet): number {
    if (!project.taches) return 0;
    return project.taches.filter(t => t.statut === StatutTache.TERMINEE).length;
  }

  getDeadlineText(task: Tache): string {
    const deadline = new Date(task.dateEcheance);
    const today = new Date();
    const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 3600 * 24));

    if (diffDays < 0) {
      return 'En retard';
    } else if (diffDays === 0) {
      return 'Aujourd\'hui';
    } else if (diffDays === 1) {
      return 'Demain';
    } else {
      return `${diffDays} jours`;
    }
  }

  getDeadlineStatusClass(task: Tache): string {
    const deadline = new Date(task.dateEcheance);
    const today = new Date();
    const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 3600 * 24));

    if (diffDays < 0) return 'deadline-urgent';
    if (diffDays <= 2) return 'deadline-urgent';
    if (diffDays <= 7) return 'deadline-soon';
    return 'deadline-normal';
  }

  hasInProgressTasks(): boolean {
    return this.myTasks.some(task => task.statut === StatutTache.EN_COURS);
  }

  updateTaskStatus(): void {
    // Cette fonction pourrait ouvrir un dialogue pour sélectionner une tâche à terminer
    // Pour l'instant, on redirige vers la page des tâches
    // this.router.navigate(['/membre/taches']);
  }
}
