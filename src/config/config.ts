import { get } from 'env-var';

export class Config {
  applicationName: 'Nest Starter App';
  server = {
    host: get('HOST').default('0.0.0.0').asString(),
    port: get('PORT').default('3000').asString(),
    publicHost: get('PUBLIC_HOST').default('http://localhost').asString(),
  };
  jwt = {
    secret: get('JWT_SECRET').required().asString(),
    expiration: get('JWT_EXPIRATION').default('60s').asString(),
    disableValidation: get('DISABLE_JWT_VALIDATION').default('false').asBool(),
  };
  firebaseValidateUrl = get('FIREBASE_VALIDATE_URL').required().asUrlString();
  fileStorage = {
    saveFolder: get('FILE_STORAGE_FOLDER').default('./data').asString(),
    imageProcess: {
      resizeWidth: get('IMAGE_RESIZE_WIDTH').default(1920).asIntPositive(),
      resizeQuality: get('IMAGE_RESIZE_QUALITY').default(80).asIntPositive(),
    },
  };
  technicalUser = {
    name: get('TECHNICAL_USER_NAME').default('Technical User').asString(),
    username: get('TECHNICAL_USER_USERNAME')
      .default('technical_user')
      .asString(),
    defaultPassword: get('TECHNICAL_USER_DEFAULT_PASSWORD')
      .default('technical_user_password')
      .asString(),
    email: get('TECHNICAL_USER_EMAIL')
      .default('technical@localhost')
      .asString(),
  };
  sharepointCookie = get('SHAREPOINT_COOKIE').default('').asString();
}
