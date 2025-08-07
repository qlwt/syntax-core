import { Route_Status, type Route } from "#src/route/type/Route.js";

export type Route__NewEOF_Token<Type> = Readonly<{
    type: Type
}>

export type Route__NewEOF_Params<Type> = Readonly<{
    name: string
    token: Route__NewEOF_Token<Type> | null
}>

export const route_new_eof = function <Type>(params: Route__NewEOF_Params<Type>): Route<Type> {
    return {
        meta: {
            name: params.name,
        },

        parse: init => {
            if (init.pointer >= init.src.length) {
                return {
                    type: Route_Status.Fulfilled,
                    next: null,

                    token: params.token ? {
                        type: params.token.type,

                        section: {
                            length: 0,
                            src: init.src,
                            pointer: init.pointer,
                        },
                    } : null,

                    section: {
                        length: 0,
                        src: init.src,
                        pointer: init.pointer,
                    }
                }
            } else {
                return {
                    type: Route_Status.Error,
                    expectation: params.name,

                    section: {
                        length: 0,
                        src: init.src,
                        pointer: init.pointer,
                    }
                }
            }
        },
    }
}
