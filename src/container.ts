import { InMemoryVehicleRepository } from './administrative-management/vehicle/repositories/InMemoryVehicleRepository';
import { CreateVehicleUseCase } from './administrative-management/vehicle/usecases/CreateVehicleUseCase';
import { ListVehiclesUseCase } from './administrative-management/vehicle/usecases/ListVehiclesUseCase';
import { GetVehicleUseCase } from './administrative-management/vehicle/usecases/GetVehicleUseCase';
import { UpdateVehicleUseCase } from './administrative-management/vehicle/usecases/UpdateVehicleUseCase';
import { DeleteVehicleUseCase } from './administrative-management/vehicle/usecases/DeleteVehicleUseCase';
import { VehicleController } from './administrative-management/vehicle/controllers/VehicleController';

import { PrismaUserRepository } from './auth-and-access/user/repositories/PrismaUserRepository';
import { CreateUserUseCase } from './auth-and-access/user/usecases/CreateUserUseCase';
import { UpdateUserUseCase } from './auth-and-access/user/usecases/UpdateUserUseCase';
import { DeleteUserUseCase } from './auth-and-access/user/usecases/DeleteUserUseCase';
import { FindByIdUseCase } from './auth-and-access/user/usecases/FindByIdUseCase';
import { UserController } from './auth-and-access/user/controllers/UserController';

import { LoginUseCase } from './auth-and-access/auth/usecases/LoginUseCase';
import { RefreshTokenUseCase } from './auth-and-access/auth/usecases/RefreshTokenUseCase';
import { AuthController } from './auth-and-access/auth/controllers/AuthController';

// Controllers Vehicle
const vehicleRepo = new InMemoryVehicleRepository();
const createVehicleUseCase = new CreateVehicleUseCase(vehicleRepo);
const listVehiclesUseCase = new ListVehiclesUseCase(vehicleRepo);
const getVehicleUseCase = new GetVehicleUseCase(vehicleRepo);
const updateVehicleUseCase = new UpdateVehicleUseCase(vehicleRepo);
const deleteVehicleUseCase = new DeleteVehicleUseCase(vehicleRepo);

export const vehicleController = new VehicleController(
  createVehicleUseCase,
  listVehiclesUseCase,
  getVehicleUseCase,
  updateVehicleUseCase,
  deleteVehicleUseCase,
);

// Controllers User
const userRepo = new PrismaUserRepository();
const createUserUC = new CreateUserUseCase(userRepo);
const updateUserUC = new UpdateUserUseCase(userRepo);
const deleteUserUC = new DeleteUserUseCase(userRepo);
const findByIdUC = new FindByIdUseCase(userRepo);

export const userController = new UserController(
  createUserUC,
  updateUserUC,
  deleteUserUC,
  findByIdUC,
);

// AUTH
const authUserRepo = new PrismaUserRepository();
const loginUC = new LoginUseCase(authUserRepo);
const refreshUC = new RefreshTokenUseCase(authUserRepo);

export const authController = new AuthController(loginUC, refreshUC);
