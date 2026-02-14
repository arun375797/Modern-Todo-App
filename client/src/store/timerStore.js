import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useTimerStore = create(
  persist(
    (set, get) => ({
      // Settings
      pomodoroTime: 25, // minutes
      breakTime: 5, // minutes
      totalFocusTime: 0, // minutes (0 means infinite/manual mode)

      // Session state
      timeLeft: 25 * 60, // seconds
      isActive: false,
      sessionType: "focus", // 'focus' or 'break'
      completedPomodoros: 0,
      totalFocusedMinutes: 0,

      // Update settings
      updateSettings: (settings) => {
        const { pomodoroTime, breakTime, totalFocusTime } = settings;
        const currentState = get();

        set({
          pomodoroTime: pomodoroTime ?? currentState.pomodoroTime,
          breakTime: breakTime ?? currentState.breakTime,
          totalFocusTime: totalFocusTime ?? currentState.totalFocusTime,
        });

        // Reset timer if not active
        if (!currentState.isActive) {
          get().resetTimer();
        }
      },

      // Timer controls
      startTimer: () => set({ isActive: true }),

      pauseTimer: () => set({ isActive: false }),

      resetTimer: () => {
        const { sessionType, pomodoroTime, breakTime } = get();
        const duration = sessionType === "focus" ? pomodoroTime : breakTime;
        set({
          timeLeft: duration * 60,
          isActive: false,
        });
      },

      tick: () => {
        const { timeLeft, isActive } = get();
        if (isActive && timeLeft > 0) {
          set({ timeLeft: timeLeft - 1 });
        }
      },

      completeSession: () => {
        const {
          sessionType,
          pomodoroTime,
          breakTime,
          completedPomodoros,
          totalFocusedMinutes,
        } = get();

        if (sessionType === "focus") {
          // Completed a focus session
          set({
            completedPomodoros: completedPomodoros + 1,
            totalFocusedMinutes: totalFocusedMinutes + pomodoroTime,
            sessionType: "break",
            timeLeft: breakTime * 60,
            isActive: false,
          });
        } else {
          // Completed a break session
          set({
            sessionType: "focus",
            timeLeft: pomodoroTime * 60,
            isActive: false,
          });
        }
      },

      switchSession: (type) => {
        const { pomodoroTime, breakTime } = get();
        const duration = type === "focus" ? pomodoroTime : breakTime;
        set({
          sessionType: type,
          timeLeft: duration * 60,
          isActive: false,
        });
      },

      resetStats: () => {
        set({
          completedPomodoros: 0,
          totalFocusedMinutes: 0,
        });
      },

      // Calculate total sessions needed
      getTotalSessions: () => {
        const { totalFocusTime, pomodoroTime } = get();
        if (totalFocusTime === 0) return null;
        return Math.ceil(totalFocusTime / pomodoroTime);
      },

      // Check if goal is reached
      isGoalReached: () => {
        const { totalFocusTime, totalFocusedMinutes } = get();
        if (totalFocusTime === 0) return false;
        return totalFocusedMinutes >= totalFocusTime;
      },
    }),
    {
      name: "timer-storage",
      getStorage: () => localStorage,
    },
  ),
);
