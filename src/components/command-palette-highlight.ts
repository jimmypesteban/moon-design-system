export interface HighlightRun {
  text: string;
  matched: boolean;
}

/**
 * Greedy, case-insensitive left-to-right subsequence match — visual-only,
 * separate from `cmdk`'s own fuzzy scorer (which filters/ranks but never
 * exposes which characters it matched). Consecutive matched/unmatched
 * characters are merged into runs, so a label renders as a handful of spans
 * (typically 2-3), not one element per character.
 *
 * @example
 * ```ts
 * getHighlightRuns('Feature Flags', 'feat')
 * // => [{ text: 'Feat', matched: true }, { text: 'ure Flags', matched: false }]
 * ```
 */
export function getHighlightRuns(label: string, query: string): HighlightRun[] {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return [{ text: label, matched: false }];
  }

  const lowerLabel = label.toLowerCase();
  const lowerQuery = trimmedQuery.toLowerCase();
  const matchedIndices = new Set<number>();
  let queryIndex = 0;
  for (let i = 0; i < lowerLabel.length && queryIndex < lowerQuery.length; i++) {
    if (lowerLabel[i] === lowerQuery[queryIndex]) {
      matchedIndices.add(i);
      queryIndex++;
    }
  }

  if (matchedIndices.size === 0) {
    return [{ text: label, matched: false }];
  }

  const runs: HighlightRun[] = [];
  let currentText = '';
  let currentMatched = matchedIndices.has(0);
  for (let i = 0; i < label.length; i++) {
    const isMatched = matchedIndices.has(i);
    if (currentText && isMatched !== currentMatched) {
      runs.push({ text: currentText, matched: currentMatched });
      currentText = '';
    }
    currentMatched = isMatched;
    currentText += label[i];
  }
  if (currentText) {
    runs.push({ text: currentText, matched: currentMatched });
  }
  return runs;
}
