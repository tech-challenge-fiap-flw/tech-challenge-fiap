import { Router, Request, Response, NextFunction } from 'express';
import { DiagnosisMySqlRepository } from '../infra/DiagnosisMySqlRepository';
import { DiagnosisEntity } from '../domain/Diagnosis';
import { getPagination, toPage } from '../../../shared/http/pagination';
import { authMiddleware } from '../../auth/AuthMiddleware';

const repo = new DiagnosisMySqlRepository();
export const diagnosisRouter = Router();

diagnosisRouter.post('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entity = DiagnosisEntity.create(req.body);
    const created = await repo.create(entity);
    res.status(201).json(created.toJSON());
  } catch (err) { next(err); }
});

diagnosisRouter.get('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const found = await repo.findById(id);
    if (!found) return res.status(404).json({ error: 'Diagnosis not found' });
    res.json(found.toJSON());
  } catch (err) { next(err); }
});

diagnosisRouter.put('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const updated = await repo.update(id, req.body);
    res.json(updated.toJSON());
  } catch (err) { next(err); }
});

diagnosisRouter.delete('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    await repo.softDelete(id);
    res.status(204).send();
  } catch (err) { next(err); }
});

diagnosisRouter.get('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, offset } = getPagination(req);
    const [items, total] = await Promise.all([
      repo.list(offset, limit),
      repo.countAll(),
    ]);
    res.json(toPage(items.map(i => i.toJSON()), page, limit, total));
  } catch (err) { next(err); }
});
