const STORAGE_KEY = "codsoft_todo_tasks_v1";
const THEME_KEY = "codsoft_todo_theme_v1";

let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

// DOM Elements
const taskForm = document.getElementById("task-form");
const formHeading = document.getElementById("form-heading");
const editTaskIdInput = document.getElementById("edit-task-id");
const titleInput = document.getElementById("task-title");
const categoryInput = document.getElementById("task-category");
const priorityInput = document.getElementById("task-priority");
const dueDateInput = document.getElementById("task-due-date");
const submitBtn = document.getElementById("submit-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");
const validationError = document.getElementById("validation-error");

const searchInput = document.getElementById("search-input");
const filterStatus = document.getElementById("filter-status");
const filterCategory = document.getElementById("filter-category");
const filterPriority = document.getElementById("filter-priority");

const taskListEl = document.getElementById("task-list");
const emptyStateEl = document.getElementById("empty-state");
const totalCountEl = document.getElementById("total-count");
const pendingCountEl = document.getElementById("pending-count");
const completedCountEl = document.getElementById("completed-count");

const themeToggleBtn = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");
const themeText = document.getElementById("theme-text");

// Initialize Theme
function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY) || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeButton(savedTheme);
}

function updateThemeButton(theme) {
  if (theme === "dark") {
    themeIcon.textContent = "☀️";
    themeText.textContent = "Light Mode";
  } else {
    themeIcon.textContent = "🌙";
    themeText.textContent = "Dark Mode";
  }
}

themeToggleBtn.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  const nextTheme = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", nextTheme);
  localStorage.setItem(THEME_KEY, nextTheme);
  updateThemeButton(nextTheme);
});

// Save to Local Storage
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Escape HTML to prevent XSS
function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// Update Task Counters
function updateCounters() {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;

  totalCountEl.textContent = total;
  pendingCountEl.textContent = pending;
  completedCountEl.textContent = completed;
}

// Check if a due date is overdue
function isOverdue(dateStr, completed) {
  if (!dateStr || completed) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr + "T00:00:00");
  return due < today;
}

// Render Tasks with Search & Filter
function renderTasks() {
  const query = searchInput.value.trim().toLowerCase();
  const statusVal = filterStatus.value;
  const categoryVal = filterCategory.value;
  const priorityVal = filterPriority.value;

  const filtered = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(query) ||
      task.category.toLowerCase().includes(query);

    const matchesStatus =
      statusVal === "All" ||
      (statusVal === "Completed" && task.completed) ||
      (statusVal === "Pending" && !task.completed);

    const matchesCategory =
      categoryVal === "All" || task.category === categoryVal;

    const matchesPriority =
      priorityVal === "All" || task.priority === priorityVal;

    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  taskListEl.innerHTML = "";

  if (filtered.length === 0) {
    emptyStateEl.classList.remove("hidden");
  } else {
    emptyStateEl.classList.add("hidden");
    filtered.forEach((task) => {
      const li = document.createElement("li");
      li.className = `task-item ${task.completed ? "completed" : ""}`;

      const overdue = isOverdue(task.dueDate, task.completed);
      const dueBadge = task.dueDate
        ? `<span class="due-date ${overdue ? "overdue" : ""}">
             📅 ${overdue ? "Overdue: " : "Due: "}${escapeHTML(task.dueDate)}
           </span>`
        : "";

      li.innerHTML = `
        <div class="task-left">
          <input
            type="checkbox"
            class="task-checkbox"
            ${task.completed ? "checked" : ""}
            aria-label="Mark task as ${task.completed ? "pending" : "completed"}"
          />
          <div class="task-content">
            <span class="task-title">${escapeHTML(task.title)}</span>
            <div class="task-meta">
              <span class="badge badge-category">${escapeHTML(task.category)}</span>
              <span class="badge badge-priority-${escapeHTML(task.priority)}">
                ${escapeHTML(task.priority)} Priority
              </span>
              ${dueBadge}
            </div>
          </div>
        </div>
        <div class="task-actions">
          <button type="button" class="action-btn edit-btn">Edit</button>
          <button type="button" class="action-btn delete-btn">Delete</button>
        </div>
      `;

      // Toggle Completed / Pending
      const checkbox = li.querySelector(".task-checkbox");
      checkbox.addEventListener("change", () => toggleTaskStatus(task.id));

      // Edit Task
      const editBtn = li.querySelector(".edit-btn");
      editBtn.addEventListener("click", () => startEditTask(task.id));

      // Delete Task
      const deleteBtn = li.querySelector(".delete-btn");
      deleteBtn.addEventListener("click", () => deleteTask(task.id));

      taskListEl.appendChild(li);
    });
  }

  updateCounters();
}

// Add or Update Task
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();

  // Input Validation
  if (!title) {
    validationError.textContent = "Please enter a valid task description.";
    titleInput.focus();
    return;
  }
  if (title.length < 3) {
    validationError.textContent = "Task description must be at least 3 characters.";
    titleInput.focus();
    return;
  }

  validationError.textContent = "";
  const editId = editTaskIdInput.value;

  if (editId) {
    // Update existing task
    tasks = tasks.map((task) =>
      task.id === editId
        ? {
            ...task,
            title,
            category: categoryInput.value,
            priority: priorityInput.value,
            dueDate: dueDateInput.value,
          }
        : task
    );
    resetFormMode();
  } else {
    // Create new task
    const newTask = {
      id: Date.now().toString(),
      title,
      category: categoryInput.value,
      priority: priorityInput.value,
      dueDate: dueDateInput.value,
      completed: false,
    };
    tasks.unshift(newTask);
  }

  taskForm.reset();
  saveTasks();
  renderTasks();
});

// Clear validation message on typing
titleInput.addEventListener("input", () => {
  if (validationError.textContent) {
    validationError.textContent = "";
  }
});

// Toggle Completed / Pending
function toggleTaskStatus(id) {
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  renderTasks();
}

// Start Editing a Task
function startEditTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  editTaskIdInput.value = task.id;
  titleInput.value = task.title;
  categoryInput.value = task.category;
  priorityInput.value = task.priority;
  dueDateInput.value = task.dueDate || "";

  formHeading.textContent = "Edit Task";
  submitBtn.textContent = "Update Task";
  cancelEditBtn.classList.remove("hidden");
  validationError.textContent = "";
  titleInput.focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Cancel Edit Mode
function resetFormMode() {
  editTaskIdInput.value = "";
  formHeading.textContent = "Add New Task";
  submitBtn.textContent = "Add Task";
  cancelEditBtn.classList.add("hidden");
  validationError.textContent = "";
}

cancelEditBtn.addEventListener("click", () => {
  taskForm.reset();
  resetFormMode();
});

// Delete Task
function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  if (editTaskIdInput.value === id) {
    taskForm.reset();
    resetFormMode();
  }
  saveTasks();
  renderTasks();
}

// Search and Filter Listeners
searchInput.addEventListener("input", renderTasks);
filterStatus.addEventListener("change", renderTasks);
filterCategory.addEventListener("change", renderTasks);
filterPriority.addEventListener("change", renderTasks);

// Initial Boot
initTheme();
renderTasks();