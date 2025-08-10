// features/admin/components/users-management/users-management.component.ts
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { UserService } from '../../../../core/services/user.service';
import { User, Role } from '../../../../core/models/user.model';
import { TableColumn, TableAction } from '../../../../shared/components/data-table/data-table.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-users-management',
  template: `
    <div class="users-management-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">
            <i class="fas fa-users"></i>
            Gestion des Utilisateurs
          </h1>
          <p class="page-description">
            Gérez tous les utilisateurs de la plateforme
          </p>
        </div>
        <div class="header-actions">
          <button mat-raised-button
                  color="primary"
                  routerLink="/admin/utilisateurs/create"
                  class="create-btn">
            <mat-icon><i class="fas fa-user-plus"></i></mat-icon>
            Nouvel Utilisateur
          </button>
        </div>
      </div>

      <!-- Filters -->
      <mat-card class="filters-card">
        <mat-card-content>
          <div class="filters-row" fxLayout="row wrap" fxLayoutGap="20px" fxLayoutAlign="start center">
            <mat-form-field appearance="outline" fxFlex="200px">
              <mat-label>Filtrer par rôle</mat-label>
              <mat-select [(value)]="selectedRole" (selectionChange)="onRoleFilterChange()">
                <mat-option value="">Tous les rôles</mat-option>
                <mat-option [value]="roleEnum.ADMIN">Administrateur</mat-option>
                <mat-option [value]="roleEnum.CHEF_DE_PROJECT">Chef de Projet</mat-option>
                <mat-option [value]="roleEnum.MEMBRE_EQUIPE">Membre Équipe</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-button
                    color="primary"
                    (click)="refreshData()"
                    [disabled]="loading">
              <mat-icon><i class="fas fa-sync-alt" [class.fa-spin]="loading"></i></mat-icon>
              Actualiser
            </button>

            <span class="spacer"></span>

            <div class="stats-info" *ngIf="!loading">
              <span class="stat-item">
                <strong>{{ filteredUsers.length }}</strong> utilisateur(s)
              </span>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Data Table -->
      <app-data-table
        title=""
        [columns]="tableColumns"
        [data]="filteredUsers"
        [actions]="tableActions"
        [loading]="loading"
        [searchable]="true"
        [selectable]="false"
        [pageable]="true"
        [pageSize]="10"
        [pageSizeOptions]="[5, 10, 20, 50]"
        loadingMessage="Chargement des utilisateurs..."
        noDataMessage="Aucun utilisateur trouvé"
        (actionClicked)="onTableAction($event)"
        (rowClicked)="onRowClick($event)">

        <div slot="toolbar-actions">
          <!-- Actions supplémentaires si nécessaire -->
        </div>
      </app-data-table>
    </div>
  `,
  styles: [`
    .users-management-container {
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

    .create-btn {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 25px;
      padding: 8px 24px;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .create-btn:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    }

    .filters-card {
      margin-bottom: 20px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(106, 27, 154, 0.1);
    }

    .filters-row {
      min-height: 60px;
    }

    .spacer {
      flex: 1;
    }

    .stats-info {
      display: flex;
      gap: 20px;
      color: #6a1b9a;
      font-size: 0.95rem;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    ::ng-deep .mat-form-field-outline {
      color: #e1bee7;
    }

    ::ng-deep .mat-form-field-label {
      color: #6a1b9a;
    }

    @media (max-width: 768px) {
      .users-management-container {
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

      .filters-row {
        flex-direction: column;
        align-items: stretch;
      }
    }
  `]
})
export class UsersManagementComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  loading = false;
  selectedRole: Role | '' = '';
  roleEnum = Role;

  tableColumns: TableColumn[] = [
    { key: 'id', label: 'ID', type: 'text', width: '80px' },
    { key: 'nom', label: 'Nom', type: 'text', sortable: true },
    { key: 'email', label: 'Email', type: 'text', sortable: true },
    { key: 'role', label: 'Rôle', type: 'role', sortable: true, width: '150px' },
    { key: 'actions', label: 'Actions', type: 'actions', width: '150px' }
  ];

  tableActions: TableAction[] = [
    {
      icon: 'fas fa-eye',
      tooltip: 'Voir détails',
      color: 'primary',
      action: 'view'
    },
    {
      icon: 'fas fa-edit',
      tooltip: 'Modifier',
      color: 'accent',
      action: 'edit'
    },
    {
      icon: 'fas fa-trash',
      tooltip: 'Supprimer',
      color: 'warn',
      action: 'delete',
      condition: (user: User) => user.role !== Role.ADMIN || this.users.filter(u => u.role === Role.ADMIN).length > 1
    }
  ];

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.toastr.error('Erreur lors du chargement des utilisateurs', 'Erreur');
        console.error('Erreur:', error);
      }
    });
  }

  refreshData(): void {
    this.loadUsers();
  }

  onRoleFilterChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    this.filteredUsers = this.users.filter(user => {
      if (this.selectedRole && user.role !== this.selectedRole) {
        return false;
      }
      return true;
    });
  }

  onTableAction(event: { action: string, element: User }): void {
    const { action, element } = event;

    switch (action) {
      case 'view':
        this.viewUser(element);
        break;
      case 'edit':
        this.editUser(element);
        break;
      case 'delete':
        this.deleteUser(element);
        break;
    }
  }

  onRowClick(user: User): void {
    // Optionnel: action au clic sur une ligne
    console.log('User clicked:', user);
  }

  viewUser(user: User): void {
    // Implémentation pour voir les détails
    this.dialog.open(UserDetailsDialogComponent, {
      width: '900px',
      data: user
    });
  }

  editUser(user: User): void {
    this.router.navigate(['/admin/utilisateurs/edit', user.id]);
  }

  deleteUser(user: User): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmer la suppression',
        message: `Êtes-vous sûr de vouloir supprimer l'utilisateur "${user.nom}" ?`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.userService.deleteUser(user.id).subscribe({
          next: () => {
            this.toastr.success('Utilisateur supprimé avec succès', 'Succès');
            this.loadUsers();
          },
          error: (error) => {
            this.loading = false;
            this.toastr.error('Erreur lors de la suppression', 'Erreur');
            console.error('Erreur:', error);
          }
        });
      }
    });
  }
}

// User Details Dialog Component
@Component({
  selector: 'app-user-details-dialog',
  template: `
    <div class="user-details-dialog">
      <div class="dialog-header">
        <h2 mat-dialog-title>
          <i class="fas fa-user"></i>
          Détails Utilisateur
        </h2>
        <button mat-icon-button (click)="close()">
          <mat-icon><i class="fas fa-times"></i></mat-icon>
        </button>
      </div>

      <mat-dialog-content class="dialog-content">
        <div class="user-profile">
          <div class="user-avatar">
            <i class="fas fa-user"></i>
          </div>

          <div class="user-info">
            <div class="info-row">
              <span class="label">ID:</span>
              <span class="value">{{ data.id }}</span>
            </div>

            <div class="info-row">
              <span class="label">Nom:</span>
              <span class="value">{{ data.nom }}</span>
            </div>

            <div class="info-row">
              <span class="label">Email:</span>
              <span class="value">{{ data.email }}</span>
            </div>

            <div class="info-row">
              <span class="label">Rôle:</span>
              <span class="value">
                <app-status-chip [status]="data.role" type="role"></app-status-chip>
              </span>
            </div>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="close()">Fermer</button>
        <button mat-raised-button color="primary" (click)="edit()">
          <mat-icon><i class="fas fa-edit"></i></mat-icon>
          Modifier
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .user-details-dialog {
     min-width: 450px;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px 10px;
      background: linear-gradient(90deg, #9a411b, #8e24aa);
      color: white;
      margin: -24px -24px 0 -24px;
    }

    .dialog-header h2 {
      margin: 0;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .dialog-content {
      padding: 30px 24px;
    }

    .user-profile {
      display: flex;
      align-items: flex-start;
      gap: 20px;
    }

    .user-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(45deg, #6a1b9a, #8e24aa);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 2rem;
      flex-shrink: 0;
    }

    .user-info {
      flex: 1;
    }

    .info-row {
      display: flex;
      margin-bottom: 15px;
      align-items: center;
    }

    .label {
      font-weight: 600;
      color: #cab0da;
      min-width: 80px;
      margin-right: 15px;
    }

    .value {
      flex: 1;
      color: #e7bece;
    }

    .dialog-actions {
      padding: 10px 24px 20px;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
  `]
})
export class UserDetailsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<UserDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: User
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  edit(): void {
    this.dialogRef.close();
    // Navigation vers l'édition sera gérée par le parent
  }
}
