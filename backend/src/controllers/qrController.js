import asyncHandler from "express-async-handler";
import QRLog from "../models/QRLog.js";
import User from "../models/User.js";

// Helper: compute curfew time (adjust to your rules)
const getCurfewMinutes = (student) => {
  // If you have gender in profile later, replace this logic accordingly.
  // For now, return a single curfew (e.g., 22:30 = 1350 minutes)
  return 22 * 60 + 30;
};

const minutesNow = (date = new Date()) => date.getHours() * 60 + date.getMinutes();

// POST /api/qr/scan  (security only)
export const logScan = asyncHandler(async (req, res) => {
  const { studentUserId, action, destination, goingHome = false } = req.body;

  if (!studentUserId || !action) {
    res.status(400);
    throw new Error("studentUserId and action are required");
  }

  if (action === "exit" && !destination) {
    res.status(400);
    throw new Error("destination is required for exit");
  }

  // ensure student exists
  const student = await User.findById(studentUserId);
  if (!student || student.role !== "student") {
    res.status(404);
    throw new Error("Student not found");
  }

  // Create log
  const log = await QRLog.create({
    studentUserId,
    action,
    destination: action === "exit" ? destination : undefined,
    goingHome,
    scannedBy: req.user._id
  });

  // basic late flag (optional for response)
  let late = false;
  if (action === "entry") {
    const curfew = getCurfewMinutes(student);
    late = !goingHome && minutesNow() > curfew;
  }

  res.status(201).json({ message: "Scan logged", log, late });
});

// Determine “currently outside” = last action is exit (and not followed by entry)
export const getOutsideStudents = asyncHandler(async (req, res) => {
  const latest = await QRLog.aggregate([
    { $sort: { timestamp: -1 } },
    {
      $group: {
        _id: "$studentUserId",
        lastAction: { $first: "$action" },
        lastTimestamp: { $first: "$timestamp" },
        lastDestination: { $first: "$destination" },
        goingHome: { $first: "$goingHome" }
      }
    },
    { $match: { lastAction: "exit" } }
  ]);

  // populate student basic data
  const studentIds = latest.map((x) => x._id);
  const students = await User.find({ _id: { $in: studentIds } }).select("name email phone");

  // merge
  const map = new Map(students.map((s) => [String(s._id), s]));
  const result = latest.map((x) => ({
    student: map.get(String(x._id)),
    lastExitAt: x.lastTimestamp,
    destination: x.lastDestination,
    goingHome: x.goingHome
  }));

  res.json({ outside: result });
});

// Late list: outside students + current time past curfew (simple version)
export const getLateStudents = asyncHandler(async (req, res) => {
  const outsideAgg = await QRLog.aggregate([
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