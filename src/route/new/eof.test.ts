import { route_new_eof } from "#src/route/new/eof.js"
import { Route_Status } from "#src/route/type/Route.js"
import { test, expect } from "vitest"

enum TokenType {
    EOF
}

test("route:eof", () => {
    const route = route_new_eof({
        name: "eof",

        token: {
            type: TokenType.EOF
        }
    })

    {
        const src = ""

        expect(route.parse({ src, pointer: 0 })).toEqual({
            type: Route_Status.Fulfilled,
            next: null,

            token: {
                type: TokenType.EOF,

                section: {
                    src,
                    pointer: 0,
                    length: 0,
                },
            },

            section: {
                src,
                length: 0,
                pointer: 0,
            },
        })
    }

    {
        const src = " "

        expect(route.parse({ src, pointer: 0 })).toEqual({
            type: Route_Status.Error,
            expectation: "eof",

            section: {
                src,
                length: 0,
                pointer: 0,
            },
        })
    }
})
