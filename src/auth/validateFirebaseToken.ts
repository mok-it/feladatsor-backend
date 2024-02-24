import { Config } from '../config/config';

const config = new Config();
export const validateFirebaseToken = async (token: string) => {
  const res = await fetch(config.firebaseValidateUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  });
  if (res.status !== 200) {
    return false;
  }
  const json = await res.json();
  return json.valid;
};
