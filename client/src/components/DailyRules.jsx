import { useEffect, useState } from "react";
import { useRuleStore } from "../store/ruleStore";
import { Plus, X, GripVertical, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DailyRules = () => {
  const { rules, fetchRules, addRule, deleteRule, updateRule } = useRuleStore();
  const [newRule, setNewRule] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newRule.trim()) return;
    await addRule(newRule);
    setNewRule("");
    setIsAdding(false);
  };

  const startEdit = (rule) => {
    setEditingId(rule._id);
    setEditText(rule.text);
  };

  const saveEdit = async () => {
    if (editText.trim()) {
      await updateRule(editingId, { text: editText });
    }
    setEditingId(null);
  };

  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 mb-8 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-primary flex items-center gap-2">
          <span className="text-2xl">✨</span> Daily Rules
        </h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="p-2 hover:bg-primary/10 rounded-full text-primary transition-colors"
        >
          <Plus size={20} />
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleAdd}
            className="mb-4 overflow-hidden"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={newRule}
                onChange={(e) => setNewRule(e.target.value)}
                placeholder="New rule..."
                className="flex-1 px-4 py-2 rounded-xl border border-border bg-bg focus:ring-2 focus:ring-primary focus:outline-none"
                autoFocus
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
              >
                Add
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-2 max-h-[300px] overflow-y-auto rules-scroll pr-2">
        {rules.map((rule, index) => (
          <motion.div
            key={rule._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ delay: index * 0.05 }}
            className="group flex items-center gap-3 p-3 rounded-xl hover:bg-bg/50 transition-colors border border-transparent hover:border-border"
          >
            <div className="text-muted/50 cursor-grab active:cursor-grabbing">
              <GripVertical size={16} />
            </div>

            {editingId === rule._id ? (
              <div className="flex-1 flex gap-2">
                <input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="flex-1 px-2 py-1 rounded border border-border bg-bg focus:ring-1 focus:ring-primary"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                />
                <button onClick={saveEdit} className="text-green-500">
                  <Check size={18} />
                </button>
              </div>
            ) : (
              <span
                className="flex-1 font-medium text-text cursor-pointer"
                onClick={() => startEdit(rule)}
              >
                {rule.text}
              </span>
            )}

            <button
              onClick={() => deleteRule(rule._id)}
              className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500 transition-opacity p-1"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
        {rules.length === 0 && !isAdding && (
          <p className="text-center text-muted italic py-4">
            No rules set for today yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default DailyRules;
