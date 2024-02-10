import { get } from 'env-var';

export class Config {
  applicationName: 'Nest Starter App';
  server = {
    host: get('SERVER_HOST').default('0.0.0.0').asString(),
    port: get('SERVER_PORT').default('3000').asString(),
  };
  jwt = {
    secret: get('JWT_SECRET').required().asString(),
    expiration: get('JWT_EXPIRATION').default('60s').asString(),
  };
}
