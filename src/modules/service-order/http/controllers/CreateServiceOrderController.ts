import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller';
import { badRequest } from '../../../../shared/http/HttpError';
import { IServiceOrderService } from '../../application/ServiceOrderService';
import { z } from 'zod';

const VehiclePartItemSchema = z.object({
  vehiclePartId: z.number().int(),
  quantity: z.number().int(),
});

const schema = z.object({
  description: z.string().min(1, { message: 'Descrição não pode ser vazia.' }),
  vehicleId: z.number().int(),
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

export class CreateServiceOrderController implements IController {
  constructor(private readonly service: IServiceOrderService) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
      throw badRequest('Validation failed', parsed.error.format());
    }

    if (!req.user) {
      throw badRequest('Unauthorized');
    }

    const created = await this.service.create(req.user, parsed.data);

    return {
      status: 201,
      body: created
    };
  }
}
