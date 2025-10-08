export interface UserResponseDTO {
  id: number;
  name: string;
  email: string;
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