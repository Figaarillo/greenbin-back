import { z } from 'zod'

export const addressDTO = z
  .string()
  .min(2, { message: 'The address must be at least 2 characters long' })
  .max(500, { message: 'The length of address must be less than 500' })
  .regex(/^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑüÜ]+$/, { message: 'The address must only contain letters, numbers, and spaces' })
  .refine((name: string) => name.trim().length > 0, { message: 'The address cannot be empty' })

export const birthdateDTO = z
  .string()
  .regex(/^\d{2}\/\d{2}\/\d{4}$/, { message: 'The format of birthdate must be dd/mm/yyyy' })
  .refine((birthdate: string) => birthdate.trim().length > 0, { message: 'The birthdate cannot be empty' })
  .refine((birthdate: string) => birthdate.trim().length === 10, {
    message: 'The birthdate must be in the format dd/mm/yyyy'
  })

export const cityDTO = z
  .string()
  .min(2, { message: 'City name must be at least 2 characters long' })
  .max(100, { message: 'City name must be less than 100 characters' })
  .regex(/^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑüÜ]+$/, { message: 'The city must only contain letters, numbers, and spaces' })

export const coordinatesDTO = z
  .object({
    latitude: z
      .number()
      .min(-90, { message: 'The latitude must be greater than -90' })
      .max(90, { message: 'The latitude must be less than 90' }),
    longitude: z
      .number()
      .min(-180, { message: 'The longitude must be greater than -180' })
      .max(180, { message: 'The longitude must be less than 180' })
  })
  .refine(coordinates => coordinates.latitude !== 0 && coordinates.longitude !== 0, {
    message: 'The coordinates cannot be 0,0'
  })

export const cuitDTO = z
  .string()
  .regex(/^\d{11}$/, {
    message: 'The CUIT must have only numeric characters. Do not use letters or special characters.'
  })
  .min(11, { message: 'The CUIT must be only 11 characters long' })
  .max(11, { message: 'The CUIT must be only 11 characters long' })
  .refine((cuit: string) => cuit.trim().length > 0, { message: 'The CUIT cannot be empty' })

export const descriptionDTO = z.string().max(500, { message: 'The length of description must be less than 500' })

export const dniDTO = z
  .number()
  .min(999999, { message: 'The DNI must be containing at least 7 characters' })
  .max(9999999999, { message: 'The dni must be less than 10 characters' })

export const emailDTO = z
  .string()
  .email({ message: 'The email must be a valid email address' })
  .refine((email: string) => email.trim().length > 0, { message: 'The email cannot be empty' })

export const firstnameDTO = z
  .string()
  .min(3, { message: 'The firstname must be at least 3 characters long' })
  .max(100, { message: 'The length of firstname must be less than 100' })
  .regex(/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]+$/, { message: 'The firstname must not contain special characters' })
  .refine((firstname: string) => firstname.trim().length > 0, { message: 'The firstname cannot be empty' })

export const idDTO = z.string().uuid({ message: 'The format of ID must be a valid UUID' })

export const lastnameDTO = z
  .string()
  .min(3, { message: 'The lastname must be at least 3 characters long' })
  .max(100, { message: 'The length of lastname must be less than 100' })
  .regex(/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]+$/, { message: 'The lastname must not contain special characters' })
  .refine((lastname: string) => lastname.trim().length > 0, { message: 'The lastname cannot be empty' })

export const nameDTO = z
  .string()
  .min(2, { message: 'The name must be at least 2 characters long' })
  .max(100, { message: 'The length of name must be less than 100' })
  .regex(/^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑüÜ]+$/, { message: 'The name must not contain special characters' })
  .refine((name: string) => name.trim().length > 0, { message: 'The name cannot be empty' })

export const passwordDTO = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters long' })
  .regex(/(?=.*[a-z])/, { message: 'Password must contain at least one lowercase letter' })
  .regex(/(?=.*[A-Z])/, { message: 'Password must contain at least one uppercase letter' })
  .regex(/(?=.*\d)/, { message: 'Password must contain at least one digit' })
  .regex(/(?=.*[@$!%*?&])/, { message: 'Password must contain at least one special character' })

export const phoneNumberDTO = z
  .string()
  .regex(/^\d{10,15}$/, { message: 'Phone number must be between 10 and 15 digits' })
  .refine((phoneNumber: string) => phoneNumber.trim().length > 0, { message: 'Phone number cannot be empty' })

export const pointsPerWeightDTO = z
  .number()
  .min(1, { message: 'Points per weight must be at least 1' })
  .positive()
  .refine(pointsPerWeight => pointsPerWeight !== 0, { message: 'Points per weight cannot be 0' })

export const provinceDTO = z
  .string()
  .min(2, { message: 'Province name must be at least 2 characters long' })
  .max(100, { message: 'Province name must be less than 100 characters' })

export const usernameDTO = z
  .string()
  .min(4, { message: 'Username must be at least 4 characters long' })
  .max(100, { message: 'Username must be less than 100 characters' })
  .regex(/^[a-zA-Z0-9]+$/, { message: 'Username must only contain letters and numbers' })
  .refine((username: string) => username.trim().length > 0, { message: 'Username cannot be empty' })

export const weightDTO = z
  .number()
  .min(0.01, { message: 'The weight must be at least 0.01 kg' })
  .max(100, { message: 'The weight cannot be greater than 100 kg' })
  .positive({ message: 'The weight must be positive' })
