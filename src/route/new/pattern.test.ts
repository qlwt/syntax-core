import { pattern_new_charset } from "#src/pattern/new/char_set.js"
import { route_new_pattern } from "#src/route/new/pattern.js"
import { Route_Status } from "#src/route/type/Route.js"
import { expect, test } from "vitest"

enum TokenType {
    Number
}

const code_num_f = "0".charCodeAt(0)
const code_num_t = "9".charCodeAt(0)

test("route:pattern", () => {
    const route = route_new_pattern({
        name: "number",
        next_new: () => null,

        token: {
            type: TokenType.Number,
        },

        pattern: pattern_new_charset({
            limits: {
                minlength: 1,

                validator: char => {
                    const code = char.charCodeAt(0)

                    if (code >= code_num_f && code <= code_num_t) {
                        return true
                    }

                    return false
                }
            },
        }),
    })

    // error - less than minlength
    {
        const src = ""

        expect(route.parse({ src, pointer: 0 })).toEqual({
            type: Route_Status.Error,
            expectation: "number",

            section: {
                src,
                length: 0,
                pointer: 0,
            },
        })
    }

    // fulfille - normal number
    {
        const src = "12"

        expect(route.parse({ src, pointer: 0 })).toEqual({
            type: Route_Status.Fulfilled,
            next: null,

            token: {
                type: TokenType.Number,

                section: {
                    src,
                    pointer: 0,
                    length: 2,
                },
            },

            section: {
                src,
                length: 2,
                pointer: 0,
            },
        })
    }

    // fulfille - number interrupted
    {
        const src = "12qq"

        expect(route.parse({ src, pointer: 0 })).toEqual({
            type: Route_Status.Fulfilled,
            next: null,

            token: {
                type: TokenType.Number,

                section: {
                    src,
                    pointer: 0,
                    length: 2,
                },
            },

            section: {
                src,
                length: 2,
                pointer: 0,
            },
        })
    }
})
