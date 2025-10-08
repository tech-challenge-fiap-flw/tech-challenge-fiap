export default class NotFoundRequest extends Error {
  public readonly statusCode: number;

  constructor(message: string) {
    super(message);
    this.statusCode = 404;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}
