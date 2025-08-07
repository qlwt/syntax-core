import { lexer_parse } from "#src/lexer/parse.js"
import { pattern_new_charseq } from "#src/pattern/new/char_seq.js"
import { pattern_new_charset } from "#src/pattern/new/char_set.js"
import { pattern_new_seq } from "#src/pattern/new/seq.js"
import { route_new_eof } from "#src/route/new/eof.js"
import { route_new_orderracef } from "#src/route/new/racef.js"
import { route_new_pattern } from "#src/route/new/pattern.js"
import type { Route } from "#src/route/type/Route.js"
import { expect, test } from "vitest"

function route_symbol(): Route<TokenType> {
    return route_new_orderracef<TokenType>({
        name: "symbol",

        src: [
            route_new_pattern({
                name: "space",
                token: null,
                next_new: () => route_symbol(),

                pattern: pattern_new_charset({
                    limits: {
                        minlength: 1,

                        validator: char => {
                            return char === " "
                        },
                    }
                }),
            }),

            route_new_pattern({
                name: "number",

                token: {
                    type: TokenType.Number
                },

                next_new: () => route_operator(),

                pattern: pattern_new_seq({
                    src: [
                        pattern_new_charset({
                            limits: {
                                minlength: 1,
                                maxlength: 1,

                                validator: char => {
                                    const code = char.charCodeAt(0)

                                    if (code > code_numf && code <= code_numt) {
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

                                    if (code >= code_numf && code <= code_numt) {
                                        return true
                                    }

                                    return false
                                }
                            }
                        }),
                    ],
                }),
            })
        ],
    })
}

function route_operator(): Route<TokenType> {
    return route_new_orderracef<TokenType>({
        name: "operator-binary",

        src: [
            route_new_pattern({
                name: "space",
                token: null,
                next_new: () => route_operator(),

                pattern: pattern_new_charset({
                    limits: {
                        minlength: 1,

                        validator: char => {
                            return char === " "
                        },
                    }
                }),
            }),

            route_new_eof({
                name: "eof",
                token: null,
            }),

            route_new_pattern({
                name: "operator-binary",
                next_new: () => route_symbol(),

                token: {
                    type: TokenType.OperatorBinary
                },

                pattern: pattern_new_charseq({
                    limits: {
                        variants: ["+", "-", "/", "*", "//", "%", "^"]
                    }
                }),
            })
        ]

    })
}

enum TokenType {
    Number,
    OperatorBinary
}

const code_numf = "0".charCodeAt(0)
const code_numt = "9".charCodeAt(0)

test("lexer_parse", () => {
    const route = route_symbol()

    {
        const src = "12 + 3 * 10 // 3"

        expect(lexer_parse({
            src,
            route,
        })).toEqual({
            error: null,

            tokens: [
                {
                    type: TokenType.Number,

                    section: {
                        src,
                        length: 2,
                        pointer: 0,
                    }
                },
                {
                    type: TokenType.OperatorBinary,

                    section: {
                        src,
                        length: 1,
                        pointer: 3,
                    }
                },
                {
                    type: TokenType.Number,

                    section: {
                        src,
                        length: 1,
                        pointer: 5,
                    }
                },
                {
                    type: TokenType.OperatorBinary,

                    section: {
                        src,
                        length: 1,
                        pointer: 7,
                    }
                },
                {
                    type: TokenType.Number,

                    section: {
                        src,
                        length: 2,
                        pointer: 9,
                    }
                },
                {
                    type: TokenType.OperatorBinary,

                    section: {
                        src,
                        length: 2,
                        pointer: 12,
                    }
                },
                {
                    type: TokenType.Number,

                    section: {
                        src,
                        length: 1,
                        pointer: 15,
                    }
                },
            ],
        })
    }

    {
        const src = "12 + 03 * 10 // 3"
        const analysis = lexer_parse({ src, route })

        expect(analysis.error !== null).toBeTruthy()
        expect(analysis.tokens.length === 2).toBeTruthy()
    }
})
