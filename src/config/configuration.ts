/**
 * Un seul endroit ou lire le .env.
 *
 * Pourquoi ne pas ecrire process.env.JWT_SECRET directement partout ?
 * Parce que les options passees a @Module(...) sont evaluees AU MOMENT
 * OU LE FICHIER EST IMPORTE, donc parfois AVANT que ConfigModule n'ait
 * charge le .env. On obtiendrait alors "undefined".
 * La solution propre est d'utiliser les versions "...Async" des modules
 * (forRootAsync / registerAsync) qui, elles, sont evaluees plus tard,
 * une fois la configuration disponible. Ce fichier regroupe les cles.
 */
export const CONFIG_KEYS = {
  DB_HOST: 'DB_HOST',
  DB_PORT: 'DB_PORT',
  DB_USER: 'DB_USER',
  DB_PASSWORD: 'DB_PASSWORD',
  DB_NAME: 'DB_NAME',
  PORT: 'PORT',
  JWT_SECRET: 'JWT_SECRET',
  JWT_EXPIRES_IN: 'JWT_EXPIRES_IN',
} as const;
