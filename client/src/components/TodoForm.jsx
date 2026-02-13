import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { X, Plus, Trash2 } from "lucide-react";
import { useTodoStore } from "../store/todoStore";

const PRIORITIES = [
  { value: "P1", label: "Urgent", color: "bg-red-500" },
  { value: "P2", label: "High", color: "bg-orange-500" },
  { value: "P3", label: "Medium", color: "bg-blue-500" },
  { value: "P4", label: "Low", color: "bg-gray-500" },
];

const COLORS = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#84cc16",
  "#10b981",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#d946ef",
  "#64748b",
];

const TodoForm = ({ isOpen, closeModal, initialData = null }) => {
  const { addTodo, updateTodo } = useTodoStore();
  const { register, control, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      title: "",
      date: new Date().toISOString().split("T")[0],
      time: "",
      priority: "P4",
      color: "#3b82f6",
      textColor: "#000000",
      goalTime: 0,
      notes: "",
      notes: "",
      subtasks: [],
      links: [],
      dayLabel: "Today",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "links",
  });

  const {
    fields: subtaskFields,
    append: appendSubtask,
    remove: removeSubtask,
  } = useFieldArray({
    control,
    name: "subtasks",
  });

  const selectedColor = watch("color");
  const selectedPriority = watch("priority");

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        goalTime: initialData.goalTime ? initialData.goalTime / 60 : 0,
      });
    } else {
      reset({
        title: "",
        date: new Date().toISOString().split("T")[0],
        time: "",
        priority: "P4",
        color: "#3b82f6",
        textColor: "#000000",
        goalTime: 0,
        notes: "",
        subtasks: [],
        links: [],
        dayLabel: "Today",
      });
    }
  }, [initialData, reset, isOpen]);

  const onSubmit = async (data) => {
    // Convert goalTime from hours to minutes for storage
    const formattedData = {
      ...data,
      goalTime: data.goalTime ? data.goalTime * 60 : 0,
    };

    if (initialData) {
      await updateTodo(initialData._id, formattedData);
    } else {
      await addTodo(formattedData);
    }
    closeModal();
    reset();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-card p-6 text-left align-middle shadow-xl transition-all border border-border">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-bold leading-6 text-text"
                  >
                    {initialData ? "Edit Todo" : "Add New Todo"}
                  </Dialog.Title>
                  <button
                    onClick={closeModal}
                    className="text-muted hover:text-text"
                  >
                    <X />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Title */}
                  <div>
                    <input
                      placeholder="What needs to be done?"
                      className="w-full text-lg font-medium border-b-2 border-border bg-transparent py-2 focus:border-primary focus:outline-none placeholder:text-muted/50"
                      {...register("title", { required: true })}
                      autoFocus
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Date & Time */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-muted mb-1">
                          Date
                        </label>
                        <input
                          type="date"
                          className="w-full rounded-lg border border-border bg-bg px-3 py-2"
                          {...register("date")}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted mb-1">
                          Time
                        </label>
                        <input
                          type="time"
                          className="w-full rounded-lg border border-border bg-bg px-3 py-2"
                          {...register("time")}
                        />
                      </div>
                    </div>

                    {/* Goal Time */}
                    <div>
                      <label className="block text-sm font-medium text-muted mb-1">
                        Goal Duration (Hours)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        placeholder="e.g. 8"
                        className="w-full rounded-lg border border-border bg-bg px-3 py-2"
                        {...register("goalTime", { valueAsNumber: true })}
                      />
                      <p className="text-xs text-muted mt-1">
                        Set a target time to track your focus progress.
                      </p>
                    </div>

                    {/* Priority & Color */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-muted mb-1">
                          Priority
                        </label>
                        <div className="flex gap-2">
                          {PRIORITIES.map((p) => (
                            <button
                              key={p.value}
                              type="button"
                              onClick={() => setValue("priority", p.value)}
                              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border-2 ${
                                selectedPriority === p.value
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-transparent bg-bg text-muted hover:bg-muted/10"
                              }`}
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-muted mb-1">
                            Tag Color
                          </label>
                          <div className="flex gap-2 flex-wrap">
                            {COLORS.map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => setValue("color", c)}
                                className={`w-6 h-6 rounded-full transition-transform ${selectedColor === c ? "scale-125 ring-2 ring-offset-2 ring-offset-card ring-primary" : "hover:scale-110"}`}
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-muted mb-1">
                            Text Color
                          </label>
                          <input
                            type="color"
                            className="w-full h-10 rounded cursor-pointer"
                            {...register("textColor")}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-muted mb-1">
                      Notes
                    </label>
                    <textarea
                      rows={3}
                      className="w-full rounded-lg border border-border bg-bg px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                      placeholder="Add details..."
                      {...register("notes")}
                    />
                  </div>

                  {/* Subtasks */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-muted">
                        Subtasks
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          appendSubtask({ title: "", completed: false })
                        }
                        className="text-xs text-primary flex items-center hover:underline"
                      >
                        <Plus size={14} className="mr-1" /> Add Step
                      </button>
                    </div>
                    <div className="space-y-2 mb-6">
                      {subtaskFields.map((field, index) => (
                        <div key={field.id} className="flex gap-2 items-center">
                          <div className="mt-1.5 w-2 h-2 rounded-full bg-muted/30" />
                          <input
                            placeholder={`Step ${index + 1}`}
                            className="flex-1 rounded-lg border border-border bg-bg px-2 py-1 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                            {...register(`subtasks.${index}.title`)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                appendSubtask({ title: "", completed: false });
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removeSubtask(index)}
                            className="text-muted hover:text-red-500"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Links */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-muted">
                        Links
                      </label>
                      <button
                        type="button"
                        onClick={() => append({ label: "", url: "" })}
                        className="text-xs text-primary flex items-center hover:underline"
                      >
                        <Plus size={14} className="mr-1" /> Add Link
                      </button>
                    </div>
                    <div className="space-y-2">
                      {fields.map((field, index) => (
                        <div key={field.id} className="flex gap-2">
                          <input
                            placeholder="Label"
                            className="flex-1 rounded-lg border border-border bg-bg px-2 py-1 text-sm"
                            {...register(`links.${index}.label`)}
                          />
                          <input
                            placeholder="URL"
                            className="flex-[2] rounded-lg border border-border bg-bg px-2 py-1 text-sm"
                            {...register(`links.${index}.url`)}
                          />
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="text-red-400 hover:text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end gap-3 border-t border-border pt-6">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-xl px-4 py-2 text-sm font-medium text-text hover:bg-bg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex justify-center rounded-xl bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    >
                      {initialData ? "Save Changes" : "Create Todo"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default TodoForm;
