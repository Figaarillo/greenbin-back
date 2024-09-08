import { z } from 'zod'

export const idDTO = z.string().uuid({ message: 'The format of ID must be a valid UUID' })

export const nameDTO = z
  .string()
  .min(2, { message: 'The name must be at least 2 characters long' })
  .max(100, { message: 'The length of name must be less than 100' })
  .regex(/^[a-zA-Z\s]+$/, { message: 'The name must not contain special characters' })
  .refine((name: string) => name.trim().length > 0, { message: 'The name cannot be empty' })

export const usernameDTO = z
  .string()
  .min(4, { message: 'Username must be at least 4 characters long' })
  .max(100, { message: 'Username must be less than 100 characters' })
  .regex(/^[a-zA-Z0-9]+$/, { message: 'Username must only contain letters and numbers' })
  .refine((username: string) => username.trim().length > 0, { message: 'Username cannot be empty' })

export const addressDTO = z
  .string()
  .min(2, { message: 'The address must be at least 2 characters long' })
  .max(500, { message: 'The length of address must be less than 500' })
  .regex(/^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑüÜ]+$/, { message: 'The address must only contain letters, numbers, and spaces' })
  .refine((name: string) => name.trim().length > 0, { message: 'The address cannot be empty' })

export const cuitDTO = z
  .string()
  .regex(/^\d{11}$/, {
    message: 'The CUIT must have only numeric characters. Do not use letters or special characters.'
  })
  .min(11, { message: 'The CUIT must be only 11 characters long' })
  .max(11, { message: 'The CUIT must be only 11 characters long' })
  .refine((cuit: string) => cuit.trim().length > 0, { message: 'The CUIT cannot be empty' })

export const emailDTO = z
  .string()
  .email({ message: 'The email must be a valid email address' })
  .refine((email: string) => email.trim().length > 0, { message: 'The email cannot be empty' })

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
