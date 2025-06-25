import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '@prisma/client';
import { Config } from '../../config/config';
import { hasRolesOrAdmin } from '../hasRolesOrAdmin';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, private readonly config: Config) {}

  canActivate(context: ExecutionContext) {
    if (this.config.jwt.disableValidation) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const ctx = GqlExecutionContext.create(context);
    const user = ctx.getContext().req.user;
    if (!user) return false;

    if (user.roles.includes('ADMIN')) {
      //If the user is an admin, we allow to do everything
      return true;
    }

    return hasRolesOrAdmin(user, ...requiredRoles);
  }
}
