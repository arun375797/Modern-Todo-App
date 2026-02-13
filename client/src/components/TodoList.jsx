import { motion } from "framer-motion";
import TodoCard from "./TodoCard";

const TodoList = ({ todos, onEdit }) => {
  if (!todos || todos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/10 mb-4">
          <span className="text-2xl">📝</span>
        </div>
        <h3 className="text-lg font-medium text-text">No todos found</h3>
        <p className="text-muted">
          You're all caught up! Or maybe you should add something?
        </p>
      </div>
    );
  }

  return (
    <div className="columns-1 md:columns-2 xl:columns-3 gap-6 space-y-6">
      {todos.map((todo) => (
        <div key={todo._id} className="break-inside-avoid">
          <TodoCard todo={todo} onEdit={onEdit} />
        </div>
      ))}
    </div>
  );
};

export default TodoList;
