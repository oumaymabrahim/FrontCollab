// shared/pipes/role.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { Role } from '../../core/models/user.model';

@Pipe({
  name: 'role'
})
export class RolePipe implements PipeTransform {
  transform(value: Role): string {
    switch (value) {
      case Role.ADMIN:
        return 'Administrateur';
      case Role.CHEF_DE_PROJECT:
        return 'Chef de Projet';
      case Role.MEMBRE_EQUIPE:
        return 'Membre Équipe';
      default:
        return 'Inconnu';
    }
  }
}
