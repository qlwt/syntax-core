import { pattern_new_charseq } from "#src/pattern/new/char_seq.js"
import { Pattern_Status } from "#src/pattern/type/Pattern.js"
import { expect, test } from "vitest"

test("pattern:char_seq", () => {
    const pattern = pattern_new_charseq({
        limits: {
            variants: [
                ">=",
                ">==",
                ">",
                "=="
            ]
        }
    })

    {
        const src = ">=  "

        expect(pattern.parse({ src, pointer: 0 })).toEqual({
            type: Pattern_Status.Fulfilled,

            section: {
                src,
                length: 2,
                pointer: 0,
            }
        })
    }

    {
        const src = "<=  "

        expect(pattern.parse({ src, pointer: 0 })).toEqual({
            type: Pattern_Status.Error,

            section: {
                src,
                length: 0,
                pointer: 0,
            }
        })
    }

    {
        const src = ">=="

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
