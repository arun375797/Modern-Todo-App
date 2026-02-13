import mongoose from "mongoose";

const todoSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dayLabel: {
      type: String,
      default: "Today",
    },
    title: {
      type: String,
      required: [true, "Please add a title"],
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    time: {
      type: String, // HH:mm
    },
    color: {
      type: String,
      default: "#ffffff",
    },
    priority: {
      type: String,
      enum: ["P1", "P2", "P3", "P4"],
      default: "P4",
    },
    notes: {
      type: String,
    },
    links: [
      {
        label: String,
        url: String,
      },
    ],
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Todo = mongoose.model("Todo", todoSchema);
export default Todo;
