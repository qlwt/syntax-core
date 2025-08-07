import type { Tree_Slot } from "#src/tree/type/Node.js"

export type Tree__InsertEOrder_Params<Node extends {}> = {
    insert_eorder: number
    insert_handler: (slot: Tree_Slot<Node>) => Tree_Slot<Node>

    tree_pointer: Tree_Slot<Node>
    node_eorder: (node: Node) => number
}


export const tree_insert_eorder = function <Node extends {}>(params: Tree__InsertEOrder_Params<Node>): Tree_Slot<Node> {
    let pointer = params.tree_pointer

    {
        loop_up:
        for (; ;) {
            const parent = pointer.parent

            if (parent && parent.node) {
                const parent_node = parent.node
                const node_priority = params.node_eorder(parent_node)

                if (params.insert_eorder > node_priority) {
                    pointer = parent
                } else {
                    break loop_up
                }
            } else {
                break loop_up
            }
        }
    }

    return params.insert_handler(pointer)
}
