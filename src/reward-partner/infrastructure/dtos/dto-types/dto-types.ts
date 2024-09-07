import { z } from 'zod'

export const idDTO = z.string().uuid({ message: 'The format of ID must be a valid UUID' })

export const nameDTO = z
  .string()
  .min(2, { message: 'The name must be at least 2 characters long' })
  .max(100, { message: 'The length of name must be less than 100' })
  .regex(/^[a-zA-Z\s]+$/, { message: 'The name must not contain special characters' })
  .refine((name: string) => name.trim().length > 0, { message: 'The name cannot be empty' })

export const addressDTO = z
  .string()
  .min(2, { message: 'The address must be at least 2 characters long' })
  .max(500, { message: 'The length of address must be less than 500' })
  .regex(/^[a-zA-Z\s]+$/, { message: 'The address must not contain special characters' })
  .refine((name: string) => name.trim().length > 0, { message: 'The address cannot be empty' })

export const cuitDTO = z
  .string()
  .regex(/^\d{11}$/, { message: 'The CUIT must be a valid CUIT' })
  .min(11, { message: 'The CUIT must be at least 11 characters long' })
  .max(11, { message: 'The CUIT must be less than 11 characters long' })
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
