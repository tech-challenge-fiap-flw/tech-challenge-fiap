import { Router, Request, Response, NextFunction } from 'express';
import { VehicleServiceMySqlRepository } from '../infra/VehicleServiceMySqlRepository';
import { VehicleServiceEntity } from '../domain/VehicleService';
import { getPagination, toPage } from '../../../shared/http/pagination';
import { authMiddleware } from '../../auth/AuthMiddleware';

const repo = new VehicleServiceMySqlRepository();

const createVehicleServiceHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entity = VehicleServiceEntity.create(req.body);
    const created = await repo.create(entity);
    res.status(201).json(created.toJSON());
  } catch (err) {
    next(err);
  }
};

const getVehicleServiceByIdHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const found = await repo.findById(id);

    if (!found) {
      return res.status(404).json({ error: 'Vehicle service not found' });
    }

    res.json(found.toJSON());
  } catch (err) {
    next(err);
  }
};

const updateVehicleServiceHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const updated = await repo.update(id, req.body);
    res.json(updated.toJSON());
  } catch (err) {
    next(err);
  }
};

const deleteVehicleServiceHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    await repo.softDelete(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

const listVehicleServicesHandler = async (req: Request, res: Response, next: NextFunction) => {
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

export const vehicleServiceRouter = Router();

vehicleServiceRouter.post('/', authMiddleware, createVehicleServiceHandler);
vehicleServiceRouter.get('/:id', authMiddleware, getVehicleServiceByIdHandler);
vehicleServiceRouter.put('/:id', authMiddleware, updateVehicleServiceHandler);
vehicleServiceRouter.delete('/:id', authMiddleware, deleteVehicleServiceHandler);
vehicleServiceRouter.get('/', authMiddleware, listVehicleServicesHandler);