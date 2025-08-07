import type { Section } from "#src/section/type/Section.js"

export enum Pattern_Status {
    Error,
    Fulfilled
}

export type Pattern_Init = Readonly<{
    src: string
    pointer: number
}>

export type Pattern_Match = Readonly<{
    section: Section
    type: Pattern_Status
}>

export type Pattern = Readonly<{
    parse: (init: Pattern_Init) => Pattern_Match
}>
