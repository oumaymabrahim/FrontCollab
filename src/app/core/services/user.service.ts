import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, Role } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = `${environment.apiUrl}/utilisateurs`;

  constructor(private http: HttpClient) {}

  // ===== ENDPOINTS PUBLICS =====

  /**
   * Inscription publique (rôle MEMBRE_EQUIPE forcé)
   */
  inscription(user: User): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/inscription`, user);
  }

  // ===== ENDPOINTS ADMIN UNIQUEMENT =====

  /**
   * Créer un utilisateur avec n'importe quel rôle (ADMIN seulement)
   */
  createUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/admin/create`, user);
  }

  /**
   * Mettre à jour un utilisateur par l'admin (ADMIN seulement)
   */
  updateUserByAdmin(id: number, updates: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/admin/${id}`, updates);
  }

  /**
   * Changer le rôle d'un utilisateur (ADMIN seulement)
   */
  changeUserRole(id: number, nouveauRole: Role): Observable<User> {
    const params = new HttpParams().set('nouveauRole', nouveauRole);
    return this.http.put<User>(`${this.apiUrl}/admin/${id}/role`, null, { params });
  }

  /**
   * Obtenir les détails complets d'un utilisateur (ADMIN seulement)
   */
  getUserDetails(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/admin/${id}/details`);
  }

  /**
   * Obtenir tous les utilisateurs (ADMIN seulement)
   */
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/all`);
  }

  /**
   * Obtenir un utilisateur par ID (ADMIN seulement)
   */
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  /**
   * Supprimer un utilisateur (ADMIN seulement)
   */
  deleteUser(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  /**
   * Rechercher par email (ADMIN seulement)
   */
  getUserByEmail(email: string): Observable<User> {
    const params = new HttpParams().set('email', email);
    return this.http.get<User>(`${this.apiUrl}/email`, { params });
  }

  /**
   * Rechercher par nom (ADMIN seulement)
   */
  getUsersByName(nom: string): Observable<User[]> {
    const params = new HttpParams().set('nom', nom);
    return this.http.get<User[]>(`${this.apiUrl}/nom`, { params });
  }

  /**
   * Rechercher par rôle (ADMIN seulement)
   */
  getUsersByRole(role: Role): Observable<User[]> {
    const params = new HttpParams().set('role', role);
    return this.http.get<User[]>(`${this.apiUrl}/role`, { params });
  }

  /**
   * Compter les utilisateurs par rôle (ADMIN seulement)
   */
  countUsersByRole(role: Role): Observable<number> {
    const params = new HttpParams().set('role', role);
    return this.http.get<number>(`${this.apiUrl}/count`, { params });
  }

  // ===== PROFIL PERSONNEL - TOUS LES UTILISATEURS CONNECTÉS =====

  /**
   * Obtenir son propre profil
   */
  getMyProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/mon-profil`);
  }

  /**
   * Modifier son propre profil (nom et email seulement)
   */
  updateMyProfile(updates: { nom?: string; email?: string }): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/mon-profil`, updates);
  }

  /**
   * Changer son propre mot de passe
   */
  changeMyPassword(passwords: { ancienMotDePasse: string; nouveauMotDePasse: string }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/mon-profil/mot-de-passe`, passwords);
  }
}
