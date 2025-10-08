export type UserId = number;

export interface UserProps {
  id?: UserId;
  name: string;
  email: string;
  password: string;
  type: string;
  active: boolean;
  creationDate: Date;
  cpf: string;
  cnpj?: string | null;
  phone: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
}

export class UserEntity {
  private props: UserProps;

  private constructor(props: UserProps) {
    this.props = props;
  }

  static create(props: Omit<UserProps, 'id' | 'creationDate' | 'active'>): UserEntity {
    return new UserEntity({
      ...props,
      id: undefined,
      active: true,
      creationDate: new Date(),
    });
  }

  static restore(props: UserProps): UserEntity {
    return new UserEntity(props);
  }

  toJSON(): UserProps {
    return { ...this.props };
  }
}
