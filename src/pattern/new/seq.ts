import { Pattern_Status, type Pattern } from "#src/pattern/type/Pattern.js";

export type Pattern__NewSeq_Params = Readonly<{
    src: readonly Pattern[]
}>

export const pattern_new_seq = function(params: Pattern__NewSeq_Params): Pattern {
    return {
        parse: init => {
            let length: number | null = null

            for (const pattern of params.src) {
                const match = pattern.parse({ src: init.src, pointer: (length || 0) + init.pointer })

                switch (match.type) {
                    case Pattern_Status.Error: {
                        return {
                            type: Pattern_Status.Error,

                            section: {
                                src: init.src,
                                pointer: init.pointer,
                                length: (length || 0) + match.section.length,
                            },
                        }
                    }
                    case Pattern_Status.Fulfilled: {
                        length = (length || 0) + match.section.length
                    }
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
                        src: init.src,
                        length: length,
                        pointer: init.pointer,
                    },
                }
            }
        },
    }
}
