export type Tree_Slot<Node extends {}> = {
    node: Node | null
    parent: Tree_Slot<Node> | null
}
