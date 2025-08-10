
// core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest
} from '../models/auth.model';
import { User, Role } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Vérifier si un utilisateur est déjà connecté au démarrage
    this.checkStoredAuth();
    console.log("currentUserSubject",this.currentUserSubject.value)
  }

  /**
   * Connexion utilisateur
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response: AuthResponse) => {
          this.handleAuthSuccess(response);
        }),
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  /**
   * Inscription utilisateur
   */
  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData)
      .pipe(
        tap((response: AuthResponse) => {
          this.handleAuthSuccess(response);
        }),
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  /**
   * Rafraîchissement du token
   */
  refreshToken(tokenRequest: RefreshTokenRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, tokenRequest)
      .pipe(
        tap((response: AuthResponse) => {
          this.handleAuthSuccess(response);
        }),
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  /**
   * Validation du token
   */
  validateToken(token: string): Observable<{ valid: boolean }> {
    return this.http.post<{ valid: boolean }>(`${this.apiUrl}/validate`, { token })
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  /**
   * Récupérer le profil utilisateur
   */
  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  /**
   * Vérifier si un email existe
   */
  checkEmail(email: string): Observable<{ exists: boolean }> {
    return this.http.get<{ exists: boolean }>(`${this.apiUrl}/check-email`, {
      params: { email }
    }).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  /**
   * Déconnexion
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  /**
   * Obtenir le token stocké
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Obtenir l'utilisateur courant
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Vérifier si l'utilisateur est connecté
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  /**
   * Vérifier si l'utilisateur a un rôle spécifique
   */
  hasRole(roles: Role[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  /**
   * Rediriger selon le rôle
   */
  redirectByRole(): void {
    const user = this.getCurrentUser();
    if (!user) {
      this.router.navigate(['/auth/login']);
      return;
    }

    switch (user.role) {
      case Role.ADMIN:
        this.router.navigate(['/admin/dashboard']);
        break;
      case Role.CHEF_DE_PROJECT:
        this.router.navigate(['/chef/dashboard']);
        break;
      case Role.MEMBRE_EQUIPE:
        this.router.navigate(['/membre/dashboard']);
        break;
      default:
        this.router.navigate(['/auth/login']);
    }
  }

  /**
   * Gérer le succès d'authentification
   */
  private handleAuthSuccess(response: AuthResponse): void {
    // Stocker le token
    localStorage.setItem('token', response.token);

    // Créer l'objet utilisateur
    const user: User = {
      id: response.userId,
      nom: response.nom,
      email: response.email,
      role: response.role
    };

    // Stocker et émettre l'utilisateur
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  /**
   * Vérifier l'authentification stockée au démarrage
   */
  private checkStoredAuth(): void {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        const user: User = JSON.parse(userData);
        this.currentUserSubject.next(user);
      } catch (error) {
        // Données corrompues, nettoyer
        this.logout();
      }
    }
  }

  /**
   * Gestion centralisée des erreurs HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur est survenue';

    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur réseau: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Données invalides';
          break;
        case 401:
          errorMessage = 'Email ou mot de passe incorrect';
          // Auto-déconnexion si token invalide
          if (this.isAuthenticated()) {
            this.logout();
          }
          break;
        case 403:
          errorMessage = 'Accès non autorisé';
          break;
        case 404:
          errorMessage = 'Service non disponible';
          break;
        case 409:
          errorMessage = 'Un compte avec cet email existe déjà';
          break;
        case 422:
          errorMessage = error.error?.message || 'Données de validation invalides';
          break;
        case 500:
          errorMessage = 'Erreur serveur, veuillez réessayer plus tard';
          break;
        default:
          errorMessage = error.error?.message || 'Une erreur inattendue s\'est produite';
      }
    }

    console.error('Erreur d\'authentification:', error);

    // Retourner une nouvelle erreur avec le message formaté
    const formattedError = new Error(errorMessage);
    return throwError(() => formattedError);
  }
}
