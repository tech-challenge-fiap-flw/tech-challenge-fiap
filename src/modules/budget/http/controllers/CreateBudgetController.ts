import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller'
import { badRequest } from '../../../../shared/http/HttpError'
import { IBudgetService } from '../../application/BudgetService'
import { z } from 'zod'

const createSchema = z.object({
  description: z.string().min(5),
  ownerId: z.number().int(),
  diagnosisId: z.number().int(),
  vehicleParts: z.array(
    z.object({
      vehiclePartId: z.number().int(),
      quantity: z.number().int().min(1)
    })
  ),
  vehicleServicesIds: z.array(z.number().int()).optional()
})

export class CreateBudgetController implements IController {
  constructor(private readonly service: IBudgetService) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const parsed = createSchema.safeParse(req.body)

    if (!parsed.success) {
      throw badRequest('Validation failed', parsed.error.format())
    }

    const created = await this.service.create(parsed.data)

    return {
      status: 201,
      body: created
    }
  }
}
