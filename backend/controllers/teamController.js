import db from "../db.js";

/**
 * -------------------------------------------------------
 * GET /api/teams
 * Returns all teams with their players
 * -------------------------------------------------------
 */
export const getAllTeams = async (req, res) => {
  try {
    const [teams] = await db.query(`
      SELECT 
        Teams.TeamID AS id,
        Teams.TeamName AS name,
        Teams.TeamColor AS color,
        Teams.Wins,
        Teams.Losses,
        Teams.Ties,
        Teams.PointDifferential,
        Teams.WinPercentage,
        Players.PlayerID,
        Players.PlayerName
      FROM Teams
      LEFT JOIN Players ON Teams.TeamID = Players.TeamID
      ORDER BY Teams.TeamID;
    `);

    // Reformat into nested structure the frontend expects
    const formatted = [];

    teams.forEach(row => {
      let team = formatted.find(t => t.id === row.id);
      if (!team) {
        team = {
          id: row.id,
          name: row.name,
          color: row.color,
          players: []
        };
        formatted.push(team);
      }

      // Add players only if they exist
      if (row.PlayerID) {
        team.players.push({
          id: row.PlayerID,
          name: row.PlayerName
        });
      }
    });

    res.json(formatted);

  } catch (err) {
    console.error("Error fetching teams:", err);
    res.status(500).json({ error: "Failed to retrieve teams" });
  }
};



/**
 * -------------------------------------------------------
 * POST /api/teams
 * Create a NEW team
 * Body example:
 * {
 *    "TeamName": "Lakers",
 *    "TeamColor": "Purple"
 * }
 * -------------------------------------------------------
 */
export const createTeam = async (req, res) => {
  try {
    const { TeamName, TeamColor } = req.body;

    if (!TeamName || !TeamColor) {
      return res.status(400).json({ error: "TeamName and TeamColor required" });
    }

    const [result] = await db.query(
      "INSERT INTO Teams (TeamName, TeamColor) VALUES (?, ?)",
      [TeamName, TeamColor]
    );

    res.json({
      TeamID: result.insertId,
      TeamName,
      TeamColor,
      Players: []
    });
  } catch (err) {
    console.error("Error creating team:", err);
    res.status(500).json({ error: "Failed to create team" });
  }
};



/**
 * -------------------------------------------------------
 * DELETE /api/teams/:id
 * Deletes a team AND its players
 * -------------------------------------------------------
 */
export const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete players on that team
    await db.query("DELETE FROM Players WHERE TeamID = ?", [id]);

    // Delete the team
    const [result] = await db.query("DELETE FROM Teams WHERE TeamID = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Team not found" });
    }

    res.json({ message: "Team deleted", TeamID: id });
  } catch (err) {
    console.error("Error deleting team:", err);
    res.status(500).json({ error: "Failed to delete team" });
  }
};

/**
 * -------------------------------------------------------
 * PATCH /api/teams/:id
 * Update a team's name or color
 * Body example:
 * {
 *    "TeamName": "New Name",
 *    "TeamColor": "Purple"
 * }
 * -------------------------------------------------------
 */
export const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { TeamName, TeamColor } = req.body;

    if (!TeamName && !TeamColor) {
      return res.status(400).json({
        error: "At least one of TeamName or TeamColor is required"
      });
    }

    let query = "UPDATE Teams SET ";
    const params = [];

    if (TeamName) {
      query += "TeamName = ?, ";
      params.push(TeamName);
    }
    if (TeamColor) {
      query += "TeamColor = ?, ";
      params.push(TeamColor);
    }

    // remove trailing comma
    query = query.slice(0, -2);

    query += " WHERE TeamID = ?";
    params.push(id);

    const [result] = await db.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Team not found" });
    }

    res.json({
      message: "Team updated",
      TeamID: id,
      TeamName,
      TeamColor
    });
  } catch (err) {
    console.error("Error updating team:", err);
    res.status(500).json({ error: "Failed to update team" });
  }
};

