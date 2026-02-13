import asyncHandler from "express-async-handler";
import Rule from "../models/Rule.js";

// @desc    Get rules
// @route   GET /api/v1/rules
// @access  Private
const getRules = asyncHandler(async (req, res) => {
  const rules = await Rule.find({ user: req.user.id }).sort("order");
  res.status(200).json(rules);
});

// @desc    Set rule
// @route   POST /api/v1/rules
// @access  Private
const setRule = asyncHandler(async (req, res) => {
  if (!req.body.text) {
    res.status(400);
    throw new Error("Please add text");
  }

  const maxOrderRule = await Rule.findOne({ user: req.user.id }).sort("-order");
  const newOrder = maxOrderRule ? maxOrderRule.order + 1 : 0;

  const rule = await Rule.create({
    user: req.user.id,
    text: req.body.text,
    order: newOrder,
  });

  res.status(200).json(rule);
});

// @desc    Update rule
// @route   PUT /api/v1/rules/:id
// @access  Private
const updateRule = asyncHandler(async (req, res) => {
  const rule = await Rule.findById(req.params.id);

  if (!rule) {
    res.status(400);
    throw new Error("Rule not found");
  }

  if (rule.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("User not authorized");
  }

  const updatedRule = await Rule.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.status(200).json(updatedRule);
});

// @desc    Delete rule
// @route   DELETE /api/v1/rules/:id
// @access  Private
const deleteRule = asyncHandler(async (req, res) => {
  const rule = await Rule.findById(req.params.id);

  if (!rule) {
    res.status(400);
    throw new Error("Rule not found");
  }

  if (rule.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("User not authorized");
  }

  await rule.deleteOne();

  res.status(200).json({ id: req.params.id });
});

export { getRules, setRule, updateRule, deleteRule };
