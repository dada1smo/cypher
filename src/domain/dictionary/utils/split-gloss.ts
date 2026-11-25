import type { GlossLink } from '../types/word';

export type GlossPart = { text: string; target?: string };

/** Cut a definition into plain and linked parts. Links must be sorted; a bad span is dropped, never its text. */
export function splitGloss(gloss: string, links: GlossLink[]): GlossPart[] {
  const parts: GlossPart[] = [];
  let at = 0;
  for (const { start, end, target } of links) {
    if (start < at || end > gloss.length || start >= end) continue;
    if (start > at) parts.push({ text: gloss.slice(at, start) });
    parts.push({ text: gloss.slice(start, end), target });
    at = end;
  }
  if (at < gloss.length) parts.push({ text: gloss.slice(at) });
  return parts;
}
