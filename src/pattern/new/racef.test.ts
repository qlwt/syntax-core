import { pattern_new_charseq } from "#src/pattern/new/char_seq.js"
import { pattern_new_charset } from "#src/pattern/new/char_set.js"
import { pattern_new_racef } from "#src/pattern/new/racef.js"
import { Pattern_Status } from "#src/pattern/type/Pattern.js"
import { expect, test } from "vitest"

test("pattern:racef", () => {
    const pattern = pattern_new_racef({
        src: [
            pattern_new_charseq({
                limits: {
                    variants: [">=", "qqqq"]
                },
            }),

            pattern_new_charset({
                limits: {
                    minlength: 1,
                    maxlength: 2,

                    validator: char => {
                        if (char === "q") {
                            return true
                        }

                        return false
                    }
                },
            }),
        ]
    })

    // will stop fulfilling charseq with charset erroring
    {
        const src = ">= "

        expect(pattern.parse({ src, pointer: 0 })).toEqual({
            type: Pattern_Status.Fulfilled,

            section: {
                src,
                length: 2,
                pointer: 0,
            }
        })
    }

    // will error at charseq
    {
        const src = ">--"

        expect(pattern.parse({ src, pointer: 0 })).toEqual({
            type: Pattern_Status.Error,

            section: {
                src,
                length: 1,
                pointer: 0,
            }
        })
    }
})
