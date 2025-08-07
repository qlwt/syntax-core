import type { Route } from "#src/route/type/Route.js"

export type Route__Build_Data = {
    readonly [K in keyof any]: any[]
}

export type Route__Build_Resolver_Api<Data extends Route__Build_Data, Key extends keyof Data> = Readonly<{
    key: Key
}>

export type Route__Build_Resolver<Data extends Route__Build_Data, TokenType> = {
    <K extends keyof Data>(api: Route__Build_Resolver_Api<Data, K>, ...params: Data[K]): Route<TokenType>
}

export type Route__Build_RouteBuilder_Api<Data extends Route__Build_Data, TokenType> = Readonly<{
    resolve: Route__Build_Resolver<Data, TokenType>
}>

export type Route__Build_Params<Data extends Route__Build_Data, TokenType> = Readonly<{
    routes: Readonly<{
        [K in keyof Data]: (api: Route__Build_RouteBuilder_Api<Data, TokenType>, ...params: Data[K]) => Route<TokenType>
    }>
}>

export const route_build = function <Data extends Route__Build_Data, TokenType>(
    params: Route__Build_Params<Data, TokenType>
): Route__Build_Resolver<Data, TokenType> {
    const resolver: Route__Build_Resolver<Data, TokenType> = (api, ...lparams) => {
        return params.routes[api.key]({ resolve: resolver }, ...lparams)
    }

    return resolver
}
