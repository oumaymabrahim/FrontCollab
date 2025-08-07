import {Tache} from "./tache.model";
import {User} from "./user.model";

export interface Projet {
  id: number;
  nom: string;
  description?: string;
  dateCreation: string;
  dateEcheance: string;
  statut: StatutProjet;
  budget?: number;
  participants?: User[];
  taches?: Tache[];
}

export enum StatutProjet {
  PLANIFIE = 'PLANIFIE',
  EN_COURS = 'EN_COURS',
  TERMINE = 'TERMINE',
  SUSPENDU = 'SUSPENDU',
  ANNULE = 'ANNULE'
}
