
// features/users/user-list/user-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { User, Role } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  loading = true;
  error: string | null = null;
  searchTerm = '';
  selectedRole: Role | 'ALL' = 'ALL';

  // Pagination
  currentPage = 1;
  pageSize = 12;
  totalPages = 0;

  // Énums pour le template
  Role = Role;

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  /**
   * Charger tous les utilisateurs
   */
  loadUsers(): void {
    this.loading = true;
    this.error = null;

    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        this.error = 'Erreur lors du chargement des utilisateurs';
        this.loading = false;
      }
    });
  }

  /**
   * Appliquer les filtres de recherche
   */
  applyFilters(): void {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = user.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesRole = this.selectedRole === 'ALL' || user.role === this.selectedRole;

      return matchesSearch && matchesRole;
    });

    // Calculer la pagination
    this.totalPages = Math.ceil(this.filteredUsers.length / this.pageSize);
    this.currentPage = 1; // Reset à la première page après filtrage
  }

  /**
   * Réinitialiser les filtres
   */
  resetFilters(): void {
    this.searchTerm = '';
    this.selectedRole = 'ALL';
    this.applyFilters();
  }

  /**
   * Obtenir les utilisateurs paginés
   */
  getPaginatedUsers(): User[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredUsers.slice(startIndex, endIndex);
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
   * Naviguer vers la création d'utilisateur
   */
  createUser(): void {
    this.router.navigate(['/admin/users/create']);
  }

  /**
   * Naviguer vers l'édition d'utilisateur
   */
  editUser(userId: number): void {
    this.router.navigate(['/admin/users/edit', userId]);
  }

  /**
   * Supprimer un utilisateur
   */
  deleteUser(user: User): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.nom} ?`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== user.id);
          this.applyFilters();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          alert('Erreur lors de la suppression de l\'utilisateur');
        }
      });
    }
  }

  /**
   * Changer le rôle d'un utilisateur
   */
  changeUserRole(user: User, newRole: string): void {
    const role = newRole as Role;

    this.userService.changeUserRole(user.id, role).subscribe({
      next: (updatedUser) => {
        // Mettre à jour l'utilisateur dans la liste
        const index = this.users.findIndex(u => u.id === user.id);
        if (index !== -1) {
          this.users[index] = updatedUser;
          this.applyFilters();
        }
      },
      error: (error) => {
        console.error('Erreur lors du changement de rôle:', error);
        alert('Erreur lors du changement de rôle');
      }
    });
  }

  /**
   * Obtenir la classe CSS pour le rôle
   */
  getRoleClass(role: Role): string {
    switch (role) {
      case Role.ADMIN: return 'role-admin';
      case Role.CHEF_DE_PROJECT: return 'role-chef';
      case Role.MEMBRE_EQUIPE: return 'role-membre';
      default: return '';
    }
  }

  /**
   * Obtenir le badge de rôle
   */
  getRoleLabel(role: Role): string {
    switch (role) {
      case Role.ADMIN: return 'Administrateur';
      case Role.CHEF_DE_PROJECT: return 'Chef de Projet';
      case Role.MEMBRE_EQUIPE: return 'Membre d\'équipe';
      default: return role;
    }
  }
}
