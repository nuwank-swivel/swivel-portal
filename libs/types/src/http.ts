import { StatusCodes } from 'http-status-codes';

export class HttpError extends Error {
  statusCode: number;

  constructor(statusCode: StatusCodes, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'HttpError';
  }
}
