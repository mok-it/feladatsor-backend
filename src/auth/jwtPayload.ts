export type JwtPayload = {
  subject: string;
  user_name: string;
  iat: number;
  exp: number;
};
