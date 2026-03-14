# search-engine-parser

[![Tests](https://github.com/getlinksc/search-engine-parser/workflows/Tests/badge.svg)](https://github.com/getlinksc/search-engine-parser/actions?query=workflow%3ATests)
[![codecov](https://codecov.io/gh/getlinksc/search-engine-parser/branch/main/graph/badge.svg)](https://codecov.io/gh/getlinksc/search-engine-parser)
[![npm version](https://img.shields.io/npm/v/search-engine-parser.svg)](https://www.npmjs.com/package/search-engine-parser)
[![npm downloads](https://img.shields.io/npm/dm/search-engine-parser.svg)](https://www.npmjs.com/package/search-engine-parser)
[![Node.js](https://img.shields.io/node/v/search-engine-parser.svg)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Parse search engine HTML results into structured **JSON** or **Markdown**. Auto-detects Google, Bing, and DuckDuckGo.

---

## Install

```bash
npm install search-engine-parser
```

## Quick start

```typescript
import { SearchEngineParser } from "search-engine-parser";

const scraper = new SearchEngineParser();

// Auto-detect engine, returns JSON (default)
const json = scraper.parse(html);

// Returns Markdown (great for LLMs)
const markdown = scraper.parse(html, { outputFormat: "markdown" });
```

---

## API

### `scraper.parse(html, options?)`

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `html` | `string` | — | Raw HTML from a search results page |
| `options.engine` | `"google" \| "bing" \| "duckduckgo"` | auto-detect | Force a specific parser |
| `options.outputFormat` | `"json" \| "markdown"` | `"json"` | Output format |

**Returns:** `string` — JSON string or Markdown string.

**Throws:** `Error` if the search engine cannot be auto-detected and no `engine` option is provided.

---

## Output formats

### JSON

```json
{
  "search_engine": "google",
  "query": "python web scraping",
  "total_results": 3,
  "results": [
    {
      "title": "Web Scraping with Python - Real Python",
      "url": "https://realpython.com/python-web-scraping/",
      "description": "Learn how to scrape websites with Python...",
      "position": 1,
      "result_type": "organic",
      "metadata": {}
    }
  ],
  "detection_confidence": 0.9,
  "parsed_at": "2026-03-14T12:00:00.000Z",
  "metadata": {}
}
```

### Markdown

```markdown
# Search Results: python web scraping

**Search Engine:** Google
**Total Results:** 3
**Parsed:** 2026-03-14T12:00:00.000Z

---

## Organic Results

### 1. Web Scraping with Python - Real Python
Learn how to scrape websites with Python...

**URL:** https://realpython.com/python-web-scraping/
```

---

## Supported result types

| `result_type` | Description |
|---------------|-------------|
| `organic` | Standard organic search result |
| `featured_snippet` | Google featured snippet (position 0) |
| `knowledge_panel` | Knowledge panel entry |
| `news` | News result |
| `image` | Image result |
| `ai_overview` | Google AI Overview |
| `people_also_ask` | People Also Ask question |
| `people_saying` | Social post ("What people are saying") |
| `people_also_search` | "People also search for" carousel item |
| `related_products` | Related products/services suggestion |
| `sponsored` | Paid/sponsored result |

---

## Advanced usage

### Access parsed data directly

```typescript
import { detect, getParserForEngine } from "search-engine-parser";

// Detect engine and get confidence score
const detection = detect(html);
if (detection) {
  console.log(detection.engine);     // "google"
  console.log(detection.confidence); // 0.9
}

// Use a parser directly for SearchResults object
const parser = getParserForEngine("google");
const results = parser.parse(html);
console.log(results.results.length);
```

### Add a custom parser

Implement the `BaseParser` interface:

```typescript
import type { BaseParser } from "search-engine-parser";
import type { CheerioAPI } from "cheerio";
import type { SearchResults } from "search-engine-parser";
import * as cheerio from "cheerio";

class YandexParser implements BaseParser {
  readonly engineName = "yandex" as const;

  canParse($: CheerioAPI): number {
    const title = $("title").text();
    return title.includes("Yandex") ? 0.9 : 0;
  }

  extractQuery($: CheerioAPI): string | null {
    return $('input[name="text"]').attr("value") ?? null;
  }

  parse(html: string): SearchResults {
    const $ = cheerio.load(html);
    // ... extract results
  }
}
```

---

## Development

```bash
npm test              # run tests
npm run test:coverage # run tests with coverage report
npm run build         # compile TypeScript
```

---

## License

MIT
