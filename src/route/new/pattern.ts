import { Pattern_Status, type Pattern } from "#src/pattern/type/Pattern.js";
import { Route_Status, type Route } from "#src/route/type/Route.js";

export type Route__NewPattern_Token<Type> = Readonly<{
    type: Type
}>

export type Route__NewPattern_Params<Type> = Readonly<{
    name: string
    pattern: Pattern
    next_new: () => Route<Type> | null
    token: Route__NewPattern_Token<Type> | null
}>

export const route_new_pattern = function <Type>(params: Route__NewPattern_Params<Type>): Route<Type> {
    return {
        meta: {
            name: params.name
        },

        parse: init => {
            const patmatch = params.pattern.parse(init)

            switch (patmatch.type) {
                case Pattern_Status.Error:
                    return {
                        type: Route_Status.Error,
                        expectation: params.name,

                        section: {
                            ...patmatch.section
                        },
                    }
                case Pattern_Status.Fulfilled:
                    return {
                        type: Route_Status.Fulfilled,
                        next: params.next_new(),

                        section: {
                            ...patmatch.section
                        },

                        token: params.token ? {
                            type: params.token.type,

                            section: {
                                ...patmatch.section
                            },
                        } : null,
                    }
            }
        },
    }
}
