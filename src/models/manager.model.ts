import Joi, { func } from "joi";
import { Pharmacy } from "./pharmacy.model";
import jwt from "jsonwebtoken";
import { env } from "process";
import { Gender } from "@prisma/client";

/**
 * @usage
 * Manager type declaration
 **/
export interface Manager {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  phoneNumber: number;
  Pharmacies: Pharmacy[];
}

/**
 * @usage
 * validate the code recived on the email
 **/
export function validateToken(token: number) {
  const schema = Joi.object({
    token: Joi.number().required(),
  });
  const result = schema.validate({
    token: token,
  });
  return result;
}

/**
 * @usage
 * validate the email
 **/
export function validateEmail(email: string) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
  });
  const result = schema.validate({
    email: email,
  });
  return result;
}

/**
 * @usage
 * validate the password
 **/
export function validatePassword(password: string) {
  const schema = Joi.object({
    password: Joi.string().min(8).max(256).required(),
  });
  const result = schema.validate({
    password: password,
  });
  return result;
}

/**
 * @usage
 * manager token infos types
 **/
export type TManager = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
};

/**
 * @usage
 * generate jwt token for session management
 **/
export function generateToken(manager: TManager): string {
  const token = jwt.sign(
    {
      id: manager.id,
      email: manager.email,
      firstName: manager.firstName,
      lastName: manager.lastName,
    },
    env.JWT_SECRET
  );
  return token;
}

/**
 * @usage
 * Validate manager informations
 **/
export function validateManagerInfos({
  firstName,
  lastName,
  phoneNumber,
}: Manager) {
  const schema = Joi.object({
    firstName: Joi.string().required().messages({
      "number.empty": `First name cannot be an empty field`,
      "any.required": `First name is required`,
    }),
    lastName: Joi.string().required().messages({
      "number.empty": `Last name cannot be an empty field`,
      "any.required": `Last name is required`,
    }),
    phoneNumber: Joi.number().required().messages({
      "number.empty": `Phone number cannot be an empty field`,
      "any.required": `Phone number is required`,
    }),
  });
  const result = schema.validate({
    firstName,
    lastName,
    phoneNumber,
  });

  return result;
}

/**
 * @usage
 * Validate auth credentials
 **/
export function validateCredentials({ email, password }: Manager) {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      "string.empty": `Email cannot be an empty field`,
      "any.required": `Email is required`,
      "string.email": `Email is not valid`,
    }),
    password: Joi.string().min(8).max(256).required().messages({
      "string.empty": `Password cannot be an empty field`,
      "any.required": `Password is required`,
      "string.min": `Password must be at least 8 characters`,
      "string.max": `Password must be at most 256 characters`,
    }),
  });
  const result = schema.validate({
    email,
    password,
  });

  return result;
}
