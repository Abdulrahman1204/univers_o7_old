import { Request } from "express";

  export interface AuthenticatedRequest extends Request {
      user?: {
        userName: string;
        id: string;
        role: string;
      };
  }