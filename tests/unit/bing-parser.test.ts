import * as fs from "fs";
import * as path from "path";
import { BingParser } from "../../src/parsers/bing";

const fixturesDir = path.join(__dirname, "..", "fixtures", "bing");
const parser = new BingParser();

function loadFixture(file: string): string {
  return fs.readFileSync(path.join(fixturesDir, file), "utf-8");
}

describe("BingParser", () => {
  test("engineName is bing", () => {
    expect(parser.engineName).toBe("bing");
  });

  describe("organic_results.html", () => {
    const html = loadFixture("organic_results.html");
    const results = parser.parse(html);

    test("detects as bing", () => {
      expect(results.search_engine).toBe("bing");
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
