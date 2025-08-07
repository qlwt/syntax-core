import { pattern_new_charseq } from "#src/pattern/new/char_seq.js"
import { pattern_new_charset } from "#src/pattern/new/char_set.js"
import { route_new_orderracef } from "#src/route/new/racef.js"
import { route_new_pattern } from "#src/route/new/pattern.js"
import { Route_Status } from "#src/route/type/Route.js"
import { expect, test } from "vitest"
import { pattern_new_seq } from "#src/pattern/new/seq.js"

enum TokenType {
    Integer,
    Float,
}

const code_num_f = "0".charCodeAt(0)
const code_num_t = "9".charCodeAt(0)

test("route:racef", () => {
    const route = route_new_orderracef({
        name: "number",

        src: [
            route_new_pattern({
                name: "integer",
                next_new: () => null,

                    token: {
                    type: TokenType.Integer,
                },

                pattern: pattern_new_seq({
                    src: [
                        pattern_new_charseq({
                            limits: {
                                variants: ["i"]
                            }
                        }),

                        pattern_new_charset({
                            limits: {
                                minlength: 1,

                                validator: char => {
                                    const code = char.charCodeAt(0)

                                    if (code > code_num_f && code <= code_num_t) {
                                        return true
                                    }

                                    return false
                                }
                            },
                        }),

                        pattern_new_charset({
                            limits: {
                                minlength: 0,

                                validator: char => {
                                    const code = char.charCodeAt(0)

                                    if (code >= code_num_f && code <= code_num_t) {
                                        return true
                                    }

                                    return false
                                }
                            },
                        }),
                    ]
                }),
            }),

            route_new_pattern({
                name: "float",
                next_new: () => null,

                    token: {
                    type: TokenType.Float,
                },

                pattern: pattern_new_seq({
                    src: [
                        pattern_new_charseq({
                            limits: {
                                variants: ["f"]
                            }
                        }),

                        pattern_new_charset({
                            limits: {
                                minlength: 1,
                                maxlength: 1,

                                validator: char => {
                                    const code = char.charCodeAt(0)

                                    if (code > code_num_f && code <= code_num_t) {
                                        return true
                                    }

                                    if (char === ".") {
                                        return true
                                    }

                                    return false
                                }
                            }
                        }),

                        pattern_new_charset({
                            limits: {
                                minlength: 0,

                                validator: char => {
                                    const code = char.charCodeAt(0)

                                    if (code >= code_num_f && code <= code_num_t) {
                                        return true
                                    }

                                    return false
                                }
                            },
                        }),

                        pattern_new_charseq({
                            limits: {
                                variants: ["."]
                            },
                        }),

                        pattern_new_charset({
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
                    ]
                }),
            })
        ],
    })


    // fulfilled integer
    {
        const src = "i10"

        expect(route.parse({ src, pointer: 0 })).toEqual({
            type: Route_Status.Fulfilled,
            next: null,

            token: {
                type: TokenType.Integer,

                section: {
                    src,
                    length: 3,
                    pointer: 0,
                }
            },

            section: {
                src,
                length: 3,
                pointer: 0,
            },
        })
    }

    // fulfilled float 
    {
        const src = "f1.1"

        expect(route.parse({ src, pointer: 0 })).toEqual({
            type: Route_Status.Fulfilled,
            next: null,

            token: {
                type: TokenType.Float,

                section: {
                    src,
                    length: 4,
                    pointer: 0,
                }
            },

            section: {
                src,
                length: 4,
                pointer: 0,
            },
        })
    }

    // error integer
    {
        const src = "i010"

        expect(route.parse({ src, pointer: 0 })).toEqual({
            type: Route_Status.Error,
            expectation: "number",

            section: {
                src,
                length: 1,
                pointer: 0,
            },
        })
    }
})
