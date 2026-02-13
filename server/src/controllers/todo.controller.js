import asyncHandler from "express-async-handler";
import Todo from "../models/Todo.js";

// @desc    Get todos
// @route   GET /api/v1/todos
// @access  Private
const getTodos = asyncHandler(async (req, res) => {
  const { date, priority, completed, search, sort } = req.query;
  const query = { user: req.user.id };

  if (date) query.date = date;
  if (priority) query.priority = priority;
  if (completed) query.completed = completed === "true";
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { notes: { $regex: search, $options: "i" } },
    ];
  }

  let todoQuery = Todo.find(query);

  // Sorting
  if (sort) {
    const sortFields = sort.split(",").join(" ");
    todoQuery = todoQuery.sort(sortFields);
  } else {
    todoQuery = todoQuery.sort("date time priority"); // Default sort
  }

  const todos = await todoQuery;
  res.status(200).json(todos);
});

// @desc    Set todo
// @route   POST /api/v1/todos
// @access  Private
const setTodo = asyncHandler(async (req, res) => {
  if (!req.body.title) {
    res.status(400);
    throw new Error("Please add a text field");
  }

  const todo = await Todo.create({
    user: req.user.id,
    ...req.body,
  });

  res.status(200).json(todo);
});

// @desc    Update todo
// @route   PUT /api/v1/todos/:id
// @access  Private
const updateTodo = asyncHandler(async (req, res) => {
  const todo = await Todo.findById(req.params.id);

  if (!todo) {
    res.status(400);
    throw new Error("Todo not found");
  }

  // Check for user
  if (!req.user) {
    res.status(401);
    throw new Error("User not found");
  }

  // Make sure the logged in user matches the todo user
  if (todo.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("User not authorized");
  }

  const updatedTodo = await Todo.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.status(200).json(updatedTodo);
});

// @desc    Delete todo
// @route   DELETE /api/v1/todos/:id
// @access  Private
const deleteTodo = asyncHandler(async (req, res) => {
  const todo = await Todo.findById(req.params.id);

  if (!todo) {
    res.status(400);
    throw new Error("Todo not found");
  }

  // Check for user
  if (!req.user) {
    res.status(401);
    throw new Error("User not found");
  }

  // Make sure the logged in user matches the todo user
  if (todo.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("User not authorized");
  }

  await todo.deleteOne();

  res.status(200).json({ id: req.params.id });
});

export { getTodos, setTodo, updateTodo, deleteTodo };
