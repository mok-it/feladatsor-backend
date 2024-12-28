import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { createParamDecoratorWithInjections } from 'nestjs-create-param-decorator-with-injections';
import { UserService } from '../../user/user.service';
import { Config } from '../../config/config';

export const CurrentUser = createParamDecoratorWithInjections(
  async (data: unknown, context: ExecutionContext, { userService, config }) => {
    if (config.jwt.disableValidation) {
      return await userService.upsertTechnicalUser();
    }
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.user;
  },
  {
    userService: UserService,
    config: Config,
  },
);
