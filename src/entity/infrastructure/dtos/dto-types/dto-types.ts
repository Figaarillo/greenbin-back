import { z } from 'zod'

export const idDTO = z.string().uuid({ message: 'The format of ID must be a valid UUID' })

export const nameDTO = z
  .string()
  .max(100, { message: 'The length of name must be less than 100' })
  .regex(/^[a-zA-Z\s]+$/, { message: 'The name must not contain special characters' })

export const descriptionDTO = z.string().max(500, { message: 'The length of description must be less than 500' })

export const passwordDTO = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters long' })
  .regex(/(?=.*[a-z])/, { message: 'Password must contain at least one lowercase letter' })
  .regex(/(?=.*[A-Z])/, { message: 'Password must contain at least one uppercase letter' })
  .regex(/(?=.*\d)/, { message: 'Password must contain at least one digit' })
  .regex(/(?=.*[@$!%*?&])/, { message: 'Password must contain at least one special character' })

export const cityDTO = z
  .string()
  .min(2, { message: 'City name must be at least 2 characters long' })
  .max(100, { message: 'City name must be less than 100 characters' })

export const provinceDTO = z
  .string()
  .min(2, { message: 'Province name must be at least 2 characters long' })
  .max(100, { message: 'Province name must be less than 100 characters' })
