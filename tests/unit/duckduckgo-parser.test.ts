import * as fs from "fs";
import * as path from "path";
import { DuckDuckGoParser } from "../../src/parsers/duckduckgo";

const fixturesDir = path.join(__dirname, "..", "fixtures", "duckduckgo");
const parser = new DuckDuckGoParser();

function loadFixture(file: string): string {
  return fs.readFileSync(path.join(fixturesDir, file), "utf-8");
}

describe("DuckDuckGoParser", () => {
  test("engineName is duckduckgo", () => {
    expect(parser.engineName).toBe("duckduckgo");
  });

  describe("organic_results.html", () => {
    const html = loadFixture("organic_results.html");
    const results = parser.parse(html);

    test("detects as duckduckgo", () => {
      expect(results.search_engine).toBe("duckduckgo");
    });

    test("extracts results", () => {
      expect(results.results.length).toBeGreaterThan(0);
    });

    test("results have titles and URLs", () => {
      for (const r of results.results) {
        expect(r.title).toBeTruthy();
        expect(r.url).toBeTruthy();
        expect(r.url).toMatch(/^https?:\/\//);
      }
    });

    test("results have descriptions", () => {
      const withDesc = results.results.filter((r) => r.description);
      expect(withDesc.length).toBeGreaterThan(0);
    });

    test("results have sequential positions", () => {
      const positions = results.results.map((r) => r.position);
      for (let i = 0; i < positions.length; i++) {
        expect(positions[i]).toBe(i + 1);
      }
    });

    test("has parsed_at timestamp", () => {
      expect(new Date(results.parsed_at).getTime()).not.toBeNaN();
    });
  });

  describe("search_github_repos.html", () => {
    const html = loadFixture("search_github_repos.html");
    const results = parser.parse(html);

    test("extracts results", () => {
      expect(results.results.length).toBeGreaterThan(0);
    });

    test("all results are organic", () => {
      for (const r of results.results) {
        expect(r.result_type).toBe("organic");
      }
    });
  });
});
