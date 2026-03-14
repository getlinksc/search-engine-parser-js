import { formatJSON } from "../../src/formatters/json";
import { formatMarkdown } from "../../src/formatters/markdown";
import type { SearchResults } from "../../src/types";

function makeResults(overrides?: Partial<SearchResults>): SearchResults {
  return {
    search_engine: "google",
    query: "test query",
    total_results: 2,
    results: [
      {
        title: "First Result",
        url: "https://example.com/1",
        description: "First description",
        position: 1,
        result_type: "organic",
        metadata: {},
      },
      {
        title: "Second Result",
        url: "https://example.com/2",
        description: null,
        position: 2,
        result_type: "organic",
        metadata: {},
      },
    ],
    detection_confidence: 0.9,
    parsed_at: "2026-01-01T00:00:00Z",
    metadata: {},
    ...overrides,
  };
}

describe("formatJSON", () => {
  test("produces valid JSON", () => {
    const json = formatJSON(makeResults());
    const parsed = JSON.parse(json);
    expect(parsed.search_engine).toBe("google");
    expect(parsed.results.length).toBe(2);
  });
});

describe("formatMarkdown", () => {
  test("includes header with query", () => {
    const md = formatMarkdown(makeResults());
    expect(md).toContain("# Search Results: test query");
  });

  test("includes header without query", () => {
    const md = formatMarkdown(makeResults({ query: null }));
    expect(md).toContain("# Search Results\n");
  });

  test("includes total results", () => {
    const md = formatMarkdown(makeResults());
    expect(md).toContain("**Total Results:** 2");
  });

  test("omits total results when null", () => {
    const md = formatMarkdown(makeResults({ total_results: null }));
    expect(md).not.toContain("**Total Results:**");
  });

  test("includes organic results section", () => {
    const md = formatMarkdown(makeResults());
    expect(md).toContain("## Organic Results");
    expect(md).toContain("### 1. First Result");
  });

  test("includes featured snippet section", () => {
    const md = formatMarkdown(
      makeResults({
        results: [
          {
            title: "Snippet Title",
            url: "https://example.com/snippet",
            description: "Snippet content",
            position: 0,
            result_type: "featured_snippet",
            metadata: {},
          },
        ],
      })
    );
    expect(md).toContain("## Featured Snippet");
    expect(md).toContain("### Snippet Title");
    expect(md).toContain("**Source:** [example.com](https://example.com/snippet)");
  });

  test("includes other results section for non-standard types", () => {
    const md = formatMarkdown(
      makeResults({
        results: [
          {
            title: "People Also Ask",
            url: "https://example.com",
            description: "A question",
            position: 1,
            result_type: "people_also_ask",
            metadata: {},
          },
        ],
      })
    );
    expect(md).toContain("## Other Results");
    expect(md).toContain("*(people also ask)*");
  });

  test("handles other results with no URL", () => {
    const md = formatMarkdown(
      makeResults({
        results: [
          {
            title: "No URL Item",
            url: "",
            description: "Just a description",
            position: 1,
            result_type: "people_also_ask",
            metadata: {},
          },
        ],
      })
    );
    expect(md).toContain("## Other Results");
    expect(md).not.toContain("**URL:**");
  });

  test("handles featured snippet with no URL", () => {
    const md = formatMarkdown(
      makeResults({
        results: [
          {
            title: "Snippet",
            url: "",
            description: "Content",
            position: 0,
            result_type: "featured_snippet",
            metadata: {},
          },
        ],
      })
    );
    expect(md).toContain("## Featured Snippet");
    expect(md).not.toContain("**Source:**");
  });

  test("handles invalid URL in domainOf gracefully", () => {
    const md = formatMarkdown(
      makeResults({
        results: [
          {
            title: "Bad URL",
            url: "not-a-url",
            description: "Content",
            position: 0,
            result_type: "featured_snippet",
            metadata: {},
          },
        ],
      })
    );
    expect(md).toContain("not-a-url");
  });
});
