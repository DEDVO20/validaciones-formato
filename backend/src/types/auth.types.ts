import { Request, Response, NextFunction } from "express";

export interface AuthRequest extends Request {
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
}

export interface JWTPayload {
  id: number;
  email: string;
  name: string;
  role: string;
}

export type AuthHandler = (req: AuthRequest, res: Response, next?: NextFunction) => Promise<void> | void;