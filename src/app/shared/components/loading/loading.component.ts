// shared/components/loading/loading.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  standalone: true,
  styleUrls: ['./loading.component.scss'],
  imports: [CommonModule]
})
export class LoadingComponent {
  @Input() message: string = 'Chargement...';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() centered: boolean = true;
}
