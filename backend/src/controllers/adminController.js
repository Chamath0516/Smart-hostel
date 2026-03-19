import asyncHandler from "express-async-handler";
import User from "../models/User.js";

// @route   POST /api/admin/create-student
// @access  Private (admin)
export const createStudentUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, studentId } = req.body;

  const normalizedStudentId = String(studentId || "").trim();

  if (!name || !email || !password || !normalizedStudentId) {
    res.status(400);
    throw new Error("Name, email, password and studentId are required");
  }

  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    res.status(409);
    throw new Error("User already exists");
  }

  const existingStudentId = await User.findOne({ studentId: normalizedStudentId });
  if (existingStudentId) {
    res.status(409);
    throw new Error("Student ID already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: "student",
    studentId: normalizedStudentId,
  });

  res.status(201).json({
    message: "Student created successfully",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      studentId: user.studentId,
    },
  });
});
