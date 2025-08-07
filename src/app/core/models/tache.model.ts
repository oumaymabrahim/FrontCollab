import {Projet} from "./projet.model";
import {User} from "./user.model";

export interface Tache {
  id: number;
  nom: string;
  description?: string;
  dateCreation: string;
  dateEcheance: string;
  statut: StatutTache;
  priorite: Priorite;
  utilisateur?: User;
  projet?: Projet;
}

export enum StatutTache {
  EN_ATTENTE = 'EN_ATTENTE',
  EN_COURS = 'EN_COURS',
  TERMINEE = 'TERMINEE'
}

export enum Priorite {
  BASSE = 'BASSE',
  MOYENNE = 'MOYENNE',
  HAUTE = 'HAUTE',
  URGENTE = 'URGENTE'
}
