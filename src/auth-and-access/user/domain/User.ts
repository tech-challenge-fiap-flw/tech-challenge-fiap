export interface UserProps {
  id: number;
  name: string;
  email: string;
  password: string; // hashed
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

export class User {
  readonly id: number;
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

  constructor(props: UserProps) {
    Object.assign(this, props);
  }
}