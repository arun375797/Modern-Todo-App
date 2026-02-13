import express from "express";
import {
  getRules,
  setRule,
  updateRule,
  deleteRule,
} from "../controllers/rule.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.route("/").get(protect, getRules).post(protect, setRule);
router.route("/:id").put(protect, updateRule).delete(protect, deleteRule);

export default router;
