import { useEffect, useState } from "react";
import { useTodoStore } from "../store/todoStore";
import DailyRules from "../components/DailyRules";
import TodoList from "../components/TodoList";
import TodoForm from "../components/TodoForm";
import { Plus } from "lucide-react";
import { format } from "date-fns";

const Dashboard = () => {
  const { todos, fetchTodos, isLoading } = useTodoStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);

  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    fetchTodos({ date: today });
  }, [fetchTodos, today]);

  const handleEdit = (todo) => {
    setEditingTodo(todo);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingTodo(null);
  };

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Good{" "}
            {new Date().getHours() < 12
              ? "Morning"
              : new Date().getHours() < 18
                ? "Afternoon"
                : "Evening"}
          </h1>
          <p className="text-muted mt-1">
            Task for today, {format(new Date(), "MMMM do, yyyy")}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary/90 transition-all font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus size={20} />
          <span>New Task</span>
        </button>
      </div>

      <DailyRules />

      <div className="mb-6">
        <h2 className="text-xl font-bold text-text mb-4">Today's Focus</h2>
        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <TodoList todos={todos} onEdit={handleEdit} />
        )}
      </div>

      <TodoForm
        isOpen={isModalOpen}
        closeModal={handleClose}
        initialData={editingTodo}
      />
    </div>
  );
};

export default Dashboard;
