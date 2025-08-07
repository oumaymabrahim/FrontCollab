// features/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { ProjetService } from '../../core/services/projet.service';
import { TacheService } from '../../core/services/tache.service';
import { User, Role } from '../../core/models/user.model';
import { Projet, StatutProjet } from '../../core/models/projet.model';
import { Tache, StatutTache } from '../../core/models/tache.model';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface DashboardStats {
  totalUsers?: number;
  totalProjets?: number;
  totalTaches?: number;
  mesTaches?: number;
  tachesEnCours?: number;
  tachesTerminees?: number;
  projetsEnCours?: number;
  projetsTermines?: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  loading = true;
  stats: DashboardStats = {};
  recentTaches: Tache[] = [];
  recentProjets: Projet[] = [];

  // Énums pour le template
  Role = Role;
  StatutTache = StatutTache;
  StatutProjet = StatutProjet;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private projetService: ProjetService,
    private tacheService: TacheService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardData();
  }

  /**
   * Charger les données du tableau de bord selon le rôle
   */
  loadDashboardData(): void {
    this.loading = true;

    if (!this.currentUser) {
      this.loading = false;
      return;
    }

    switch (this.currentUser.role) {
      case Role.ADMIN:
        this.loadAdminDashboard();
        break;
      case Role.CHEF_DE_PROJECT:
        this.loadChefDashboard();
        break;
      case Role.MEMBRE_EQUIPE:
        this.loadMembreDashboard();
        break;
      default:
        this.loading = false;
    }
  }

  /**
   * Tableau de bord administrateur
   */
  private loadAdminDashboard(): void {
    const requests = {
      totalUsers: this.userService.getAllUsers().pipe(catchError(() => of([]))),
      totalProjets: this.projetService.getAllProjets().pipe(catchError(() => of([]))),
      projetsEnCours: this.projetService.getProjetsByStatut(StatutProjet.EN_COURS).pipe(catchError(() => of([]))),
      projetsTermines: this.projetService.getProjetsByStatut(StatutProjet.TERMINE).pipe(catchError(() => of([])))
    };

    forkJoin(requests).subscribe({
      next: (results) => {
        this.stats = {
          totalUsers: results.totalUsers.length,
          totalProjets: results.totalProjets.length,
          projetsEnCours: results.projetsEnCours.length,
          projetsTermines: results.projetsTermines.length
        };
        this.recentProjets = results.totalProjets.slice(0, 5);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  /**
   * Tableau de bord chef de projet
   */
  private loadChefDashboard(): void {
    const requests = {
      totalTaches: this.tacheService.getAllTaches().pipe(catchError(() => of([]))),
      tachesEnCours: this.tacheService.getTachesByStatut(StatutTache.EN_COURS).pipe(catchError(() => of([]))),
      tachesTerminees: this.tacheService.getTachesByStatut(StatutTache.TERMINEE).pipe(catchError(() => of([]))),
      projetsEnCours: this.projetService.getProjetsByStatut(StatutProjet.EN_COURS).pipe(catchError(() => of([])))
    };

    forkJoin(requests).subscribe({
      next: (results) => {
        this.stats = {
          totalTaches: results.totalTaches.length,
          tachesEnCours: results.tachesEnCours.length,
          tachesTerminees: results.tachesTerminees.length,
          projetsEnCours: results.projetsEnCours.length
        };
        this.recentTaches = results.totalTaches.slice(0, 5);
        this.recentProjets = results.projetsEnCours.slice(0, 3);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  /**
   * Tableau de bord membre d'équipe
   */
  private loadMembreDashboard(): void {
    const requests = {
      mesTaches: this.tacheService.getMesTaches().pipe(catchError(() => of([]))),
      tachesEnCours: this.tacheService.getTachesByStatut(StatutTache.EN_COURS).pipe(catchError(() => of([]))),
      tachesTerminees: this.tacheService.getTachesByStatut(StatutTache.TERMINEE).pipe(catchError(() => of([])))
    };

    forkJoin(requests).subscribe({
      next: (results) => {
        const mesTachesEnCours = results.mesTaches.filter(t => t.statut === StatutTache.EN_COURS);
        const mesTachesTerminees = results.mesTaches.filter(t => t.statut === StatutTache.TERMINEE);

        this.stats = {
          mesTaches: results.mesTaches.length,
          tachesEnCours: mesTachesEnCours.length,
          tachesTerminees: mesTachesTerminees.length
        };
        this.recentTaches = results.mesTaches.slice(0, 5);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  /**
   * Obtenir la classe CSS pour le statut d'une tâche
   */
  getStatutTacheClass(statut: StatutTache): string {
    switch (statut) {
      case StatutTache.EN_ATTENTE:
        return 'statut-en-attente';
      case StatutTache.EN_COURS:
        return 'statut-en-cours';
      case StatutTache.TERMINEE:
        return 'statut-terminee';
      default:
        return '';
    }
  }

  /**
   * Obtenir la classe CSS pour le statut d'un projet
   */
  getStatutProjetClass(statut: StatutProjet): string {
    switch (statut) {
      case StatutProjet.PLANIFIE:
        return 'statut-planifie';
      case StatutProjet.EN_COURS:
        return 'statut-en-cours';
      case StatutProjet.TERMINE:
        return 'statut-terminee';
      case StatutProjet.SUSPENDU:
        return 'statut-suspendu';
      case StatutProjet.ANNULE:
        return 'statut-annule';
      default:
        return '';
    }
  }

  /**
   * Formater une date
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  /**
   * Calculer les jours restants
   */
  getDaysRemaining(dateEcheance: string): number {
    const today = new Date();
    const echeance = new Date(dateEcheance);
    const diffTime = echeance.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Vérifier si une échéance est proche (moins de 7 jours)
   */
  isEcheanceProche(dateEcheance: string): boolean {
    return this.getDaysRemaining(dateEcheance) <= 7;
  }
}
