import { Router, Request, Response, NextFunction } from 'express';
import { BudgetService } from '../application/BudgetService';
import { BudgetMySqlRepository, BudgetVehiclePartMySqlRepository, BudgetVehicleServiceMySqlRepository } from '../infra/BudgetMySqlRepositories';
import { getPagination, toPage } from '../../../shared/http/pagination';
import { authMiddleware } from '../../auth/AuthMiddleware';
import { requireRole } from '../../auth/RoleMiddleware';

const budgetRepo = new BudgetMySqlRepository();
const partRepo = new BudgetVehiclePartMySqlRepository();
const serviceRepo = new BudgetVehicleServiceMySqlRepository();
const service = new BudgetService(budgetRepo, partRepo, serviceRepo);

const createBudgetHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const created = await service.createBudget(req.body);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

const getBudgetByIdHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const found = await budgetRepo.findById(id);

    if (!found) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    res.json(found.toJSON());
  } catch (err) {
    next(err);
  }
};

const addPartToBudgetHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const { vehiclePartId, quantity, price } = req.body;

    await service.addPart(id, vehiclePartId, quantity, price);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

const addServiceToBudgetHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const { vehicleServiceId, price } = req.body;

    await service.addService(id, vehicleServiceId, price);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

const removePartFromBudgetHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const entryId = Number(req.params.entryId);

    await service.removePart(entryId, id);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

const removeServiceFromBudgetHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const entryId = Number(req.params.entryId);

    await service.removeService(entryId, id);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

const listBudgetsHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, offset } = getPagination(req);

    const [items, total] = await Promise.all([
      budgetRepo.list(offset, limit),
      budgetRepo.countAll(),
    ]);

    res.json(toPage(items.map(i => i.toJSON()), page, limit, total));
  } catch (err) {
    next(err);
  }
};

export const budgetRouter = Router();

budgetRouter.post('/', authMiddleware, requireRole('admin'), createBudgetHandler);
budgetRouter.get('/:id', authMiddleware, getBudgetByIdHandler);
budgetRouter.post('/:id/parts', authMiddleware, requireRole('admin', 'mechanic'), addPartToBudgetHandler);
budgetRouter.post('/:id/services', authMiddleware, requireRole('admin', 'mechanic'), addServiceToBudgetHandler);
budgetRouter.delete('/:id/parts/:entryId', authMiddleware, requireRole('admin', 'mechanic'), removePartFromBudgetHandler);
budgetRouter.delete('/:id/services/:entryId', authMiddleware, requireRole('admin', 'mechanic'), removeServiceFromBudgetHandler);
budgetRouter.get('/', authMiddleware, requireRole('admin'), listBudgetsHandler);