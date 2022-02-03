import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const getConfig = (): ENV => ({
  NODE_ENV: process.env.NODE_ENV,
  TOKEN_SECRET: process.env.TOKEN_SECRET,
  MONGO_URL: process.env.MONGO_URL,
  MONGO_TEST_URL: process.env.MONGO_TEST_URL
});

const getSanitzedConfig = (rawConfig: ENV): Config => {
  for(const [key, value] of Object.entries(rawConfig)) {
    if(value === undefined) throw new Error(`Missing required key ${key} in .env`);
  }
  return rawConfig as Config;
};

const sanitizedConfig = getSanitzedConfig(getConfig());

export default sanitizedConfig;