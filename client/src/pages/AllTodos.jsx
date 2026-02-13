import { useEffect, useState } from "react";
import { useTodoStore } from "../store/todoStore";
import TodoList from "../components/TodoList";
import TodoForm from "../components/TodoForm";
import { Plus, Filter, SortDesc } from "lucide-react";

const AllTodos = () => {
  const { todos, fetchTodos, isLoading } = useTodoStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    completed: "",
    priority: "",
    sort: "date",
  });

  useEffect(() => {
    // Debounce search could be added here
    fetchTodos(filters);
  }, [fetchTodos, filters]);

  const handleEdit = (todo) => {
    setEditingTodo(todo);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingTodo(null);
  };

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text">All Tasks</h1>
          <p className="text-muted mt-1">Manage and organize everything.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-all font-medium shadow-md"
        >
          <Plus size={20} />
          <span>New Task</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-card p-4 rounded-xl border border-border shadow-sm mb-6 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            name="search"
            placeholder="Search tasks..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-bg focus:ring-2 focus:ring-primary focus:outline-none"
            value={filters.search}
            onChange={handleFilterChange}
          />
          <Filter className="absolute left-3 top-2.5 text-muted" size={18} />
        </div>

        <select
          name="priority"
          value={filters.priority}
          onChange={handleFilterChange}
          className="px-4 py-2 rounded-lg border border-border bg-bg focus:ring-2 focus:ring-primary focus:outline-none"
        >
          <option value="">All Priorities</option>
          <option value="P1">High (P1)</option>
          <option value="P2">Medium (P2)</option>
          <option value="P3">Low (P3)</option>
          <option value="P4">None (P4)</option>
        </select>

        <select
          name="completed"
          value={filters.completed}
          onChange={handleFilterChange}
          className="px-4 py-2 rounded-lg border border-border bg-bg focus:ring-2 focus:ring-primary focus:outline-none"
        >
          <option value="">All Status</option>
          <option value="false">Active</option>
          <option value="true">Completed</option>
        </select>

        <select
          name="sort"
          value={filters.sort}
          onChange={handleFilterChange}
          className="px-4 py-2 rounded-lg border border-border bg-bg focus:ring-2 focus:ring-primary focus:outline-none"
        >
          <option value="date">Date</option>
          <option value="priority">Priority</option>
          <option value="-createdAt">Newest First</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <TodoList todos={todos} onEdit={handleEdit} />
      )}

      <TodoForm
        isOpen={isModalOpen}
        closeModal={handleClose}
        initialData={editingTodo}
      />
    </div>
  );
};

export default AllTodos;
