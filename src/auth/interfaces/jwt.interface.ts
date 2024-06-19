import { UserRoles } from '@prisma/booksCollection-client';

export interface JwtPayload {
  sub: string;
  role: UserRoles;
}
