import { useState, useEffect } from "react";
import { useTodoStore } from "../store/todoStore";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
  isToday,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import TodoForm from "../components/TodoForm";

const Calendar = () => {
  const { todos, fetchTodos } = useTodoStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Fetch all todos - optimizations could be made to fetch by range
    fetchTodos();
  }, [fetchTodos]);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const jumpToToday = () => setCurrentDate(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const getDayTodos = (day) => {
    return todos.filter((todo) => {
      if (!todo.date) return false;
      // Handle timezone offset issues by comparing date strings YYYY-MM-DD
      return todo.date === format(day, "yyyy-MM-dd");
    });
  };

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handleDayClick = (day) => {
    setSelectedDate(day);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 h-[calc(100vh-140px)] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-text">Calendar</h1>
          <p className="text-muted">Plan your schedule.</p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={jumpToToday}
            className="text-sm font-medium text-primary hover:underline"
          >
            Today
          </button>
          <div className="flex items-center bg-card rounded-xl border border-border shadow-sm">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-muted/10 rounded-l-xl text-text"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="px-4 font-semibold text-text min-w-[140px] text-center">
              {format(currentDate, "MMMM yyyy")}
            </div>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-muted/10 rounded-r-xl text-text"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm flex-1 flex flex-col overflow-hidden">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-border bg-muted/5">
          {dayNames.map((day) => (
            <div
              key={day}
              className="py-3 text-center text-sm font-medium text-muted"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 flex-1 auto-rows-fr">
          {calendarDays.map((day, dayIdx) => {
            const dayTodos = getDayTodos(day);
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isDayToday = isToday(day);

            return (
              <div
                key={day.toString()}
                onClick={() => handleDayClick(day)}
                className={`border-b border-r border-border p-2 min-h-[100px] flex flex-col transition-colors cursor-pointer group hover:bg-primary/5 ${
                  !isCurrentMonth ? "bg-muted/5 text-muted" : "bg-card"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span
                    className={`text-sm w-7 h-7 flex items-center justify-center rounded-full font-medium ${
                      isDayToday
                        ? "bg-primary text-white"
                        : !isCurrentMonth
                          ? "text-muted"
                          : "text-text"
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                  <button className="opacity-0 group-hover:opacity-100 text-primary hover:bg-primary/10 p-1 rounded transition-all">
                    <Plus size={14} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
                  {dayTodos.map((todo) => (
                    <div
                      key={todo._id}
                      className={`text-[10px] px-1.5 py-0.5 rounded truncate font-medium border-l-2 ${
                        todo.completed
                          ? "opacity-50 line-through bg-muted/20"
                          : "bg-primary/10 text-text"
                      }`}
                      style={{
                        borderLeftColor: todo.color,
                        backgroundColor: todo.completed
                          ? undefined
                          : `${todo.color}15`,
                      }}
                    >
                      {todo.title}
                    </div>
                  ))}
                  {dayTodos.length > 3 && (
                    <div className="text-[10px] text-muted pl-1">
                      + {dayTodos.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <TodoForm
        isOpen={isModalOpen}
        closeModal={handleCloseModal}
        initialData={{
          date: selectedDate
            ? format(selectedDate, "yyyy-MM-dd")
            : format(new Date(), "yyyy-MM-dd"),
        }}
      />
    </div>
  );
};

export default Calendar;
