import { DiagnosisEntity, DiagnosisProps } from '../domain/Diagnosis';
import { DiagnosisRepository } from '../domain/DiagnosisRepository';

export class DiagnosisService {
  constructor(private readonly repo: DiagnosisRepository) {}
  async createDiagnosis(input: Omit<DiagnosisProps, 'id' | 'creationDate' | 'deletedAt'>) {
    const entity = DiagnosisEntity.create(input);
    const created = await this.repo.create(entity);
    return created.toJSON();
  }
  async updateDiagnosis(id: number, partial: Partial<DiagnosisProps>) {
    const updated = await this.repo.update(id, partial);
    return updated.toJSON();
  }
  async deleteDiagnosis(id: number) { await this.repo.softDelete(id); }
}
