Project: xhaka-changelog

Current file content:
## 2026-03-13 (100 commits)
_No significant changes._
## 2026-03-14 (100 commits)
### ✅ Built
- capture: session memory
### 🐛 Fixed
- fix: reset stuck organize job
## 2026-03-16 (100 commits)
### ✅ Built
- feat(sim): Phase 1 Digital Twins — NAH team behavioral nodes
- feat: add MiroFish article to inbox
- feat: queue-first architecture — dispatcher/capture/scheduler
- feat: add skill-graph content article to inbox
### 🐛 Fixed
- fix(intelligence): queue dedup + aggressive prune
- fix: prune bloated task queue (316 → clean)
- fix: fragility hardening — OpenAI fallback chain + GitHub SHA retry + cost logging
### 🔄 Changed
- chore: results-log [tool-monitor=success]
- chore: update railway latest-update
- chore: update posthog latest-update
- chore: update anthropic latest-update
- chore: update openai latest-update
- chore: update gohighlevel latest-update
- chore: update packages latest-update
- chore: update last-scan state
- chore: remediation-state update
- chore: reset stuck jobs to failed on boot [daily-log, heartbeat-check]
## 2026-03-16 (100 commits)
### ✅ Built
- feat: book intelligence pipeline — library, INDEX, E-Myth + 100M Offers processed
- feat: rebuild Control Room with live GitHub API polling — 8 live panels
- feat: add index.html redirect for Control Room
- feat: rebuild Control Room with live GitHub API polling — 8 live panels
### 🐛 Fixed
- researcher: cleared 0 article(s) from inbox (36 failed, kept for retry)
- researcher: cleared 0 article(s) from inbox (36 failed, kept for retry)
- researcher: cleared 0 article(s) from inbox (36 failed, kept for retry)
- researcher: cleared 0 article(s) from inbox (36 failed, kept for retry)
- researcher: cleared 0 article(s) from inbox (36 failed, kept for retry)
- intelligence: remove session-capture-2026-03-16-0046.md from inbox (parse error)
- intelligence: route session-capture-2026-03-16-0046.md → general (parse error)
### 🔄 Changed
- task-queue: completed researcher/process-article-inbox [task_1773637201306_zn8irlv]
- task-queue: update task_1773637201306_zn8irlv -> running
- task-queue: push researcher/process-article-inbox [task_1773637201306_zn8irlv]
- task-queue: completed researcher/process-article-inbox [task_1773636602764_8icxah9]
- task-queue: update task_1773636602764_8icxah9 -> running
- task-queue: push researcher/process-article-inbox [task_1773636602764_8icxah9]
- task-queue: completed researcher/process-article-inbox [task_1773636301377_1m80y0n]
- task-queue: update task_1773636301377_1m80y0n -> running
- task-queue: push researcher/process-article-inbox [task_1773636301377_1m80y0n]
- task-queue: completed researcher/process-article-inbox [task_1773635700780_fi38ybl]
- task-queue: update task_1773635700780_fi38ybl -> running
- task-queue: push researcher/process-article-inbox [task_1773635700780_fi38ybl]
- task-queue: completed researcher/process-article-inbox [task_1773635401606_kuktuzb]
- task-queue: update task_177363

---

Status: Critical issues identified
Current State: The xhaka-control-room is experiencing a crash loop, redeploying every minute due to a Railway service error. This is causing significant disruption, and Corey needs to investigate the Railway logs to identify the root cause. The issue is not related to recent commits, indicating a configuration or environment problem.
## 2026-03-22 (100 commits)
### 🔄 Changed
- chore: job-registry [heartbeat-check=running]
- chore: results-log [operator=success]
- chore: job-registry [operator=success]
- chore: operator-log [cleanup=alert]
- chore: job-registry [operator=running]
- chore: results-log [operator=success]
- chore: job-registry [dispatcher=success]
- chore: job-registry [dispatcher=running]
- chore: operator-log [improve=alert]
- chore: job-registry [operator=success]
- chore: results-log [dispatcher=success]
- chore: job-registry [operator=success]
- chore: operator-log [cleanup=alert]
- chore: job-registry [operator=running]
- chore: results-log [operator=success]
- chore: job-registry [operator=success]
- chore: operator-log [improve=alert]
- chore: job-registry [dispatcher=success]
- chore: job-registry [capture=running]
- chore: results-log [operator=success]
- chore: job-registry [operator=success]
- chore: operator-log [cleanup=alert]
- chore: job-registry [operator=running]
- chore: results-log [dispatcher=success]
- chore: job-registry [operator=success]
- chore: operator-log [improve=alert]
- chore: job-registry [dispatcher=success]
- chore: job-registry [dispatcher=running]
- chore: results-log [operator=success]
- chore: job-registry [operator=success]
- chore: operator-log [cleanup=alert]
- chore: job-registry [operator=running]
- chore: results-log [dispatcher=success]
- chore: job-registry [operator=success]
- chore: operator-log [improve=alert]
- chore: job-registry [dispatcher=success]
- chore: job-registry [dispatcher=running]
- chore: results-log [operator=success]
- chore: job-registry [operator=success]
- chore: operator-log [cleanup=alert]
- chore: job-registry [operator=running]
- chore: results-log [dispatcher=success]
- chore: job-registry [capture=success]
- chore: job-registry [watchdog=success]
- chore: job-registry [watchdog=running]
- chore: results-log [operator=success]
- chore: job-registry [operator=success]
- chore: operator-log [cleanup=alert]
- chore: job-registry [operator=running]
- chore: results-log [operator=success]
- chore: results-log [dispatcher=success]
- chore: operator-log [improve=alert]