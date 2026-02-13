import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Todo from "../models/Todo.js";
import Rule from "../models/Rule.js";

// @desc    Register new user
// @route   POST /api/v1/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please add all fields");
  }

  // Check if user exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    // Seed Demo Data
    try {
      await Rule.create([
        { user: user._id, text: "Drink 3L of water", order: 0 },
        { user: user._id, text: "Read 10 pages", order: 1 },
      ]);

      const today = new Date().toISOString().split("T")[0];
      await Todo.create([
        {
          user: user._id,
          title: "Welcome to Antigravity! 🚀",
          date: today,
          priority: "P1",
          time: "09:00",
          color: "#3b82f6",
          notes: "This is your first todo. Click to see details or edit it.",
          completed: false,
        },
        {
          user: user._id,
          title: "Explore Themes & Settings 🎨",
          date: today,
          priority: "P2",
          color: "#10b981",
          notes:
            "Go to settings and pick a theme (Calm, Green, Ocean, Dark) or upload a custom background.",
          completed: false,
        },
      ]);
    } catch (error) {
      console.error("Error seeding data", error);
      // Continue even if seeding fails
    }

    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
      preferences: user.preferences,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc    Authenticate a user
// @route   POST /api/v1/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for user email
  const user = await User.findOne({ email }).select("+password");

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
      preferences: user.preferences,
    });
  } else {
    res.status(400);
    throw new Error("Invalid credentials");
  }
});

// @desc    Get user data
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(req.user);
});

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "30d",
  });
};

export { registerUser, loginUser, getMe };
