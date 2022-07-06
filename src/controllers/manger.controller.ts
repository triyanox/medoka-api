import { Router, NextFunction, Request, Response } from "express";
import prisma from "../lib/prisma";
import nodemailer from "nodemailer";
import { env } from "process";
import bcrypt from "bcrypt";
import cookie from "cookie";
import { IAuthRequest } from "../middleware/auth";
import {
  validateToken,
  validateEmail,
  generateToken,
  validatePassword,
  Manager,
  validateManagerInfos,
} from "../models/manager.model";
import { auth } from "../middleware/auth";
import { Gender } from "@prisma/client";
import crypto from "crypto";

const router = Router();

// register email
router.post(
  "/manager/register",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email }: Manager = req.body;
      const { error } = validateEmail(req.body.email);
      if (error) {
        return res.status(400).json({
          error: error.details[0].message,
        });
      }

      const isExist = await prisma.manager.findUnique({
        where: {
          email: email,
        },
      });
      if (isExist) {
        return res.status(400).json({
          error: "Email already exist",
        });
      }

      const manager = await prisma.manager.create({
        data: {
          email: email,
        },
      });

      const RandomNUmber = Math.floor(Math.random() * 1000000);

      await prisma.verificationToken.create({
        data: {
          token: RandomNUmber,
          managerId: manager.id,
        },
      });

      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          type: "OAuth2",
          user: env.MAIL_USERNAME,
          clientId: env.OAUTH_CLIENTID,
          clientSecret: env.OAUTH_CLIENT_SECRET,
          refreshToken: env.OAUTH_REFRESH_TOKEN,
        },
      });

      const mailOptions = {
        from: env.EMAIL_FROM,
        to: email,
        subject: "Medoka - Verify your email",
        html: `
                <div>
                    <p>
                    Thanks for registering with Medoka.
                    </p>
                    <p>
                      Please use the following verification code to verify your email: <b>${RandomNUmber}</b>
                    </p>
                </div>
            `,
      };

      transporter.sendMail(mailOptions);

      return res.status(200).json({
        message: "Email sent",
        managerId: manager.id,
      });
    } catch (e) {
      next(e);
    }
  }
);

// verify email
router.post(
  "/manager/verify/:managerId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.body.token;
      const { managerId } = req.params;

      const { error } = validateToken(token);
      if (error) {
        return res.status(400).send(error.details[0].message);
      }

      const VerificationToken = await prisma.verificationToken.findFirst({
        where: {
          managerId: Number(managerId),
          token: Number(token),
        },
      });

      if (!VerificationToken) {
        return res.status(400).json({
          error: "Access denied, invalid token",
        });
      }
      const manager = await prisma.manager.update({
        where: {
          id: VerificationToken.id,
        },
        data: {
          verified: true,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      });
      await prisma.verificationToken.delete({
        where: {
          id: VerificationToken.id,
        },
      });
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
          message: "Email verified",
        });
    } catch (e) {
      next(e);
    }
  }
);

// add and update password
router.put(
  "/manager/password",
  auth,
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    try {
      const { password }: Manager = req.body;

      const { error } = validatePassword(req.body.password);
      if (error) {
        return res.status(400).json({
          error: error.details[0].message,
        });
      }
      const hashedPassword = await bcrypt.hash(password, 10);

      await prisma.manager.update({
        where: {
          id: req.manager.id,
        },
        data: {
          password: hashedPassword,
        },
      });

      return res.status(200).json({
        message: "Password updated",
      });
    } catch (e) {
      next(e);
    }
  }
);

// add manager info
router.put(
  "/manager/info",
  auth,
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    try {
      let { gender, firstName, lastName, phoneNumber }: Manager = req.body;
      const { error } = validateManagerInfos(req.body);
      if (error) {
        return res.status(400).json({
          error: error.details[0].message,
        });
      }
      gender = gender || Gender.Female;
      const updated = await prisma.manager.update({
        where: {
          id: req.manager.id,
        },
        data: {
          gender,
          firstName,
          lastName,
          phoneNumber: Number(phoneNumber),
        },
      });
      const jwtToken = generateToken(updated);

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
          message: "Manager info updated",
        });
    } catch (e) {
      next(e);
    }
  }
);

// recover password
router.post(
  "/manager/recover",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email }: Manager = req.body;
      const { error } = validateEmail(req.body.email);
      if (error) {
        return res.status(400).json({
          error: error.details[0].message,
        });
      }

      const isExist = await prisma.manager.findUnique({
        where: {
          email: email,
        },
      });
      if (!isExist) {
        return res.status(400).json({
          error: "Account does not exist",
        });
      }

      const RandomString = crypto.randomBytes(8).toString("hex");
      // this page can be dynamically generated on the client and contain
      // a form to submit the new password to /api/recover/:token
      // where the token is the same RandomString
      let url = `${env.FRONTEND_URL}/recover/${RandomString}`;

      await prisma.recoveryToken.create({
        data: {
          token: RandomString,
          managerId: isExist.id,
        },
      });

      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          type: "OAuth2",
          user: env.MAIL_USERNAME,
          clientId: env.OAUTH_CLIENTID,
          clientSecret: env.OAUTH_CLIENT_SECRET,
          refreshToken: env.OAUTH_REFRESH_TOKEN,
        },
      });

      const mailOptions = {
        from: env.EMAIL_FROM,
        to: email,
        subject: "Medoka - Recover your account",
        html: `
                <div>
                    <p>
                    You have requested to recover your account.
                    </p>
                    <p>
                      Please use the following link to recover your account: 
                      <a href="${url}">Recover your account</a>
                    </p>
                </div>
            `,
      };

      transporter.sendMail(mailOptions);
      res.status(200).json({
        message: "Recovery link sent",
      });
    } catch (e) {
      next(e);
    }
  }
);

// set new password
router.put(
  "/recover/:token",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { password } = req.body;
      const { error } = validatePassword(req.body.password);
      if (error) {
        return res.status(400).json({
          error: error.details[0].message,
        });
      }

      const managerToken = await prisma.recoveryToken.findFirst({
        where: {
          token: req.params.token,
        },
        select: {
          managerId: true,
          id: true,
        },
      });
      if (!managerToken) {
        return res.status(404).json({
          error: "Access denied, invalid token",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await prisma.manager.update({
        where: {
          id: managerToken.managerId,
        },
        data: {
          password: hashedPassword,
        },
      });

      await prisma.recoveryToken.deleteMany({
        where: {
          id: managerToken.id,
        },
      });
      return res.status(200).json({ message: "Password updated" });
    } catch (e) {
      next(e);
    }
  }
);

export default router;
