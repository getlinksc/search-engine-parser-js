# Adding a New Search Engine Parser

This guide walks through creating a parser for a new search engine.

## 1. Create the parser file

Add `src/parsers/yandex.ts` (replace "yandex" with your engine name):

```typescript
import * as cheerio from "cheerio";
import type { CheerioAPI } from "cheerio";
import type { Element } from "domhandler";
import type { BaseParser } from "./base";
import type { SearchResult, SearchResults, EngineName } from "../types";

export class YandexParser implements BaseParser {
  readonly engineName = "yandex" as unknown as EngineName; // extend EngineName in types.ts

  canParse($: CheerioAPI): number {
    let confidence = 0;

    // Check for engine-specific identifiers
    const title = $("title").text();
    if (title.includes("Yandex")) confidence += 0.4;

    // Check for engine-specific DOM elements
    if ($("div.serp-item").length > 0) confidence += 0.4;

    return Math.min(confidence, 1);
  }

  extractQuery($: CheerioAPI): string | null {
    return $('input[name="text"]').attr("value") ?? null;
  }

  parse(html: string): SearchResults {
    const $ = cheerio.load(html);
    const confidence = this.canParse($);
    const query = this.extractQuery($);
    const results: SearchResult[] = [];
    let position = 1;

    $("div.serp-item").each((_, el) => {
      const $el = $(el);
      const title = $el.find("h2 a").text().trim();
      const url = $el.find("h2 a").attr("href") ?? "";
      const description = $el.find("div.text-container").text().trim() || null;

      if (title && url) {
        results.push({
          title,
          url,
          description,
          position: position++,
          result_type: "organic",
          metadata: {},
        });
      }
    });

    return {
      search_engine: "yandex",
      query,
      total_results: results.length,
      results,
      detection_confidence: confidence,
      parsed_at: new Date().toISOString(),
      metadata: {},
    };
  }
}
```

## 2. Register the parser in `detector.ts`

```typescript
// src/detector.ts
import { YandexParser } from "./parsers/yandex";

const parsers: BaseParser[] = [
  new GoogleParser(),
  new BingParser(),
  new DuckDuckGoParser(),
  new YandexParser(), // add here
];
```

Also add it to `getParserForEngine`:

```typescript
export function getParserForEngine(engine: EngineName): BaseParser {
  const map = {
    google: new GoogleParser(),
    bing: new BingParser(),
    duckduckgo: new DuckDuckGoParser(),
    yandex: new YandexParser(), // add here
  };
  return map[engine];
}
```

## 3. Extend `EngineName` in `types.ts`

```typescript
export type EngineName = "google" | "bing" | "duckduckgo" | "yandex";
```

## 4. Add HTML fixtures

Save real Yandex result pages to:

```
tests/fixtures/yandex/organic_results.html
tests/fixtures/yandex/search_something.html
```

Keep fixtures minimal — strip scripts/styles if possible.

## 5. Write tests

Create `tests/unit/yandex-parser.test.ts`:

```typescript
import * as fs from "fs";
import * as path from "path";
import { YandexParser } from "../../src/parsers/yandex";

const fixturesDir = path.join(__dirname, "..", "fixtures", "yandex");
const parser = new YandexParser();

function loadFixture(file: string): string {
  return fs.readFileSync(path.join(fixturesDir, file), "utf-8");
}

describe("YandexParser", () => {
  describe("organic_results.html", () => {
    const html = loadFixture("organic_results.html");
    const results = parser.parse(html);

    test("detects as yandex", () => expect(results.search_engine).toBe("yandex"));
    test("extracts results", () => expect(results.results.length).toBeGreaterThan(0));
    test("results have titles and URLs", () => {
      for (const r of results.results) {
        expect(r.title).toBeTruthy();
        expect(r.url).toMatch(/^https?:\/\//);
      }
    });
  });
});
```

## 6. Export from `index.ts`

```typescript
export { YandexParser } from "./parsers/yandex";
```

## Tips

- **Use `canParse` conservatively.** Only return high confidence (> 0.5) when you are certain. Multiple competing parsers can confuse auto-detection.
- **Handle gracefully.** If a selector finds nothing, return an empty `results` array — never throw.
- **Keep selectors minimal.** Prefer stable attributes (`id`, `data-testid`) over volatile class names that search engines change frequently.
- **Run `npm run test:coverage`** before submitting a PR and aim for > 90% coverage on your new file.
