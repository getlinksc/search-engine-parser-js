import type { SearchResults, SearchResult } from "../types";

export function formatMarkdown(data: SearchResults): string {
  const lines: string[] = [];

  // Header
  const heading = data.query
    ? `# Search Results: ${data.query}`
    : "# Search Results";
  lines.push(heading, "");
  lines.push(`**Search Engine:** ${capitalize(data.search_engine)}`);
  if (data.total_results != null) {
    lines.push(`**Total Results:** ${data.total_results}`);
  }
  lines.push(`**Parsed:** ${data.parsed_at}`, "");
  lines.push("---", "");

  // Group results by type
  const featured = data.results.filter(r => r.result_type === "featured_snippet");
  const organic = data.results.filter(r => r.result_type === "organic");
  const others = data.results.filter(
    r => r.result_type !== "organic" && r.result_type !== "featured_snippet"
  );

  if (featured.length > 0) {
    lines.push("## Featured Snippet", "");
    for (const r of featured) {
      lines.push(`### ${r.title}`);
      if (r.description) lines.push(r.description);
      if (r.url) lines.push("", `**Source:** [${domainOf(r.url)}](${r.url})`);
      lines.push("");
    }
    lines.push("---", "");
  }

  if (organic.length > 0) {
    lines.push("## Organic Results", "");
    for (const r of organic) {
      lines.push(`### ${r.position}. ${r.title}`);
      if (r.description) lines.push(r.description);
      lines.push("", `**URL:** ${r.url}`, "");
    }
    lines.push("---", "");
  }

  if (others.length > 0) {
    lines.push("## Other Results", "");
    for (const r of others) {
      lines.push(`### ${r.title} *(${formatType(r.result_type)})*`);
      if (r.description) lines.push(r.description);
      if (r.url) lines.push("", `**URL:** ${r.url}`);
      lines.push("");
    }
    lines.push("---", "");
  }

  return lines.join("\n").trimEnd() + "\n";
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function domainOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function formatType(type: string): string {
  return type.replace(/_/g, " ");
}
