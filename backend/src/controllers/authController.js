import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email and password are required");
  }

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(409);
    throw new Error("User already exists");
  }

  const allowedRoles = ["student", "warden", "security", "finance", "admin"];

  if (role && !allowedRoles.includes(role)) {
    res.status(400);
    throw new Error("Invalid role. Allowed roles: student, warden, security, finance, admin");
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || "student",
    phone,
  });

  res.status(201).json({
    message: "Registered successfully",
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    token: generateToken(user),
  });
});

// @route   POST /api/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  // password is select:false, so we need +password
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  res.json({
    message: "Login successful",
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    token: generateToken(user),
  });
});

// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});
