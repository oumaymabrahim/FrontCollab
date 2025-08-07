
// shared/components/navbar/navbar.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { User, Role } from '../../../core/models/user.model';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isMenuOpen = false;
  private destroy$ = new Subject<void>();

  // Enum pour le template
  Role = Role;

  constructor(
    private authService: AuthService,
    public router: Router
  ) {}

  ngOnInit(): void {
    // S'abonner aux changements d'utilisateur
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Basculer le menu mobile
   */
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  /**
   * Déconnexion
   */
  logout(): void {
    this.authService.logout();
  }

  /**
   * Obtenir les liens de navigation selon le rôle
   */
  getNavigationLinks(): { label: string; route: string; icon: string }[] {
    if (!this.currentUser) return [];

    const baseLinks = [
      { label: 'Tableau de bord', route: 'dashboard', icon: 'dashboard' }
    ];

    switch (this.currentUser.role) {
      case Role.ADMIN:
        return [
          ...baseLinks,
          { label: 'Utilisateurs', route: 'users', icon: 'people' },
          { label: 'Projets', route: 'projets', icon: 'folder' }
        ];

      case Role.CHEF_DE_PROJECT:
        return [
          ...baseLinks,
          { label: 'Projets', route: 'projets', icon: 'folder' },
          { label: 'Tâches', route: 'taches', icon: 'task' }
        ];

      case Role.MEMBRE_EQUIPE:
        return [
          ...baseLinks,
          { label: 'Mes tâches', route: 'mes-taches', icon: 'task' }
        ];

      default:
        return baseLinks;
    }
  }

  /**
   * Obtenir le préfixe de route selon le rôle
   */
  getRoutePrefix(): string {
    if (!this.currentUser) return '';

    switch (this.currentUser.role) {
      case Role.ADMIN:
        return '/admin';
      case Role.CHEF_DE_PROJECT:
        return '/chef';
      case Role.MEMBRE_EQUIPE:
        return '/membre';
      default:
        return '';
    }
  }

  /**
   * Naviguer vers une route
   */
  navigateTo(route: string): void {
    const prefix = this.getRoutePrefix();
    this.router.navigate([`${prefix}/${route}`]);
    this.isMenuOpen = false; // Fermer le menu mobile
  }

  /**
   * Obtenir la classe CSS pour le rôle
   */
  getRoleClass(): string {
    if (!this.currentUser) return '';

    switch (this.currentUser.role) {
      case Role.ADMIN:
        return 'role-admin';
      case Role.CHEF_DE_PROJECT:
        return 'role-chef';
      case Role.MEMBRE_EQUIPE:
        return 'role-membre';
      default:
        return '';
    }
  }
}
