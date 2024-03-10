import { get } from 'env-var';

export class Config {
  applicationName: 'Nest Starter App';
  server = {
    host: get('HOST').default('0.0.0.0').asString(),
    port: get('PORT').default('3000').asString(),
  };
  jwt = {
    secret: get('JWT_SECRET').required().asString(),
    expiration: get('JWT_EXPIRATION').default('60s').asString(),
  };
  firebaseValidateUrl = get('FIREBASE_VALIDATE_URL').required().asUrlString();
}
