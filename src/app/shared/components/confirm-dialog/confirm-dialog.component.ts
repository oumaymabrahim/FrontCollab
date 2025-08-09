// shared/components/confirm-dialog/confirm-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

@Component({
  selector: 'app-confirm-dialog',
  template: `
    <div class="confirm-dialog">
      <div class="dialog-header" [ngClass]="'header-' + (data.type || 'info')">
        <mat-icon class="dialog-icon">
          <i [class]="getIcon()"></i>
        </mat-icon>
        <h2 mat-dialog-title>{{ data.title }}</h2>
      </div>

      <mat-dialog-content class="dialog-content">
        <p>{{ data.message }}</p>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onCancel()" class="cancel-btn">
          {{ data.cancelText || 'Annuler' }}
        </button>
        <button
          mat-raised-button
          (click)="onConfirm()"
          [ngClass]="'confirm-btn-' + (data.type || 'info')">
          {{ data.confirmText || 'Confirmer' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirm-dialog {
      min-width: 400px;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      padding: 20px 24px 10px;
      border-radius: 8px 8px 0 0;
    }

    .header-danger { background: linear-gradient(45deg, #f44336, #e57373); color: white; }
    .header-warning { background: linear-gradient(45deg, #ff9800, #ffb74d); color: white; }
    .header-info { background: linear-gradient(45deg, #6a1b9a, #8e24aa); color: white; }

    .dialog-icon {
      margin-right: 12px;
      font-size: 1.5rem;
    }

    h2 {
      margin: 0;
      font-weight: 600;
    }

    .dialog-content {
      padding: 20px 24px;
      font-size: 1rem;
      line-height: 1.5;
    }

    .dialog-actions {
      padding: 10px 24px 20px;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }

    .cancel-btn {
      color: #666;
    }

    .confirm-btn-danger {
      background: linear-gradient(45deg, #f44336, #e57373);
      color: white;
    }

    .confirm-btn-warning {
      background: linear-gradient(45deg, #ff9800, #ffb74d);
      color: white;
    }

    .confirm-btn-info {
      background: linear-gradient(45deg, #6a1b9a, #8e24aa);
      color: white;
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  getIcon(): string {
    switch (this.data.type) {
      case 'danger':
        return 'fas fa-exclamation-triangle';
      case 'warning':
        return 'fas fa-exclamation-circle';
      case 'info':
      default:
        return 'fas fa-info-circle';
    }
  }
}
