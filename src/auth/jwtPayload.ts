import { Role } from '@prisma/client';

export type JwtPayload = {
  subject: string;
  user_name: string;
  roles: Role[];
  iat: number;
  exp: number;
};
