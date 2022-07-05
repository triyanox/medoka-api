import e, { Router, NextFunction, Response } from "express";
import prisma from "../lib/prisma";
import { IAuthRequest } from "../middleware/auth";
import { auth } from "../middleware/auth";
import {
  formatPharmacy,
  Pharmacy,
  validateAdress,
  validateInfo,
  validatePhoneNumber,
} from "../models/pharmacy.model";

const router = Router();

// add pharmacy infos
router.put(
  "/pharmacy/info",
  auth,
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id, companyName, serialNumber, registrationDate } =
        formatPharmacy(req.body);
      const { error } = validateInfo(req.body);
      if (error) {
        return res.status(400).json({
          error: error.details[0].message,
        });
      }

      if (id) {
        const found = await prisma.pharmacy.findFirst({
          where: {
            id: id,
            managerId: req.manager.id,
          },
        });
        if (!found)
          return res.status(400).json({
            error: "Pharmacy not found",
          });
        const updated = await prisma.pharmacy.update({
          where: { id: id },
          data: {
            companyName,
            serialNumber,
            registrationDate,
          },
        });

        return res.status(200).json({
          message: "Pharmacy info updated successfully",
          pharmacyId: updated.id,
        });
      }

      const created = await prisma.pharmacy.create({
        data: {
          companyName,
          serialNumber,
          registrationDate,
          manager: {
            connect: {
              id: req.manager.id,
            },
          },
        },
      });

      return res.status(200).json({
        message: "Pharmacy created successfully",
        pharmacyId: created.id,
      });
    } catch (e) {
      next(e);
    }
  }
);

// add adress
router.put(
  "/pharmacy/adress/:id",
  auth,
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    try {
      const { adress }: Pharmacy = req.body;
      const id = Number(req.params.id);
      const { error } = validateAdress(req.body);
      if (error) {
        return res.status(400).json({
          error: error.details[0].message,
        });
      }
      const found = await prisma.pharmacy.findFirst({
        where: {
          id: id,
          managerId: req.manager.id,
        },
      });
      if (!found)
        return res.status(400).json({
          error: "Pharmacy not found",
        });
      await prisma.pharmacy.update({
        where: { id: id },
        data: {
          adress,
        },
      });
      return res.status(200).json({
        message: "Adress updated successfuly ",
      });
    } catch (e) {
      next(e);
    }
  }
);

// add phone number
router.put(
  "/pharmacy/phone/:id",
  auth,
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    try {
      const phoneNumber = Number(req.body.phoneNumber);
      const id = Number(req.params.id);

      const { error } = validatePhoneNumber(req.body);
      if (error) {
        return res.status(400).json({
          error: error.details[0].message,
        });
      }
      const found = await prisma.pharmacy.findFirst({
        where: {
          id: id,
          managerId: req.manager.id,
        },
      });
      if (!found)
        return res.status(400).json({
          error: "Pharmacy not found",
        });
      await prisma.pharmacy.update({
        where: { id: id },
        data: {
          phoneNumber,
        },
      });
      return res.status(200).json({
        message: "Phone number updated successfuly ",
      });
    } catch (e) {
      next(e);
    }
  }
);

export default router;
