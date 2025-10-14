import { Router } from 'express';
import { authMiddleware } from '../../auth/AuthMiddleware';
import { adaptExpress } from '../../../shared/http/Controller';
import { BudgetMySqlRepository } from '../infra/BudgetMySqlRepository';
import { BudgetService } from '../application/BudgetService';
import { BudgetVehiclePartMySqlRepository } from '../../budget-vehicle-part/infra/BudgetVehiclePartMySqlRepository';
import { BudgetVehiclePartService } from '../../budget-vehicle-part/application/BudgetVehiclePartService';
import { BudgetVehicleServiceMySqlRepository } from '../../budget-vehicle-service/infra/BudgetVehicleServiceMySqlRepository';
import { BudgetVehicleServiceService } from '../../budget-vehicle-service/application/BudgetVehicleServiceService';
import { VehiclePartMySqlRepository } from '../../vehicle-part/infra/VehiclePartMySqlRepository';
import { VehiclePartService } from '../../vehicle-part/application/VehiclePartService';
import { VehicleServiceMySqlRepository } from '../../vehicle-service/infra/VehicleServiceMySqlRepository';
import { VehicleServiceService } from '../../vehicle-service/application/VehicleServiceService';
import { CreateBudgetController } from './controllers/CreateBudgetController';
import { UserMySqlRepository } from '../../../modules/user/infra/UserMySqlRepository';
import { UserService } from '../../../modules/user/application/UserService';
import { BcryptPasswordHasher } from '../../user/infra/BcryptPasswordHasher';
import { DiagnosisService } from '../../../modules/diagnosis/application/DiagnosisService';
import { VehicleMySqlRepository } from '../../../modules/vehicle/infra/VehicleMySqlRepository';
import { VehicleService } from '../../../modules/vehicle/application/VehicleService';
import { DiagnosisMySqlRepository } from '../../../modules/diagnosis/infra/DiagnosisMySqlRepository';
import { FindBudgetController } from './controllers/FindBudgetController';
import { requireRole } from '../../../modules/auth/RoleMiddleware';

const budgetRepo = new BudgetMySqlRepository();

const userRepository = new UserMySqlRepository();
const userPasswordHasher = new BcryptPasswordHasher();
const userService = new UserService(userRepository, userPasswordHasher);

const vehiclePartRepo = new VehiclePartMySqlRepository();
const vehiclePartService = new VehiclePartService(vehiclePartRepo);

const budgetVehiclePartRepo = new BudgetVehiclePartMySqlRepository();
const budgetVehiclePartService = new BudgetVehiclePartService(budgetVehiclePartRepo);

const vehicleRepository = new VehicleMySqlRepository();
const vehicleService = new VehicleService(vehicleRepository, userService);

const vehicleServiceRepo = new VehicleServiceMySqlRepository();
const vehicleServiceService = new VehicleServiceService(vehicleServiceRepo);

const budgetVehicleServiceRepo = new BudgetVehicleServiceMySqlRepository();
const budgetVehicleServiceService = new BudgetVehicleServiceService(budgetVehicleServiceRepo);

const diagnosisRepo = new DiagnosisMySqlRepository();
const diagnosisService = new DiagnosisService(diagnosisRepo, vehicleService, userService);

const budgetService = new BudgetService(
  budgetRepo,
  userService,
  diagnosisService,
  vehiclePartService,
  budgetVehiclePartService,
  vehicleServiceService,
  budgetVehicleServiceService,
);

export const budgetRouter = Router();

budgetRouter.post('/', authMiddleware, requireRole('admin'), adaptExpress(new CreateBudgetController(budgetService)));
budgetRouter.get('/:id', authMiddleware, adaptExpress(new FindBudgetController(budgetService)));
