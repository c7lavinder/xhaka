# 🕸️ Skill Graph Architecture

This is the methodology for how Xhaka stores and traverses knowledge. It is based on the [[Arscontexta]] research.

## 📐 The Primitives
- **WikiLinks**: All knowledge nodes are connected via `[[wikilink]]` syntax. This allows an agent to see a reference and "jump" to that file.
- **YAML Frontmatter**: Every node has a description at the top so the agent can scan it without reading the whole file.
- **Maps of Content (MOC)**: Index files that organize clusters of related skills (e.g., the [[Master Skill Graph]]).

## 📈 Progressive Disclosure
Agents follow this path to minimize token waste:
1. **Index**: Scan the high-level topics.
2. **Descriptions**: Read the one-line purpose of a node.
3. **Traverse**: Follow the specific link that matters for the task.

---
*Goal: Move from an agent that follows instructions to an agent that understands the domain.*
