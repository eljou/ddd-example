import { ParameterizedContext } from 'koa'
import Router from 'koa-router'
import { ZodType, z } from 'zod'

import { JSONType } from '@src/bounded-contexts/shared/custom-types'

type GetZodSchemaOutput<P extends ZodType> = P extends ZodType<infer O, infer D, infer I> ? O : never

type Path = string | string[] | RegExp
type Method = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'options' | 'head'

type AuthParams = {
  userName: string
  role: number
}
type KoaContex<
  IsPrivate extends boolean,
  ReqBody extends JSONType = null,
  ResBody extends JSONType = null,
> = (IsPrivate extends true
  ? ParameterizedContext<AuthParams, Router.IRouterParamContext<AuthParams, Record<string, never>>, ResBody>
  : ParameterizedContext<undefined, Router.IRouterParamContext<undefined, Record<string, never>>, ResBody>) & {
  request: ParameterizedContext['request'] & {
    body: ReqBody
  }
}

type RouteHandler<IsPrivate extends boolean, ReqBody extends JSONType = null, ResBody extends JSONType = null> = (
  ctx: KoaContex<IsPrivate, ReqBody, ResBody>,
) => Promise<void>

type BaseRoute<IsPrivate extends boolean> = {
  isPrivate: IsPrivate
  path: Path
  method: Method
}

export type CustomRoute<
  IsPrivate extends boolean,
  ReqSchem extends ZodType | null = null,
  ResBody extends JSONType = null,
> = ReqSchem extends ZodType
  ? BaseRoute<IsPrivate> & {
      bodySchema: ReqSchem
      handler:
        | RouteHandler<IsPrivate, GetZodSchemaOutput<ReqSchem>, ResBody>
        | Array<RouteHandler<IsPrivate, GetZodSchemaOutput<ReqSchem>, ResBody>>
    }
  : BaseRoute<IsPrivate> & {
      handler: RouteHandler<IsPrivate, null, ResBody> | Array<RouteHandler<IsPrivate, null, ResBody>>
    }

export class CustomRouteBuilder<
  IsPrivate extends boolean = false,
  ReqSchem extends ZodType | null = null,
  ResBody extends JSONType = null,
> {
  private isPrivate: IsPrivate
  private bodySchema: ReqSchem = null as ReqSchem

  constructor(options: { isPrivate: IsPrivate }) {
    this.isPrivate = options.isPrivate
  }

  private createRoute(params: {
    isPrivate: IsPrivate
    method: Method
    path: Path
    handler: CustomRoute<IsPrivate, ReqSchem, ResBody>['handler']
    bodySchema?: ReqSchem
  }): CustomRoute<IsPrivate, ReqSchem, ResBody> {
    if (params.bodySchema) {
      return {
        isPrivate: params.isPrivate,
        method: params.method,
        path: params.path,
        handler: params.handler,
        bodySchema: params.bodySchema,
      } as any
    }

    return {
      isPrivate: params.isPrivate,
      method: params.method,
      path: params.path,
      handler: params.handler,
    } as any
  }

  setBodySchema(schema: NonNullable<ReqSchem>): this {
    this.bodySchema = schema as ReqSchem
    return this
  }

  get(
    path: Path,
    handler: CustomRoute<IsPrivate, ReqSchem, ResBody>['handler'],
  ): CustomRoute<IsPrivate, ReqSchem, ResBody> {
    return this.createRoute({
      isPrivate: this.isPrivate,
      method: 'get',
      path,
      handler,
      bodySchema: this.bodySchema,
    })
  }

  post(
    path: Path,
    handler: CustomRoute<IsPrivate, ReqSchem, ResBody>['handler'],
  ): CustomRoute<IsPrivate, ReqSchem, ResBody> {
    return this.createRoute({
      isPrivate: this.isPrivate,
      method: 'post',
      path,
      handler,
      bodySchema: this.bodySchema,
    })
  }

  delete(
    path: Path,
    handler: CustomRoute<IsPrivate, ReqSchem, ResBody>['handler'],
  ): CustomRoute<IsPrivate, ReqSchem, ResBody> {
    return this.createRoute({
      isPrivate: this.isPrivate,
      method: 'delete',
      path,
      handler,
      bodySchema: this.bodySchema,
    })
  }

  patch(
    path: Path,
    handler: CustomRoute<IsPrivate, ReqSchem, ResBody>['handler'],
  ): CustomRoute<IsPrivate, ReqSchem, ResBody> {
    return this.createRoute({
      isPrivate: this.isPrivate,
      method: 'patch',
      path,
      handler,
      bodySchema: this.bodySchema,
    })
  }

  put(
    path: Path,
    handler: CustomRoute<IsPrivate, ReqSchem, ResBody>['handler'],
  ): CustomRoute<IsPrivate, ReqSchem, ResBody> {
    return this.createRoute({
      isPrivate: this.isPrivate,
      method: 'put',
      path,
      handler,
      bodySchema: this.bodySchema,
    })
  }
}
