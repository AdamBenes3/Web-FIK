import { cleanEnv, num, str } from 'envalid';

const envSchema = {
  NODE_ENV: str({ choices: ['development', 'production']}),
  PORT: num({ default: 3000 }),
};

export const getConfig = (configObject: object) => {
  return cleanEnv(configObject, envSchema);
}
