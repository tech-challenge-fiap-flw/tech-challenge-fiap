import { Budget } from '../../domain/entities/budget';

export type VehiclePartItemResponseDto = {
  id: number;
  quantity: number;
};

export type BudgetResponseDto = {
  id: number;
  description: string;
  deletedAt: Date | null;
  creationDate: Date | null;
  ownerId: number;
  diagnosisId: number;
  total: number;
  vehicleParts?: VehiclePartItemResponseDto[];
};

export class BudgetPresenter {
  static toResponse(b: Budget): BudgetResponseDto {
    return {
      id: b.id,
      description: b.description,
      deletedAt: b.deletedAt ?? null,
      creationDate: b.creationDate ?? null,
      ownerId: b.ownerId,
      diagnosisId: b.diagnosisId,
      total: b.total,
      vehicleParts: (b.vehicleParts ?? []).map(vp => ({
        id: vp.id,
        quantity: vp.quantity,
      })),
    };
  }
}
