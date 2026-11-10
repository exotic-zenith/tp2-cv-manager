/**
 * Les roles de l'application.
 *
 * Le proprietaire de l'application peut ajouter un role a tout moment :
 * il suffit d'ajouter une ligne ici, puis de l'utiliser dans @Roles(...).
 * Le RolesGuard, lui, n'a pas besoin d'etre modifie (voir roles.guard.ts).
 */
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}
