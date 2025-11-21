import db from "../db.js";

export const getTeamStats = async (req, res) => {
  try {
    const teamId = req.params.teamId;

    // -------------------------------------------------------
    // 1) TEAM SUMMARY STATS (TOTALS + AVERAGES + SHOOTING %)
    // -------------------------------------------------------
    const [summary] = await db.query(
      `
      SELECT 
        t.TeamID AS teamId,
        t.TeamName AS teamName,

        -- Totals
        SUM(gs.Points) AS totalPoints,
        SUM(gs.Rebounds) AS totalRebounds,
        SUM(gs.Assists) AS totalAssists,
        SUM(gs.Steals) AS totalSteals,
        SUM(gs.Blocks) AS totalBlocks,
        SUM(gs.Turnovers) AS totalTurnovers,

        COUNT(DISTINCT gs.GameID) AS games,

        -- Per-game stats
        ROUND(SUM(gs.Points)/COUNT(DISTINCT gs.GameID), 1) AS ppg,
        ROUND(SUM(gs.Rebounds)/COUNT(DISTINCT gs.GameID), 1) AS rpg,
        ROUND(SUM(gs.Assists)/COUNT(DISTINCT gs.GameID), 1) AS apg,
        ROUND(SUM(gs.Steals)/COUNT(DISTINCT gs.GameID), 1) AS spg,
        ROUND(SUM(gs.Blocks)/COUNT(DISTINCT gs.GameID), 1) AS bpg,
        ROUND(SUM(gs.Turnovers)/COUNT(DISTINCT gs.GameID), 1) AS tpg,

        -- Shooting percentages (MATCHES YOUR TABLE: ThreePM / ThreePA)
        ROUND((SUM(gs.FGM) / NULLIF(SUM(gs.FGA), 0)) * 100, 1) AS fgp,
        ROUND((SUM(gs.ThreePM) / NULLIF(SUM(gs.ThreePA), 0)) * 100, 1) AS threepp,
        ROUND((SUM(gs.FTM) / NULLIF(SUM(gs.FTA), 0)) * 100, 1) AS ftp

      FROM Teams t
      JOIN Players p ON p.TeamID = t.TeamID
      JOIN GameStats gs ON gs.PlayerID = p.PlayerID
      WHERE t.TeamID = ?
      GROUP BY t.TeamID;
      `,
      [teamId]
    );

    if (!summary.length) {
      return res.json({});
    }

    const stats = summary[0];

    // -------------------------------------------------------
    // 2) GAME-BY-GAME STATS (FOR LINE CHARTS)
    // -------------------------------------------------------
    const [games] = await db.query(
      `
      SELECT 
        gs.GameID,
        SUM(gs.Points) AS PointsFor

        -- OPTIONAL: support PointsAgainst if you add column later
        -- , SUM(gs.PointsAgainst) AS PointsAgainst

      FROM GameStats gs
      JOIN Players p ON p.PlayerID = gs.PlayerID
      WHERE p.TeamID = ?
      GROUP BY gs.GameID
      ORDER BY gs.GameID;
      `,
      [teamId]
    );

    // Points line chart data
    stats.pointsAcrossGames = games.map(g => g.PointsFor);

    // If you add PointsAgainst later, uncomment this:
    // stats.pointsAgainstGames = games.map(g => g.PointsAgainst);

    // For now, safely return empty array to prevent frontend crashing:
    stats.pointsAgainstGames = games.map(() => 0);

    res.json(stats);

  } catch (err) {
    console.error("Error fetching team stats:", err);
    res.status(500).json({ error: "Error fetching team stats" });
  }
};
