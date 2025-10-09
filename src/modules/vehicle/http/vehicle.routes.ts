import { Router, Request, Response, NextFunction } from 'express';
import { VehicleMySqlRepository } from '../infra/VehicleMySqlRepository';
import { VehicleService } from '../application/VehicleService';
import { getPagination, toPage } from '../../../shared/http/pagination';
import { authMiddleware } from '../../auth/AuthMiddleware';

const repo = new VehicleMySqlRepository();
const service = new VehicleService(repo);

const createVehicleHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.createVehicle(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

const getVehicleByIdHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const found = await repo.findById(id);
    
    if (!found) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    res.json(found.toJSON());
  } catch (err) {
    next(err);
  }
};

const updateVehicleHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const result = await service.updateVehicle(id, req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const deleteVehicleHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    await service.deleteVehicle(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

const listVehiclesHandler = async (req: Request, res: Response, next: NextFunction) => {
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

export const vehicleRouter = Router();

vehicleRouter.post('/', authMiddleware, createVehicleHandler);
vehicleRouter.get('/:id', authMiddleware, getVehicleByIdHandler);
vehicleRouter.put('/:id', authMiddleware, updateVehicleHandler);
vehicleRouter.delete('/:id', authMiddleware, deleteVehicleHandler);
vehicleRouter.get('/', authMiddleware, listVehiclesHandler);