import { Diagnosis } from '../../domain/entities/diagnosis';

export type DiagnosisResponseDto = {
  id: number;
  description: string;
  creationDate: Date;
  vehicleId: number;
  responsibleMechanicId: number | null;
  deletedAt: Date | null;
};

export class DiagnosisPresenter {
  static toResponse(d: Diagnosis): DiagnosisResponseDto {
    return {
      id: d.id,
      description: d.description,
      creationDate: d.creationDate,
      vehicleId: d.vehicleId,
      responsibleMechanicId: d.responsibleMechanicId,
      deletedAt: d.deletedAt
    };
  }
}
