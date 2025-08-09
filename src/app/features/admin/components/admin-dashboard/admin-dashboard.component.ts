import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { UserService } from '../../../../core/services/user.service';
import { ProjetService } from '../../../../core/services/projet.service';
import { User, Role } from '../../../../core/models/user.model';
import { Projet, StatutProjet } from '../../../../core/models/projet.model';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-admin-dashboard',
  template: `
    <div class="dashboard-container">
      <!-- Welcome Section -->
      <div class="welcome-section">
        <div class="welcome-content">
          <h1 class="dashboard-title">
            <i class="fas fa-chart-line"></i>
            Tableau de Bord Admin
          </h1>
          <p class="welcome-message" *ngIf="currentUser">
            Bienvenue, <strong>{{ currentUser.nom }}</strong> !

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
              <div class="stat-trend" *ngIf="stat.trend">
                <i [class]="stat.trend > 0 ? 'fas fa-arrow-up text-success' : 'fas fa-arrow-down text-danger'"></i>
                <span>{{ Math.abs(stat.trend) }}% ce mois</span>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts-section" fxLayout="row wrap" fxLayoutGap="20px">
        <!-- Projets par statut -->
        <div fxFlex="100" fxFlex.gt-md="50">
          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>
                <i class="fas fa-project-diagram"></i>
                Répartition des Projets
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="chart-container" *ngIf="pieChartData.labels?.length">
                <canvas baseChart
                  [data]="pieChartData"
                  [type]="'doughnut'"
                  [options]="pieChartOptions">
                </canvas>
              </div>
              <div class="no-data" *ngIf="!pieChartData.labels?.length">
                <i class="fas fa-chart-pie"></i>
                <p>Aucune donnée disponible</p>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Utilisateurs par rôle -->
        <div fxFlex="100" fxFlex.gt-md="50">
          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>
                <i class="fas fa-users"></i>
                Utilisateurs par Rôle
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="chart-container" *ngIf="barChartData.labels?.length">
                <canvas baseChart
                  [data]="barChartData"
                  [type]="'bar'"
                  [options]="barChartOptions">
                </canvas>
              </div>
              <div class="no-data" *ngIf="!barChartData.labels?.length">
                <i class="fas fa-chart-bar"></i>
                <p>Aucune donnée disponible</p>
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
                      routerLink="/admin/utilisateurs/create"
                      class="action-btn">
                <mat-icon><i class="fas fa-user-plus"></i></mat-icon>
                Créer Utilisateur
              </button>

              <button mat-raised-button
                      color="accent"
                      routerLink="/admin/projets/create"
                      class="action-btn">
                <mat-icon><i class="fas fa-plus-circle"></i></mat-icon>
                Nouveau Projet
              </button>

              <button mat-raised-button
                      routerLink="/admin/utilisateurs"
                      class="action-btn">
                <mat-icon><i class="fas fa-users"></i></mat-icon>
                Gérer Utilisateurs
              </button>

              <button mat-raised-button
                      routerLink="/admin/projets"
                      class="action-btn">
                <mat-icon><i class="fas fa-project-diagram"></i></mat-icon>
                Gérer Projets
              </button>

              <button mat-raised-button
                      routerLink="/admin/statistiques"
                      class="action-btn">
                <mat-icon><i class="fas fa-chart-line"></i></mat-icon>
                Voir Statistiques
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Recent Activities -->
      <div class="recent-section">
        <mat-card class="recent-card">
          <mat-card-header>
            <mat-card-title>
              <i class="fas fa-clock"></i>
              Activités Récentes
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="activity-list" *ngIf="recentActivities.length > 0">
              <div class="activity-item" *ngFor="let activity of recentActivities">
                <div class="activity-icon" [ngClass]="'icon-' + activity.type">
                  <i [class]="activity.icon"></i>
                </div>
                <div class="activity-content">
                  <div class="activity-text">{{ activity.text }}</div>
                  <div class="activity-time">{{ activity.time }}</div>
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
      position: relative;
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

    .stat-trend {
      margin-top: 15px;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .text-success { color: #4caf50; }
    .text-danger { color: #f44336; }

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

    .activity-list {
      max-height: 300px;
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
      margin-right: 15px;
      font-size: 1.1rem;
      flex-shrink: 0;
    }

    .icon-user { background: #e3f2fd; color: #1976d2; }
    .icon-project { background: #f3e5f5; color: #7b1fa2; }
    .icon-task { background: #e8f5e8; color: #388e3c; }

    .activity-content {
      flex: 1;
    }

    .activity-text {
      font-weight: 500;
      color: #333;
      margin-bottom: 5px;
    }

    .activity-time {
      font-size: 0.85rem;
      color: #666;
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
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  currentUser: User | null = null;
  loading = false;

  stats = [
    { label: 'Total Utilisateurs', value: 0, icon: 'fas fa-users', color: 'primary', trend: 12 },
    { label: 'Projets Actifs', value: 0, icon: 'fas fa-project-diagram', color: 'accent', trend: 8 },
    { label: 'Projets Terminés', value: 0, icon: 'fas fa-check-circle', color: 'success', trend: 15 },
    { label: 'En Attente', value: 0, icon: 'fas fa-clock', color: 'warning', trend: -5 }
  ];

  // Chart data
  pieChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [
        '#6a1b9a',
        '#8e24aa',
        '#ab47bc',
        '#ba68c8',
        '#ce93d8'
      ]
    }]
  };

  pieChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      label: 'Nombre d\'utilisateurs',
      data: [],
      backgroundColor: '#6a1b9a'
    }]
  };

  barChartOptions: ChartConfiguration<'bar'>['options'] = {
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

  recentActivities = [
    {
      type: 'user',
      icon: 'fas fa-user-plus',
      text: 'Nouvel utilisateur inscrit : Jean Dupont',
      time: 'Il y a 2 heures'
    },
    {
      type: 'project',
      icon: 'fas fa-project-diagram',
      text: 'Nouveau projet créé : Site E-commerce',
      time: 'Il y a 4 heures'
    },
    {
      type: 'task',
      icon: 'fas fa-check',
      text: 'Tâche terminée dans le projet Mobile App',
      time: 'Il y a 1 jour'
    }
  ];

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private projetService: ProjetService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.loading = true;

    // Charger les statistiques
    this.loadUserStats();
    this.loadProjectStats();
  }

  private loadUserStats(): void {
    // Charger tous les utilisateurs pour les statistiques
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.stats[0].value = users.length;

        // Compter par rôle
        const adminCount = users.filter(u => u.role === Role.ADMIN).length;
        const chefCount = users.filter(u => u.role === Role.CHEF_DE_PROJECT).length;
        const membreCount = users.filter(u => u.role === Role.MEMBRE_EQUIPE).length;

        this.barChartData = {
          labels: ['Admin', 'Chef de Projet', 'Membre Équipe'],
          datasets: [{
            label: 'Nombre d\'utilisateurs',
            data: [adminCount, chefCount, membreCount],
            backgroundColor: ['#6a1b9a', '#8e24aa', '#ab47bc']
          }]
        };
      },
      error: (error) => {
        console.error('Erreur lors du chargement des utilisateurs:', error);
      }
    });
  }

  private loadProjectStats(): void {
    this.projetService.getAllProjets().subscribe({
      next: (projets) => {
        const activeCount = projets.filter(p => p.statut === StatutProjet.EN_COURS).length;
        const completedCount = projets.filter(p => p.statut === StatutProjet.TERMINE).length;
        const pendingCount = projets.filter(p => p.statut === StatutProjet.PLANIFIE).length;

        this.stats[1].value = activeCount;
        this.stats[2].value = completedCount;
        this.stats[3].value = pendingCount;

        // Données pour le graphique en secteurs
        const statusCounts: { [key: string]: number } = {};
        projets.forEach(projet => {
          statusCounts[projet.statut] = (statusCounts[projet.statut] || 0) + 1;
        });

        this.pieChartData = {
          labels: Object.keys(statusCounts).map(status => {
            switch (status) {
              case StatutProjet.PLANIFIE: return 'Planifiés';
              case StatutProjet.EN_COURS: return 'En Cours';
              case StatutProjet.TERMINE: return 'Terminés';
              case StatutProjet.SUSPENDU: return 'Suspendus';
              case StatutProjet.ANNULE: return 'Annulés';
              default: return status;
            }
          }),
          datasets: [{
            data: Object.values(statusCounts),
            backgroundColor: [
              '#6a1b9a',
              '#8e24aa',
              '#ab47bc',
              '#ba68c8',
              '#ce93d8'
            ]
          }]
        };

        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des projets:', error);
        this.loading = false;
      }
    });
  }

  // Exposer Math pour le template
  Math = Math;
}
