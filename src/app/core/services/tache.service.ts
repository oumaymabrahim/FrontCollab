
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Tache, StatutTache } from '../models/tache.model';

@Injectable({
  providedIn: 'root'
})
export class TacheService {
  private readonly apiUrl = `${environment.apiUrl}/taches`;

  constructor(private http: HttpClient) {}

  // ===== ENDPOINTS CHEF_DE_PROJECT UNIQUEMENT =====

  /**
   * Créer une tâche (CHEF_DE_PROJECT seulement)
   */
  createTache(tache: Tache): Observable<Tache> {
    return this.http.post<Tache>(`${this.apiUrl}/add`, tache);
  }

  /**
   * Mettre à jour une tâche (CHEF_DE_PROJECT seulement)
   */
  updateTache(id: number, tache: Tache): Observable<Tache> {
    return this.http.put<Tache>(`${this.apiUrl}/${id}/update`, tache);
  }

  /**
   * Supprimer une tâche (CHEF_DE_PROJECT seulement)
   */
  deleteTache(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}/delete`);
  }

  /**
   * Obtenir toutes les tâches (CHEF_DE_PROJECT seulement)
   */
  getAllTaches(): Observable<Tache[]> {
    return this.http.get<Tache[]>(`${this.apiUrl}/all`);
  }

  /**
   * Obtenir une tâche par ID (CHEF_DE_PROJECT seulement)
   */
  getTacheById(id: number): Observable<Tache> {
    return this.http.get<Tache>(`${this.apiUrl}/${id}/tache`);
  }

  /**
   * Obtenir les tâches d'un projet (CHEF_DE_PROJECT seulement)
   */
  getTachesByProjet(projetId: number): Observable<Tache[]> {
    return this.http.get<Tache[]>(`${this.apiUrl}/projet/${projetId}`);
  }

  /**
   * Obtenir les tâches assignées à un utilisateur (CHEF_DE_PROJECT seulement)
   */
  getTachesAssigneesUtilisateur(utilisateurId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/utilisateur/${utilisateurId}`);
  }

  /**
   * Obtenir les tâches assignées à un utilisateur par statut (CHEF_DE_PROJECT seulement)
   */
  getTachesAssigneesUtilisateurParStatut(utilisateurId: number, statut: StatutTache): Observable<any> {
    const params = new HttpParams().set('statut', statut);
    return this.http.get<any>(`${this.apiUrl}/utilisateur/${utilisateurId}/statut`, { params });
  }

  // ===== ENDPOINTS MEMBRE_EQUIPE UNIQUEMENT =====

  /**
   * Obtenir ses propres tâches (MEMBRE_EQUIPE seulement)
   */
  getMesTaches(): Observable<Tache[]> {
    return this.http.get<Tache[]>(`${this.apiUrl}/mes-taches`);
  }

  /**
   * Mettre à jour le statut de sa tâche (MEMBRE_EQUIPE seulement)
   */
  updateTacheStatut(id: number, statut: StatutTache): Observable<Tache> {
    return this.http.put<Tache>(`${this.apiUrl}/${id}/update-statut`, { statut });
  }

  // ===== ENDPOINTS PARTAGÉS CHEF_DE_PROJECT + MEMBRE_EQUIPE =====

  /**
   * Obtenir les tâches par statut (CHEF_DE_PROJECT et MEMBRE_EQUIPE)
   * - Chef voit toutes les tâches avec ce statut
   * - Membre voit seulement ses tâches avec ce statut
   */
  getTachesByStatut(statut: StatutTache): Observable<Tache[]> {
    const params = new HttpParams().set('statut', statut);
    return this.http.get<Tache[]>(`${this.apiUrl}/statut`, { params });
  }
}
