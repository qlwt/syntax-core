import { Route_Status, type Route, type Route_Match } from "#src/route/type/Route.js";

export type Route__NewRaceF_Params<Type> = Readonly<{
    name?: string
    src: readonly Route<Type>[]
}>

export const route_new_orderracef = function <Type>(params: Route__NewRaceF_Params<Type>): Route<Type> {
    const name = params.name ?? params.src.map(route => route.meta.name).join(" | ")

    return {
        meta: {
            name
        },

        parse: init => {
            let fulfilled_first: Route_Match<Type> | null = null
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
                        if (!fulfilled_first || match.section.length < fulfilled_first.section.length) {
                            fulfilled_first = match
                        }

                        break
                    }
                }
            }

            if (fulfilled_first) {
                return {
                    ...fulfilled_first
                }
            } else if (error_last){ 
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
