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
  technicalUser2 = {
    name: get('TECHNICAL_USER2_NAME').default('Technical User 2').asString(),
    username: get('TECHNICAL_USER2_USERNAME')
      .default('technical_user_2')
      .asString(),
    defaultPassword: get('TECHNICAL_USER2_DEFAULT_PASSWORD')
      .default('technical_user_2_password')
      .asString(),
    email: get('TECHNICAL_USER2_EMAIL')
      .default('technical2@localhost')
      .asString(),
  };
  technicalUser3 = {
    name: get('TECHNICAL_USER3_NAME').default('Technical User 3').asString(),
    username: get('TECHNICAL_USER3_USERNAME')
      .default('technical_user_3')
      .asString(),
    defaultPassword: get('TECHNICAL_USER3_DEFAULT_PASSWORD')
      .default('technical_user_3_password')
      .asString(),
    email: get('TECHNICAL_USER3_EMAIL')
      .default('technical3@localhost')
      .asString(),
  };
  sharepointCookie = get('SHAREPOINT_COOKIE').default('').asString();
}
