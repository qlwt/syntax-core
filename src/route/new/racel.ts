import { Route_Status, type Route, type Route_Match } from "#src/route/type/Route.js";

export type Route__NewRaceL_Params<Type> = Readonly<{
    name?: string
    src: readonly Route<Type>[]
}>

export const route_new_racel = function <Type>(params: Route__NewRaceL_Params<Type>): Route<Type> {
    const name = params.name ?? params.src.map(route => route.meta.name).join(" | ")

    return {
        meta: {
            name
        },

        parse: init => {
            let fulfilled_last: Route_Match<Type> | null = null
            let error_last: Route_Match<Type> | null = null

            for (let i = 0; i < params.src.length; ++i) {
                const match = params.src[i]!.parse(init)

                switch (match.type) {
                    case Route_Status.Error: {
                        if (!error_last || match.section.length > error_last.section.length) {
                            error_last = match
                        }

                        break
                    }
                    case Route_Status.Fulfilled: {
                        if (!fulfilled_last || match.section.length > fulfilled_last.section.length) {
                            fulfilled_last = match
                        }

                        break
                    }
                }
            }

            if (fulfilled_last) {
                return {
                    ...fulfilled_last
                }
            } else if (error_last) {
                return {
                    ...error_last,

                    expectation: name
                }
            } else {
                return {
                    type: Route_Status.Error,
                    expectation: name,

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
