import { DiagnosisEntity } from '../domain/Diagnosis';
import { NotFoundServerException } from '../../../shared/application/ServerException';

export function makeDiagnosis(overrides: Partial<ReturnType<DiagnosisEntity['toJSON']>> = {}) {
  const base = DiagnosisEntity.restore({
    id: overrides.id ?? 1,
    description: overrides.description ?? 'Engine noise',
    creationDate: overrides.creationDate ?? new Date('2024-01-01T00:00:00Z'),
    vehicleId: overrides.vehicleId ?? 10,
    mechanicId: overrides.mechanicId ?? null,
    deletedAt: overrides.deletedAt ?? null,
  }).toJSON();
  return { ...base, ...overrides };
}

export function makeDiagnosisEntity(overrides: Partial<ReturnType<DiagnosisEntity['toJSON']>> = {}) {
  return DiagnosisEntity.restore(makeDiagnosis(overrides) as any);
}

export function notFound(message: string) {
  return new NotFoundServerException(message);
}
