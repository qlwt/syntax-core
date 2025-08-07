import { pattern_new_charset } from "#src/pattern/new/char_set.js"
import { Pattern_Status } from "#src/pattern/type/Pattern.js"
import { expect, test } from "vitest"

const code_num_from = "0".charCodeAt(0)
const code_num_to = "9".charCodeAt(0)
const code_alphabet_from = "a".charCodeAt(0)
const code_alphabet_to = "z".charCodeAt(0)

test("pattern:char_set", () => {
    const pattern = pattern_new_charset({
        limits: {
            minlength: 1,
            maxlength: 4,

            validator: char => {
                const code = char.charCodeAt(0)

                if (code >= code_num_from && code <= code_num_to) {
                    return true
                }

                if (code >= code_alphabet_from && code <= code_alphabet_to) {
                    return true
                }

                return false
            }
        }
    })

    {
        const src = "1"

        expect(pattern.parse({ src, pointer: 0 })).toEqual({
            type: Pattern_Status.Fulfilled,

            section: {
                src,
                length: 1,
                pointer: 0,
            }
        })
    }

    {
        const src = "1234"

        expect(pattern.parse({ src, pointer: 0 })).toEqual({
            type: Pattern_Status.Fulfilled,

            section: {
                src,
                length: 4,
                pointer: 0,
            }
        })
    }

    {
        const src = "123456"

        expect(pattern.parse({ src, pointer: 0 })).toEqual({
            type: Pattern_Status.Fulfilled,

            section: {
                src,
                length: 4,
                pointer: 0,
            }
        })
    }

    {
        const src = ""

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
        const src = "12$"

        expect(pattern.parse({ src, pointer: 0 })).toEqual({
            type: Pattern_Status.Fulfilled,

            section: {
                src,
                length: 2,
                pointer: 0,
            }
        })
    }
})
