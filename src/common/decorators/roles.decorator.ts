import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../enums/user-role.enum';

/** Cle sous laquelle les roles requis sont stockes dans les metadata. */
export const ROLES_KEY = 'roles';

/**
 * Decorateur maison : @Roles(UserRole.ADMIN) au dessus d'une route
 * ou d'un controleur. Il attache la liste des roles autorises aux
 * metadata de la methode ; c'est le RolesGuard qui les relira.
 *
 * On passe par un decorateur dedie plutot que @SetMetadata('roles', [...])
 * directement : c'est la bonne pratique recommandee par la doc Nest
 * (code plus lisible et cle centralisee).
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
