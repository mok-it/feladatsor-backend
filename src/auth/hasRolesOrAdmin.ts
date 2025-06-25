import { Role, User as PrismaUser } from '@prisma/client';
import { User as GQLUser } from '../graphql/graphqlTypes';

export const hasRolesOrAdmin = (
  user: PrismaUser | GQLUser,
  ...roles: Role[]
) => {
  const hasRole = user.roles.some((role) => roles.includes(role));
  const isAdmin = user.roles.includes('ADMIN' as any);

  return hasRole || isAdmin;
};
