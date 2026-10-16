export type InstagramKeywordMatchType = 'contains' | 'exact' | 'word';

export function matchesInstagramKeyword(
  commentText: string,
  keywords: string[],
  matchType: InstagramKeywordMatchType = 'contains',
): boolean {
  const text = commentText.trim().toLocaleLowerCase();
  if (!text) return false;

  return keywords.some((rawKeyword) => {
    const keyword = rawKeyword.trim().toLocaleLowerCase();
    if (!keyword) return false;
    if (matchType === 'exact') return text === keyword;
    if (matchType === 'word') {
      const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`(^|[^\\p{L}\\p{N}_])${escaped}($|[^\\p{L}\\p{N}_])`, 'u').test(text);
    }
    return text.includes(keyword);
  });
}
