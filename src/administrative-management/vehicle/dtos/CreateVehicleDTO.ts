import BadRequest from "../../../errors/BadRequest";

export interface CreateVehicleDTO {
  idPlate: string;
  type: string;
  model: string;
  brand: string;
  manufactureYear: number;
  modelYear: number;
  color: string;
  ownerId?: number;
}

export function validateCreateVehicleDTO(input: any): asserts input is CreateVehicleDTO {
  const plateRegex = /^[A-Z]{3}\d{1}[A-Z0-9]{1}\d{2}$/;

  if (!input || typeof input !== 'object') {
    throw new BadRequest('Body inválido');
  }

  if (!plateRegex.test(input.idPlate)) {
    throw new BadRequest('Placa inválida (ex: ABC1234)');
  }

  for (const key of ['type', 'model', 'brand', 'color']) {
    if (typeof input[key] !== 'string' || !input[key]) {
      throw new BadRequest(`${key} é obrigatório`);
    }
  }

  for (const key of ['manufactureYear', 'modelYear']) {
    if (typeof input[key] !== 'number') {
      throw new BadRequest(`${key} deve ser número`);
    }
  }
}