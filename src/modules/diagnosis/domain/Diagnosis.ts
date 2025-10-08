export type DiagnosisId = number;

export interface DiagnosisProps {
  id?: DiagnosisId;
  description: string;
  creationDate: Date;
  vehicleId: number;
  responsibleMechanicId?: number | null;
  deletedAt?: Date | null;
}

export class DiagnosisEntity {
  private props: DiagnosisProps;
  private constructor(props: DiagnosisProps) { this.props = props; }
  static create(input: Omit<DiagnosisProps, 'id' | 'creationDate' | 'deletedAt'>) {
    return new DiagnosisEntity({ ...input, creationDate: new Date(), deletedAt: null });
  }
  static restore(props: DiagnosisProps) { return new DiagnosisEntity(props); }
  toJSON(): DiagnosisProps { return { ...this.props }; }
}
