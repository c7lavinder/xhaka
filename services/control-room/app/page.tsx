"use client";

import { useEffect, useState } from "react";
import StatusBar from "./components/StatusBar";
import MetricCard from "./components/MetricCard";
import ActivityFeed from "./components/ActivityFeed";
import AgentCard from "./components/AgentCard";
import {
  Bot,
  Cpu,
  FileText,
  GitCommit,
  Zap,
} from "lucide-react";
import { getRecentCommits, getRepoStats, fetchFromGitHub, parseResultsTsv } from "./lib/github";

const agents = [
  { name: "Dispatcher", emoji: "\u2699\uFE0F", role: "Job Orchestrator", responsibility: "Schedules and runs all jobs via the queue system", trigger: "Cron + queue", status: "active" as const },
  { name: "Intelligence", emoji: "\uD83E\uDDE0", role: "Evaluation Engine", responsibility: "Scores calls and generates coaching insights", trigger: "dispatcher", status: "active" as const },
  { name: "Builder", emoji: "\uD83D\uDEE0\uFE0F", role: "Engineering Agent", responsibility: "Implements features, fixes bugs, ships code", trigger: "task assignment", status: "standby" as const },
  { name: "Sentinel", emoji: "\uD83D\uDEE1\uFE0F", role: "Watchdog", responsibility: "Monitors deploys, health checks, and drift", trigger: "scheduled", status: "scheduled" as const },
];

export default function HomePage() {
  const [stats, setStats] = useState({ totalFiles: 0, lastCommit: null as null | { sha: string; commit: { message: string; committer: { date: string } } } });
  const [recentActivity, setRecentActivity] = useState<{ id: string; type: "check" | "alert" | "info"; message: string; timestamp?: string }[]>([]);
  const [jobCount, setJobCount] = useState(0);

  useEffect(() => {
    getRepoStats().then(setStats);
    getRecentCommits(5).then((commits) => {
      setRecentActivity(
        commits.map((c, i) => ({
          id: String(i),
          type: "check" as const,
          message: c.commit.message.split("\n")[0],
          timestamp: new Date(c.commit.committer.date).toLocaleDateString(),
        }))
      );
    });
    fetchFromGitHub("data/results.tsv").then((tsv) => {
      parseResultsTsv(tsv).then((rows) => setJobCount(rows.length));
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <StatusBar />

      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Control Room</h1>
        <p className="text-sm text-slate-400">Xhaka intelligence platform overview</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Agents" value={agents.length} icon={Bot} color="teal" index={0} />
        <MetricCard title="Files Tracked" value={stats.totalFiles} icon={FileText} color="purple" index={1} />
        <MetricCard title="Job Results" value={jobCount} icon={Zap} color="yellow" index={2} />
        <MetricCard
          title="Last Commit"
          value={stats.lastCommit ? stats.lastCommit.sha.slice(0, 7) : "..."}
          subtitle={stats.lastCommit ? stats.lastCommit.commit.message.split("\n")[0].slice(0, 40) : ""}
          icon={GitCommit}
          color="blue"
          index={3}
        />
      </div>

      {/* Agents + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-teal-400" />
            Agents
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {agents.map((agent, i) => (
              <AgentCard key={agent.name} {...agent} index={i} />
            ))}
          </div>
        </div>

        <div>
          <ActivityFeed items={recentActivity} title="Recent Commits" />
        </div>
      </div>
    </div>
  );
}
