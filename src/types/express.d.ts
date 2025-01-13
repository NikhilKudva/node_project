import { Request } from 'express';
import User from '../models/user'; 

declare module 'express' {
  export interface Request {
    user?: User;
  }
}

export {};