import { Pattern_Status, type Pattern } from "#src/pattern/type/Pattern.js";

export type Pattern__NewRegex_Error = Readonly<{
    message: string
}>

export type Pattern__NewRegex_Token<Type> = Readonly<{
    type: Type
}>

export type Pattern__NewRegex_Limits = Readonly<{
}>

export type Pattern__NewRegex_Params = Readonly<{
    regex: RegExp
}>

export const pattern_new_regex = function(params: Pattern__NewRegex_Params): Pattern {
    return {
        parse: init => {
            params.regex.lastIndex = init.pointer

            const rmatch = params.regex.exec(init.src)

            if (!rmatch || rmatch.index !== init.pointer) {
                return {
                    type: Pattern_Status.Error,

                    section: {
                        length: 0,
                        src: init.src,
                        pointer: init.pointer,
                    }
                }
            } else {
                return {
                    type: Pattern_Status.Fulfilled,

                    section: {
                        src: init.src,
                        pointer: init.pointer,
                        length: rmatch[0].length
                    },
                }
            }
        },
    }
}
