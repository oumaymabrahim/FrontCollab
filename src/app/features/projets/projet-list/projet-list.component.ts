import { Component, OnInit } from '@angular/core';
import { ProjetService } from '../../../core/services/projet.service';
import { AuthService } from '../../../core/services/auth.service';
import { Projet, StatutProjet } from '../../../core/models/projet.model';
import { Role } from '../../../core/models/user.model';

@Component({
  selector: 'app-projet-list',
  templateUrl: './projet-list.component.html',
  styleUrls: ['./projet-list.component.scss']
})
export class ProjetListComponent implements OnInit {
  projets: Projet[] = [];
  filteredProjets: Projet[] = [];
  loading = true;
  error = '';

  // Filtres
  searchTerm = '';
  selectedStatut: StatutProjet | '' = '';

  // Enums pour le template
  StatutProjet = StatutProjet;
  Role = Role;

  // Pagination
  currentPage = 1;
  itemsPerPage = 6;
  totalPages = 0;

  // Utilisateur actuel
  isAdmin = false;

  constructor(
    private projetService: ProjetService,
    private authService: AuthService
  ) {
    const currentUser = this.authService.getCurrentUser();
    this.isAdmin = currentUser?.role === Role.ADMIN;
  }

  ngOnInit(): void {
    this.loadProjets();
  }

  /**
   * Charger la liste des projets
   */
  loadProjets(): void {
    this.loading = true;
    this.error = '';
console.error("rrrrrrr");
console.warn("ggggg");
console.log("ttttttt");

    this.projetService.getAllProjets().subscribe({
      next: (projets) => {
        this.projets = projets;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message || 'Erreur lors du chargement des projets';
        this.loading = false;
      }
    });
  }

  /**
   * Appliquer les filtres de recherche
   */
  applyFilters(): void {
    let filtered = [...this.projets];

    // Filtre par terme de recherche
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(projet =>
        projet.nom.toLowerCase().includes(term) ||
        (projet.description && projet.description.toLowerCase().includes(term))
      );
    }

    // Filtre par statut
    if (this.selectedStatut) {
      filtered = filtered.filter(projet => projet.statut === this.selectedStatut);
    }

    this.filteredProjets = filtered;
    this.calculatePagination();
  }

  /**
   * Calculer la pagination
   */
  calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredProjets.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }

  /**
   * Obtenir les projets pour la page courante
   */
  getPaginatedProjets(): Projet[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredProjets.slice(start, end);
  }

  /**
   * Changer de page
   */
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  /**
   * Supprimer un projet (Admin seulement)
   */
  deleteProjet(projet: Projet): void {
    if (!this.isAdmin) return;

    if (confirm(`Êtes-vous sûr de vouloir supprimer le projet "${projet.nom}" ?`)) {
      this.projetService.deleteProjet(projet.id).subscribe({
        next: () => {
          this.loadProjets(); // Recharger la liste
        },
        error: (error) => {
          this.error = error.message || 'Erreur lors de la suppression';
        }
      });
    }
  }

  /**
   * Obtenir la classe CSS pour le statut
   */
  getStatutClass(statut: StatutProjet): string {
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
   * Obtenir le libellé du statut
   */
  getStatutLabel(statut: StatutProjet): string {
    switch (statut) {
      case StatutProjet.PLANIFIE:
        return 'Planifié';
      case StatutProjet.EN_COURS:
        return 'En cours';
      case StatutProjet.TERMINE:
        return 'Terminé';
      case StatutProjet.SUSPENDU:
        return 'Suspendu';
      case StatutProjet.ANNULE:
        return 'Annulé';
      default:
        return statut;
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
   * Vérifier si une échéance est proche
   */
  isEcheanceProche(dateEcheance: string): boolean {
    return this.getDaysRemaining(dateEcheance) <= 7;
  }

  /**
   * Réinitialiser les filtres
   */
  resetFilters(): void {
    this.searchTerm = '';
    this.selectedStatut = '';
    this.currentPage = 1;
    this.applyFilters();
  }
}
