/**
 * Tous les messages d'erreur de l'application sont centralises ici.
 * Objectif : ne jamais ecrire deux fois le meme texte dans le code.
 */
export const AUTH_ERRORS = {
  MISSING_HEADER: "Acces refuse : le header 'auth-user' est absent.",
  INVALID_TOKEN: 'Acces refuse : le token fourni est invalide ou expire.',
  MISSING_USER_ID: "Acces refuse : le token ne contient pas de 'userId'.",
  BAD_CREDENTIALS: 'Identifiants incorrects.',
  USERNAME_TAKEN: "Ce nom d'utilisateur est deja utilise.",
  EMAIL_TAKEN: 'Cet email est deja utilise.',
  NOT_AUTHENTICATED: 'Vous devez etre connecte pour acceder a cette ressource.',
  FORBIDDEN_ROLE:
    "Vous n'avez pas le role necessaire pour acceder a cette ressource.",
  NOT_OWNER: 'Vous ne pouvez manipuler que vos propres ressources.',
};

export const CRUD_ERRORS = {
  NOT_FOUND: (entity: string, id: number | string) =>
    `${entity} d'id ${id} introuvable.`,
  ALREADY_DELETED: (entity: string, id: number | string) =>
    `${entity} d'id ${id} est deja supprime.`,
};

export const VALIDATION_ERRORS = {
  REQUIRED: (champ: string) => `Le champ ${champ} est obligatoire.`,
  IS_STRING: (champ: string) =>
    `Le champ ${champ} doit etre une chaine de caracteres.`,
  IS_NUMBER: (champ: string) => `Le champ ${champ} doit etre un nombre.`,
  IS_EMAIL: 'Veuillez saisir un email valide.',
  MIN_LENGTH: (champ: string, min: number) =>
    `Le champ ${champ} doit contenir au moins ${min} caracteres.`,
  MAX_LENGTH: (champ: string, max: number) =>
    `Le champ ${champ} ne doit pas depasser ${max} caracteres.`,
};
