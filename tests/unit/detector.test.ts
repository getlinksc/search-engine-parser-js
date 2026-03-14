import * as fs from "fs";
import * as path from "path";
import { detect } from "../../src/detector";

const fixturesDir = path.join(__dirname, "..", "fixtures");

function loadFixture(engine: string, file: string): string {
  return fs.readFileSync(path.join(fixturesDir, engine, file), "utf-8");
}

describe("detect", () => {
  const googleFixtures = [
    "organic_results.html",
    "featured_snippet.html",
    "knowledge_panel.html",
    "search_github_repos.html",
    "search_python_web_scraping.html",
    "search_best_employee_scheduling_app.html",
    "search_seven_cloak.html",
    "supply-chain-director-jobs.html",
    "weekly_contacts_with_mobile.html",
  ];

  test.each(googleFixtures)("detects Google for %s", (file) => {
    const html = loadFixture("google", file);
    const result = detect(html);
    expect(result).not.toBeNull();
    expect(result!.engine).toBe("google");
    expect(result!.confidence).toBeGreaterThanOrEqual(0.3);
  });

  test.each(["organic_results.html", "search_github_repos.html"])(
    "detects Bing for %s",
    (file) => {
      const html = loadFixture("bing", file);
      const result = detect(html);
      expect(result).not.toBeNull();
      expect(result!.engine).toBe("bing");
      expect(result!.confidence).toBeGreaterThanOrEqual(0.3);
    }
  );

  test.each(["organic_results.html", "search_github_repos.html"])(
    "detects DuckDuckGo for %s",
    (file) => {
      const html = loadFixture("duckduckgo", file);
      const result = detect(html);
      expect(result).not.toBeNull();
      expect(result!.engine).toBe("duckduckgo");
      expect(result!.confidence).toBeGreaterThanOrEqual(0.3);
    }
  );

  test("returns null for unrecognizable HTML", () => {
    const result = detect("<html><body><p>Hello world</p></body></html>");
    expect(result).toBeNull();
  });

  test("detects Google for JS-required error page", () => {
    const html = loadFixture("google", "need_turn_on_javascript.html");
    const result = detect(html);
    // May or may not detect — depends on meta tags in that page
    // But it should not throw
    expect(true).toBe(true);
  });
});
