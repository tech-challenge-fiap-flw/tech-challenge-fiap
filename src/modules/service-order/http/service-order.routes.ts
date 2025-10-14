import { Router } from 'express';
import { authMiddleware } from '../../auth/AuthMiddleware';
import { adaptExpress } from '../../../shared/http/Controller';
import { ServiceOrderMySqlRepository } from '../infra/ServiceOrderMySqlRepository';
import { ServiceOrderService } from '../application/ServiceOrderService';
import { CreateServiceOrderController } from './controllers/CreateServiceOrderController';
import { DiagnosisMySqlRepository } from '../../../modules/diagnosis/infra/DiagnosisMySqlRepository';
import { DiagnosisService } from '../../../modules/diagnosis/application/DiagnosisService';
import { VehicleMySqlRepository } from '../../../modules/vehicle/infra/VehicleMySqlRepository';
import { VehicleService } from '../../../modules/vehicle/application/VehicleService';
import { UserMySqlRepository } from '../../../modules/user/infra/UserMySqlRepository';
import { UserService } from '../../../modules/user/application/UserService';
import { BudgetMySqlRepository } from '../../../modules/budget/infra/BudgetMySqlRepository';
import { BudgetService } from '../../../modules/budget/application/BudgetService';
import { VehiclePartMySqlRepository } from '../../../modules/vehicle-part/infra/VehiclePartMySqlRepository';
import { VehiclePartService } from '../../../modules/vehicle-part/application/VehiclePartService';
import { BudgetVehiclePartMySqlRepository } from '../../../modules/budget-vehicle-part/infra/BudgetVehiclePartMySqlRepository';
import { BudgetVehiclePartService } from '../../../modules/budget-vehicle-part/application/BudgetVehiclePartService';
import { VehicleServiceMySqlRepository } from '../../../modules/vehicle-service/infra/VehicleServiceMySqlRepository';
import { VehicleServiceService } from '../../../modules/vehicle-service/application/VehicleServiceService';
import { BudgetVehicleServiceMySqlRepository } from '../../../modules/budget-vehicle-service/infra/BudgetVehicleServiceMySqlRepository';
import { BudgetVehicleServiceService } from '../../../modules/budget-vehicle-service/application/BudgetVehicleServiceService';
import { BcryptPasswordHasher } from '../../../modules/user/infra/BcryptPasswordHasher';
import { AcceptServiceOrderController } from './controllers/AcceptServiceOrderController';
import { AssignBudgetServiceOrderController } from './controllers/AssignBudgetServiceOrderController';
import { StartRepairServiceOrderController } from './controllers/StartRepairServiceOrderController';
import { FinishRepairServiceOrderController } from './controllers/FinishRepairServiceOrderController';
import { DeliveredServiceOrderController } from './controllers/DeliveredServiceOrderController';
import { DeleteServiceOrderController } from './controllers/DeleteServiceOrderController';
import { GetServiceOrderController } from './controllers/GetServiceOrderController';
import { ServiceOrderHistoryMongoRepository } from '../../../modules/service-order-history/infra/ServiceOrderHistoryMongoRepository';
import { ServiceOrderHistoryService } from '../../../modules/service-order-history/application/ServiceOrderHistoryService';
import { NodemailerEmailService } from '../../../shared/mail/NodemailerEmailService';
import { AcceptBudgetServiceOrderController } from './controllers/AcceptBudgetServiceOrderController';

const userRepository = new UserMySqlRepository();
const userPasswordHasher = new BcryptPasswordHasher();
const userService = new UserService(userRepository, userPasswordHasher);

const vehicleRepository = new VehicleMySqlRepository();
const vehicleService = new VehicleService(vehicleRepository, userService);

const diagnosisRepository = new DiagnosisMySqlRepository();
const diagnosisService = new DiagnosisService(diagnosisRepository, vehicleService, userService);

const vehiclePartRepo = new VehiclePartMySqlRepository();
const vehiclePartService = new VehiclePartService(vehiclePartRepo);

const budgetVehiclePartRepo = new BudgetVehiclePartMySqlRepository();
const budgetVehiclePartService = new BudgetVehiclePartService(budgetVehiclePartRepo);

const vehicleServiceRepo = new VehicleServiceMySqlRepository();
const vehicleServiceService = new VehicleServiceService(vehicleServiceRepo);

const budgetVehicleServiceRepo = new BudgetVehicleServiceMySqlRepository();
const budgetVehicleServiceService = new BudgetVehicleServiceService(budgetVehicleServiceRepo);

const historyRepository = new ServiceOrderHistoryMongoRepository();
const emailService = new NodemailerEmailService();
const historyService = new ServiceOrderHistoryService(historyRepository, emailService, new ServiceOrderMySqlRepository(), userRepository);

const budgetRepository = new BudgetMySqlRepository();
const budgetService = new BudgetService(
  budgetRepository,
  userService,
  diagnosisService,
  vehiclePartService,
  budgetVehiclePartService,
  vehicleServiceService,
  budgetVehicleServiceService,
  historyService
);

const repository = new ServiceOrderMySqlRepository();
const service = new ServiceOrderService(
  repository,
  diagnosisService,
  budgetService,
  budgetVehiclePartService,
  vehiclePartService,
  historyService
);

export const serviceOrderRouter = Router();

serviceOrderRouter.post('/', authMiddleware, adaptExpress(new CreateServiceOrderController(service)));
serviceOrderRouter.delete('/:id', authMiddleware, adaptExpress(new DeleteServiceOrderController(service)));
serviceOrderRouter.get('/:id', authMiddleware, adaptExpress(new GetServiceOrderController(service)));
serviceOrderRouter.post('/:id/accept', authMiddleware, adaptExpress(new AcceptServiceOrderController(service)));
serviceOrderRouter.post('/:id/budget', authMiddleware, adaptExpress(new AssignBudgetServiceOrderController(service)));
serviceOrderRouter.post('/:id/start', authMiddleware, adaptExpress(new StartRepairServiceOrderController(service)));
serviceOrderRouter.post('/:id/finish', authMiddleware, adaptExpress(new FinishRepairServiceOrderController(service)));
serviceOrderRouter.post('/:id/delivered', authMiddleware, adaptExpress(new DeliveredServiceOrderController(service)));
serviceOrderRouter.post('/:id/accept-budget', authMiddleware, adaptExpress(new AcceptBudgetServiceOrderController(service)));
