import { z } from 'zod';

export const createVehiclePartSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string().optional().nullable(),
  price: z.number().positive(),
});

export const updateVehiclePartSchema = createVehiclePartSchema.partial();

export type CreateVehiclePartInput = z.infer<typeof createVehiclePartSchema>;
export type UpdateVehiclePartInput = z.infer<typeof updateVehiclePartSchema>;
