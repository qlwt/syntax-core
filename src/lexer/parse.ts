import { Route_Status, type Route, type Route_Match } from "#src/route/type/Route.js"
import type { Token } from "#src/token/type/Token.js"

export type Lexer__Parse_Params<Type> = Readonly<{
    src: string
    route: Route<Type>
}>

export type Lexer__Parse_Response_Error = Readonly<{
    expectation: string

    section: Readonly<{
        src: string
        length: number
        pointer: number
    }>
}>

export type Lexer__Parse_Response<Type> = Readonly<{
    tokens: readonly Token<Type>[]
    error: null | Lexer__Parse_Response_Error
}>

export const lexer_parse = function <Type>(params: Lexer__Parse_Params<Type>): Lexer__Parse_Response<Type> {
    const tokens: Token<Type>[] = []

    {
        let pointer = 0
        let route: Route<Type> | null = params.route

        do {
            const rtmatch: Route_Match<Type> = route.parse({ src: params.src, pointer })

            switch (rtmatch.type) {
                case Route_Status.Error: {
                    return {
                        tokens,

                        error: {
                            expectation: route.meta.name,
                            section: rtmatch.section,
                        }
                    }
                }

                case Route_Status.Fulfilled: {
                    route = rtmatch.next
                    pointer = rtmatch.section.pointer + rtmatch.section.length

                    if (rtmatch.token) {
                        tokens.push(rtmatch.token)
                    }

                    break
                }
            }
        } while (route)
    }

    return {
        tokens,

        error: null
    }
}
