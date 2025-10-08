export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  type: string;
  cpf?: string;
  cnpj?: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export function validateCreateUserDTO(input: any) {
  if (!input || typeof input !== 'object') {
    throw new Error('Body inválido');
  }

  const requiredStr = ['name', 'email', 'password', 'type', 'phone'];
  for (const k of requiredStr) {
    if (typeof input[k] !== 'string' || !input[k]) {
      throw new Error(`${k} é obrigatório`);
    }
  }

  // CPF ou CNPJ: pelo menos um
  if (!input.cpf && !input.cnpj) {
    throw new Error('CPF ou CNPJ deve ser informado');
  }

  if (input.cpf && !/^\d{11}$/.test(input.cpf)) {
    throw new Error('CPF deve conter 11 números');
  }

  if (input.cnpj && !/^\d{14}$/.test(input.cnpj)) {
    throw new Error('CNPJ deve conter 14 números');
  }
}