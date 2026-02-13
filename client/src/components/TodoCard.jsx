import { useState } from "react";
import { useTodoStore } from "../store/todoStore";
import {
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  Trash2,
  Edit2,
  Link as LinkIcon,
  AlignLeft,
  MoreVertical,
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

const PRIORITY_COLORS = {
  P1: "bg-red-500 text-white",
  P2: "bg-orange-500 text-white",
  P3: "bg-blue-500 text-white",
  P4: "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
};

const TodoCard = ({ todo, onEdit }) => {
  const { updateTodo, deleteTodo } = useTodoStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleComplete = () => {
    updateTodo(todo._id, { completed: !todo.completed });
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm("Delete this todo?")) {
      deleteTodo(todo._id);
    }
  };

  const isOverdue =
    !todo.completed &&
    todo.date &&
    new Date(todo.date + "T23:59:59") < new Date();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`group relative bg-card border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 ${
        todo.completed
          ? "opacity-60 border-border"
          : isOverdue
            ? "border-red-300 ring-1 ring-red-100"
            : "border-border"
      }`}
    >
      <div className="p-4 flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={toggleComplete}
          className={`mt-1 transition-colors ${
            todo.completed ? "text-primary" : "text-muted hover:text-primary"
          }`}
        >
          {todo.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
        </button>

        {/* Content */}
        <div
          className="flex-1 min-w-0"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${PRIORITY_COLORS[todo.priority]}`}
            >
              {todo.priority}
            </span>
            {todo.completed && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                Done
              </span>
            )}
            <div
              className="w-3 h-3 rounded-full ml-auto"
              style={{ backgroundColor: todo.color }}
            />
          </div>

          <h3
            className={`font-semibold text-lg text-text truncate ${todo.completed ? "line-through decoration-muted" : ""}`}
          >
            {todo.title}
          </h3>

          <div className="flex items-center gap-4 mt-2 text-sm text-muted">
            {todo.time && (
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>{todo.time}</span>
              </div>
            )}
            {todo.date && (
              <div
                className={`flex items-center gap-1 ${isOverdue ? "text-red-500 font-medium" : ""}`}
              >
                <Calendar size={14} />
                <span>{format(new Date(todo.date), "MMM d")}</span>
                {isOverdue && (
                  <span className="text-[10px] uppercase ml-1">Overdue</span>
                )}
              </div>
            )}
            {(todo.notes || (todo.links && todo.links.length > 0)) && (
              <div className="flex items-center gap-2 ml-auto">
                {todo.notes && <AlignLeft size={16} />}
                {todo.links?.length > 0 && <LinkIcon size={16} />}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(todo);
            }}
            className="p-1.5 hover:bg-muted/10 rounded-lg text-muted hover:text-primary"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 hover:bg-red-500/10 rounded-lg text-muted hover:text-red-500"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="px-4 pb-4 border-t border-border pt-3 bg-muted/5 rounded-b-xl"
        >
          {todo.notes && (
            <p className="text-sm text-text/80 whitespace-pre-wrap mb-3">
              {todo.notes}
            </p>
          )}
          {todo.links && todo.links.length > 0 && (
            <div className="space-y-1">
              {todo.links.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <LinkIcon size={12} />
                  {link.label || link.url}
                </a>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default TodoCard;
