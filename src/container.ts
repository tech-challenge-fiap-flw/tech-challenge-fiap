import { InMemoryVehicleRepository } from './administrative-management/vehicle/repositories/InMemoryVehicleRepository';
import { CreateVehicleUseCase } from './administrative-management/vehicle/usecases/CreateVehicleUseCase';
import { ListVehiclesUseCase } from './administrative-management/vehicle/usecases/ListVehiclesUseCase';
import { GetVehicleUseCase } from './administrative-management/vehicle/usecases/GetVehicleUseCase';
import { UpdateVehicleUseCase } from './administrative-management/vehicle/usecases/UpdateVehicleUseCase';
import { DeleteVehicleUseCase } from './administrative-management/vehicle/usecases/DeleteVehicleUseCase';
import { VehicleController } from './administrative-management/vehicle/controllers/VehicleController';

const vehicleRepo = new InMemoryVehicleRepository();

const createVehicleUseCase = new CreateVehicleUseCase(vehicleRepo);
const listVehiclesUseCase = new ListVehiclesUseCase(vehicleRepo);
const getVehicleUseCase = new GetVehicleUseCase(vehicleRepo);
const updateVehicleUseCase = new UpdateVehicleUseCase(vehicleRepo);
const deleteVehicleUseCase = new DeleteVehicleUseCase(vehicleRepo);

const vehicleController = new VehicleController(
  createVehicleUseCase,
  listVehiclesUseCase,
  getVehicleUseCase,
  updateVehicleUseCase,
  deleteVehicleUseCase,
);

export { vehicleController };
