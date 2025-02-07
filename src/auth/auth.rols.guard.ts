import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class RolsGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    console.log(user)
    if (user.rol !== 1) {
      throw new ForbiddenException('Solo los administradores pueden acceder a esta ruta.');
    }

    return true;
  }
}