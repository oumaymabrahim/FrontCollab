
// core/interceptors/error.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {

        // Erreur 401 - Non autorisé
        if (error.status === 401) {
          this.authService.logout();
          return throwError(() => new Error('Session expirée. Veuillez vous reconnecter.'));
        }

        // Erreur 403 - Accès refusé
        if (error.status === 403) {
          return throwError(() => new Error('Accès refusé. Vous n\'avez pas les permissions nécessaires.'));
        }

        // Erreur 404 - Non trouvé
        if (error.status === 404) {
          return throwError(() => new Error('Ressource non trouvée.'));
        }

        // Erreur 500 - Erreur serveur
        if (error.status >= 500) {
          return throwError(() => new Error('Erreur serveur. Veuillez réessayer plus tard.'));
        }

        // Autres erreurs
        const errorMessage = error.error?.message || error.message || 'Une erreur s\'est produite';
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
