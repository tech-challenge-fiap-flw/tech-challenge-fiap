import { DiagnosisRepositoryPort } from '../../domain/repositories/diagnosis.repository.port';
import { Diagnosis } from '../../domain/entities/diagnosis';

export class FindDiagnosisByIdUseCase {
  constructor(private diagnoses: DiagnosisRepositoryPort) {}

  async execute(id: number): Promise<Diagnosis> {
    const d = await this.diagnoses.findById(id);

    if (!d) {
      const err: any = new Error(`Diagnosis with id ${id} not found`);
      err.status = 404;
      throw err;
    }

    return d;
  }
}
