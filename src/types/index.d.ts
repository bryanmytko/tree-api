declare global {
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
