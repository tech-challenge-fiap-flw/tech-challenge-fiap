import { prisma } from '../../../../../shared/prisma/client';
import { DiagnosisRepositoryPort } from '../../../domain/repositories/diagnosis.repository.port';
import { Diagnosis } from '../../../domain/entities/diagnosis';

export class PrismaDiagnosisRepository implements DiagnosisRepositoryPort {
  private map(row: any): Diagnosis {
    return new Diagnosis(
      row.id,
      row.description,
      row.creationDate,
      row.vehicleId,
      row.responsibleMechanicId ?? null,
      row.deletedAt ?? null
    );
  }

  async create(data: Omit<Diagnosis, 'id' | 'deletedAt' | 'creationDate'> & Partial<Pick<Diagnosis,'creationDate'>>): Promise<Diagnosis> {
    const created = await prisma.diagnosis.create({
      data: {
        description: data.description,
        vehicleId: data.vehicleId,
        responsibleMechanicId: data.responsibleMechanicId ?? null,
        creationDate: data.creationDate ?? new Date()
      }
    });

    return this.map(created);
  }

  async findById(id: number): Promise<Diagnosis | null> {
    const row = await prisma.diagnosis.findFirst({
      where: { id, deletedAt: null }
    });

    return row ? this.map(row) : null;
  }
}
