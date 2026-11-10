import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../user/entities/user.entity';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

/**
 * Decorateur de parametre maison.
 *
 * Passport, apres avoir valide le JWT, depose le user dans request.user.
 * Plutot que d'ecrire @Req() req puis req.user dans chaque controleur,
 * on ecrit simplement :
 *      getProfile(@CurrentUser() user: User)
 *      getId(@CurrentUser('id') id: number)
 */
export const CurrentUser = createParamDecorator(
  (data: keyof User | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
