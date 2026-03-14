import { detect, getParserForEngine } from "./detector";
import { formatJSON } from "./formatters/json";
import { formatMarkdown } from "./formatters/markdown";
import type { OutputFormat, EngineName, SearchResults } from "./types";

export class SearchEngineParser {
  parse(
    html: string,
    options?: { engine?: EngineName; outputFormat?: OutputFormat }
  ): string {
    const engine = options?.engine;
    const format = options?.outputFormat ?? "json";

    let results: SearchResults;

    if (engine) {
      const parser = getParserForEngine(engine);
      results = parser.parse(html);
    } else {
      const detection = detect(html);
      if (!detection) {
        throw new Error(
          "Could not detect search engine. Specify engine manually via options.engine."
        );
      }
      results = detection.parser.parse(html);
    }

    return format === "markdown" ? formatMarkdown(results) : formatJSON(results);
  }
}
