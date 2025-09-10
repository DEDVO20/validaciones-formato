import { Request } from "express";

export interface AuthRequest extends Request {
  user: {
    id: number;
    email: string;
    nombre: string;
    rol: string;
  };
}

export interface JWTPayload {
  id: number;
  email: string;
  nombre: string;
  rol: string;
}