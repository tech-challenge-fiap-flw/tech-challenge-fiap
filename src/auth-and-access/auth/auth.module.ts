import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthService } from './domain/services/auth.service';
import { AuthController } from './presentation/controllers/auth.controller';
import { LocalStrategy } from './infrastructure/strategies/local.strategy';
import { UserModule } from 'src/auth-and-access/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { LoginValidationMiddleware } from './infrastructure/middlewares/login-validation.middleware';

@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '30d' },
      }),
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})

export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoginValidationMiddleware).forRoutes('login');
  }
}
