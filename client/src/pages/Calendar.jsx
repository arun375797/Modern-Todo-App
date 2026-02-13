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
  const dayNamesShort = ["S", "M", "T", "W", "T", "F", "S"];

  const handleDayClick = (day) => {
    setSelectedDate(day);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 h-[calc(100vh-100px)] md:h-[calc(100vh-140px)] flex flex-col px-2 md:px-0">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-3 md:mb-6 gap-2 md:gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text">Calendar</h1>
          <p className="text-muted text-xs md:text-sm">Plan your schedule.</p>
        </div>

        <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
          <button
            onClick={jumpToToday}
            className="text-xs md:text-sm font-medium text-primary hover:underline"
          >
            Today
          </button>
          <div className="flex items-center bg-card rounded-xl border border-border shadow-sm flex-1 md:flex-initial">
            <button
              onClick={prevMonth}
              className="p-1.5 md:p-2 hover:bg-muted/10 rounded-l-xl text-text"
            >
              <ChevronLeft size={18} className="md:w-5 md:h-5" />
            </button>
            <div className="px-2 md:px-4 font-semibold text-text text-sm md:text-base min-w-[120px] md:min-w-[140px] text-center">
              {format(currentDate, "MMMM yyyy")}
            </div>
            <button
              onClick={nextMonth}
              className="p-1.5 md:p-2 hover:bg-muted/10 rounded-r-xl text-text"
            >
              <ChevronRight size={18} className="md:w-5 md:h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl md:rounded-2xl border border-border shadow-sm flex-1 flex flex-col overflow-hidden">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-border bg-muted/5">
          {dayNames.map((day, idx) => (
            <div
              key={day}
              className="py-2 md:py-3 text-center text-xs md:text-sm font-medium text-muted"
            >
              <span className="hidden md:inline">{day}</span>
              <span className="md:hidden">{dayNamesShort[idx]}</span>
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
                className={`border-b border-r border-border p-1.5 md:p-2 min-h-[80px] md:min-h-[100px] flex flex-col transition-colors cursor-pointer group hover:bg-primary/5 ${
                  !isCurrentMonth ? "bg-muted/5 text-muted" : "bg-card"
                }`}
              >
                <div className="flex justify-between items-start mb-1 md:mb-1">
                  <span
                    className={`text-sm md:text-sm w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-full font-medium ${
                      isDayToday
                        ? "bg-primary text-white"
                        : !isCurrentMonth
                          ? "text-muted"
                          : "text-text"
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                  <button className="hidden md:block opacity-0 group-hover:opacity-100 text-primary hover:bg-primary/10 p-1 rounded transition-all">
                    <Plus size={14} />
                  </button>
                </div>

                {/* Mobile: Show dots only */}
                <div className="flex-1 flex md:hidden items-start pt-1">
                  {dayTodos.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {dayTodos.slice(0, 3).map((todo) => (
                        <div
                          key={todo._id}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            backgroundColor: todo.completed
                              ? "#94a3b8"
                              : todo.color,
                          }}
                        />
                      ))}
                      {dayTodos.length > 3 && (
                        <span className="text-[8px] text-muted">
                          +{dayTodos.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Desktop: Show todo list */}
                <div className="hidden md:flex flex-1 overflow-y-auto space-y-1 custom-scrollbar flex-col">
                  {dayTodos.slice(0, 3).map((todo) => (
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
                      +{dayTodos.length - 3}
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
