import { TinyFish } from "@tiny-fish/sdk";

const tf = new TinyFish({ apiKey: "sk-tinyfish-yvcGRabmg0NXiv37oouDpr2b0YpcavTq" });

async function run() {
  console.log("--- 1. Testing live TinyFish fetch on https://resend.com ---");
  const res = await tf.fetch.getContents({ urls: ["https://resend.com"] });
  const result = res.results?.[0];
  console.log("Title:", result?.title);
  console.log("Description:", result?.description);
  console.log("Latency:", result?.latency_ms, "ms");
  const text = (result?.text || result?.markdown || "");
  console.log("Text length:", text.length);
  console.log("Text preview:\n", text.slice(0, 300));

  console.log("\n--- 2. Testing live TinyFish search on churn signals ---");
  const searchRes = await tf.search.query({ query: "switched from sendgrid to resend site:reddit.com OR site:x.com" });
  const results = searchRes.results || [];
  console.log(`Found ${results.length} results:`);
  results.slice(0, 3).forEach((r, idx) => {
    console.log(`[${idx + 1}] ${r.title}`);
    console.log(`    URL: ${r.url}`);
    console.log(`    Snippet: ${r.snippet}`);
  });
}

run().catch(console.error);
