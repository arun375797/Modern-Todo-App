import { motion } from "framer-motion";
import { Share, MoreVertical, Smartphone, Monitor, Info } from "lucide-react";

const InstallApp = () => {
  const steps = {
    ios: [
      { id: 1, text: "Open this site in Safari on your iPhone/iPad" },
      {
        id: 2,
        text: "Tap the Share button (square with up arrow)",
        icon: Share,
      },
      { id: 3, text: 'Scroll down and select "Add to Home Screen"' },
      { id: 4, text: 'Tap "Add" in the top right corner' },
    ],
    android: [
      { id: 1, text: "Open this site in Chrome on your Android device" },
      {
        id: 2,
        text: "Tap the Menu button (three vertical dots)",
        icon: MoreVertical,
      },
      { id: 3, text: 'Select "Install app" or "Add to Home screen"' },
      { id: 4, text: "Follow the prompts to confirm installation" },
    ],
    desktop: [
      {
        id: 1,
        text: "Look for the install icon in your browser's address bar",
      },
      { id: 2, text: 'Click "Install" to add to your desktop/launcher' },
    ],
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 md:mb-10 gap-2 md:gap-3">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Install MyTodo
          </h1>
          <p className="text-muted text-sm md:text-base mt-1">
            Transform this website into a high-performance desktop or mobile
            app.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* iOS Section */}
        <section className="bg-card/50 backdrop-blur-md border border-border rounded-2xl p-6 glass-panel">
          <div className="flex items-center space-x-3 mb-6 text-primary">
            <Smartphone className="text-accent" />
            <h2 className="text-xl font-semibold">iOS (iPhone/iPad)</h2>
          </div>
          <div className="space-y-4">
            {steps.ios.map((step) => (
              <div key={step.id} className="flex items-start space-x-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {step.id}
                </span>
                <p className="text-muted self-center">
                  {step.text}{" "}
                  {step.icon && (
                    <step.icon
                      className="inline-block ml-1 text-primary"
                      size={18}
                    />
                  )}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Android Section */}
        <section className="bg-card/50 backdrop-blur-md border border-border rounded-2xl p-6 glass-panel">
          <div className="flex items-center space-x-3 mb-6 text-primary">
            <Smartphone className="text-green-500" />
            <h2 className="text-xl font-semibold">Android</h2>
          </div>
          <div className="space-y-4">
            {steps.android.map((step) => (
              <div key={step.id} className="flex items-start space-x-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {step.id}
                </span>
                <p className="text-muted self-center">
                  {step.text}{" "}
                  {step.icon && (
                    <step.icon
                      className="inline-block ml-1 text-primary"
                      size={18}
                    />
                  )}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Desktop Section */}
        <section className="bg-card/50 backdrop-blur-md border border-border rounded-2xl p-6 glass-panel md:col-span-2">
          <div className="flex items-center space-x-3 mb-6 text-primary">
            <Monitor className="text-blue-500" />
            <h2 className="text-xl font-semibold">
              Desktop (Chrome/Edge/Safari)
            </h2>
          </div>
          <div className="space-y-4">
            {steps.desktop.map((step) => (
              <div key={step.id} className="flex items-start space-x-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {step.id}
                </span>
                <p className="text-muted self-center">{step.text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="p-6 bg-primary/5 rounded-2xl border border-primary/20 flex items-start space-x-4">
        <Info className="text-primary flex-shrink-0 mt-1" />
        <div className="space-y-1">
          <h3 className="font-semibold text-primary">Why install as an app?</h3>
          <ul className="text-sm text-muted list-disc list-inside space-y-1">
            <li>Full-screen experience without browser toolbars</li>
            <li>Better performance and native-like feel</li>
            <li>Easy access from your home screen or taskbar</li>
            <li>Works offline or on slow connections</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InstallApp;
