import { Request, Response } from 'express';
import { CreateVehicleUseCase } from '../usecases/CreateVehicleUseCase';
import { ListVehiclesUseCase } from '../usecases/ListVehiclesUseCase';
import { GetVehicleUseCase } from '../usecases/GetVehicleUseCase';
import { UpdateVehicleUseCase } from '../usecases/UpdateVehicleUseCase';
import { DeleteVehicleUseCase } from '../usecases/DeleteVehicleUseCase';

export class VehicleController {
  constructor(
    private createUseCase: CreateVehicleUseCase,
    private listUseCase: ListVehiclesUseCase,
    private getUseCase: GetVehicleUseCase,
    private updateUseCase: UpdateVehicleUseCase,
    private deleteUseCase: DeleteVehicleUseCase,
  ) {}

  async create(req: Request, res: Response) {
    const dto = req.body;
    const created = await this.createUseCase.execute(dto);
    return res.status(201).json(created);
  }

  async list(req: Request, res: Response) {
    const items = await this.listUseCase.execute();
    return res.json(items);
  }

  async get(req: Request, res: Response) {
    const { id } = req.params;
    const v = await this.getUseCase.execute(id);
    return res.json(v);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const data = req.body;
    const updated = await this.updateUseCase.execute(id, data);
    return res.json(updated);
  }

  async remove(req: Request, res: Response) {
    const { id } = req.params;
    await this.deleteUseCase.execute(id);
    return res.status(204).send();
  }
}
