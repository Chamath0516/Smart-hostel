import express from "express";
import { createStudentUser } from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/create-student", protect, authorizeRoles("admin"), createStudentUser);

export default router;
