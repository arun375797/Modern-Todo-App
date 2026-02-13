import asyncHandler from "express-async-handler";
import User from "../models/User.js";

// @desc    Update user preferences
// @route   PUT /api/v1/users/preferences
// @access  Private
const updatePreferences = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.preferences = {
    ...user.preferences,
    ...req.body,
  };

  await user.save();
  res.status(200).json(user.preferences);
});

// @desc    Upload background image
// @route   POST /api/v1/users/upload/background
// @access  Private
const uploadBackground = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("No file uploaded");
  }

  const user = await User.findById(req.user.id);
  const imageUrl = `/uploads/${req.file.filename}`;

  user.preferences.background = {
    type: "upload",
    value: imageUrl,
  };

  await user.save();
  res.status(200).json({ url: imageUrl, preferences: user.preferences });
});

export { updatePreferences, uploadBackground };
