declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: string;
      TOKEN_SECRET: string;
      MONGO_URL: string;
      MONGO_TEST_URL: string;
    }
  }
  
  interface ENV {
    NODE_ENV: string | undefined;
    TOKEN_SECRET: string | undefined;
    MONGO_URL: string | undefined;
    MONGO_TEST_URL: string | undefined;
  }
  
  interface Config {
    NODE_ENV: string;
    TOKEN_SECRET: string;
    MONGO_URL: string;
    MONGO_TEST_URL: string;
  }

  interface JwtPayload {
    data: string;
  }

  interface UserType {
    _id: string
  }

  namespace Express {
    interface Request {
        user?: string
    }

    interface Headers {
      authorization: string;
    }
  }
}

export {}
