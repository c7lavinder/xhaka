# Intelligence System

> Everything Corey feeds me gets processed, stored, and put to work here. Nothing gets lost.

## How It Works

**Input:** Corey sends an article, URL, voice note, screenshot, or thought
**Process:** Xhaka reads it, synthesizes what it means for our specific situation
**Store:** Saved here with context, tags, and connections to existing knowledge
**Apply:** Agents read from this — they get smarter from everything Corey touches

---

## Folder Structure

```
intelligence/
├── inbox/        ← Raw captures — unprocessed (Xhaka processes these immediately)
├── processed/
│   ├── gunner/   ← Intel relevant to Gunner product
│   ├── nah/      ← Intel relevant to New Again Houses
│   └── general/  ← Market, tools, personal — broader context
└── applied/      ← Where intel actually changed a decision, agent, or plan
```

---

## File Format (Every Processed Item)

```markdown
# [Title of Article/Topic]

**Date:** YYYY-MM-DD
**Source:** [URL or "Corey shared directly"]
**Category:** gunner | nah | general
**Tags:** [relevant tags]

## What It Is
[2-3 sentences — what the source actually says]

## What It Means for Us
[Specific connection to Gunner or NAH — not generic]

## Action Taken
[What changed as a result — or "none yet"]

## Connected To
[Links to related intel or agent files this informed]
```

---

## Rules

- Raw input → processed within the same session it's received
- Nothing stored without synthesis (storing raw = not useful)
- Every item tagged by project (gunner/nah/general)
- When intel changes an agent or decision → moved to `applied/` with a note on what changed
- The 24/7 intelligence service monitors this folder and propagates learnings to agents
