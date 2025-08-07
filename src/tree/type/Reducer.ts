export type Tree_Reducer_Params<PNode extends {}, RNode extends {}, Value> = {
    readonly node: PNode

    readonly queue: {
        readonly push: (node: RNode) => void
    }

    readonly compute: {
        readonly delete: (node: RNode) => void
        readonly has: (node: RNode) => boolean
        readonly get: (node: RNode) => Value | undefined
    }
}

export type Tree_Reducer<PNode extends {}, RNode extends {}, Value> = {
    (params: Tree_Reducer_Params<PNode, RNode, Value>): { readonly value: Value } | null
}
