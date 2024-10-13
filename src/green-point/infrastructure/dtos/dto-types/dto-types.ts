import { z } from 'zod'

export const idDTO = z.string().uuid({ message: 'The format of ID must be a valid UUID' })

export const nameDTO = z
  .string()
  .max(100, { message: 'The length of name must be less than 100' })
  .regex(/^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑüÜ]+$/, { message: 'The name must not contain special characters' })

export const descriptionDTO = z.string().max(500, { message: 'The length of description must be less than 500' })

export const addressDTO = z
  .string()
  .min(2, { message: 'The address must be at least 2 characters long' })
  .max(500, { message: 'The length of address must be less than 500' })
  .regex(/^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑüÜ]+$/, { message: 'The address must only contain letters, numbers, and spaces' })
  .refine((name: string) => name.trim().length > 0, { message: 'The address cannot be empty' })

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
