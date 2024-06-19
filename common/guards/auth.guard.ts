import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class JWTAuthGuard extends AuthGuard('jwt') implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest()
    
        if (!request || !request.headers.authorization) {
          throw new UnauthorizedException()
        }
    
        return (await super.canActivate(context)) as boolean
      }
    
      handleRequest(err: any, user: any): any {
        if (err || !user) {
          throw err || new UnauthorizedException()
        }
        return user
      }
}
