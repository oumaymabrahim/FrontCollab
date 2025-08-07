
// core/guards/role.guard.ts
import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {

    const expectedRoles: Role[] = route.data['roles'];

    if (!expectedRoles || expectedRoles.length === 0) {
      return true;
    }

    if (this.authService.hasRole(expectedRoles)) {
      return true;
    }

    // Rediriger vers la page appropriée selon le rôle
    this.authService.redirectByRole();
    return false;
  }
}
