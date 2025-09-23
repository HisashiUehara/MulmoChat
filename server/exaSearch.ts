import Exa from "exa-js";

// 1) Instantiate the client (put EXA_API_KEY in your .env)
const exa = new Exa(process.env.EXA_API_KEY!);

// 2) A small helper that does search + (optionally) pulls contents
export async function exaSearch(
  query: string,
  opts?: {
    numResults?: number;
    includeDomains?: string[];
    excludeDomains?: string[];
    startPublishedDate?: string; // ISO: "2025-01-01"
    endPublishedDate?: string;   // ISO
    fetchText?: boolean;         // return cleaned article text
    fetchHighlights?: boolean;   // return query-relevant highlights
  }
) {
  const {
    numResults = 10,
    includeDomains,
    excludeDomains,
    startPublishedDate,
    endPublishedDate,
    fetchText = false,
    fetchHighlights = false,
  } = opts ?? {};

  // You can use either `search` (links only) or `searchAndContents` (links + content)
  const method = fetchText || fetchHighlights ? "searchAndContents" : "search";

  const res =
    method === "searchAndContents"
      ? await exa.searchAndContents(query, {
          numResults,
          includeDomains,
          excludeDomains,
          startPublishedDate,
          endPublishedDate,
          // contents retrieval flags:
          text: fetchText ? { maxCharacters: 5000 } : undefined,
          highlights: fetchHighlights || undefined,
        })
      : await exa.search(query, {
          numResults,
          includeDomains,
          excludeDomains,
          startPublishedDate,
          endPublishedDate,
        });

  // Normalize minimal shape for your app:
  return res.results.map(r => ({
    id: r.id,
    url: r.url,
    title: r.title,
    score: r.score,
    publishedDate: r.publishedDate,
    author: r.author,
    // present only if you asked for them:
    highlights: (r as any).highlights,
    text: (r as any).text,
  }));
}