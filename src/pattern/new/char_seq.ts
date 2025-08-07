import { linklist_new } from "#src/linklist/new.js";
import { Pattern_Status, type Pattern } from "#src/pattern/type/Pattern.js";

export type Pattern__NewCharSeq_Limits = Readonly<{
    variants: readonly string[]
}>

export type Pattern__NewCharSeq_Params = Readonly<{
    limits: Pattern__NewCharSeq_Limits
}>

// abandoned, regex is better
export const pattern_new_charseq = function(params: Pattern__NewCharSeq_Params): Pattern {
    return {
        parse: init => {
            if (params.limits.variants.length === 0) {
                return {
                    type: Pattern_Status.Error,

                    section: {
                        length: 0,
                        src: init.src,
                        pointer: init.pointer,
                    }
                }
            }

            let variant_fit: string | null = null
            let variants = linklist_new(params.limits.variants)

            let i = 0

            for (; i < init.src.length - init.pointer; ++i) {
                const char = init.src[init.pointer + i]!

                let slot = variants

                while (slot.node) {
                    if (slot.node!.value[i] === char) {
                        if (slot.node!.value.length - 1 === i) {
                            variant_fit = slot.node!.value

                            slot.node = slot.node!.right.node
                        } else {
                            slot = slot.node!.right
                        }
                    } else {
                        slot.node = slot.node!.right.node
                    }
                };

                if (!variants.node) {
                    break
                }
            }

            if (variant_fit === null) {
                return {
                    type: Pattern_Status.Error,

                    section: {
                        length: i,
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
                        length: variant_fit.length,
                    }
                }
            }
        },
    }
}

