import { z } from 'zod'

export const idDTO = z.string().uuid({ message: 'The format of ID must be a valid UUID' })

export const firstnameDTO = z
  .string()
  .min(2, { message: 'The firstname must be at least 2 characters long' })
  .max(100, { message: 'The length of firstname must be less than 100' })
  .regex(/^[a-zA-Z\s]+$/, { message: 'The firstname must not contain special characters' })
  .refine((name: string) => name.trim().length > 0, { message: 'The firstname cannot be empty' })

export const lastnameDTO = z
  .string()
  .min(2, { message: 'The lastname must be at least 2 characters long' })
  .max(100, { message: 'The length of lastname must be less than 100' })
  .regex(/^[a-zA-Z\s]+$/, { message: 'The lastname must not contain special characters' })
  .refine((name: string) => name.trim().length > 0, { message: 'The firstname cannot be empty' })

export const usernameDTO = z
  .string()
  .min(4, { message: 'Username must be at least 4 characters long' })
  .max(100, { message: 'Username must be less than 100 characters' })
  .regex(/^[a-zA-Z0-9]+$/, { message: 'Username must only contain letters and numbers' })
  .refine((username: string) => username.trim().length > 0, { message: 'Username cannot be empty' })

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

export const dniDTO = z
  .number()
  .min(8, { message: 'The length of dni must be 8' })
  .max(8, { message: 'The length of dni must be 8' })

export const phoneNumberDTO = z
  .number()
  .min(8, { message: 'The length of phone number must be 8' })
  .max(11, { message: 'The length of phone number must be 11' })
