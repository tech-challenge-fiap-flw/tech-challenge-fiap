import { z } from 'zod';

export const createBudgetSchema = z.object({
  customerId: z.number().int().positive(),
  vehicleId: z.number().int().positive(),
  description: z.string().min(3)
});

export const addPartSchema = z.object({
  vehiclePartId: z.number().int().positive(),
  quantity: z.number().int().positive(),
  price: z.number().positive()
});

export const addServiceSchema = z.object({
  vehicleServiceId: z.number().int().positive(),
  price: z.number().positive()
});
