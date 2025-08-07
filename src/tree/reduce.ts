import type { Tree_Slot } from "#src/tree/type/Node.js"
import type { Tree_Reducer } from "#src/tree/type/Reducer.js"

export type Tree__Reduce_Params<Node extends {}, Value> = {
    readonly root: Tree_Slot<Node>
    readonly reducer: Tree_Reducer<Node, Node, Value>
}

export const tree_reduce = function <Node extends {}, Value>(params: Tree__Reduce_Params<Node, Value>): Value {
    const { root, reducer } = params

    if (root.node === null) { throw new Error("Nullish root") }

    const stack = [root.node]
    const compute = new Map<Node, Value>

    do {
        const node = stack.at(-1)!

        const node_reduced = reducer({
            node,

            queue: {
                push: node => { stack.push(node) }
            },

            compute: {
                has: node => compute.has(node),
                get: node => compute.get(node),
                delete: node => { compute.delete(node) }
            }
        })

        if (node_reduced === null) {
            continue
        }

        stack.pop()
        compute.set(node, node_reduced.value)
    } while (stack.length);

    if (!compute.has(root.node)) {
        throw new Error("AST reduction failed")
    }

    return compute.get(root.node)!
}
