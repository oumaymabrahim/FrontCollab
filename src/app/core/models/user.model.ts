export interface User  {
  id: number;
  nom: string;
  email: string;
  role: Role;
  motDePasse?: string;
}

export enum Role {
  ADMIN = 'ADMIN',
  CHEF_DE_PROJECT = 'CHEF_DE_PROJECT',
  MEMBRE_EQUIPE = 'MEMBRE_EQUIPE'
}
