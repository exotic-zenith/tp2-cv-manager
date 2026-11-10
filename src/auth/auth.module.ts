import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { CONFIG_KEYS } from '../config/configuration';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    UserModule,

    // Strategie par defaut de Passport pour toute l'application.
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // Fournit le JwtService (sign / verify / decode).
    // registerAsync au lieu de register : la fabrique s'execute une fois
    // le .env charge, sinon secret vaudrait undefined.
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>(CONFIG_KEYS.JWT_SECRET),
        signOptions: {
          // Duree de validite du token, en secondes.
          expiresIn: Number(
            config.get<string>(CONFIG_KEYS.JWT_EXPIRES_IN) ?? 3600,
          ),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  // On exporte pour que les autres modules puissent s'appuyer sur la
  // strategie 'jwt' (utilisee par JwtAuthGuard).
  exports: [AuthService, JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule {}
