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

  // Properly update nested fields
  if (req.body.theme) user.preferences.theme = req.body.theme;
  if (req.body.font) user.preferences.font = req.body.font;
  // Use hasOwnProperty to allow setting empty string
  if (Object.prototype.hasOwnProperty.call(req.body, "textColor")) {
    user.preferences.textColor = req.body.textColor;
  }

  if (req.body.background) {
    if (req.body.background.type)
      user.preferences.background.type = req.body.background.type;
    if (req.body.background.value !== undefined)
      user.preferences.background.value = req.body.background.value;
  }

  if (req.body.overlay) {
    if (req.body.overlay.dim !== undefined)
      user.preferences.overlay.dim = req.body.overlay.dim;
    if (req.body.overlay.blur !== undefined)
      user.preferences.overlay.blur = req.body.overlay.blur;
  }

  // Mark modified to ensure save (sometimes needed for mixed types/deep nesting)
  user.markModified("preferences");

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
