// shared/pipes/status.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { StatutProjet } from '../../core/models/projet.model';
import { StatutTache } from '../../core/models/tache.model';

@Pipe({
  name: 'status'
})
export class StatusPipe implements PipeTransform {
  transform(value: StatutProjet | StatutTache): string {
    switch (value) {
      // Statuts Projet
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

      // Statuts Tâche
      case 'EN_ATTENTE':
        return 'En Attente';
      case 'TERMINEE':
        return 'Terminée';

      default:
        return value || 'Inconnu';
    }
  }
}
