import { z } from 'zod';
import { ServiceOrderStatus } from '../../domain/ServiceOrder';

export const createServiceOrderSchema = z.object({
  vehicleId: z.number().int().positive(),
  customerId: z.number().int().positive(),
  description: z.string().min(3),
  status: z.string().optional(),
  mechanicId: z.number().int().positive().optional(),
});

export const allowedStatuses: ServiceOrderStatus[] = [
  'CREATED',
  'APPROVED',
  'IN_PROGRESS',
  'PAUSED',
  'COMPLETED',
  'CANCELLED'
];

export const changeStatusSchema = z.object({
  status: z.enum(allowedStatuses as [ServiceOrderStatus, ...ServiceOrderStatus[]])
});

export type CreateServiceOrderInput = z.infer<typeof createServiceOrderSchema>;
export type ChangeStatusInput = z.infer<typeof changeStatusSchema>;
