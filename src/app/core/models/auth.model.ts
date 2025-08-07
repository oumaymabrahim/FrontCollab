import {Role} from "./user.model";


export interface LoginRequest {
  email: string;
  motDePasse: string;
}

export interface RegisterRequest {
  nom: string;
  email: string;
  motDePasse: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  userId: number;
  nom: string;
  email: string;
  role: Role;
  message: string;
}

export interface RefreshTokenRequest {
  token: string;
}
