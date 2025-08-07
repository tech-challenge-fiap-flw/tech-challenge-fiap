import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './auth-and-access/user/user.module';
import { AuthModule } from './auth-and-access/auth/auth.module';

import { AppService } from './app.service';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth-and-access/auth/infrastructure/guards/jwt-auth.guard';
import { AppController } from './app.controller';
import { VehicleModule } from './administrative-management/vehicle/vehicle.module';
import { DiagnosisModule } from './administrative-management/diagnosis/diagnosis.module';
import { VehiclePartModule } from './administrative-management/vehicle-part/vehicle-part.module';
import { BudgetModule } from './administrative-management/budget/budget.module';
import { BudgetVehiclePartModule } from './administrative-management/budget-vehicle-part/budget-vehicle-part.module';
import { ServiceOrderModule } from './service-order/service-order.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
    }),
    UserModule,
    VehicleModule,
    DiagnosisModule,
    VehiclePartModule,
    BudgetModule,
    AuthModule,
    BudgetVehiclePartModule,
    ServiceOrderModule,
  ],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  controllers: [AppController]
})
export class AppModule {}
