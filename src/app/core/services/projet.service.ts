
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Projet, StatutProjet } from '../models/projet.model';

@Injectable({
  providedIn: 'root'
})
export class ProjetService {
  private readonly apiUrl = `${environment.apiUrl}/projets`;

  constructor(private http: HttpClient) {}

  // ===== ENDPOINTS ADMIN UNIQUEMENT =====

  /**
   * Créer un projet (ADMIN seulement)
   */
  createProjet(projet: Projet): Observable<Projet> {
    return this.http.post<Projet>(`${this.apiUrl}/add`, projet);
  }

  /**
   * Obtenir tous les projets (ADMIN seulement)
   */
  getAllProjets(): Observable<Projet[]> {
    return this.http.get<Projet[]>(`${this.apiUrl}/all`);
  }

  /**
   * Supprimer un projet (ADMIN seulement)
   */
  deleteProjet(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}/delete`);
  }

  /**
   * Rechercher des projets par nom (ADMIN seulement)
   */
  searchProjetsByName(nom: string): Observable<Projet[]> {
    const params = new HttpParams().set('nom', nom);
    return this.http.get<Projet[]>(`${this.apiUrl}/search`, { params });
  }

  /**
   * Assigner un utilisateur à un projet (ADMIN seulement)
   */
  assignerUtilisateurAuProjet(projetId: number, utilisateurId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${projetId}/assigner/${utilisateurId}`, {});
  }

  /**
   * Retirer un utilisateur d'un projet (ADMIN seulement)
   */
  retirerUtilisateurDuProjet(projetId: number, utilisateurId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${projetId}/retirer/${utilisateurId}`);
  }

  /**
   * Obtenir les projets sans participants (ADMIN seulement)
   */
  getProjetsSansParticipants(): Observable<Projet[]> {
    return this.http.get<Projet[]>(`${this.apiUrl}/sans-participants`);
  }

  // ===== ENDPOINTS ADMIN + CHEF_DE_PROJECT =====

  /**
   * Obtenir les statistiques d'un projet (ADMIN, CHEF_DE_PROJECT)
   */
  getProjetStatistiques(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/statistiques`);
  }

  /**
   * Mettre à jour le statut d'un projet (ADMIN, CHEF_DE_PROJECT)
   */
  updateProjetStatut(id: number, statut: StatutProjet): Observable<Projet> {
    return this.http.put<Projet>(`${this.apiUrl}/${id}/statut`, { statut });
  }

  // ===== ENDPOINTS TOUS LES RÔLES AVEC CONTRÔLES D'ACCÈS =====

  /**
   * Obtenir des projets par statut (tous rôles avec restrictions)
   */
  getProjetsByStatut(statut: StatutProjet): Observable<Projet[]> {
    const params = new HttpParams().set('statut', statut);
    return this.http.get<Projet[]>(`${this.apiUrl}/statut`, { params });
  }

  /**
   * Obtenir un projet par ID (tous rôles avec restrictions)
   */
  getProjetById(id: number): Observable<Projet> {
    return this.http.get<Projet>(`${this.apiUrl}/${id}/projet`);
  }

  /**
   * Obtenir les participants d'un projet (tous rôles avec restrictions)
   */
  getProjetParticipants(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/participants`);
  }

  // ===== ENDPOINTS CHEF_DE_PROJECT + MEMBRE_EQUIPE =====

  /**
   * Obtenir ses projets assignés (CHEF_DE_PROJECT, MEMBRE_EQUIPE)
   */
  getMesProjets(): Observable<Projet[]> {
    return this.http.get<Projet[]>(`${this.apiUrl}/mes-projets`);
  }
}
