
// shared/pipes/priority.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { Priorite } from '../../core/models/tache.model';

@Pipe({
  name: 'priority'
})
export class PriorityPipe implements PipeTransform {
  transform(value: Priorite): string {
    switch (value) {
      case Priorite.BASSE:
        return 'Basse';
      case Priorite.MOYENNE:
        return 'Moyenne';
      case Priorite.HAUTE:
        return 'Haute';
      case Priorite.URGENTE:
        return 'Urgente';
      default:
        return 'Moyenne';
    }
  }
}
