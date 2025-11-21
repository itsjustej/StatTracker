import React, { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar
} from "recharts";
import { ChevronDown } from "lucide-react";

function Donut({ title, value, color }) {
  const numericValue = Number(value);
  const safeValue = Number.isFinite(numericValue) ? numericValue : 0;
  const clampedValue = Math.max(0, Math.min(100, safeValue));

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 flex flex-col items-center">
      <h3 className="text-white font-bold mb-2">{title}</h3>

      <ResponsiveContainer width="100%" height={220}>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="70%"
          outerRadius="100%"
          startAngle={90}
          endAngle={90 - (clampedValue / 100) * 360}
          barSize={18}
          data={[{ value: clampedValue }]}
        >
          <RadialBar dataKey="value" fill={color} background={{ fill: "#1e293b" }} />
        </RadialBarChart>
      </ResponsiveContainer>

      <p className="text-xl font-bold text-white mt-2">{clampedValue.toFixed(1)}%</p>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 text-center">
      <p className="text-slate-400 text-sm mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{Number(value || 0).toFixed(1)}</p>
    </div>
  );
}

export default function TeamStats() {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [stats, setStats] = useState(null);

  // ---- Fetch all teams ----
  useEffect(() => {
    fetch("http://localhost:5000/api/teams")
      .then(res => res.json())
      .then(data => {
        setTeams(data);
        if (data.length > 0) setSelectedTeam(data[0].id);
      })
      .catch(err => console.error("Failed to load teams:", err));
  }, []);

  // ---- Fetch team stats whenever dropdown changes ----
  useEffect(() => {
    if (!selectedTeam) return;

    fetch(`http://localhost:5000/api/teamstats/${selectedTeam}`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error("Failed to load team stats:", err));
  }, [selectedTeam]);

  // Build line chart data safely
  const chartData = useMemo(() => {
    if (!stats?.pointsAcrossGames) return [];

    return stats.pointsAcrossGames.map((pf, i) => ({
      game: `G${i + 1}`,
      pf,
      pa: stats.pointsAgainstGames[i] || 0
    }));
  }, [stats]);

  if (teams.length === 0) return <p className="text-white">Loading teams...</p>;
  if (!stats) return <p className="text-white">Loading team stats...</p>;

  return (
    <div className="space-y-10">

      {/* Team Selector */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">
          Select Team
        </label>

        <div className="relative inline-block w-full max-w-xs">
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white appearance-none"
          >
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      {/* Top Row Stats */}
      <div className="grid md:grid-cols-6 gap-4">
        <StatCard label="PPG" value={stats.ppg} color="text-orange-500" />
        <StatCard label="RPG" value={stats.rpg} color="text-blue-400" />
        <StatCard label="APG" value={stats.apg} color="text-green-400" />
        <StatCard label="SPG" value={stats.spg} color="text-purple-400" />
        <StatCard label="BPG" value={stats.bpg} color="text-yellow-400" />
        <StatCard label="TPG" value={stats.tpg} color="text-red-400" />
      </div>

      {/* Donut Charts */}
      <div className="grid md:grid-cols-3 gap-6">
        <Donut title="FG%" value={stats.fgp} color="#6366f1" />
        <Donut title="3PT%" value={stats.threepp} color="#22c55e" />
        <Donut title="FT%" value={stats.ftp} color="#f59e0b" />
      </div>

      {/* Line Chart */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg text-white font-bold mb-4">Points Across Season</h3>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <XAxis dataKey="game" stroke="#94a3b8" hide={true} />

            <YAxis stroke="#94a3b8" />

            <Legend wrapperStyle={{ color: "white" }} />

            <Line type="monotone" dataKey="pf" stroke="#f59e0b" strokeWidth={3} dot={{ r: 5 }} name="Points For" />

            <Line type="monotone" dataKey="pa" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5 }} name="Points Against" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
