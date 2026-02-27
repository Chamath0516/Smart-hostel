import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";
import {
  logScan,
  getOutsideStudents,
  getLateStudents
} from "../controllers/qrController.js";

const router = express.Router();

// Security scans
router.post("/scan", protect, allowRoles("security"), logScan);

// Warden views
router.get("/outside", protect, allowRoles("warden", "admin"), getOutsideStudents);
router.get("/late", protect, allowRoles("warden", "admin"), getLateStudents);

export default router;