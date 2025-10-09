import { Router, Request, Response, NextFunction } from 'express';
import { VehiclePartMySqlRepository } from '../infra/VehiclePartMySqlRepository';
import { VehiclePartEntity } from '../domain/VehiclePart';
import { getPagination, toPage } from '../../../shared/http/pagination';
import { authMiddleware } from '../../auth/AuthMiddleware';

const repo = new VehiclePartMySqlRepository();

const createVehiclePartHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entity = VehiclePartEntity.create(req.body);
    const created = await repo.create(entity);
    res.status(201).json(created.toJSON());
  } catch (err) {
    next(err);
  }
};

const getVehiclePartByIdHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const found = await repo.findById(id);

    if (!found) {
      return res.status(404).json({ error: 'Vehicle part not found' });
    }

    res.json(found.toJSON());
  } catch (err) {
    next(err);
  }
};

const updateVehiclePartHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const updated = await repo.update(id, req.body);
    res.json(updated.toJSON());
  } catch (err) {
    next(err);
  }
};

const deleteVehiclePartHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    await repo.softDelete(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

const listVehiclePartsHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, offset } = getPagination(req);
    
    const [items, total] = await Promise.all([
      repo.list(offset, limit),
      repo.countAll(),
    ]);
    
    res.json(toPage(items.map(i => i.toJSON()), page, limit, total));
  } catch (err) {
    next(err);
  }
};

export const vehiclePartRouter = Router();

vehiclePartRouter.post('/', authMiddleware, createVehiclePartHandler);
vehiclePartRouter.get('/:id', authMiddleware, getVehiclePartByIdHandler);
vehiclePartRouter.put('/:id', authMiddleware, updateVehiclePartHandler);
vehiclePartRouter.delete('/:id', authMiddleware, deleteVehiclePartHandler);
vehiclePartRouter.get('/', authMiddleware, listVehiclePartsHandler);