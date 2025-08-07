import { pattern_new_charseq } from "#src/pattern/new/char_seq.js"
import { pattern_new_charset } from "#src/pattern/new/char_set.js"
import { pattern_new_racef } from "#src/pattern/new/racef.js"
import { pattern_new_orderrepeat } from "#src/pattern/new/repeat.js"
import { pattern_new_seq } from "#src/pattern/new/seq.js"
import { Pattern_Status } from "#src/pattern/type/Pattern.js"
import { expect, test } from "vitest"

test("pattern:repeat", () => {
    const pattern = pattern_new_orderrepeat({
        src: pattern_new_racef({
            src: [
                pattern_new_seq({
                    src: [
                        pattern_new_charseq({
                            limits: {
                                variants: ["\\"]
                            }
                        }),

                        pattern_new_charset({
                            limits: {
                                minlength: 1,
                                maxlength: 1,
                                validator: () => true,
                            }
                        })
                    ]
                }),

                pattern_new_charset({
                    limits: {
                        minlength: 1,

                        validator: char => {
                            if (char !== "\\" && char !== "\"" && char !== "$") {
                                return true
                            }

                            return false
                        }
                    }
                })
            ]
        })
    })

    // will fulfill
    {
        const src = "hello world \\n Lorem Ipsum "

        expect(pattern.parse({ src, pointer: 0 })).toEqual({
            type: Pattern_Status.Fulfilled,

            section: {
                src,
                length: 27,
                pointer: 0,
            }
        })
    }

    // will throw
    {
        const src = "$"

        expect(pattern.parse({ src, pointer: 0 })).toEqual({
            type: Pattern_Status.Error,

            section: {
                src,
                length: 0,
                pointer: 0,
            }
        })
    }

    // will fulfill
    {
        const src = "qwe$"

        expect(pattern.parse({ src, pointer: 0 })).toEqual({
            type: Pattern_Status.Fulfilled,

            section: {
                src,
                length: 3,
                pointer: 0,
            }
        })
    }
})
