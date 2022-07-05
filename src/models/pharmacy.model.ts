import { DayName } from "@prisma/client";
import joi from "joi";

/**
 * @usage
 * Pharmacy type declaration
 **/
export interface Pharmacy {
  id: number;
  companyName: string;
  serialNumber: number;
  registrationDate: Date | string;
  adress: string;
  phoneNumber: number;
  Days: Day[];
}

/**
 * @usage
 * work daya interfce
 **/
export interface Day {
  name: DayName;
  open: boolean;
  startsAt: number;
  endsAt: number;
}

/**
 * @usage
 * format days to be inserted in the database
 **/
export function formatDays(Days: Day[]) {
  return Days.map((day) => {
    return {
      name: day.name,
      open: JSON.parse(day.open.toString()),
      startsAt: new Date(`1970-01-01T${day.startsAt}:00.000Z`),
      endsAt: new Date(`1970-01-01T${day.endsAt}:00.000Z`),
    };
  });
}

/**
 * @usage
 * validate pharmacy informations
 **/
export function validateInfo({
  companyName,
  serialNumber,
  registrationDate,
}: Pharmacy) {
  const schema = joi.object({
    companyName: joi.string().min(3).max(50).required().messages({
      "string.empty": `The company name cannot be an empty field`,
      "string.min": `The company name must be more than 3 letters`,
      "string.max": `The company name must be less than 50 letters`,
      "any.required": `The company name is required`,
    }),
    serialNumber: joi.number().required().messages({
      "number.empty": `The serial number cannot be an empty field`,
      "any.required": `The serial number is required`,
    }),
    registrationDate: joi.date().required().messages({
      "any.required": `The registration date is required`,
    }),
  });

  const result = schema.validate({
    companyName,
    serialNumber,
    registrationDate,
  });
  return result;
}

/**
 * @usage
 * validate pharmacy adress
 **/
export function validateAdress({ adress }: Pharmacy) {
  const schema = joi.object({
    adress: joi.string().min(3).max(50).required().messages({
      "string.empty": `The adress cannot be an empty field`,
      "string.min": `The adress must be more than 3 letters`,
      "string.max": `The adress must be less than 50 letters`,
      "any.required": `The adress is required`,
    }),
  });

  const result = schema.validate({
    adress,
  });
  return result;
}

/**
 * @usage
 * validate phone number
 **/
export function validatePhoneNumber({ phoneNumber }: Pharmacy) {
  const schema = joi.object({
    phoneNumber: joi.number().required().messages({
      "number.empty": `The phone number cannot be an empty field`,
      "any.required": `The phone number is required`,
    }),
  });

  const result = schema.validate({
    phoneNumber,
  });
  return result;
}

/**
 * @usage
 * format pharmacy informations
 * especially the registration date
 **/
export function formatPharmacy({
  companyName,
  serialNumber,
  registrationDate,
  id,
}: Pharmacy) {
  return {
    id: Number(id),
    companyName: String(companyName),
    serialNumber: Number(serialNumber),
    registrationDate: new Date(registrationDate),
  };
}
