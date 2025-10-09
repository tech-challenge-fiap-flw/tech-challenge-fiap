import { z } from 'zod';

export const createVehicleServiceSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string().optional().nullable(),
  price: z.number().positive(),
});

export const updateVehicleServiceSchema = createVehicleServiceSchema.partial();

export type CreateVehicleServiceInput = z.infer<typeof createVehicleServiceSchema>;
export type UpdateVehicleServiceInput = z.infer<typeof updateVehicleServiceSchema>;
