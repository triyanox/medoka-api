import { Router, NextFunction, Request, Response } from "express";
import prisma from "../lib/prisma";
import {
  generateToken,
  Manager,
  validateCredentials,
} from "../models/manager.model";
import bcrypt from "bcrypt";
import cookie from "cookie";
import { env } from "process";

const router = Router();

router.post(
  "/auth",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { password, email }: Manager = req.body;
      const { error } = validateCredentials(req.body);
      if (error) {
        return res.status(400).json({
          error: error.details[0].message,
        });
      }
      const manager = await prisma.manager.findUnique({
        where: {
          email: email,
        },
      });
      if (!manager) {
        return res.status(404).json({
          error: "Account not found",
        });
      }

      const isMatch = await bcrypt.compare(password, manager.password);
      if (!isMatch) {
        return res.status(400).json({
          error: "Invalid password",
        });
      }

      const jwtToken = generateToken(manager);
      return res
        .append(
          "Set-Cookie",
          cookie.serialize("token", jwtToken, {
            httpOnly: true,
            secure: env.NODE_ENV === "production",
            maxAge: 1000 * 60 * 60 * 24 * 7,
            path: "/",
          })
        )
        .status(200)
        .json({
          message: "Successfully logged in",
        });
    } catch (e) {
      next(e);
    }
  }
);

export default router;
