import type { Section } from "#src/section/type/Section.js";

export const section_slice = function (section: Section): string {
    return section.src.slice(section.pointer, section.pointer + section.length)
}
