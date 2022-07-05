import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { TManager } from "../models/manager.model";
import { env } from "process";

/**
 * @description
 * extended Request interface with the Manager JWT payload
 **/
export interface IAuthRequest extends Request {
  manager: TManager;
}

// auth middleware
/**
 * @usage
 * Used on routes that require authentication
 **/
export function auth(req: IAuthRequest, res: Response, next: NextFunction) {
  try {
    const token = req.cookies.token;
    if (!token)
      return res.status(401).send("Access denied. No token provided.");
    jwt.verify(token, env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(400).send("Invalid token.");
      req.manager = decoded;
      next();
    });
  } catch (e) {
    next(e);
  }
}
