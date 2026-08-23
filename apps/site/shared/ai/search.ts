export interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  keywords: string[];
  route?: string;
}

export function scoreSearch(query: string, items: SearchResultItem[]) {
  const normalized = query.toLowerCase().trim();
  if (!normalized) return [];

  const tokens = normalized.split(/\s+/).filter(Boolean);

  return items
    .map((item) => {
      const haystack = `${item.title} ${item.subtitle} ${item.category} ${item.keywords.join(' ')}`.toLowerCase();
      const score = tokens.reduce((total, token) => total + (haystack.includes(token) ? 2 : 0), 0)
        + (haystack.includes(normalized) ? 4 : 0);

      return { item, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(({ item }) => item);
}
