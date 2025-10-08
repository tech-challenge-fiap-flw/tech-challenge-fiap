export default class ConflictRequest extends Error {
  public readonly statusCode: number;

  constructor(message: string) {
    super(message);
    this.statusCode = 409;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}
