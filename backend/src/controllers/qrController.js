import asyncHandler from "express-async-handler";
import QRLog from "../models/QRLog.js";
import User from "../models/User.js";
import { getPinMeta, verifyPin } from "../utils/securityPin.js";

// Helper: compute curfew time (adjust to your rules)
const getCurfewMinutes = (student) => {
  // If you have gender in profile later, replace this logic accordingly.
  // For now, return a single curfew (e.g., 22:30 = 1350 minutes)
  return 22 * 60 + 30;
};

const minutesNow = (date = new Date()) => date.getHours() * 60 + date.getMinutes();

// GET /api/qr/status/:studentId (public)
export const getStudentQrStatus = asyncHandler(async (req, res) => {
  const studentId = String(req.params.studentId || "").trim();
  if (!studentId) {
    res.status(400);
    throw new Error("studentId is required");
  }

  const student = await User.findOne({ studentId }).select("_id studentId role");
  if (!student || student.role !== "student") {
    res.status(404);
    throw new Error("Student not found");
  }

  const latestLog = await QRLog.findOne({ studentUserId: student._id })
    .sort({ timestamp: -1 })
    .select("action timestamp");

  let status = "INSIDE";
  if (latestLog?.action === "exit") status = "OUTSIDE";
  if (latestLog?.action === "entry") status = "INSIDE";

  res.json({
    studentId: student.studentId,
    studentUserId: student._id,
    status,
    lastAction: latestLog ? latestLog.action.toUpperCase() : null,
    lastTime: latestLog ? latestLog.timestamp : null
  });
});

// POST /api/qr/scan
export const logScan = asyncHandler(async (req, res) => {
  const { studentId, action, destination, goingHome = false, securityPin } = req.body;
  const normalizedStudentId = String(studentId || "").trim();
  const normalizedAction = String(action || "").toLowerCase();
  const normalizedDestination = typeof destination === "string" ? destination.trim() : "";
  const normalizedSecurityPin = String(securityPin || "").trim();

  if (!normalizedStudentId || !normalizedAction) {
    res.status(400);
    throw new Error("studentId and action are required");
  }

  if (!normalizedSecurityPin) {
    res.status(400);
    throw new Error("securityPin is required");
  }

  if (!verifyPin(normalizedSecurityPin)) {
    res.status(400);
    throw new Error("Invalid or expired security PIN");
  }

  if (!["entry", "exit"].includes(normalizedAction)) {
    res.status(400);
    throw new Error("action must be ENTRY or EXIT");
  }

  if (normalizedAction === "exit" && !normalizedDestination) {
    res.status(400);
    throw new Error("destination is required for exit");
  }

  // ensure student exists
  const student = await User.findOne({ studentId: normalizedStudentId }).select("_id studentId role");
  if (!student || student.role !== "student") {
    res.status(404);
    throw new Error("Student not found");
  }

  // Create log
  const log = await QRLog.create({
    studentId: student.studentId,
    studentUserId: student._id,
    action: normalizedAction,
    destination: normalizedAction === "exit" ? normalizedDestination : undefined,
    goingHome,
    scannedBy: req.user?._id
  });

  // basic late flag (optional for response)
  let late = false;
  if (normalizedAction === "entry") {
    const curfew = getCurfewMinutes(student);
    late = !goingHome && minutesNow() > curfew;
  }

  res.status(201).json({ message: "Scan logged", log, late });
});

export const getSecurityPin = asyncHandler(async (_req, res) => {
  res.json(getPinMeta());
});

// Determine “currently outside” = last action is exit (and not followed by entry)
export const getOutsideStudents = asyncHandler(async (req, res) => {
  const latest = await QRLog.aggregate([
    { $match: { studentUserId: { $exists: true, $ne: null } } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$studentUserId",
        lastAction: { $first: "$action" },
        lastExitAt: { $first: "$createdAt" },
        destination: { $first: "$destination" },
        goingHome: { $first: "$goingHome" }
      }
    },
    { $match: { lastAction: "exit" } }
  ]);

  const curfewHour = Number.parseInt(process.env.CURFEW_HOUR || "", 10);
  const curfewMinute = Number.parseInt(process.env.CURFEW_MINUTE || "", 10);
  const hasEnvCurfew = Number.isInteger(curfewHour) && Number.isInteger(curfewMinute);
  const curfewMinutes = hasEnvCurfew
    ? curfewHour * 60 + curfewMinute
    : getCurfewMinutes();
  const nowMins = minutesNow();

  const studentIds = latest.map((row) => row._id);
  const students = await User.find({ _id: { $in: studentIds } }).select("name email phone studentId");
  const studentMap = new Map(
    students.map((student) => [
      String(student._id),
      {
        name: student.name,
        email: student.email,
        phone: student.phone,
        studentId: student.studentId
      }
    ])
  );

  const outside = latest.map((row) => ({
    student: studentMap.get(String(row._id)) || null,
    lastExitAt: row.lastExitAt,
    destination: row.destination,
    goingHome: row.goingHome,
    isLate: !row.goingHome && nowMins > curfewMinutes
  }));

  res.json({ outsideCount: outside.length, outside });
});

// Late list: outside students + current time past curfew (simple version)
export const getLateStudents = asyncHandler(async (req, res) => {
  const outsideAgg = await QRLog.aggregate([
    { $match: { studentUserId: { $exists: true, $ne: null } } },
    { $sort: { timestamp: -1 } },
    { $group: { _id: "$studentUserId", last: { $first: "$$ROOT" } } },
    { $match: { "last.action": "exit", "last.goingHome": false } }
  ]);

  const studentIds = outsideAgg.map((x) => x._id);
  const students = await User.find({ _id: { $in: studentIds } }).select("name email phone");

  const nowMins = minutesNow();
  const late = students
    .map((s) => ({ s, curfew: getCurfewMinutes(s) }))
    .filter(({ curfew }) => nowMins > curfew)
    .map(({ s }) => s);

  res.json({ lateCount: late.length, lateStudents: late });
});
