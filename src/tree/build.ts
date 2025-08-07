import type { Token } from "#src/token/type/Token.js"
import type { Tree_Slot } from "#src/tree/type/Node.js"

export type Tree__Build_Params<Node extends {}, Type> = Readonly<{
    tokens: readonly Token<Type>[]
    handler: (pointer: Tree_Slot<Node>, token: Token<Type>) => Tree_Slot<Node> | null
}>

export const tree_build = function <Node extends {}, Type>(params: Tree__Build_Params<Node, Type>): Tree_Slot<Node> {
    let root: Tree_Slot<Node> = {
        node: null,
        parent: null
    }

    {
        let pointer = root

        for (const token of params.tokens) {
            const next = params.handler(pointer, token)

            if (next === null) {
                return root
            } else {
                pointer = next
            }
        }
    }

    return root
}
