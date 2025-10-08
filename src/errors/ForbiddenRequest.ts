export default class ForbiddenRequest extends Error {
  public readonly statusCode: number;

  constructor(message: string) {
    super(message);
    this.statusCode = 403;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}
