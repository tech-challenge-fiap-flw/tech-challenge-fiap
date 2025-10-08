import { Diagnosis } from '../entities/diagnosis';

export interface DiagnosisRepositoryPort {
  create(data: Omit<Diagnosis, 'id' | 'deletedAt' | 'creationDate'> & Partial<Pick<Diagnosis,'creationDate'>>): Promise<Diagnosis>;
  findById(id: number): Promise<Diagnosis | null>;
}
