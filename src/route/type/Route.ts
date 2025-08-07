import type { Section } from "#src/section/type/Section.js"
import type { Token } from "#src/token/type/Token.js"

export enum Route_Status {
    Error,
    Fulfilled
}

export type Route_Init = Readonly<{
    src: string
    pointer: number
}>

export type Route_Meta = Readonly<{
    name: string
}>

export type Route_MatchError = Readonly<{
    type: Route_Status.Error

    section: Section
    expectation: string
}>

export type Route_MatchFulfilled<Type> = Readonly<{
    type: Route_Status.Fulfilled

    section: Section
    token: Token<Type> | null
    next: Route<Type> | null
}>

export type Route_Match<Type> = (
    | Route_MatchError
    | Route_MatchFulfilled<Type>
)

export type Route<Type> = Readonly<{
    meta: Route_Meta
    parse: (init: Route_Init) => Route_Match<Type>
}>
