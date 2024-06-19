import { UserRoles } from '@prisma/books-client'

export class UserInputDto {
    userId: string
    role: UserRoles
}