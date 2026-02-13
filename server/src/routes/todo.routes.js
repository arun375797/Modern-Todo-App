import express from "express";
import {
  getTodos,
  setTodo,
  updateTodo,
  deleteTodo,
} from "../controllers/todo.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.route("/").get(protect, getTodos).post(protect, setTodo);
router.route("/:id").put(protect, updateTodo).delete(protect, deleteTodo);

export default router;
