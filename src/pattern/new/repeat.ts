import { Pattern_Status, type Pattern } from "#src/pattern/type/Pattern.js";

export type Pattern__NewRepeat_Params = Readonly<{
    src: Pattern
}>

export const pattern_new_orderrepeat = function(params: Pattern__NewRepeat_Params): Pattern {
    return {
        parse: init => {
            let length: number | null = null

            {
                let match = params.src.parse(init)

                while (match.type === Pattern_Status.Fulfilled) {
                    length = (length || 0) + match.section.length

                    match = params.src.parse({ src: init.src, pointer: init.pointer + length })
                }
            }

            if (length === null) {
                return {
                    type: Pattern_Status.Error,

                    section: {
                        length: 0,
                        src: init.src,
                        pointer: init.pointer,
                    },
                }
            } else {
                return {
                    type: Pattern_Status.Fulfilled,

                    section: {
                        length: length,
                        src: init.src,
                        pointer: init.pointer,
                    },
                }
            }
        },
    }
}
