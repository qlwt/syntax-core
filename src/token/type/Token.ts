export interface Token<Type> {
    readonly type: Type

    readonly section: {
        readonly src: string
        readonly length: number
        readonly pointer: number
    }
}
