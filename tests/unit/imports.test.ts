import {
  SearchEngineParser,
  detect,
  getParserForEngine,
  GoogleParser,
  BingParser,
  DuckDuckGoParser,
  formatJSON,
  formatMarkdown,
} from "../../src/index";

describe("index exports", () => {
  test("exports SearchEngineParser", () => {
    expect(SearchEngineParser).toBeDefined();
    expect(new SearchEngineParser()).toBeDefined();
  });

  test("exports detect", () => {
    expect(typeof detect).toBe("function");
  });

  test("exports getParserForEngine", () => {
    expect(typeof getParserForEngine).toBe("function");
    expect(getParserForEngine("google")).toBeInstanceOf(GoogleParser);
    expect(getParserForEngine("bing")).toBeInstanceOf(BingParser);
    expect(getParserForEngine("duckduckgo")).toBeInstanceOf(DuckDuckGoParser);
  });

  test("exports formatters", () => {
    expect(typeof formatJSON).toBe("function");
    expect(typeof formatMarkdown).toBe("function");
  });

  test("exports parser classes", () => {
    expect(GoogleParser).toBeDefined();
    expect(BingParser).toBeDefined();
    expect(DuckDuckGoParser).toBeDefined();
  });
});
