# 🚀 Antigravity: Product Specification

## 1. Product Vision

**Antigravity** is not just another to-do list; it is a "calm productivity" engine designed to keep users grounded while elevating their efficiency. It combines the structured discipline of daily rules with a flexible, high-performance task management system. By merging aesthetic excellence (custom themes, glassmorphism) with power-user features (natural language input, recursing tasks), Antigravity aims to be the daily driver for professionals who value both form and function.

---

## 2. Feature List & Specification

### A. Core MVP (The Foundation)

#### Feature: Secure Authentication

- **Description**: reliable email/password login system with persistent sessions.
- **User Flow**:
  1.  User lands on `/login`.
  2.  Enters email/password.
  3.  On success -> Redirects to Dashboard.
  4.  On failure -> Shows toast error.
- **Edge Cases**: Invalid email format, duplicate email on register, wrong password, server timeout.
- **Acceptance Criteria**:
  - [ ] Register creates new user document with hashed password.
  - [ ] Login returns valid JWT.
  - [ ] Protected routes redirect unauthenticated users to `/login`.
- **Data Model**: `User` schema (email, passwordHash, createdAt).
- **API**: `POST /auth/register`, `POST /auth/login`, `GET /auth/me`.
- **UI Components**: `AuthForm`, `ProtectedRoute`, `useAuthStore`.

#### Feature: Basic Todo Management (CRUD)

- **Description**: Create, Read, Update, and Delete tasks.
- **User Flow**: User clicks "+", types title/date, saves. item appears in list.
- **Data Model**: `Todo` schema (title, date, priority, completed, userId).
- **API**: `GET /todos`, `POST /todos`, `PUT /todos/:id`, `DELETE /todos/:id`.
- **UI Components**: `TodoCard`, `TodoForm`, `TodoList`.

---

### B. Power Features (Premium Feel)

#### Feature: Recurring Todos 🔄

- **Description**: Tasks that automatically recreate themselves after completion based on a schedule (Daily, Weekly, Custom).
- **User Flow**:
  1.  User opens Todo Modal.
  2.  Selects "Repeat" -> "Every Week".
  3.  Completes task -> System automatically generates the next instance for next week.
- **Edge Cases**: Leap years, completing a task late (should next one be based on original due date or completion date?).
- **Acceptance Criteria**:
  - [ ] "Repeat" field in Todo schema.
  - [ ] Completion trigger checks for recurrence.
  - [ ] New task created with future date upon completion of parent.
- **Data Model**: `Todo.recurrence: { type: 'daily'|'weekly'|'custom', interval: Number }`.
- **API**: Backend logic in `PUT /todos/:id` (completion handler).
- **UI Components**: `RecurrenceSelector` in `TodoForm`.

#### Feature: Subtasks Checklist 📝

- **Description**: Break down complex todos into smaller, checkable steps.
- **User Flow**: In Todo Details, user adds "Step 1", "Step 2". Checks them off individually.
- **Edge Cases**: Deleting a parent task deletes subtasks.
- **Acceptance Criteria**:
  - [ ] Add/Remove subtask.
  - [ ] Check/Uncheck subtask updates progress bar.
- **Data Model**: `Todo.subtasks: [{ title: String, completed: Boolean }]`.
- **UI Components**: `SubtaskList`, `ProgressBar`.

#### Feature: Natural Language Quick-Add ⚡

- **Description**: Parse inputs like "Call mom tomorrow 6pm #family P1" into structured data.
- **User Flow**: User hits `/` -> Types string -> Enters. App extracts date, time, tags, priority.
- **Acceptance Criteria**:
  - [ ] "tomorrow" sets date.
  - [ ] "6pm" sets time.
  - [ ] "#tag" adds code.
  - [ ] "P1" sets priority.
- **UI Components**: `QuickAddBar` (floating or top), parser utility function.

#### Feature: Daily Rule Streaks 🔥

- **Description**: Gamify discipline. Track how many consecutive days a rule has been completed.
- **User Flow**: User checks off "Drink Water". Streak counter increments. Missing a day resets it (logic on backend).
- **Data Model**: `Rule.streak: Number`, `Rule.lastCompletedDate: Date`.
- **Acceptance Criteria**:
  - [ ] Visual flame/counter icon.
  - [ ] Logic to reset streak if `lastCompletedDate` < yesterday.
- **UI Components**: `RuleItem`, `StreakBadge`.

#### Feature: Calendar / Week View 📅

- **Description**: Visual representation of tasks on a timeline.
- **User Flow**: Switch view from "List" to "Week". Drag and drop tasks to change days.
- **Acceptance Criteria**:
  - [ ] Columns for Mon-Sun.
  - [ ] Tasks rendered in correct column.
  - [ ] Dragging task updates `date` field.
- **UI Components**: `WeekView`, `DraggableTask`.

---

### C. UX Polish

#### Feature: Background Readability Controls 🎨

- **Description**: Ensure text is legible on any custom wallpaper.
- **User Flow**: Settings -> Slider for "Dim" (0-100%) and "Blur" (0-20px). Real-time preview.
- **Data Model**: `User.preferences.overlay: { dim: Number, blur: Number }`.
- **UI Components**: `SettingsPage`, `AppearancePanel`.
- **Auto-Contrast**: (Nice to have) analyzing image brightness to set default text color.

#### Feature: Optimistic UI Updates 🚀

- **Description**: UI reflects changes immediately, reverting only if server fails.
- **User Flow**: User clicks "Complete". Checkbox ticks instantly. Request sent in background.
- **Acceptance Criteria**:
  - [ ] No loading spinner for checkbox actions.
  - [ ] Toast error + rollback if API fails.
- **Implementation**: Zustand `set` before `api.call`.

---

### D. Backend & Security

#### Feature: Data Integrity & Validation

- **Description**: robust server-side validation.
- **Tech**: Zod (backend).
- **Criteria**: API rejects invalid dates, missing titles, extremely long notes.

#### Feature: Rate Limiting

- **Description**: Prevent brute force attacks.
- **Criteria**: Limit `/auth/login` to 5 attempts per 15 minutes.
- **Tech**: `express-rate-limit`.

---

## 3. Implementation Roadmap

### Phase 1: Solidify Foundation (Current Status Refinement) -> "Upgrade Branch"

- [ ] **Refactor**: Ensure all current features use `express-async-handler` and proper error boundaries.
- [ ] **Strict Typing**: Add PropType validations or JSDoc for critical components.
- [ ] **Fixes**: Address current "Outlet" or routing issues.

### Phase 2: User Experience First

1.  **Quick Add**: Implement the parsing logic.
2.  **Optimistic UI**: refactor `todoStore` to update state _before_ API calls.
3.  **Background Controls**: Finish the Settings/Overlay logic.

### Phase 3: Power Features

1.  **Recurring Tasks**: Schema update + Backend logic.
2.  **Subtasks**: Schema update + UI expansion.
3.  **Week View**: New Page `/app/week` with Drag & Drop.

### Phase 4: Gamification & Polish

1.  **Rule Streaks**: Update Rule schema and daily check constraints.
2.  **Animations**: Revisit Framer Motion transitions for "delight".
