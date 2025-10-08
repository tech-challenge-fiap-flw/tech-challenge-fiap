# Migration Notes: Nest.js to Node + Express (Clean Architecture)

## Overview
This codebase was migrated from Nest.js to a Clean Architecture setup using Express, with manual repositories (mysql2) and Mongo via the official driver. DDD/SOLID principles structure the modules into domain/application/infra/http.

## Environments
- MySQL: DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE
- Mongo: MONGO_URI (e.g., mongodb://localhost:27017), MONGO_DB (default tech_challenge)
- App: PORT (default 3000), JWT_SECRET

## Entry Point
- Server: src/server.ts
- Health: GET /health

## Auth
- POST /auth/login → returns JWT (1h)
- Protected routes use Authorization: Bearer <token> and populate req.user = { sub, email, type }

## Modules (implemented)
- User: domain/application/infra/http, repository MySQL manual
- Vehicle: domain/application/infra/http, repository MySQL manual
- Vehicle Part: domain/infra/http, repository MySQL manual
- Vehicle Service: domain/infra/http, repository MySQL manual
- Diagnosis: domain/application/infra/http, repository MySQL manual
- Service Order History: domain/infra (Mongo repository)

## Pending/Next
- Optional: refresh tokens e guards por role mais avançados
- GETs de listagem paginada para todos os módulos (implementado)
- Scripts DDL (MySQL) definitivos c/ índices e FKs (rasa versão em src/infra/db/schema.sql)
- Documentação OpenAPI (manual) caso seja requerida no futuro (sem Swagger)

## Database Sketch (MySQL)
Tables expected by repositories (simplified):
- users(id, name, email unique, password, type, active, creationDate, cpf, cnpj, phone, address, city, state, zipCode)
- vehicles(id, idPlate unique, type, model, brand, manufactureYear, modelYear, color, ownerId, deletedAt)
- vehicle_parts(id, type, name, description, quantity, price, deletedAt, creationDate)
- vehicle_services(id, name, price, description, deletedAt)
- diagnosis(id, description, creationDate, vehicleId, responsibleMechanicId, deletedAt)
- budgets(id, description, ownerId, diagnosisId, total, creationDate, deletedAt)
- budget_vehicle_parts(id, budgetId, vehiclePartId, quantity, price)
- budget_vehicle_services(id, budgetId, vehicleServiceId, price)
- service_orders(id, description, creationDate, currentStatus, budgetId, customerId, mechanicId, vehicleId, active)

Mongo Collections:
- service_order_history: { _id, idServiceOrder, userId, oldStatus?, newStatus, changedAt }

## Notes
- All TypeORM/Nest artifacts removed; tsconfig includes only new modules.
- Manual SQL uses mysql2/promise with pooled connections.
- Keep migrations/DDL scripts in infra/db as needed (not included here).
 - Rotas montadas em src/server.ts; módulos seguem domain/application/infra/http.

## Pagination
- Query params: page (default 1), limit (default 10, max 100)
- Shape: { items: T[], page: number, limit: number, count: number, total: number, totalPages: number }
- Helper: src/shared/http/pagination.ts

Available list endpoints:
- GET /users (admin)
- GET /vehicles
- GET /vehicle-parts
- GET /vehicle-services
- GET /diagnosis
- GET /budgets (admin)
- GET /service-orders (admin)

## Database initialization
1. Configure .env with MySQL and Mongo settings.
2. Run DDL to create tables:
	- Load file: src/infra/db/schema.sql in your MySQL instance.
3. Seed at least one admin user directly in DB to access admin routes.
4. Start app and test health: GET /health.
