# TP2 NestJS — RT4 2026/2027 — Gestionnaire de CVs

API REST NestJS 11 + TypeORM/MySQL : gestion de CVs, de compétences et
d'utilisateurs, avec authentification JWT (Passport) et autorisation par rôles.

> Une explication complète, exercice par exercice et ligne par ligne, se trouve
> dans **`../EXPLICATION-TP2.txt`**.

## Prérequis

- Node.js 18+
- Un serveur MySQL démarré, avec une base `cv_db` créée :

```sql
CREATE DATABASE IF NOT EXISTS cv_db;
```

## Configuration

Copier `.env.example` en `.env` et renseigner les valeurs :

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=cv_db
PORT=3000
JWT_SECRET=...
JWT_EXPIRES_IN=3600
```

## Commandes

```bash
npm install
npm run start:dev    # serveur en mode watch sur http://localhost:3000
npm run seed:cvs     # remplit la base (10 skills, 1 admin, 5 users, 15 cvs)
npm run build
npm run lint
```

Comptes créés par le seed : `admin / admin123` (rôle admin) et 5 comptes
utilisateurs avec le mot de passe `user123`.

## Branches

| Branche  | Contenu |
|----------|---------|
| `master` | Exercices 1 à 3 : `AuthMiddleware` actif sur les routes d'écriture de `/todo`, entités `Cv`/`Skill`/`User` et leurs relations, seed via standalone application. |
| `auth`   | Middleware désactivé, `AuthModule` (bcrypt + JWT), `JwtStrategy` Passport, `JwtAuthGuard`, `RolesGuard` (RBAC), règles de propriété sur les CVs. |

## Endpoints (branche `auth`)

| Méthode | Route            | Accès |
|---------|------------------|-------|
| POST    | `/auth/signup`   | public |
| POST    | `/auth/login`    | public — renvoie `access_token` |
| GET     | `/auth/me`       | connecté |
| GET     | `/cv`            | connecté — admin : tous, user : les siens |
| GET     | `/cv/search`     | connecté — recherche paginée |
| POST    | `/cv`            | connecté — le propriétaire est le user connecté |
| GET/PATCH/DELETE | `/cv/:id` | propriétaire ou admin |
| GET     | `/skill`         | connecté |
| POST/PATCH/DELETE | `/skill`, `/skill/:id` | admin |
| GET     | `/user/me`       | connecté |
| GET/PATCH/DELETE | `/user`, `/user/:id` | admin |
| GET     | `/todo`, `/todo/:id` | public |
| POST/PATCH/DELETE | `/todo`, `/todo/:id` | connecté — seul le créateur modifie/supprime |

Sur la branche `master`, les routes d'écriture de `/todo` attendent à la place
un header `auth-user` contenant un JWT porteur d'un `userId`.

## Architecture

```
src/
├── common/          code partagé : BaseEntity, GenericCrudService<T>,
│                    messages d'erreur, middleware, guards, décorateurs
├── config/          clés des variables d'environnement
├── user/ skill/ cv/ todo/    modules métier (module/controller/service/entity/dto)
├── auth/            signup, login, JwtStrategy (branche auth)
└── commands/        cv.seeder.ts — standalone application
```

La factorisation demandée par le TP est portée par `BaseEntity`
(`createdAt`/`updatedAt`/`deletedAt`) et `GenericCrudService<T>` (les six
opérations CRUD écrites une seule fois, héritées par chaque service métier).
