import { UserRoles } from '@prisma/booksCollection-client';

export class UserType {
  id: string;
  username: string;
  email: string;
  role: UserRoles;
  created_at: Date;
  updated_at: Date;
}
