import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { JwtStrategy } from './guards/passport-strategy';
import { Config } from '../config/config';
import { AuthenticateUser } from './authenticate-user-use-case';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { ConfigModule } from '../config/config.module';
import { RolesGuard } from './guards/roles.guard';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwt-auth-guard';

const config = new Config();

@Module({
  imports: [
    JwtModule.register({
      secret: config.jwt.secret,
      signOptions: { expiresIn: config.jwt.expiration },
    }),
    UserModule,
    ConfigModule,
  ],
  providers: [
    JwtStrategy,
    AuthenticateUser,
    AuthResolver,
    AuthService,
    RolesGuard,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  //exports: [JwtStrategy, JwtModule],
})
export class AuthModule {}
