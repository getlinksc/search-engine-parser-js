import * as fs from "fs";
import * as path from "path";
import { GoogleParser } from "../../src/parsers/google";

const fixturesDir = path.join(__dirname, "..", "fixtures", "google");
const parser = new GoogleParser();

function loadFixture(file: string): string {
  return fs.readFileSync(path.join(fixturesDir, file), "utf-8");
}

describe("GoogleParser", () => {
  test("engineName is google", () => {
    expect(parser.engineName).toBe("google");
  });

  describe("legacy format - organic_results.html", () => {
    const html = loadFixture("organic_results.html");
    const results = parser.parse(html);

    test("detects as google", () => {
      expect(results.search_engine).toBe("google");
    });

    test("extracts results", () => {
      expect(results.results.length).toBeGreaterThan(0);
    });

    test("results have titles and URLs", () => {
      for (const r of results.results) {
        expect(r.title).toBeTruthy();
        expect(r.url).toBeTruthy();
      }
    });

    test("results have sequential positions", () => {
      const positions = results.results.map((r) => r.position);
      for (let i = 0; i < positions.length; i++) {
        expect(positions[i]).toBe(i + 1);
      }
    });

    test("has parsed_at timestamp", () => {
      expect(results.parsed_at).toBeTruthy();
      expect(new Date(results.parsed_at).getTime()).not.toBeNaN();
    });
  });

  describe("featured_snippet.html", () => {
    const html = loadFixture("featured_snippet.html");
    const results = parser.parse(html);

    test("extracts featured snippet", () => {
      const snippets = results.results.filter(
        (r) => r.result_type === "featured_snippet"
      );
      expect(snippets.length).toBeGreaterThan(0);
      expect(snippets[0].position).toBe(0);
      expect(snippets[0].description).toBeTruthy();
    });
  });

  describe("knowledge_panel.html", () => {
    const html = loadFixture("knowledge_panel.html");
    const results = parser.parse(html);

    test("parses without error", () => {
      expect(results.search_engine).toBe("google");
    });

    test("returns results array", () => {
      expect(Array.isArray(results.results)).toBe(true);
    });
  });

  describe("modern format - search_github_repos.html", () => {
    const html = loadFixture("search_github_repos.html");
    const results = parser.parse(html);

    test("extracts results from modern format", () => {
      expect(results.results.length).toBeGreaterThan(0);
    });

    test("results have titles and URLs", () => {
      for (const r of results.results) {
        expect(r.title).toBeTruthy();
        expect(r.url).toBeTruthy();
        expect(r.url).toMatch(/^https?:\/\//);
      }
    });
  });

  describe("modern format - search_python_web_scraping.html", () => {
    const html = loadFixture("search_python_web_scraping.html");
    const results = parser.parse(html);

    test("extracts results", () => {
      expect(results.results.length).toBeGreaterThan(0);
    });
  });

  describe("modern format - search_best_employee_scheduling_app.html", () => {
    const html = loadFixture("search_best_employee_scheduling_app.html");
    const results = parser.parse(html);

    test("extracts results", () => {
      expect(results.results.length).toBeGreaterThan(0);
    });
  });

  describe("modern format - search_seven_cloak.html", () => {
    const html = loadFixture("search_seven_cloak.html");
    const results = parser.parse(html);

    test("extracts results", () => {
      expect(results.results.length).toBeGreaterThan(0);
    });
  });

  describe("modern format - supply-chain-director-jobs.html", () => {
    const html = loadFixture("supply-chain-director-jobs.html");
    const results = parser.parse(html);

    test("extracts results", () => {
      expect(results.results.length).toBeGreaterThan(0);
    });
  });

  describe("weekly_contacts_with_mobile.html", () => {
    const html = loadFixture("weekly_contacts_with_mobile.html");
    const results = parser.parse(html);

    test("parses without error", () => {
      expect(results.search_engine).toBe("google");
      expect(Array.isArray(results.results)).toBe(true);
    });
  });

  describe("JSON output format", () => {
    const html = loadFixture("organic_results.html");
    const results = parser.parse(html);

    test("serializes to valid JSON", () => {
      const json = JSON.stringify(results);
      const parsed = JSON.parse(json);
      expect(parsed.search_engine).toBe("google");
      expect(Array.isArray(parsed.results)).toBe(true);
    });
  });
});
