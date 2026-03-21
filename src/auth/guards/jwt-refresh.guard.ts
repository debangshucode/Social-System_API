import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";


@Injectable()
export class jwtRefreshGuard extends AuthGuard ('jwt-refresh') {}