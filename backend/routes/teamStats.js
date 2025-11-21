import express from "express";
import { getTeamStats } from "../controllers/teamStatsController.js";

const router = express.Router();

router.get("/:teamId", getTeamStats);

export default router;
