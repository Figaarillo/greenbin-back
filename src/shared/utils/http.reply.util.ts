import { type FastifyReply } from 'fastify'

/* eslint-disable @typescript-eslint/no-extraneous-class */
export enum HTTPStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500
}

export default class HandleHTTPResponse {
  static OK(rep: FastifyReply, message: string, data?: any): void {
    rep.status(HTTPStatus.OK).send({
      status: HTTPStatus.OK,
      message,
      data
    })
  }

  static Created(rep: FastifyReply, message: string, data?: any): void {
    rep.status(HTTPStatus.CREATED).send({
      status: HTTPStatus.CREATED,
      message,
      data
    })
  }

  static BadRequest(rep: FastifyReply, message: string, data?: any): void {
    rep.status(HTTPStatus.BAD_REQUEST).send({
      status: HTTPStatus.BAD_REQUEST,
      message,
      data
    })
  }

  static Unauthorized(rep: FastifyReply, message: string, data?: any): void {
    rep.status(HTTPStatus.UNAUTHORIZED).send({
      status: HTTPStatus.UNAUTHORIZED,
      message,
      data
    })
  }

  static Forbidden(rep: FastifyReply, message: string, data?: any): void {
    rep.status(HTTPStatus.FORBIDDEN).send({
      status: HTTPStatus.FORBIDDEN,
      message,
      data
    })
  }

  static NotFound(rep: FastifyReply, message: string, data?: any): void {
    rep.status(HTTPStatus.NOT_FOUND).send({
      status: HTTPStatus.NOT_FOUND,
      message,
      data
    })
  }

  static InternalServerError(rep: FastifyReply, message: string, data?: any): void {
    rep.status(HTTPStatus.INTERNAL_SERVER_ERROR).send({
      status: HTTPStatus.INTERNAL_SERVER_ERROR,
      message,
      data
    })
  }
}
