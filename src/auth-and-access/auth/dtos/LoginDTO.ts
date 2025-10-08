export interface LoginDTO {
  email: string;
  password: string;
}

export function validateLoginDTO(input: any): asserts input is LoginDTO {
  if (!input || typeof input !== 'object') {
    throw new Error('Body inválido');
  }

  if (typeof input.email !== 'string' || !input.email) {
    throw new Error('email é obrigatório');
  }

  if (typeof input.password !== 'string' || !input.password) {
    throw new Error('password é obrigatório');
  }
}
