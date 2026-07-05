import { en } from "./en";

export type Dictionary = typeof en;

/**
 * v1 ships English only; the locale toggle is v1.5 (brief, Part 0). When it
 * lands, this reads `settings.locale` and returns the matching dictionary.
 */
export function getDictionary(): Dictionary {
  return en;
}
