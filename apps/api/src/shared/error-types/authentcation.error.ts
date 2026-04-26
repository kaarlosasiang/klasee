export class AuthenticationError extends Error {
  status = 401;
  constructor(message: string) {
    super(message);
    this.name = "AuthenticationError";
  }
}
