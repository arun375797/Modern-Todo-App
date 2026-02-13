import express from "express";
import {
  updatePreferences,
  uploadBackground,
} from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

router.put("/preferences", protect, updatePreferences);
router.post(
  "/upload/background",
  protect,
  upload.single("image"),
  uploadBackground,
);

export default router;
