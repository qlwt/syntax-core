import { pattern_new_regex } from "#src/pattern/new/regex.js"
import { Pattern_Status } from "#src/pattern/type/Pattern.js"
import { expect, test } from "vitest"

test("pattern:regex", () => {
    const pattern = pattern_new_regex({
        regex: /[1-9][0-9]*/g
    })

    // error - no match
    {
        const src = "qwe"

        expect(pattern.parse({ src, pointer: 0 })).toEqual({
            type: Pattern_Status.Error,

            section: {
                src,
                length: 0,
                pointer: 0,
            },
        })
    }

    // error - not connected
    {
        const src = " 123"

        expect(pattern.parse({ src, pointer: 0 })).toEqual({
            type: Pattern_Status.Error,

            section: {
                src,
                length: 0,
                pointer: 0,
            },
        })
    }

    // fulfill
    {
        const src = "12"

        expect(pattern.parse({ src, pointer: 0 })).toEqual({
            type: Pattern_Status.Fulfilled,

            section: {
                src,
                length: 2,
                pointer: 0,
            },
        })
    }

    // fulfilled - number interrupted
    {
        const src = "qq12qq"

        expect(pattern.parse({ src, pointer: 2 })).toEqual({
            type: Pattern_Status.Fulfilled,

            section: {
                src,
                length: 2,
                pointer: 2,
            },
        })
    }
})
