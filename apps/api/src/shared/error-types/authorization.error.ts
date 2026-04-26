export class AuthorizationError extends Error {
  public status: number;

  constructor(message: string) {
    super(message);
    this.name = "AuthorizationError";
    this.status = 403;
    Error.captureStackTrace(this, this.constructor);
  }
}
