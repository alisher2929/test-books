import {
    Injectable,
    ExecutionContext,
    CanActivate,
    UnauthorizedException,
} from '@nestjs/common'
import { UserRoles } from '@prisma/books-client'

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private readonly _roles: UserRoles[]) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest()
        const role = request.user?.role

        if (!role || !this._roles.includes(role)) {
            throw new UnauthorizedException()        
        }
        return true
    }
}
