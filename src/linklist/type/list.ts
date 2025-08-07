export type LinkList_Slot<T> = {
    node: LinkList_Node<T> | null
}

export type LinkList_Node<T> = {
    value: T
    right: LinkList_Slot<T>
}
