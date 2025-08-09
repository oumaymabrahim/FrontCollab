// shared/components/loader/loader.component.ts
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loader',
  template: `
    <div class="loader-container" [class.overlay]="overlay">
      <div class="loader-content">
        <mat-spinner
          [diameter]="size"
          [strokeWidth]="strokeWidth"
          color="primary">
        </mat-spinner>
        <p *ngIf="message" class="loader-message">{{ message }}</p>
      </div>
    </div>
  `,
  styles: [`
    .loader-container {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .loader-container.overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.8);
      z-index: 9999;
      backdrop-filter: blur(2px);
    }

    .loader-content {
      text-align: center;
    }

    .loader-message {
      margin-top: 16px;
      color: #6a1b9a;
      font-weight: 500;
    }

    ::ng-deep .mat-progress-spinner circle {
      stroke: url(#gradient) !important;
    }
  `]
})
export class LoaderComponent {
  @Input() message: string = '';
  @Input() size: number = 50;
  @Input() strokeWidth: number = 4;
  @Input() overlay: boolean = false;
}
