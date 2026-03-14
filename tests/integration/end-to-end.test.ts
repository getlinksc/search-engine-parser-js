import * as fs from "fs";
import * as path from "path";
import { SearchEngineParser } from "../../src/scraper";

const scraper = new SearchEngineParser();
const fixturesDir = path.join(__dirname, "..", "fixtures");

function loadFixture(engine: string, file: string): string {
  return fs.readFileSync(path.join(fixturesDir, engine, file), "utf-8");
}

interface Fixture {
  engine: string;
  file: string;
}

const allFixtures: Fixture[] = [
  { engine: "google", file: "organic_results.html" },
  { engine: "google", file: "featured_snippet.html" },
  { engine: "google", file: "knowledge_panel.html" },
  { engine: "google", file: "search_github_repos.html" },
  { engine: "google", file: "search_python_web_scraping.html" },
  { engine: "google", file: "search_best_employee_scheduling_app.html" },
  { engine: "google", file: "search_seven_cloak.html" },
  { engine: "google", file: "supply-chain-director-jobs.html" },
  { engine: "google", file: "weekly_contacts_with_mobile.html" },
  { engine: "bing", file: "organic_results.html" },
  { engine: "bing", file: "search_github_repos.html" },
  { engine: "duckduckgo", file: "organic_results.html" },
  { engine: "duckduckgo", file: "search_github_repos.html" },
];

describe("end-to-end", () => {
  test.each(allFixtures)(
    "parses $engine/$file as JSON with auto-detection",
    ({ engine, file }) => {
      const html = loadFixture(engine, file);
      const json = scraper.parse(html);
      const parsed = JSON.parse(json);
      expect(parsed.search_engine).toBe(engine);
      expect(Array.isArray(parsed.results)).toBe(true);
      expect(parsed.parsed_at).toBeTruthy();
    }
  );

  test.each(allFixtures)(
    "parses $engine/$file as Markdown with auto-detection",
    ({ engine, file }) => {
      const html = loadFixture(engine, file);
      const md = scraper.parse(html, { outputFormat: "markdown" });
      expect(typeof md).toBe("string");
      expect(md.length).toBeGreaterThan(0);
      expect(md).toContain("# Search Results");
    }
  );

  test.each(allFixtures)(
    "parses $engine/$file with explicit engine option",
    ({ engine, file }) => {
      const html = loadFixture(engine, file);
      const json = scraper.parse(html, {
        engine: engine as "google" | "bing" | "duckduckgo",
      });
      const parsed = JSON.parse(json);
      expect(parsed.search_engine).toBe(engine);
    }
  );

  describe("Google fixtures produce non-empty results (excluding error pages)", () => {
    const googleWithResults = [
      "organic_results.html",
      "search_github_repos.html",
      "search_python_web_scraping.html",
      "search_best_employee_scheduling_app.html",
      "search_seven_cloak.html",
      "supply-chain-director-jobs.html",
    ];

    test.each(googleWithResults)("google/%s has results", (file) => {
      const html = loadFixture("google", file);
      const json = scraper.parse(html);
      const parsed = JSON.parse(json);
      expect(parsed.results.length).toBeGreaterThan(0);
    });
  });

  test("need_turn_on_javascript.html returns empty results", () => {
    const html = loadFixture("google", "need_turn_on_javascript.html");
    const json = scraper.parse(html, { engine: "google" });
    const parsed = JSON.parse(json);
    expect(parsed.results).toEqual([]);
    expect(parsed.metadata.error).toBe("javascript_required");
  });
});
