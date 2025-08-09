// shared/components/status-chip/status-chip.component.ts
import { Component, Input } from '@angular/core';
import { StatutProjet } from '../../../core/models/projet.model';
import { StatutTache, Priorite } from '../../../core/models/tache.model';
import { Role } from '../../../core/models/user.model';

@Component({
  selector: 'app-status-chip',
  template: `
    <mat-chip [ngClass]="getChipClass()" class="status-chip">
      <mat-icon *ngIf="showIcon && getIcon()" class="chip-icon">
        <i [class]="getIcon()"></i>
      </mat-icon>
      {{ getDisplayText() }}
    </mat-chip>
  `,
  styles: [`
    .status-chip {
      font-size: 0.8rem;
      font-weight: 500;
      border-radius: 16px;
      min-height: 28px;
      padding: 0 12px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .chip-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    /* Status Styles */
    .status-planifie {
      background: rgba(33, 150, 243, 0.15);
      color: #1976d2;
    }

    .status-en-cours {
      background: rgba(255, 152, 0, 0.15);
      color: #f57c00;
    }

    .status-termine, .status-terminee {
      background: rgba(76, 175, 80, 0.15);
      color: #388e3c;
    }

    .status-suspendu {
      background: rgba(158, 158, 158, 0.15);
      color: #616161;
    }

    .status-annule {
      background: rgba(244, 67, 54, 0.15);
      color: #d32f2f;
    }

    .status-en-attente {
      background: rgba(121, 85, 72, 0.15);
      color: #5d4037;
    }

    /* Priority Styles */
    .priority-basse {
      background: rgba(76, 175, 80, 0.15);
      color: #388e3c;
    }

    .priority-moyenne {
      background: rgba(255, 193, 7, 0.15);
      color: #f57f17;
    }

    .priority-haute {
      background: rgba(255, 152, 0, 0.15);
      color: #ef6c00;
    }

    .priority-urgente {
      background: rgba(244, 67, 54, 0.15);
      color: #c62828;
    }

    /* Role Styles */
    .role-admin {
      background: rgba(106, 27, 154, 0.15);
      color: #6a1b9a;
    }

    .role-chef-de-project {
      background: rgba(233, 30, 99, 0.15);
      color: #c2185b;
    }

    .role-membre-equipe {
      background: rgba(63, 81, 181, 0.15);
      color: #3949ab;
    }

    /* Default */
    .status-default {
      background: rgba(158, 158, 158, 0.15);
      color: #616161;
    }
  `]
})
export class StatusChipComponent {
  @Input() status: StatutProjet | StatutTache | Priorite | Role | string | any;
  @Input() type: 'status' | 'priority' | 'role' = 'status';
  @Input() showIcon: boolean = true; // Nouvelle propriété ajoutée

  getChipClass(): string {
    if (!this.status) return 'status-default';

    const statusStr = this.status.toString().toLowerCase().replace(/_/g, '-');

    switch (this.type) {
      case 'priority':
        return `priority-${statusStr}`;
      case 'role':
        return `role-${statusStr}`;
      case 'status':
      default:
        return `status-${statusStr}`;
    }
  }

  getDisplayText(): string {
    if (!this.status) return 'Inconnu';

    switch (this.type) {
      case 'status':
        return this.getStatusText(this.status);
      case 'priority':
        return this.getPriorityText(this.status);
      case 'role':
        return this.getRoleText(this.status);
      default:
        return this.status.toString();
    }
  }

  private getStatusText(status: StatutProjet | StatutTache | string): string {
    switch (status) {
      case 'PLANIFIE':
        return 'Planifié';
      case 'EN_COURS':
        return 'En Cours';
      case 'TERMINE':
        return 'Terminé';
      case 'SUSPENDU':
        return 'Suspendu';
      case 'ANNULE':
        return 'Annulé';
      case 'EN_ATTENTE':
        return 'En Attente';
      case 'TERMINEE':
        return 'Terminée';
      default:
        return status?.toString() || 'Inconnu';
    }
  }

  private getPriorityText(priority: Priorite | string): string {
    switch (priority) {
      case Priorite.BASSE:
      case 'BASSE':
        return 'Basse';
      case Priorite.MOYENNE:
      case 'MOYENNE':
        return 'Moyenne';
      case Priorite.HAUTE:
      case 'HAUTE':
        return 'Haute';
      case Priorite.URGENTE:
      case 'URGENTE':
        return 'Urgente';
      default:
        return priority?.toString() || 'Moyenne';
    }
  }

  private getRoleText(role: Role | string): string {
    switch (role) {
      case Role.ADMIN:
      case 'ADMIN':
        return 'Administrateur';
      case Role.CHEF_DE_PROJECT:
      case 'CHEF_DE_PROJECT':
        return 'Chef de Projet';
      case Role.MEMBRE_EQUIPE:
      case 'MEMBRE_EQUIPE':
        return 'Membre Équipe';
      default:
        return role?.toString() || 'Inconnu';
    }
  }

  getIcon(): string {
    if (!this.status) return '';

    switch (this.type) {
      case 'status':
        return this.getStatusIcon(this.status);
      case 'priority':
        return this.getPriorityIcon(this.status);
      case 'role':
        return this.getRoleIcon(this.status);
      default:
        return '';
    }
  }

  private getStatusIcon(status: StatutProjet | StatutTache | string): string {
    switch (status) {
      case 'PLANIFIE':
        return 'fas fa-calendar-alt';
      case 'EN_COURS':
        return 'fas fa-play';
      case 'TERMINE':
      case 'TERMINEE':
        return 'fas fa-check';
      case 'SUSPENDU':
        return 'fas fa-pause';
      case 'ANNULE':
        return 'fas fa-times';
      case 'EN_ATTENTE':
        return 'fas fa-clock';
      default:
        return '';
    }
  }

  private getPriorityIcon(priority: Priorite | string): string {
    switch (priority) {
      case Priorite.BASSE:
      case 'BASSE':
        return 'fas fa-chevron-down';
      case Priorite.MOYENNE:
      case 'MOYENNE':
        return 'fas fa-minus';
      case Priorite.HAUTE:
      case 'HAUTE':
        return 'fas fa-chevron-up';
      case Priorite.URGENTE:
      case 'URGENTE':
        return 'fas fa-exclamation';
      default:
        return '';
    }
  }

  private getRoleIcon(role: Role | string): string {
    switch (role) {
      case Role.ADMIN:
      case 'ADMIN':
        return 'fas fa-crown';
      case Role.CHEF_DE_PROJECT:
      case 'CHEF_DE_PROJECT':
        return 'fas fa-user-tie';
      case Role.MEMBRE_EQUIPE:
      case 'MEMBRE_EQUIPE':
        return 'fas fa-user';
      default:
        return 'fas fa-user';
    }
  }
}
