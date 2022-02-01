declare global {
  export interface AuthHeader extends Headers {
    authorization: string;
  }
  
  export interface JwtPayload {
    data: string;
  }

  export interface UserType {
    _id: string
  }
  
  export interface TypedRequestParams<T> extends Express.Request {
    params: T;
  }

  namespace Express {
    interface Request {
        user?: string
    }
  }
}

export {}

 declare module 'express-serve-static-core' {
    export interface Request {
      user?: string;
      headers?: AuthHeader;
      //body?: T;
    }
  }


