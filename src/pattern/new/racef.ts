import { Pattern_Status, type Pattern, type Pattern_Match } from "#src/pattern/type/Pattern.js";

export type Pattern__NewRaceF_Params = Readonly<{
    src: readonly Pattern[]
}>

export const pattern_new_racef = function(params: Pattern__NewRaceF_Params): Pattern {
    return {
        parse: init => {
            let fulfilled_first: Pattern_Match | null = null
            let error_last: Pattern_Match | null = null

            for (let i = 0; i < params.src.length; ++i) {
                const match = params.src[i]!.parse(init)

                switch (match.type) {
                    case Pattern_Status.Error: {
                        if (!error_last || match.section.length > error_last.section.length) {
                            error_last = match
                        }
                        
                        break
                    }
                    case Pattern_Status.Fulfilled: {
                        if (!fulfilled_first || match.section.length < fulfilled_first.section.length) {
                            fulfilled_first = match
                        }

                        break
                    }
                }
            }

            if (fulfilled_first) {
                return fulfilled_first
            } else if (error_last){ 
                return error_last
            } else {
                return {
                    type: Pattern_Status.Error,

                    section: {
                        length: 0,
                        src: init.src,
                        pointer: init.pointer,
                    }
                }
            }
        },
    }
}
