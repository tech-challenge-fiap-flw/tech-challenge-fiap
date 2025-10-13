import { z } from 'zod';

export const acceptSchema = z.object({
  accept: z.boolean()
})

export const assignBudgetSchema = z.object({
  description: z.string().min(5),
  vehicleParts: z.array(
    z.object({
      vehiclePartId: z.number().int(),
      quantity: z.number().int().min(1)
    })
  ),
  vehicleServicesIds: z.array(z.number().int()).optional()
})

const VehiclePartItemSchema = z.object({
  vehiclePartId: z.number().int(),
  quantity: z.number().int(),
});

export const createSchema = z.object({
  description: z.string().min(1, { message: 'Descrição não pode ser vazia.' }),
  vehicleId: z.number().int(),
  budgetId: z.number().int().optional(),
  vehicleParts: z
    .array(VehiclePartItemSchema)
    .optional()
    .refine(
      (arr) => !arr || new Set(arr.map((item) => item.vehiclePartId)).size === arr.length,
      { message: 'A lista de peças não pode conter itens com o mesmo id.' }
    ),
  vehicleServicesIds: z
    .array(z.number().int())
    .optional()
    .refine(
      (arr) => !arr || new Set(arr).size === arr.length,
      { message: 'A lista de serviços não pode conter IDs duplicados.' }
    ),
});
