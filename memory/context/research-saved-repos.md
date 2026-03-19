# NemoClaw

- Repository: https://github.com/NVIDIA/NemoClaw
- Description: NVIDIA plugin for secure installation of OpenClaw. Simplifies running OpenClaw always-on assistants safely using NVIDIA OpenShell runtime and Nemotron models.
- Core Features:
  - Secure sandboxed environment (Landlock + seccomp + netns).
  - Inference routed through NVIDIA cloud.
  - Policy-enforced egress and filesystem control.
- Setup: `curl -fsSL https://www.nvidia.com/nemoclaw.sh | bash`

# Matt Pocock Skills

- Repository: https://github.com/mattpocock/skills
- Description: A collection of agent skills straight from Matt Pocock's .claude directory.
- Key Planning Skills:
  - `write-a-prd`: Create a PRD through interactive interview.
  - `prd-to-plan`: Turn PRD into vertical slice implementation plan.
  - `grill-me`: Relentless interviewing to resolve design decision trees.
- Key Development Skills:
  - `tdd`: Test-driven development red-green-refactor loop.
  - `triage-issue`: Bug investigation and TDD-based fix planning.
  - `git-guardrails-claude-code`: Blocks dangerous git commands in Claude Code.
- Installation: `npx skills@latest add [skill-path]`
