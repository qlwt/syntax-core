import { Pattern_Status, type Pattern } from "#src/pattern/type/Pattern.js";

export type Pattern__NewCharSet_Limits = Readonly<{
    validator: (char: string) => boolean

    minlength?: number
    maxlength?: number
}>

export type Pattern__NewCharSet_Params = Readonly<{
    limits: Pattern__NewCharSet_Limits
}>

// abandoned, regex is better
export const pattern_new_charset = function(params: Pattern__NewCharSet_Params): Pattern {
    return {
        parse: init => {
            let i = 0

            for (; i < Math.min(params.limits.maxlength ?? Infinity, init.src.length - init.pointer); ++i) {
                const char = init.src[init.pointer + i]!

                if (params.limits.validator(char)) {
                    continue
                } else {
                    break
                }
            }

            if (i < (params.limits.minlength ?? 1)) {
                return {
                    type: Pattern_Status.Error,

                    section: {
                        src: init.src,
                        pointer: init.pointer,
                        length: i
                    }
                }
            } else {
                return {
                    type: Pattern_Status.Fulfilled,

                    section: {
                        src: init.src,
                        pointer: init.pointer,
                        length: i
                    }
                }
            }
        },
    }
}
