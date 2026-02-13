import { useState, useEffect } from "react";
import { useTodoStore } from "../store/todoStore";
import {
  X,
  Play,
  Pause,
  CheckCircle2,
  RotateCcw,
  Minimize2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

const FocusMode = () => {
  const { activeFocusTask, clearFocusTask, updateTodo } = useTodoStore();
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState("focus"); // 'focus' or 'break'

  // Timer Tick
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Optional: Play sound here
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // Reset when task changes
  useEffect(() => {
    if (activeFocusTask) {
      setTimeLeft(25 * 60);
      setIsActive(false);
      setMode("focus");
    }
  }, [activeFocusTask]);

  // Goal Tracking: Update timeSpent (visual/local tracking could be added here)
  useEffect(() => {
    let interval = null;
    if (isActive && mode === "focus") {
      interval = setInterval(() => {
        // We generally trust the main timer above for 'timeLeft'.
        // To sync with backend strictly, we'd need more complex logic.
        // For now, we rely on 'updateProgress' when timer hits 0.
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, mode]);

  if (!activeFocusTask) return null;

  // Stats Calculation
  const stats =
    activeFocusTask.goalTime > 0
      ? {
          progress: Math.min(
            100,
            Math.round(
              (activeFocusTask.timeSpent / activeFocusTask.goalTime) * 100,
            ),
          ),
          timeLeft: Math.max(
            0,
            activeFocusTask.goalTime - activeFocusTask.timeSpent,
          ),
          sessionsLeft: Math.ceil(
            (activeFocusTask.goalTime - activeFocusTask.timeSpent) / 25,
          ),
        }
      : null;

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === "focus" ? 25 * 60 : 5 * 60);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(newMode === "focus" ? 25 * 60 : 5 * 60);
  };

  const updateProgress = async () => {
    // Add 25 mins when a focus session completes
    const newTimeSpent = (activeFocusTask.timeSpent || 0) + 25;
    await updateTodo(activeFocusTask._id, { timeSpent: newTimeSpent });
  };

  const handleComplete = async () => {
    await updateTodo(activeFocusTask._id, { completed: true });
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
    });
    setTimeout(() => {
      clearFocusTask();
    }, 1500);
  };

  // Auto-update progress when timer finishes focus session
  // We use a separate useEffect to watch 'timeLeft' and 'mode'
  // ensuring this runs only when the timer actually hits 0 naturally.
  useEffect(() => {
    if (timeLeft === 0 && mode === "focus") {
      updateProgress();
    }
  }, [timeLeft, mode]); // activeFocusTask dependencies might trigger loops, so better keep it minimal

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-bg/95 backdrop-blur-md flex flex-col items-center justify-center p-6"
      >
        <button
          onClick={clearFocusTask}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted/10 text-muted hover:text-text transition-colors"
        >
          <X size={32} />
        </button>

        <div className="max-w-4xl w-full flex flex-col items-center text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-medium text-sm">
            {mode === "focus" ? "🎯 Deep Focus" : "☕ Take a Break"}
          </div>

          <h2 className="text-3xl md:text-5xl font-bold text-text leading-tight max-w-2xl">
            {activeFocusTask.title}
          </h2>

          {/* Goal Stats */}
          {stats && (
            <div className="flex items-center gap-6 text-muted">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-text">
                  {stats.progress}%
                </span>
                <span className="text-xs uppercase tracking-wider">
                  Goal Reached
                </span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-text">
                  {(stats.timeLeft / 60).toFixed(1)}h
                </span>
                <span className="text-xs uppercase tracking-wider">
                  Remaining
                </span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-text">
                  {stats.sessionsLeft}
                </span>
                <span className="text-xs uppercase tracking-wider">
                  Sessions
                </span>
              </div>
            </div>
          )}

          {activeFocusTask.notes && (
            <p className="text-muted text-lg max-w-xl mx-auto line-clamp-3">
              {activeFocusTask.notes}
            </p>
          )}

          {/* Timer Display */}
          <div className="relative py-8">
            <div className="text-[6rem] md:text-[10rem] font-bold tabular-nums tracking-tighter leading-none text-text/90 font-mono select-none">
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={toggleTimer}
              className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl hover:shadow-primary/40"
            >
              {isActive ? (
                <Pause size={36} fill="currentColor" />
              ) : (
                <Play size={36} fill="currentColor" className="ml-1" />
              )}
            </button>

            <button
              onClick={resetTimer}
              className="w-14 h-14 rounded-full bg-muted/10 text-muted flex items-center justify-center hover:bg-muted/20 hover:text-text transition-all"
              title="Reset Timer"
            >
              <RotateCcw size={24} />
            </button>
          </div>

          {/* Actions */}
          <div className="pt-12 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => switchMode(mode === "focus" ? "break" : "focus")}
              className="px-6 py-3 rounded-xl border-2 border-dashed border-muted/30 text-muted hover:text-primary hover:border-primary transition-all font-medium"
            >
              {mode === "focus"
                ? "Switch to Break (5m)"
                : "Switch to Focus (25m)"}
            </button>

            <button
              onClick={handleComplete}
              className="px-8 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold flex items-center gap-2 shadow-lg hover:shadow-green-500/40 transition-all hover:-translate-y-1"
            >
              <CheckCircle2 size={20} />
              Mark Complete
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FocusMode;
