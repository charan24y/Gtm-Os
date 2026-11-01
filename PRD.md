# GTM Customer Discovery Engine: PRD and 3-Hour Antigravity Build

TinyFish hackathon build plan. Written to be dropped into the repo as PRD.md and fed to Antigravity agents phase by phase.

## 1. Overview
- **One-liner:** Paste a product URL. Get 8 to 10 real people who are publicly showing the problem your product solves, each with a score, a one-line reason, and a link to the proof.
- **Goal for the demo:** One live run, end to end, on a pre-tested product, with real source links the judges can click.
- **Non-goals (roadmap slide only):** Apollo and Hunter enrichment, Resend email sending, Supabase, company mode, campaigns, reply tracking, analytics, auth.
- **Differentiator:** Every prospect is backed by evidence from a page that was actually fetched. No source URL, no row. Missing data shows as unknown, never guessed.

## 2. Users and Demo Scenario
- **User:** A solo founder or small team who built a product and does not know who needs it.
- **Demo scenario:** Pick one product with an active public community (a creator tool, developer tool or productivity app). Pre-test it. The founder pastes the URL and watches the agent work.

## 3. Core Flow
1. User pastes a product URL and clicks Run.
2. TinyFish fetches the product site.
3. LLM extracts product, problem, audience, three ICPs and 5 search queries aimed at people expressing the problem.
4. TinyFish searches public sources with those queries and keeps the top unique URLs.
5. TinyFish fetches each page.
6. LLM extracts prospects from the page text, with a verbatim evidence snippet, and scores them with the rubric.
7. Results stream into the UI as they are found, sorted by score.
8. User clicks through to source posts or exports CSV.

## 4. Honesty Rules
- A prospect row is only created if it has a source URL that was actually fetched.
- The evidence snippet must appear in the fetched text. Reject rows where it does not.
- Never invent contact details. Show "not found".
- Deduplicate by source URL and handle.
- Label output "public signals, not confirmed buying intent".

## 5. Scoring Rubric
- `problem_match` (0 to 40): Their stated problem matches the product's core problem.
- `intent` (0 to 30): Explicitly asking for a tool, comparing alternatives, or frustrated with one.
- `recency` (0 to 15): How recent the post or activity is.
- `icp_fit` (0 to 15): Role or segment fits one of the ICPs.
Total: 0 to 100.
