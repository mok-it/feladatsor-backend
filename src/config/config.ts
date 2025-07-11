import { get } from 'env-var';

export class Config {
  port = get('PORT').default('8080').asString();
  host = get('HOST').default('0.0.0.0').asString();

  server = {
    host: this.host,
    port: this.port,
    publicHost: get('PUBLIC_HOST')
      .default(`http://${this.host}:${this.port}`)
      .asString(),
  };
  jwt = {
    secret: get('JWT_SECRET').required().asString(),
    expiration: get('JWT_EXPIRATION').default('60s').asString(),
    disableValidation: get('DISABLE_JWT_VALIDATION').default('false').asBool(),
  };
  firebaseValidateUrl = get('FIREBASE_VALIDATE_URL').required().asUrlString();
  fileStorage = {
    imageFolder: get('FILE_STORAGE_FOLDER').default('./data').asString(),
    generatedArtifactFolder: get('FILE_STORAGE_FOLDER')
      .default('./generated')
      .asString(),
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
