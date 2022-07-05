import { Router, NextFunction, Request, Response } from "express";
import { auth } from "../middleware/auth";

const router = Router();

router.post(
  "/logout",
  auth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.clearCookie("token").status(200).json({
        message: "Successfully logged out",
      });
    } catch (e) {
      next(e);
    }
  }
);

export default router;
