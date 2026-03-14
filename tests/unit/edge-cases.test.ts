import * as fs from "fs";
import * as path from "path";
import { GoogleParser } from "../../src/parsers/google";
import { SearchEngineScraper } from "../../src/scraper";

const fixturesDir = path.join(__dirname, "..", "fixtures");
const parser = new GoogleParser();
const scraper = new SearchEngineScraper();

describe("edge cases", () => {
  describe("need_turn_on_javascript.html", () => {
    const html = fs.readFileSync(
      path.join(fixturesDir, "google", "need_turn_on_javascript.html"),
      "utf-8"
    );

    test("returns empty results, does not throw", () => {
      const results = parser.parse(html);
      expect(results.results).toEqual([]);
      expect(results.total_results).toBe(0);
    });

    test("metadata indicates javascript_required error", () => {
      const results = parser.parse(html);
      expect(results.metadata).toHaveProperty("error", "javascript_required");
    });
  });

  describe("empty HTML", () => {
    test("does not throw on empty string", () => {
      expect(() => parser.parse("")).not.toThrow();
      const results = parser.parse("");
      expect(results.results).toEqual([]);
    });

    test("scraper throws detection error on empty string without engine", () => {
      expect(() => scraper.parse("")).toThrow(/Could not detect/);
    });

    test("scraper returns empty results on empty string with engine specified", () => {
      const json = scraper.parse("", { engine: "google" });
      const parsed = JSON.parse(json);
      expect(parsed.results).toEqual([]);
    });
  });

  describe("malformed HTML", () => {
    test("handles unclosed tags gracefully", () => {
      const html = "<html><body><div class='g'><h3>Broken";
      const results = parser.parse(html);
      expect(Array.isArray(results.results)).toBe(true);
    });

    test("handles completely invalid content", () => {
      const results = parser.parse("not html at all { } < >");
      expect(Array.isArray(results.results)).toBe(true);
    });
  });

  describe("scraper output formats", () => {
    const html = fs.readFileSync(
      path.join(fixturesDir, "google", "organic_results.html"),
      "utf-8"
    );

    test("json output is valid JSON", () => {
      const output = scraper.parse(html);
      expect(() => JSON.parse(output)).not.toThrow();
    });

    test("markdown output is a non-empty string", () => {
      const output = scraper.parse(html, { outputFormat: "markdown" });
      expect(output.length).toBeGreaterThan(0);
      expect(output).toContain("# Search Results");
    });
  });
});
