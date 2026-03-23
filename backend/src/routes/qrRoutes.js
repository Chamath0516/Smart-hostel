import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import {
  logScan,
  getStudentQrStatus,
  getSecurityPin,
  getOutsideStudents,
  getLateStudents
} from "../controllers/qrController.js";

const router = express.Router();

// Public scan/status for gate QR flow
router.get("/status/:studentId", getStudentQrStatus);
router.post("/scan", logScan);
router.get("/security-pin", protect, authorizeRoles("security", "admin"), getSecurityPin);

// Warden views
router.get("/outside", protect, authorizeRoles("warden", "security", "admin"), getOutsideStudents);
router.get("/late", protect, authorizeRoles("warden", "admin"), getLateStudents);

export default router;
