import { DiagnosisEntity, DiagnosisId, DiagnosisProps } from './Diagnosis';

export interface DiagnosisRepository {
  create(entity: DiagnosisEntity): Promise<DiagnosisEntity>;
  findById(id: DiagnosisId): Promise<DiagnosisEntity | null>;
  update(id: DiagnosisId, partial: Partial<DiagnosisProps>): Promise<DiagnosisEntity>;
  softDelete(id: DiagnosisId): Promise<void>;
  list(offset: number, limit: number): Promise<DiagnosisEntity[]>;
  countAll(): Promise<number>;
}
