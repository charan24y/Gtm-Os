async function test() {
  console.log("--- 1. Calling /api/analyze for https://resend.com ---");
  const anRes = await fetch("http://localhost:3000/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: "https://resend.com" }),
  });
  const anData = await anRes.json();
  console.log("Analyze Response Status:", anRes.status);
  console.log("Product Name:", anData.data?.productName);
  console.log("Category:", anData.telemetry?.category);
  console.log("Recommended Mode:", anData.data?.recommendedMode);
  console.log("Search Queries:", anData.data?.searchQueries);

  console.log("\n--- 2. Calling /api/discover with Deep Web Radar ---");
  const disRes = await fetch("http://localhost:3000/api/discover", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productDna: anData.data, depth: "deep" }),
  });
  const disData = await disRes.json();
  console.log("Discover Response Status:", disRes.status);
  console.log("Prospects Count:", disData.prospects?.length);
  console.log("Telemetry:", disData.telemetry);

  (disData.prospects || []).slice(0, 3).forEach((p, idx) => {
    console.log(`\n[Prospect ${idx + 1}]`);
    console.log(`  Name: ${p.name}`);
    console.log(`  Role: ${p.role_or_handle}`);
    console.log(`  Company: ${p.company_or_channel}`);
    console.log(`  Email: ${p.contact_email}`);
    console.log(`  Score: ${p.relevance_score}/100`);
    console.log(`  Why Needed: ${p.why_identified}`);
    console.log(`  Evidence URL: ${p.evidence_url}`);
    console.log(`  Evidence Quote: ${p.evidence_quote_or_observation}`);
  });
}

test().catch(console.error);
