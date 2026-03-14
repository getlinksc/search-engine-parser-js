export type ResultType =
  | "organic"
  | "featured_snippet"
  | "knowledge_panel"
  | "news"
  | "image"
  | "sponsored"
  | "ai_overview"
  | "people_also_ask"
  | "people_saying"
  | "people_also_search"
  | "related_products";

export interface SearchResult {
  title: string;
  url: string;
  description: string | null;
  position: number;
  result_type: ResultType;
  metadata: Record<string, unknown>;
}

export interface SearchResults {
  search_engine: string;
  query: string | null;
  total_results: number | null;
  results: SearchResult[];
  detection_confidence: number;
  parsed_at: string;
  metadata: Record<string, unknown>;
}

export type OutputFormat = "json" | "markdown";

export type EngineName = "google" | "bing" | "duckduckgo";
