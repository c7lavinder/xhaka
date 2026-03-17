# IDEAS.md

---

## 💡 Stack-Specific Tool Intelligence (2026-03-16)

**Concept:** You upload your tech stack config. The system becomes an expert on *your specific setup* — not generic docs. Ask "how do I wire PostHog + Railway + Supabase together for a SaaS with 50 users?" and get an answer that knows your architecture.

**Why generic fails:** ChatGPT/Claude already answer generic tool questions well. Competing there = losing on distribution.

**The wedge:** Vertical by industry. "Tool intelligence for real estate ops teams." Every integration, every workflow, every gotcha for PropTech stacks (GHL + BatchDialer + CallRail + Podio + Railway). The combinations are too specific for generic AI to nail.

### 47 Micro-SaaS Score
| Factor | Score (1-10) | Notes |
|---|---|---|
| Customer income | 7 | PropTech/SaaS ops teams — can pay |
| Usage frequency | 6 | Weekly, not daily |
| Market gap | 8 | Generic AI bad at stack-specific combos |
| Can't self-build | 7 | Needs ongoing ingestion + indexing |
| Integration depth | 6 | Sits alongside existing tools |
| **Total** | **~420** | Below 500 threshold |

**Verdict:** Score ~420 — below the 500 build threshold. Not a standalone product right now.

**Better framing:** This is a *feature inside Gunner* or inside Xhaka — not a standalone SaaS. The tool knowledge hub we're building right now IS this, scoped to our own stack. If Gunner expands to 100+ users, offer it as a team feature: "Your team's private tool knowledge base."

**Status:** PARKED — revisit if Gunner hits 100 users and teams want stack intelligence as a feature.
