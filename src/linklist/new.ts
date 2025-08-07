import type { LinkList_Slot } from "#src/linklist/type/list.js"

export function linklist_new<T>(src: readonly T[]): LinkList_Slot<T> {
    const slot_first: LinkList_Slot<T> = { node: null }

    let slot_last = slot_first

    for (let i = 0; i < src.length; ++i) {
        const next_slot = { node: null }
        const i_node = { right: next_slot, value: src[i]! }

        slot_last.node = i_node
        slot_last = next_slot
    }

    return slot_first
}
