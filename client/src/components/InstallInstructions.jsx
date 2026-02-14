import { useState, useEffect } from "react";
import {
  Share,
  MoreVertical,
  Smartphone,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const InstallInstructions = () => {
  const [platform, setPlatform] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkStandalone = () => {
      return (
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true
      );
    };

    setIsStandalone(checkStandalone());

    const userAgent = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform("ios");
    } else if (/android/.test(userAgent)) {
      setPlatform("android");
    } else {
      setPlatform("other");
    }
  }, []);

  if (isStandalone) return null;

  return (
    <div className="pt-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full p-4 rounded-xl text-lg transition-all ${
          isOpen ? "bg-primary/10 text-primary font-medium" : "text-muted"
        }`}
      >
        <div className="flex items-center space-x-4">
          <Smartphone size={24} />
          <span>Install App</span>
        </div>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-2 ml-4 pl-4 border-l-2 border-primary/20 space-y-4 py-4">
              <div className="space-y-4 text-sm text-muted">
                {platform === "ios" ? (
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                        1
                      </div>
                      <p>
                        Tap the{" "}
                        <Share
                          size={16}
                          className="inline-block mx-1 text-primary"
                        />{" "}
                        Share button in Safari
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                        2
                      </div>
                      <p>
                        Select{" "}
                        <span className="text-primary font-medium">
                          "Add to Home Screen"
                        </span>
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                        3
                      </div>
                      <p>
                        Tap{" "}
                        <span className="text-primary font-medium">"Add"</span>{" "}
                        to finish
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                        1
                      </div>
                      <p>
                        Tap the{" "}
                        <MoreVertical
                          size={16}
                          className="inline-block mx-1 text-primary"
                        />{" "}
                        menu button in Chrome
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                        2
                      </div>
                      <p>
                        Select{" "}
                        <span className="text-primary font-medium">
                          "Install app"
                        </span>{" "}
                        or{" "}
                        <span className="text-primary font-medium">
                          "Add to Home"
                        </span>
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                        3
                      </div>
                      <p>Follow the prompts to install</p>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground italic mt-2">
                Tip: This creates a full-screen app experience!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InstallInstructions;
