# 🛠️ Skill Sourcing & Integration

This playbook defines how we find, evaluate, and integrate new capabilities into the Xhaka agent ecosystem.

## 🔎 External Repositories
- **ClawHub**: The primary registry for official OpenClaw skills.
- **Master Skills GitHub**: A collection of community-driven skills, specifically focused on SEO and high-volume content workflows (Ref: Julian Goldie).
- **Awesome OpenClaw Skills**: Community-curated list of 5,400+ filtered skills.

## 📋 Evaluation Criteria
Before adding a new skill, Xhaka or the Researcher must evaluate:
1. **Utility**: Does it solve a problem for Corey, NAH, or Gunner?
2. **Security**: Does it require sensitive permissions or external API keys?
3. **Redundancy**: Can this already be done via the Builder or a simple script?
4. **Maintenance**: Is it a "one-hit wonder" or a durable tool?

## 🚀 Integration Process
1. **Inbox**: New skill sources are dropped into `intelligence/article-inbox.md`.
2. **Researcher**: The Researcher job evaluates the source and extracts specific skill definitions.
3. **Playbook Update**: Validated skills are added to the [Master Skills Library](../INDEX.md).
4. **Implementation**: The Operator or Builder configures the skill in the OpenClaw gateway if it requires installation.

---
*Next Action: Research Julian Goldie's specific "37 skills" and map them to NAH/Gunner growth.*
