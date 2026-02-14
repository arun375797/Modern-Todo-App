import { useEffect, useRef, useState } from "react";
import { useTimerStore } from "../store/timerStore";
import { useAuthStore } from "../store/authStore";
import {
  Play,
  Pause,
  RotateCcw,
  Settings as SettingsIcon,
  Coffee,
  Target,
  Clock,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

const FocusTimer = () => {
  const {
    timeLeft,
    isActive,
    sessionType,
    pomodoroTime,
    breakTime,
    totalFocusTime,
    completedPomodoros,
    totalFocusedMinutes,
    startTimer,
    pauseTimer,
    resetTimer,
    tick,
    completeSession,
    switchSession,
    updateSettings,
    resetStats,
    getTotalSessions,
    isGoalReached,
  } = useTimerStore();

  const { user } = useAuthStore();
  const [showSettings, setShowSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    pomodoroTime,
    breakTime,
    totalFocusTime,
  });
  const alarmTimeoutRef = useRef(null);

  // Timer tick effect
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        tick();
      }, 1000);
    } else if (timeLeft === 0 && isActive === false) {
      // Session completed
      handleSessionComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleSessionComplete = () => {
    // Play alarm
    playAlarm();

    // Show confetti for focus session completion
    if (sessionType === "focus") {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    // Auto-complete session
    completeSession();
  };

  const playAlarm = () => {
    const soundPref = user?.preferences?.alarmSound || "beep";
    if (soundPref !== "none") {
      const audioMap = {
        beep: "https://actions.google.com/sounds/v1/alarms/beep_short.ogg",
        bell: "https://actions.google.com/sounds/v1/alarms/bugle_tune.ogg",
        digital:
          "https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg",
      };

      const audioUrl = audioMap[soundPref] || audioMap["beep"];
      const audio = new Audio(audioUrl);
      audio.loop = true;

      audio.play().catch((e) => console.error("Audio play failed", e));

      alarmTimeoutRef.current = setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
      }, 10000);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleSaveSettings = () => {
    updateSettings(settingsForm);
    setShowSettings(false);
  };

  const totalSessions = getTotalSessions();
  const goalReached = isGoalReached();
  const progress =
    timeLeft / ((sessionType === "focus" ? pomodoroTime : breakTime) * 60);
  const circumference = 2 * Math.PI * 140;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text mb-2">Focus Timer</h1>
          <p className="text-muted">
            Pomodoro technique for deep work sessions
          </p>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-3 rounded-xl bg-card hover:bg-muted/10 transition-colors border border-border"
        >
          <SettingsIcon size={20} />
        </button>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-8 overflow-hidden"
          >
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-text">
                Session Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted mb-2">
                    Pomodoro Duration (min)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={settingsForm.pomodoroTime}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        pomodoroTime: parseInt(e.target.value) || 25,
                      })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-bg border border-border text-text focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted mb-2">
                    Break Duration (min)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={settingsForm.breakTime}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        breakTime: parseInt(e.target.value) || 5,
                      })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-bg border border-border text-text focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted mb-2">
                    Total Focus Time (min, 0 = infinite)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={settingsForm.totalFocusTime}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        totalFocusTime: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-bg border border-border text-text focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleSaveSettings}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  Save Settings
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-6 py-2 bg-muted/10 text-text rounded-lg hover:bg-muted/20 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted mb-1">
            <Target size={16} />
            <span className="text-xs font-medium uppercase">Completed</span>
          </div>
          <p className="text-2xl font-bold text-text">{completedPomodoros}</p>
          <p className="text-xs text-muted">Pomodoros</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted mb-1">
            <Clock size={16} />
            <span className="text-xs font-medium uppercase">Total Time</span>
          </div>
          <p className="text-2xl font-bold text-text">{totalFocusedMinutes}</p>
          <p className="text-xs text-muted">Minutes</p>
        </div>
        {totalSessions && (
          <>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 text-muted mb-1">
                <TrendingUp size={16} />
                <span className="text-xs font-medium uppercase">Progress</span>
              </div>
              <p className="text-2xl font-bold text-text">
                {Math.min(
                  100,
                  Math.round((totalFocusedMinutes / totalFocusTime) * 100),
                )}
                %
              </p>
              <p className="text-xs text-muted">
                {completedPomodoros}/{totalSessions}
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 text-muted mb-1">
                <Coffee size={16} />
                <span className="text-xs font-medium uppercase">Goal</span>
              </div>
              <p className="text-2xl font-bold text-text">{totalFocusTime}</p>
              <p className="text-xs text-muted">Minutes</p>
            </div>
          </>
        )}
      </div>

      {/* Goal Reached Banner */}
      {goalReached && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl p-6 mb-8 text-center"
        >
          <h3 className="text-2xl font-bold mb-2">🎉 Goal Reached!</h3>
          <p className="text-white/90">
            You've completed your focus time goal of {totalFocusTime} minutes!
          </p>
          <button
            onClick={resetStats}
            className="mt-4 px-6 py-2 bg-white text-green-600 rounded-lg font-semibold hover:bg-white/90 transition-colors"
          >
            Start New Session
          </button>
        </motion.div>
      )}

      {/* Timer Display */}
      <div className="bg-card border border-border rounded-3xl p-8 md:p-12">
        <div className="flex flex-col items-center">
          {/* Session Type Badge */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm mb-8 ${
              sessionType === "focus"
                ? "bg-primary/10 text-primary"
                : "bg-green-500/10 text-green-600"
            }`}
          >
            {sessionType === "focus" ? "🎯 Focus Session" : "☕ Break Time"}
          </div>

          {/* Circular Timer */}
          <div className="relative mb-12">
            <svg width="320" height="320" className="transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="160"
                cy="160"
                r="140"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className="text-muted/20"
              />
              {/* Progress circle */}
              <circle
                cx="160"
                cy="160"
                r="140"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className={
                  sessionType === "focus" ? "text-primary" : "text-green-500"
                }
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
            </svg>
            {/* Time Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-7xl font-bold font-mono tabular-nums text-text">
                {formatTime(timeLeft)}
              </div>
              <div className="text-sm text-muted mt-2 uppercase tracking-wider">
                {sessionType === "focus"
                  ? `${pomodoroTime} min session`
                  : `${breakTime} min break`}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={resetTimer}
              className="w-14 h-14 rounded-full bg-muted/10 text-muted hover:bg-muted/20 hover:text-text transition-all flex items-center justify-center"
              title="Reset Timer"
            >
              <RotateCcw size={24} />
            </button>

            <button
              onClick={isActive ? pauseTimer : startTimer}
              className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl hover:shadow-primary/40"
            >
              {isActive ? (
                <Pause size={36} fill="currentColor" />
              ) : (
                <Play size={36} fill="currentColor" className="ml-1" />
              )}
            </button>

            <button
              onClick={() =>
                switchSession(sessionType === "focus" ? "break" : "focus")
              }
              className="w-14 h-14 rounded-full bg-muted/10 text-muted hover:bg-muted/20 hover:text-text transition-all flex items-center justify-center"
              title={`Switch to ${sessionType === "focus" ? "Break" : "Focus"}`}
            >
              {sessionType === "focus" ? (
                <Coffee size={24} />
              ) : (
                <Target size={24} />
              )}
            </button>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted mb-2">Quick switch</p>
            <div className="flex gap-2">
              <button
                onClick={() => switchSession("focus")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sessionType === "focus"
                    ? "bg-primary text-white"
                    : "bg-muted/10 text-muted hover:bg-muted/20"
                }`}
              >
                Focus
              </button>
              <button
                onClick={() => switchSession("break")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sessionType === "break"
                    ? "bg-green-500 text-white"
                    : "bg-muted/10 text-muted hover:bg-muted/20"
                }`}
              >
                Break
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-8 bg-primary/5 border border-primary/20 rounded-xl p-6">
        <h4 className="font-semibold text-text mb-2">💡 Pomodoro Tips</h4>
        <ul className="text-sm text-muted space-y-1">
          <li>• Work in focused 25-minute intervals</li>
          <li>• Take 5-minute breaks between sessions</li>
          <li>• Set a total focus time goal to track your progress</li>
          <li>• Eliminate distractions during focus sessions</li>
        </ul>
      </div>
    </div>
  );
};

export default FocusTimer;
