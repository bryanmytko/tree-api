export interface RequestCustom extends Request {
  user?: string;
  body: any;
  headers: AuthHeader
}

export interface AuthHeader extends Headers {
  authorization: string;
}

export interface JwtPayload {
  data: string;
}