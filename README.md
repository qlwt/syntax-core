# @qyu/syntax-core

Generalised simple syntax parser

## Core concepts

### General Flow

- parse source with lexer
- build abstract syntax tree from result tokens
- reduce ast to computed result

### Token

Minimal syntax unit.

```typescript
interface Token<Type> {
    readonly type: Type

    readonly section: {
        readonly src: string
        readonly length: number
        readonly pointer: number
    }
}
```

### Route

Parses string from given pointer and returns Token or Error

- route_new_pattern - uses pattern as parser
- route_new_eof - expects end of file
- route_new_racef - gets other routes as param, resolves with first that is fulfilled
- route_new_racel - same as racef, but resolves with last on that is fulfilled

```typescript
const route_number = route_new_pattern({
    // metadata, used for error messages
    name: "integer",

    // returns next token or null (ends parsing)
    next_new: () => route_new_eof({
        name: "eof",
        token: null
    }),

    token: {
        type: "INTEGER"
    },

    // patterns are next one
    pattern: pattern_new_regex({
        regex: /[1-9][0-9]*/g
    })
})
```

### Pattern

Generic patterns for string parsing for routes

- pattern_new_regex - regex based, most commonly used. Regex always should be global
- pattern_new_repeat - repeat until it fails
- pattern_new_racel - same as route_racel but for patterns
- pattern_new_racef - same as route_racef but for patterns
- pattern_new_seq - resolves patterns in specified order

```typescript
pattern_new_regex({
    // regex should be global
    regex: /[1-9][0-9]/g
})
```

### Lexer

Parses you input

```typescript
const src = "13"
const result = lexer_parse({ src, route: route_number })
```

### Route Builder

- When you have multiple routes you would want to spread them to different files.
- Due to recursive nature of routes next_new parameter you will most likely have recursive imports
- Route Builder solves this problem

```typescript
enum TokenType {
    Integer,
    Operator
}

// typings for builder - k-v pairs of route name and contextual parameters
type BuildData = {
    number: []
    operator: []
}

const route_number = function (resolve: Route__Build_Resolver<BuilderData, TokenType>) {
    return route_new_pattern({
        name: "integer",
        next_new: () => resolve({ key: "operator" }),

        token: {
            type: TokenType.Integer
        },

        pattern: pattern_new_regex({
            regex: /[1-9][0-9]*/g
        })
    })
}

const route_operator = function (resolve: Route__Build_Resolver<BuilderData, TokenType>) {
    return route_new_racef({
        src: [
            route_new_eof({
                token: null,
                name: "eof",
            }),

            route_new_pattern({
                name: "binary-operator",
                next_new: () => resolve({ key: "number" }),

                token: {
                    type: TokenType.Operator
                },

                pattern: pattern_new_regex({
                    regex: /\+|\*|-|\//g
                })
            })
        ]
    })
}

const lexed = lexer_parse({
    src: "3 + 2 * 1 / 4",

    // build route and init it with { key: number }
    route: route_build<BuilderData>({
        routes: {
            number: (api, ...params) => route_number(api.resolve, ...params),
            operator: (api, ...params) => route_operator(api.resolve, ...params),
        }
    })({ key: "number" })
})
```

### AST

AST is defined as Tree_Slot

```typescript
type Tree_Slot<Node extends {}> = {
    node: Node | null
    parent: Tree_Slot<Node> | null
}
```

### AST builder

- AST is initiated with empty slot with pointer on it.
- Walks by tokens and moves pointer

```typescript
// define nodes
enum Node_Type {
    Number,
    Operator
}

type NodeNumber = {
    type: Node_Type.Number
    value: number
}

type NodeOperator = {
    type: Node_Type.Operator,
    operation: string
    left: Tree_Slot<Node>
    right: Tree_Slot<Node>
}

type Node = (
    | NodeNumber
    | NodeOperator
)

// build tree
const ast = tree_build<Node_Type, TokenType>({
    tokens: lexed.tokens,

    handler: (pointer, token) => {
        switch (token.type) {
            case TokenType.Number: {
                if (pointer.node !== null) {
                    throw new Error("TokenOrder: number should be processed at nullish slot")
                }

                const value = Number.parseInt(sector_new(token))

                if (Number.isNaN(value)) {
                    throw new Error(`TokenValue: number token is NaN value:${sector_new(token)}`)
                }

                // set up node
                pointer.node = {
                    type: TreeNode_Type.Number,
                    value
                }

                return pointer
            }
            // will ignore operator priority for now
            case TokenType.Operator: {
                const operation = sector_new(token)

                pointer.node = {
                    type: Node_Type.Operator,

                    operation,
                    left: { node: pointer.node, parent: pointer },
                    right: { node: null, parent: pointer },
                }

                return pointer.node.right
            }
        }
    }
})
```

### AST reducer

- AST when built needs to be reduced to computed value
- Reducer returns computed value for node or null (if value can not be processed now)
- Api allows pushing more nodes to queue if there children that target node depends on
- Api allows acces computed hashmap to use values of already computed nodes

```typescript
tree_reduce({
    root: ast,

    reducer: api => {
        switch (api.node.type) {
            case TreeNode_Type.Number: {
                return { value: api.node.value }
            }
            case TreeNode_Type.Operator: {
                if (!api.node.left.node || !api.node.right.node) {
                    throw new Error(`Unifinished Binary Operation ${api.node.operation}`)
                }

                // check if left and right node are already processed
                const l = api.compute.get(api.node.left.node)
                const r = api.compute.get(api.node.right.node)

                // if they are not processed - push them into queue and delay calculation
                if (l === undefined) {
                    api.queue.push(api.node.left.node)

                    if (r === undefined) {
                        api.queue.push(api.node.right.node)
                    }

                    return null
                } else if (r === undefined) {
                    api.queue.push(api.node.right.node)

                    return null
                } else {
                    switch (api.node.operation) {
                        case "+":
                            return { value: l + r }
                        case "-":
                            return { value: l - r }
                        case "/":
                            return { value: Math.trunc(l / r) }
                        case "*":
                            return { value: l * r }
                        default: {
                            throw new Error(`Unexpected operation ${api.node.operation}`)
                        }
                    }
                }
            }
        }
    },
})
```

## Usage example

- This is parser, interpreter and reducer for math expresion with contextual parameters and operator priority

```typescript
// to keep track of context
enum TokenScope {
    Root,
    Priority,
}

// raw token types
enum TokenType {
    EOF,
    Number,
    OpBinary,
    PriorityOpen,
    PriorityClose,
}

// context parameter
type Meta = {
    scope: readonly TokenScope[]
}

// route builder data
// k-v pairs of routes and context parameters
type BuilderData = {
    symbol: [Meta]
    operator_binary: [Meta]
}

// initial route
const route_init = function() {
    // uses route builder
    // designed to avoid recursive imports when defining routes in different files
    return route_build<BuilderData, TokenType>({
        routes: {
            // specific routes will be defined later
            symbol: (api, ...params) => route_symbol(api.resolve, ...params),
            operator_binary: (api, ...params) => route_operator(api.resolve, ...params),
        }
    })({ key: "symbol" }, { scope: [TokenScope.Root] })
}

// route symbol definition
function route_symbol(resolve: Route__Build_Resolver<BuilderData, TokenType>, meta: Meta): Route<TokenType> {
    return route_new_orderracef({
        name: "symbol",

        src: [
            route_new_pattern({
                name: "whitespace",
                token: null,
                next_new: () => resolve({ key: "symbol" }, meta),

                pattern: pattern_new_regex({
                    regex: /\s+/g
                }),
            }),

            route_new_pattern({
                name: "number",
                next_new: () => resolve({ key: "operator_binary" }, meta),

                token: {
                    type: TokenType.Number
                },

                pattern: pattern_new_regex({
                    regex: /-?[1-9][0-9]*/g
                })
            }),

            route_new_pattern({
                name: "priority-scope",

                // modifying contextual data
                next_new: () => resolve({ key: "symbol" }, {
                    ...meta,

                    scope: [...meta.scope, TokenScope.Priority],
                }),

                token: {
                    type: TokenType.PriorityOpen
                },

                pattern: pattern_new_regex({
                    regex: /\(/g
                })
            })
        ],
    })
}

// route for endofscope - utility function
function route_endofscope(resolve: Route__Build_Resolver<BuilderData, TokenType>, meta: Meta): Route<TokenType> {
    const scope = meta.scope[meta.scope.length - 1]

    switch (scope) {
        case TokenScope.Priority:
            return route_new_pattern({
                name: "priority-scope-end",

                next_new: () => resolve({ key: "operator_binary" }, {
                    ...meta,

                    scope: meta.scope.slice(0, -1)
                }),

                token: {
                    type: TokenType.PriorityClose
                },

                pattern: pattern_new_regex({
                    regex: /\)/g
                })
            })
        case TokenScope.Root:
        default: {
            return route_new_eof({
                name: "end-of-file",
                token: null,
            })
        }
    }
}

// route for binary operator
function route_operator(resolve: Route__Build_Resolver<BuilderData, TokenType>, meta: Meta): Route<TokenType> {
    return route_new_orderracef({
        name: "operator-binary",

        src: [
            route_new_pattern({
                name: "whitespace",
                token: null,
                next_new: () => resolve({ key: "operator_binary" }, meta),

                pattern: pattern_new_regex({
                    regex: /\s+/g
                }),
            }),

            route_new_pattern({
                name: "number",
                next_new: () => resolve({ key: "symbol" }, meta),

                token: {
                    type: TokenType.OpBinary
                },

                pattern: pattern_new_regex({
                    regex: /(\/|\+|-|\*|\^|>(?!=)|>=|<(?!=)|<=|==|%)/g
                }),
            }),

            route_endofscope(resolve, meta)
        ],
    })
}

const src = "(13 * 2) ^ 3 + 2"

// will output tokens and possibly error (in this case no error)
const lexed = lexer_parse({
    src,
    route: route_init()
})

// defenitions for ast tree
enum TreeNode_Type {
    Number,
    OpBinary,
    Priority
}

type TreeNodeOperator = {
    type: TreeNode_Type.OpBinary
    operation: string
    left: Tree_Slot<TreeNode>
    right: Tree_Slot<TreeNode>
}

type TreeNodeNumber = {
    type: TreeNode_Type.Number
    value: number
}

type TreeNodePriority = {
    type: TreeNode_Type.Priority
    child: Tree_Slot<TreeNode>
}

type TreeNode = (
    | TreeNodeOperator
    | TreeNodeNumber
    | TreeNodePriority
)

// execution order
// used during ast build
enum EOrder {
    OpBinaryComp,
    OpBinaryPower,
    OpBinaryMult,
    OpBinaryAddition,
    Expression,
}

const eorder_new_biop = function(operation: string): number {
    switch (operation) {
        case "+":
        case "-":
            return EOrder.OpBinaryAddition
        case "*":
        case "/":
        case "%":
            return EOrder.OpBinaryMult
        case "^":
            return EOrder.OpBinaryPower
        case ">":
        case "<":
        case ">=":
        case "<=":
        case "==":
            return EOrder.OpBinaryComp
        default:
            return EOrder.OpBinaryAddition
    }
}

const eorder_new = function(node: TreeNode): number {
    switch (node.type) {
        case TreeNode_Type.OpBinary:
            return eorder_new_biop(node.operation)
        default:
            return EOrder.Expression
    }
}

// build ast
const ast = tree_build<TreeNode, TokenType>({
    tokens: lexed.tokens,

    // pointer is slot currently targeted
    // handler processes token and returns new node
    handler: (pointer, token) => {
        switch (token.type) {
            case TokenType.Number: {
                if (pointer.node !== null) {
                    throw new Error("TokenOrder: number should be processed at nullish slot")
                }

                const value = Number.parseInt(section_slice(token.section))

                if (Number.isNaN(value)) {
                    throw new Error(`TokenValue: number token is NaN value:${section_slice(token.section)}`)
                }

                // set up node
                pointer.node = {
                    type: TreeNode_Type.Number,
                    value
                }

                return pointer
            }
            case TokenType.OpBinary: {
                const operation = section_slice(token.section)

                // utility to insert aware of execution order
                return tree_insert_eorder({
                    // current slot pointer
                    tree_pointer: pointer,
                    // function that gets execution order from node
                    node_eorder: eorder_new,
                    // execution order of new node
                    insert_eorder: eorder_new_biop(operation),

                    // handler inserts node into slot that respects execution order
                    insert_handler: slot => {
                        // put target node to target slot and return right slot as new target
                        slot.node = {
                            type: TreeNode_Type.OpBinary,

                            operation,
                            left: { node: slot.node, parent: slot },
                            right: { node: null, parent: slot },
                        }

                        return slot.node.right
                    }
                })
            }
            case TokenType.EOF: {
                // finish
                return null
            }
            case TokenType.PriorityOpen: {
                // open priority scope
                pointer.node = {
                    type: TreeNode_Type.Priority,

                    child: {
                        parent: pointer,
                        node: pointer.node,
                    }
                }

                return pointer.node.child
            }
            case TokenType.PriorityClose: {
                // close priority scope
                for (; ;) {
                    const parent = pointer.parent

                    if (parent && parent.node) {
                        const parent_node = parent.node

                        if (parent_node.type === TreeNode_Type.Priority) {
                            return parent
                        } else {
                            pointer = parent
                        }
                    } else {
                        throw new Error(`Unexpected closing of priority scope`)
                    }
                }
            }
        }
    }
})

// actually execute ast
const reduced = tree_reduce<TreeNode, number>({
    root: ast,

    // reducer computes value of node
    // push children into api.queue if the node depends on them
    // return null if value can not be computed now
    reducer: api => {
        switch (api.node.type) {
            case TreeNode_Type.Number: {
                return { value: api.node.value }
            }
            case TreeNode_Type.Priority: {
                if (!api.node.child.node) {
                    throw new Error(`Unifinished Priority Expression`)
                }

                const child_computed = api.compute.get(api.node.child.node)

                if (child_computed === undefined) {
                    api.queue.push(api.node.child.node)

                    return null
                } else {
                    return { value: child_computed }
                }
            }
            case TreeNode_Type.OpBinary: {
                if (!api.node.left.node || !api.node.right.node) {
                    throw new Error(`Unifinished Binary Operation ${api.node.operation}`)
                }

                // check if left and right node are already processed
                const l = api.compute.get(api.node.left.node)
                const r = api.compute.get(api.node.right.node)

                // if they are not processed - push them into queue and delay calculation
                if (l === undefined) {
                    api.queue.push(api.node.left.node)

                    if (r === undefined) {
                        api.queue.push(api.node.right.node)
                    }

                    return null
                } else if (r === undefined) {
                    api.queue.push(api.node.right.node)

                    return null
                } else {
                    switch (api.node.operation) {
                        case "+":
                            return { value: l + r }
                        case "-":
                            return { value: l - r }
                        case "/":
                            return { value: Math.trunc(l / r) }
                        case "%":
                            return { value: l % r }
                        case "*":
                            return { value: l * r }
                        case "^":
                            return { value: l ** r }
                        case "==":
                            return { value: Number(l === r) }
                        case ">=":
                            return { value: Number(l >= r) }
                        case ">":
                            return { value: Number(l > r) }
                        case "<=":
                            return { value: Number(l <= r) }
                        case "<":
                            return { value: Number(l < r) }
                        default: {
                            throw new Error(`Unexpected operation ${api.node.operation}`)
                        }
                    }
                }
            }
        }
    },
})

console.log({ reduced })
```
