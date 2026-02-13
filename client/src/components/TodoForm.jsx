import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { X, Plus, Trash2 } from "lucide-react";
import { useTodoStore } from "../store/todoStore";

const PRIORITIES = [
  { value: "P1", label: "Priority 1", color: "bg-red-500" },
  { value: "P2", label: "Priority 2", color: "bg-orange-500" },
  { value: "P3", label: "Priority 3", color: "bg-blue-500" },
  { value: "P4", label: "Priority 4", color: "bg-gray-500" },
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
      notes: "",
      links: [],
      dayLabel: "Today",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "links",
  });

  const selectedColor = watch("color");
  const selectedPriority = watch("priority");

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset({
        title: "",
        date: new Date().toISOString().split("T")[0],
        time: "",
        priority: "P4",
        color: "#3b82f6",
        notes: "",
        links: [],
        dayLabel: "Today",
      });
    }
  }, [initialData, reset, isOpen]);

  const onSubmit = async (data) => {
    if (initialData) {
      await updateTodo(initialData._id, data);
    } else {
      await addTodo(data);
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
                              {p.value}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted mb-1">
                          Color Label
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
