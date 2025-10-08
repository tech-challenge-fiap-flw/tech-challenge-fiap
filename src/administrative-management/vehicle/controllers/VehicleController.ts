import { Request, Response } from 'express';
import { CreateVehicleUseCase } from '../usecases/CreateVehicleUseCase';
import { ListVehiclesUseCase } from '../usecases/ListVehiclesUseCase';
import { GetVehicleUseCase } from '../usecases/GetVehicleUseCase';
import { UpdateVehicleUseCase } from '../usecases/UpdateVehicleUseCase';
import { DeleteVehicleUseCase } from '../usecases/DeleteVehicleUseCase';
import { Vehicle } from '../domain/Vehicle';
import { VehicleResponseDTO } from '../dtos/VehicleResponseDTO';
import { CreateVehicleDTO } from '../dtos/CreateVehicleDTO';

export class VehicleController {
  constructor(
    private createUC: CreateVehicleUseCase,
    private listUC: ListVehiclesUseCase,
    private getUC: GetVehicleUseCase,
    private updateUC: UpdateVehicleUseCase,
    private deleteUC: DeleteVehicleUseCase,
  ) {}

  private toResponse(v: Vehicle): VehicleResponseDTO {
    return {
      id: v.id,
      idPlate: v.idPlate,
      type: v.type,
      model: v.model,
      brand: v.brand,
      manufactureYear: v.manufactureYear,
      modelYear: v.modelYear,
      color: v.color,
      ownerId: v.ownerId,
      deletedAt: v.deletedAt,
    };
  }

  async create(req: Request, res: Response) {
    const dto = req.body as CreateVehicleDTO;
    const created = await this.createUC.execute(
      { id: req.user.id, roles: req.user.roles },
      dto,
    );
    return res.status(201).json(this.toResponse(created));
  }

  async list(req: Request, res: Response) {
    const items = await this.listUC.execute({ id: req.user.id, roles: req.user.roles });
    return res.json(items.map(this.toResponse));
  }

  async get(req: Request, res: Response) {
    const id = Number(req.params.id);
    const v = await this.getUC.execute(id, { id: req.user.id, roles: req.user.roles });
    return res.json(this.toResponse(v));
  }

  async update(req: Request, res: Response) {
    const id = Number(req.params.id);
    const updated = await this.updateUC.execute(id, { id: req.user.id, roles: req.user.roles }, req.body);
    return res.json(this.toResponse(updated));
  }

  async remove(req: Request, res: Response) {
    const id = Number(req.params.id);
    await this.deleteUC.execute(id, { id: req.user.id, roles: req.user.roles });
    return res.status(204).send();
  }
}
