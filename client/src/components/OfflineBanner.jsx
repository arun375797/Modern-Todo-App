import React, { useState, useEffect } from "react";
import { WifiOff, Wifi, RefreshCw } from "lucide-react";
import { useNetwork } from "../hooks/useNetwork";
import { useTodoStore } from "../store/todoStore";
import { motion, AnimatePresence } from "framer-motion";

const OfflineBanner = () => {
  const isOnline = useNetwork();
  const { pendingActions, sync, isLoading } = useTodoStore();
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    if (isOnline && pendingActions.length > 0) {
      sync();
      setShowBackOnline(true);
      const timer = setTimeout(() => setShowBackOnline(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, pendingActions.length, sync]);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md"
        >
          <div className="bg-amber-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between gap-3 border border-amber-400/50 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <WifiOff size={18} />
              </div>
              <div>
                <p className="font-semibold text-sm">Offline Mode</p>
                <p className="text-xs text-amber-50/80">
                  {pendingActions.length > 0
                    ? `${pendingActions.length} changes waiting to sync`
                    : "Working with local data"}
                </p>
              </div>
            </div>
            {pendingActions.length > 0 && (
              <div className="flex items-center gap-2 text-[10px] font-medium bg-black/10 px-2 py-1 rounded-full">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                Local
              </div>
            )}
          </div>
        </motion.div>
      )}

      {showBackOnline && isOnline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md"
        >
          <div className="bg-emerald-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 border border-emerald-400/50 backdrop-blur-md">
            <div className="p-2 bg-white/20 rounded-lg">
              {isLoading ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <Wifi size={18} />
              )}
            </div>
            <div>
              <p className="font-semibold text-sm">Back Online</p>
              <p className="text-xs text-emerald-50/80">
                {isLoading
                  ? "Synchronizing your changes..."
                  : "Your data is up to date"}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineBanner;
