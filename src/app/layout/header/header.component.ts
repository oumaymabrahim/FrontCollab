
// layout/header/header.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  template: `
    <mat-toolbar class="header-toolbar">
      <button
        type="button"
        aria-label="Toggle sidenav"
        mat-icon-button
        (click)="drawer.toggle()"
        *ngIf="drawer">
        <mat-icon aria-label="Side nav toggle icon">
          <i class="fas fa-bars"></i>
        </mat-icon>
      </button>

      <span class="app-title">
        <i class="fas fa-project-diagram text-accent"></i>
        CollabManager
      </span>

      <span class="spacer"></span>

      <div class="header-actions" fxLayout="row" fxLayoutAlign="center center" fxLayoutGap="10px">
        <!-- Notifications -->
        <button mat-icon-button [matMenuTriggerFor]="notificationMenu">
          <mat-icon [matBadge]="3" matBadgeColor="accent">
            <i class="fas fa-bell"></i>
          </mat-icon>
        </button>

        <mat-menu #notificationMenu="matMenu" class="notification-menu">
          <div class="notification-header">
            <span>Notifications</span>
            <button mat-button color="primary">Tout marquer lu</button>
          </div>
          <mat-divider></mat-divider>
          <button mat-menu-item>
            <mat-icon><i class="fas fa-info-circle text-info"></i></mat-icon>
            <span>Nouvelle tâche assignée</span>
          </button>
          <button mat-menu-item>
            <mat-icon><i class="fas fa-check-circle text-success"></i></mat-icon>
            <span>Projet terminé</span>
          </button>
          <button mat-menu-item>
            <mat-icon><i class="fas fa-exclamation-triangle text-warning"></i></mat-icon>
            <span>Date limite approche</span>
          </button>
        </mat-menu>

        <!-- User menu -->
        <button mat-button [matMenuTriggerFor]="userMenu" class="user-menu-btn">
          <div class="user-avatar">
            <i class="fas fa-user"></i>
          </div>
          <span class="user-name" *ngIf="currentUser$ | async as user">
            {{ user.nom }}
          </span>
          <mat-icon><i class="fas fa-chevron-down"></i></mat-icon>
        </button>

        <mat-menu #userMenu="matMenu" class="user-menu">
          <div class="user-info" *ngIf="currentUser$ | async as user">
            <div class="user-avatar-large">
              <i class="fas fa-user"></i>
            </div>
            <div class="user-details">
              <div class="user-name">{{ user.nom }}</div>
              <div class="user-email">{{ user.email }}</div>
              <div class="user-role">{{ user.role | role }}</div>
            </div>
          </div>
          <mat-divider></mat-divider>
          <button mat-menu-item routerLink="/profile">
            <mat-icon><i class="fas fa-user-edit"></i></mat-icon>
            <span>Mon Profil</span>
          </button>
          <button mat-menu-item>
            <mat-icon><i class="fas fa-cog"></i></mat-icon>
            <span>Paramètres</span>
          </button>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="logout()">
            <mat-icon><i class="fas fa-sign-out-alt"></i></mat-icon>
            <span>Déconnexion</span>
          </button>
        </mat-menu>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .header-toolbar {
      background: linear-gradient(90deg, #6a1b9a, #8e24aa);
      color: white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      z-index: 2;
      position: relative;
    }

    .app-title {
      font-size: 1.5rem;
      font-weight: 600;
      margin-left: 10px;
    }

    .text-accent {
      color: #e1bee7;
      margin-right: 10px;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .header-actions {
      color: white;
    }

    .user-menu-btn {
      padding: 5px 15px;
      border-radius: 25px;
      background: rgba(255, 255, 255, 0.1);
      transition: background 0.3s ease;
    }

    .user-menu-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(45deg, #e1bee7, #f8bbd9);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 8px;
      color: #6a1b9a;
    }

    .user-name {
      margin-right: 8px;
      font-weight: 500;
    }

    ::ng-deep .notification-menu {
      min-width: 300px;
    }

    ::ng-deep .notification-header {
      padding: 10px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
    }

    ::ng-deep .user-menu {
      min-width: 280px;
    }

    ::ng-deep .user-info {
      padding: 16px;
      display: flex;
      align-items: center;
    }

    ::ng-deep .user-avatar-large {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(45deg, #6a1b9a, #8e24aa);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      margin-right: 12px;
      font-size: 1.2rem;
    }

    ::ng-deep .user-details .user-name {
      font-weight: 600;
      margin-bottom: 2px;
    }

    ::ng-deep .user-details .user-email {
      color: #666;
      font-size: 0.875rem;
      margin-bottom: 2px;
    }

    ::ng-deep .user-details .user-role {
      font-size: 0.75rem;
      background: linear-gradient(45deg, #6a1b9a, #8e24aa);
      color: white;
      padding: 2px 8px;
      border-radius: 12px;
      display: inline-block;
    }

    .text-info { color: #2196F3; }
    .text-success { color: #4CAF50; }
    .text-warning { color: #FF9800; }
  `]
})
export class HeaderComponent implements OnInit {
  @Input() drawer!: MatSidenav;

  currentUser$: Observable<User | null>;

  constructor(private authService: AuthService) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {}

  logout(): void {
    this.authService.logout();
  }
}
