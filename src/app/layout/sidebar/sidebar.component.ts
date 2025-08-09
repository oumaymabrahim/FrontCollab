// layout/sidebar/sidebar.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { User, Role } from '../../core/models/user.model';
import { Observable } from 'rxjs';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  roles: Role[];
  children?: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  template: `
    <div class="sidebar-content">
      <!-- Logo Section -->
      <div class="logo-section">
        <div class="logo">
          <i class="fas fa-project-diagram"></i>
          <span>CollabManager</span>
        </div>
      </div>

      <!-- User Info -->
      <div class="user-section" *ngIf="currentUser$ | async as user">
        <div class="user-card">
          <div class="user-avatar">
            <i class="fas fa-user"></i>
          </div>
          <div class="user-info">
            <div class="user-name">{{ user.nom }}</div>
            <div class="user-role">{{ user.role | role }}</div>
          </div>
        </div>
      </div>

      <!-- Navigation Menu -->
      <nav class="navigation-menu">
        <mat-nav-list>
          <ng-container *ngFor="let item of menuItems">
            <ng-container *ngIf="hasAccess(item.roles)">

              <!-- Menu item with children -->
              <div *ngIf="item.children && item.children.length > 0" class="menu-group">
                <div class="menu-group-header" (click)="toggleGroup(item.label)">
                  <mat-icon class="menu-icon">
                    <i [class]="item.icon"></i>
                  </mat-icon>
                  <span class="menu-label">{{ item.label }}</span>
                  <mat-icon class="expand-icon" [class.rotated]="isGroupExpanded(item.label)">
                    <i class="fas fa-chevron-down"></i>
                  </mat-icon>
                </div>

                <div class="submenu" [class.expanded]="isGroupExpanded(item.label)">
                  <ng-container *ngFor="let child of item.children">
                    <a *ngIf="hasAccess(child.roles)"
                       mat-list-item
                       [routerLink]="child.route"
                       routerLinkActive="active-link"
                       class="submenu-item">
                      <mat-icon class="submenu-icon">
                        <i [class]="child.icon"></i>
                      </mat-icon>
                      <span class="menu-label">{{ child.label }}</span>
                    </a>
                  </ng-container>
                </div>
              </div>

              <!-- Simple menu item -->
              <a *ngIf="!item.children || item.children.length === 0"
                 mat-list-item
                 [routerLink]="item.route"
                 routerLinkActive="active-link"
                 class="menu-item">
                <mat-icon class="menu-icon">
                  <i [class]="item.icon"></i>
                </mat-icon>
                <span class="menu-label">{{ item.label }}</span>
              </a>
            </ng-container>
          </ng-container>
        </mat-nav-list>
      </nav>
    </div>
  `,
  styles: [`
    .sidebar-content {
      height: 100%;
      display: flex;
      flex-direction: column;
      background: linear-gradient(180deg, #6a1b9a 0%, #8e24aa 50%, #ab47bc 100%);
      color: white;
    }

    .logo-section {
      padding: 20px 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    }

    .logo {
      display: flex;
      align-items: center;
      font-size: 1.5rem;
      font-weight: 700;
      color: white;
    }

    .logo i {
      margin-right: 12px;
      font-size: 1.8rem;
      color: #e1bee7;
    }

    .user-section {
      padding: 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    }

    .user-card {
      display: flex;
      align-items: center;
      background: rgba(255, 255, 255, 0.1);
      padding: 12px;
      border-radius: 12px;
      backdrop-filter: blur(10px);
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(45deg, #e1bee7, #f8bbd9);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      color: #6a1b9a;
      font-size: 1.1rem;
    }

    .user-info {
      flex: 1;
    }

    .user-name {
      font-weight: 600;
      font-size: 0.95rem;
      margin-bottom: 2px;
    }

    .user-role {
      font-size: 0.8rem;
      color: #e1bee7;
      font-weight: 500;
    }

    .navigation-menu {
      flex: 1;
      overflow-y: auto;
      padding-top: 8px;
    }

    ::ng-deep .mat-nav-list .mat-list-item {
      color: white !important;
      transition: all 0.3s ease;
      margin: 2px 8px;
      border-radius: 8px;
      position: relative;
      overflow: hidden;
    }

    ::ng-deep .menu-item:hover,
    ::ng-deep .submenu-item:hover {
      background: rgba(255, 255, 255, 0.15) !important;
      transform: translateX(4px);
    }

    ::ng-deep .active-link {
      background: linear-gradient(90deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1)) !important;
      border-left: 4px solid #e1bee7;
    }

    .menu-icon,
    .submenu-icon {
      margin-right: 16px !important;
      color: #e1bee7 !important;
      width: 20px !important;
      min-width: 20px !important;
    }

    .menu-label {
      font-weight: 500;
      font-size: 0.9rem;
    }

    .menu-group {
      margin: 2px 8px;
    }

    .menu-group-header {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      cursor: pointer;
      border-radius: 8px;
      transition: all 0.3s ease;
      position: relative;
    }

    .menu-group-header:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .expand-icon {
      margin-left: auto !important;
      transition: transform 0.3s ease;
      color: #e1bee7 !important;
    }

    .expand-icon.rotated {
      transform: rotate(180deg);
    }

    .submenu {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease;
      background: rgba(0, 0, 0, 0.1);
      border-radius: 0 0 8px 8px;
      margin-top: -8px;
    }

    .submenu.expanded {
      max-height: 300px;
      padding-top: 8px;
    }

    ::ng-deep .submenu-item {
      padding-left: 48px !important;
      font-size: 0.85rem !important;
      min-height: 40px !important;
    }

    ::ng-deep .submenu-icon {
      font-size: 0.9rem !important;
      margin-right: 12px !important;
    }
  `]
})
export class SidebarComponent implements OnInit {
  currentUser$: Observable<User | null>;
  expandedGroups: Set<string> = new Set();

  menuItems: MenuItem[] = [
    {
      label: 'Tableau de Bord',
      icon: 'fas fa-chart-line',
      route: '/admin/dashboard',
      roles: [Role.ADMIN]
    },
    {
      label: 'Tableau de Bord',
      icon: 'fas fa-chart-line',
      route: '/chef/dashboard',
      roles: [Role.CHEF_DE_PROJECT]
    },
    {
      label: 'Tableau de Bord',
      icon: 'fas fa-chart-line',
      route: '/membre/dashboard',
      roles: [Role.MEMBRE_EQUIPE]
    },
    {
      label: 'Gestion Utilisateurs',
      icon: 'fas fa-users',
      route: '',
      roles: [Role.ADMIN],
      children: [
        {
          label: 'Tous les Utilisateurs',
          icon: 'fas fa-list',
          route: '/admin/utilisateurs',
          roles: [Role.ADMIN]
        },
        {
          label: 'Créer Utilisateur',
          icon: 'fas fa-user-plus',
          route: '/admin/utilisateurs/create',
          roles: [Role.ADMIN]
        }
      ]
    },
    {
      label: 'Gestion Projets',
      icon: 'fas fa-project-diagram',
      route: '',
      roles: [Role.ADMIN, Role.CHEF_DE_PROJECT],
      children: [
        {
          label: 'Tous les Projets',
          icon: 'fas fa-list',
          route: '/admin/projets',
          roles: [Role.ADMIN]
        },
        {
          label: 'Mes Projets',
          icon: 'fas fa-folder',
          route: '/chef/projets',
          roles: [Role.CHEF_DE_PROJECT]
        },
        {
          label: 'Créer Projet',
          icon: 'fas fa-plus-circle',
          route: '/admin/projets/create',
          roles: [Role.ADMIN]
        }
      ]
    },
    {
      label: 'Gestion Tâches',
      icon: 'fas fa-tasks',
      route: '',
      roles: [Role.CHEF_DE_PROJECT, Role.MEMBRE_EQUIPE],
      children: [
        {
          label: 'Toutes les Tâches',
          icon: 'fas fa-list',
          route: '/chef/taches',
          roles: [Role.CHEF_DE_PROJECT]
        },
        {
          label: 'Mes Tâches',
          icon: 'fas fa-user-check',
          route: '/membre/taches',
          roles: [Role.MEMBRE_EQUIPE]
        },
        {
          label: 'Créer Tâche',
          icon: 'fas fa-plus-square',
          route: '/chef/taches/create',
          roles: [Role.CHEF_DE_PROJECT]
        }
      ]
    },
    {
      label: 'Mes Projets',
      icon: 'fas fa-folder-open',
      route: '/membre/projets',
      roles: [Role.MEMBRE_EQUIPE]
    },
    {
      label: 'Statistiques',
      icon: 'fas fa-chart-bar',
      route: '/admin/statistiques',
      roles: [Role.ADMIN]
    },
    {
      label: 'Rapports',
      icon: 'fas fa-file-alt',
      route: '/chef/rapports',
      roles: [Role.CHEF_DE_PROJECT]
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {}

  hasAccess(roles: Role[]): boolean {
    return this.authService.hasRole(roles);
  }

  toggleGroup(groupLabel: string): void {
    if (this.expandedGroups.has(groupLabel)) {
      this.expandedGroups.delete(groupLabel);
    } else {
      this.expandedGroups.add(groupLabel);
    }
  }

  isGroupExpanded(groupLabel: string): boolean {
    return this.expandedGroups.has(groupLabel);
  }
}
