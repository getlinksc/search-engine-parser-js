export { SearchEngineParser } from "./scraper";
export { detect, getParserForEngine } from "./detector";
export { GoogleParser } from "./parsers/google";
export { BingParser } from "./parsers/bing";
export { DuckDuckGoParser } from "./parsers/duckduckgo";
export { formatJSON } from "./formatters/json";
export { formatMarkdown } from "./formatters/markdown";
export type {
  SearchResult,
  SearchResults,
  OutputFormat,
  EngineName,
  ResultType,
} from "./types";
export type { BaseParser } from "./parsers/base";
