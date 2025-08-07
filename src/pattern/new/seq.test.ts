import { pattern_new_charseq } from "#src/pattern/new/char_seq.js"
import { pattern_new_charset } from "#src/pattern/new/char_set.js"
import { pattern_new_seq } from "#src/pattern/new/seq.js"
import { Pattern_Status } from "#src/pattern/type/Pattern.js"
import { expect, test } from "vitest"

const code_num_f = "0".charCodeAt(0)
const code_num_t = "9".charCodeAt(0)

test("pattern:seq", () => {
    const pattern = pattern_new_seq({
        src: [
            pattern_new_charseq({
                limits: {
                    variants: ["i", "f"]
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

                        if (char === ".") {
                            return true
                        }

                        return false
                    }
                },
            }),
        ]
    })

    // will fulfill
    {
        const src = "i1.1"

        expect(pattern.parse({ src, pointer: 0 })).toEqual({
            type: Pattern_Status.Fulfilled,

            section: {
                src,
                length: 4,
                pointer: 0,
            }
        })
    }

    // will fulfill
    {
        const src = "f1.1"

        expect(pattern.parse({ src, pointer: 0 })).toEqual({
            type: Pattern_Status.Fulfilled,

            section: {
                src,
                length: 4,
                pointer: 0,
            }
        })
    }

    // will throw error on charseq
    {
        const src = "11.1"

        expect(pattern.parse({ src, pointer: 0 })).toEqual({
            type: Pattern_Status.Error,

            section: {
                src,
                length: 0,
                pointer: 0,
            }
        })
    }

    // will throw error on charset
    {
        const src = "ii1.1"

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
