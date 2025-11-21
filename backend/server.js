import express from "express";
import cors from "cors";

import playerRoutes from "./routes/playerRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import gameRoutes from "./routes/gameRoutes.js";
import teamStatsRoutes from "./routes/teamStats.js";
import leagueLeaderRoutes from "./routes/leagueLeaderRoutes.js";

const app = express();

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- ROUTES ---
app.use("/api/players", playerRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/teamstats", teamStatsRoutes);
app.use("/api/league-leaders", leagueLeaderRoutes);

// --- START SERVER ---
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
