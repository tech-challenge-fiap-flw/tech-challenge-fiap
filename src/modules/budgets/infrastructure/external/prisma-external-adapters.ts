import { prisma } from '../../../../shared/prisma/client';
import {
  UsersQueryPort, DiagnosisQueryPort, VehiclePartStockPort,
  VehicleServiceQueryPort, ServiceOrderPort, ServiceOrderHistoryPort
} from '../../domain/ports/external-services.ports';

export class PrismaUsersQuery implements UsersQueryPort {
  async ensureExists(userId: number): Promise<void> {
    const u = await prisma.user.findFirst({ where: { id: userId } });
    if (!u) { const e:any = new Error('User not found'); e.status = 404; throw e; }
  }
}

export class PrismaDiagnosisQuery implements DiagnosisQueryPort {
  async ensureExists(diagnosisId: number): Promise<void> {
    const d = await prisma.diagnosis.findFirst({ where: { id: diagnosisId } });
    if (!d) { const e:any = new Error('Diagnosis not found'); e.status = 404; throw e; }
  }
}

export class PrismaVehiclePartStock implements VehiclePartStockPort {
  async getOne(partId: number) {
    const p = await prisma.vehiclePart.findFirst({ where: { id: partId, deletedAt: null } });
    if (!p) { const e:any = new Error('VehiclePart not found'); e.status = 404; throw e; }
    return { id: p.id, quantity: p.quantity, price: p.price };
  }
  async setQuantity(partId: number, newQty: number, tx?: any) {
    const db = tx ?? prisma;
    await db.vehiclePart.update({ where: { id: partId }, data: { quantity: newQty } });
  }
}

export class PrismaVehicleServiceQuery implements VehicleServiceQueryPort {
  async findByIds(ids: number[]) {
    if (!ids?.length) return [];
    const rows = await prisma.vehicleService.findMany({ where: { id: { in: ids }, deletedAt: null } });
    return rows.map(r => ({ id: r.id, price: r.price ?? 0 }));
  }
}

export class PrismaServiceOrder implements ServiceOrderPort {
  async findActiveByBudgetId(budgetId: number) {
    const o = await prisma.serviceOrder.findFirst({
      where: { budgetId, active: true },
      select: { idServiceOrder: true, currentStatus: true, customerId: true }
    });
    return o ?? null;
  }
  async setStatus(orderId: number, status: any, tx?: any) {
    const db = tx ?? prisma;
    return db.serviceOrder.update({
      where: { idServiceOrder: orderId },
      data: { currentStatus: status }
    });
  }
}

export class PrismaServiceOrderHistory implements ServiceOrderHistoryPort {
  async log(orderId: number, userId: number, from: string, to: string, tx?: any): Promise<void> {
    // se tiver tabela de histórico, salve; se não, mantenha como no-op
    // await (tx ?? prisma).serviceOrderHistory.create({...})
  }
}
