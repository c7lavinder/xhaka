---
title: Generate Better AI Designs in Claude Code — Design Inspiration Skill Workflow
source: UI Collective YouTube tutorial transcript
date: 2026-03-16
tags: [claude-code, design, skills, workflow, ui, architect]
---

# Better AI Designs with Claude Code — Design Inspiration Skill

## The Problem
Generic Claude Code design output = aggressive gradients, basic cards, "AI-generated" look. Even with a good prompt, first drafts look like every other AI design.

## The Solution: Design Inspiration Skill + Competitor Research

### Step 1: Create the Skill with One Prompt
```
Please build a Claude Skill called "design-inspiration". Every time a design 
is created or modified, Claude will look at the files inside this skill, 
which will include visual references of designs I want to mimic. This will 
help create designs more closely aligned with the look and feel we are going for.
```
Claude auto-generates the SKILL.md and creates an `images/` folder inside it.

### Step 2: Populate with Competitor Screenshots
- Find competitor/inspiration designs (Mobbin is recommended — repository of real app screens)
- Screenshot 3-6 examples per competitor
- Upload to the skill's images folder
- Organize: `images/linear/`, `images/competitor-2/`, etc.
- Name files descriptively

### Step 3: Run the Same Prompt — Better Results
Same one-line prompt + skill = designs that look closer to production-ready vs. generic AI output. Claude reads the reference images before generating any UI.

## Key Insight: Skills as Visual Memory
> "The more you populate your cloud skill, the better the output is going to get."

**Folder organization that scales:**
```
design-inspiration/
├── SKILL.md
└── images/
    ├── linear/         # Linear app screenshots
    ├── rocks/          # Competitor screenshots  
    ├── hero/           # Hero section inspiration
    ├── dashboard/      # Dashboard layouts
    ├── cards/          # Card components
    └── footer/         # Footer patterns
```

Break out by feature/section, not just by competitor. More granular = better targeted output.

## Application to Gunner

For the Gunner Architect agent, we should build a `gunner-design-inspiration` skill with:
- Screenshots of the Forge design system (existing Gunner UI)
- Screenshots of 2-3 competitor call coaching platforms
- Screenshots of leaderboard/dashboard designs we want to emulate
- Specific UI sections: call card, grade badge, leaderboard row, analytics charts

This gives Architect a visual reference baseline so it doesn't drift from the Forge system when adding new components.

## Tools Mentioned
- **Mobbin** (mobbin.com) — repository of real app screens, flows, UI elements for virtually every major company. Good for finding competitor inspiration before building.

---
*Source: UI Collective YouTube tutorial, 2026 | Processed: 2026-03-16*
