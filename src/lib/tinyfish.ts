import { TinyFish } from "@tiny-fish/sdk";
import { validateSafeUrl } from "./security/ssrf";

const apiKey = process.env.TINYFISH_API_KEY || "";

export const tinyfish = apiKey ? new TinyFish({ apiKey }) : null;

// Helper to fetch page markdown & metadata via TinyFish Fetch API with SSRF check
export async function fetchPageContent(rawUrl: string): Promise<{
  title?: string;
  description?: string;
  markdown: string;
  latency_ms?: number;
  error?: string;
}> {
  const safeCheck = validateSafeUrl(rawUrl);
  if (!safeCheck.valid || !safeCheck.normalizedUrl) {
    return { markdown: "", error: safeCheck.error || "Invalid or prohibited URL." };
  }

  const url = safeCheck.normalizedUrl;

  if (tinyfish) {
    try {
      const res = await tinyfish.fetch.getContents({ urls: [url] });
      const result = res.results?.[0];
      if (result) {
        const textContent =
          ("text" in result && typeof result.text === "string" ? result.text : "") ||
          ("markdown" in result && typeof result.markdown === "string" ? result.markdown : "");

        return {
          title: "title" in result && typeof result.title === "string" ? result.title : undefined,
          description: "description" in result && typeof result.description === "string" ? result.description : undefined,
          markdown: textContent,
          latency_ms: "latency_ms" in result && typeof result.latency_ms === "number" ? result.latency_ms : undefined,
        };
      }
    } catch (e) {
      console.warn("TinyFish SDK fetch failed, attempting REST fallback:", e);
    }
  }

  // Direct REST fallback
  if (apiKey) {
    try {
      const res = await fetch("https://api.fetch.tinyfish.ai", {
        method: "POST",
        headers: {
          "X-API-Key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, format: "markdown" }),
      });
      const data = await res.json();
      const first = data.results?.[0];
      const content = first?.text || first?.markdown || "";
      return {
        title: first?.title,
        description: first?.description,
        markdown: content,
        latency_ms: first?.latency_ms,
      };
    } catch (err) {
      console.error("Direct fetch error:", err);
      return { markdown: "", error: "Failed to connect to TinyFish fetch endpoint." };
    }
  }

  return { markdown: "", error: "TINYFISH_API_KEY not configured." };
}

// Helper to search via TinyFish Search API
export async function searchWeb(
  query: string,
  maxResults = 5
): Promise<Array<{ title: string; url: string; snippet: string }>> {
  if (tinyfish) {
    try {
      const res = await tinyfish.search.query({ query });
      if (res.results) {
        return res.results.slice(0, maxResults).map((r: { title: string; url: string; snippet: string }) => ({
          title: r.title,
          url: r.url,
          snippet: r.snippet,
        }));
      }
    } catch (e) {
      console.warn("TinyFish SDK search failed, attempting REST fallback:", e);
    }
  }

  if (apiKey) {
    try {
      const searchUrl = new URL("https://api.search.tinyfish.ai");
      searchUrl.searchParams.set("query", query);
      searchUrl.searchParams.set("max_results", maxResults.toString());

      const res = await fetch(searchUrl.toString(), {
        headers: { "X-API-Key": apiKey },
      });
      const data = await res.json();
      return (data.results || []).slice(0, maxResults);
    } catch (err) {
      console.error("Direct search error:", err);
    }
  }

  return [];
}

// Helper to trigger TinyFish Agent / Automation run
export async function runAutomationAgent(
  url: string,
  goal: string
): Promise<{ streaming_url?: string; result?: unknown; error?: string }> {
  if (tinyfish) {
    try {
      const run = await tinyfish.agent.run({
        url,
        goal,
      });
      return {
        streaming_url: ((run as unknown as Record<string, unknown>).streaming_url as string) || undefined,
        result: run.result,
      };
    } catch (e) {
      console.warn("TinyFish SDK agent run failed:", e);
    }
  }

  if (apiKey) {
    try {
      const res = await fetch("https://api.tinyfish.ai/v1/automation/run", {
        method: "POST",
        headers: {
          "X-API-Key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, goal }),
      });
      const data = await res.json();
      return {
        streaming_url: data.streaming_url,
        result: data.result,
      };
    } catch (err) {
      return { error: "Failed to connect to TinyFish agent endpoint." };
    }
  }

  return { error: "TINYFISH_API_KEY is not configured." };
}
