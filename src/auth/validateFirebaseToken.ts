import { Config } from '../config/config';
import { Logger } from '@nestjs/common';

const config = new Config();
const logger = new Logger('FirebaseValidator');

export const validateFirebaseToken = async (token: string) => {
  const res = await fetch(config.firebaseValidateUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  });
  if (res.status !== 200) {
    logger.warn('Error while validating firebase token', res);
    return false;
  }
  const json = await res.json();
  return json.valid;
};
