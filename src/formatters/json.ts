import type { SearchResults } from "../types";

export function formatJSON(results: SearchResults): string {
  return JSON.stringify(results);
}
