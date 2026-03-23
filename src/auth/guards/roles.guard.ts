import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { user_role } from "src/users/entities/user.entity";
import { ROLES_KEY } from "../decorators/roles.decorator";

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const requriedRoles = this.reflector.getAllAndOverride<user_role[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()]
        );

        if (!requriedRoles || requriedRoles.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user as { role?: user_role };

        if (!requriedRoles.includes(user.role as user_role)) {
            throw new ForbiddenException('Only admins can access this route');
        }
        return true;
    }
}