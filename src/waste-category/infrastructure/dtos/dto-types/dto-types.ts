import { z } from 'zod'

export const idDTO = z.string().uuid({ message: 'The format of ID must be a valid UUID' })

export const nameDTO = z
  .string()
  .max(100, { message: 'The length of name must be less than 100' })
  .regex(/^[a-zA-Z\s]+$/, { message: 'The name must not contain special characters' })

export const descriptionDTO = z.string().max(1000, { message: 'The length of description must be less than 1000' })
