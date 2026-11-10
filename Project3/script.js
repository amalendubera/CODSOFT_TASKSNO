const STORAGE_KEY = "codsoft_expense_tracker_transactions";

const CATEGORIES = {
  expense: [
    "Food & Dining",
    "Transportation",
    "Shopping",
    "Bills & Utilities",
    "Entertainment",
    "Healthcare",
    "Education",
    "Other Expense"
  ],
  income: [
    "Salary",
    "Freelance",
    "Investments",
    "Gift / Bonus",
    "Other Income"
  ]
};

// State
let transactions = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

// DOM Elements
const form = document.getElementById("transactionForm");
const formTitle = document.getElementById("formTitle");
const editIdInput = document.getElementById("editId");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const typeSelect = document.getElementById("type");
const categorySelect = document.getElementById("category");
const dateInput = document.getElementById("date");
const submitBtn = document.getElementById("submitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const clearAllBtn = document.getElementById("clearAllBtn");

const totalBalanceEl = document.getElementById("totalBalance");
const balanceStatusEl = document.getElementById("balanceStatus");
const totalIncomeEl = document.getElementById("totalIncome");
const incomeCountEl = document.getElementById("incomeCount");
const totalExpenseEl = document.getElementById("totalExpense");
const expenseCountEl = document.getElementById("expenseCount");
const savingsRateEl = document.getElementById("savingsRate");
const topCategoryInsightEl = document.getElementById("topCategoryInsight");

const filterTypeSelect = document.getElementById("filterType");
const filterCategorySelect = document.getElementById("filterCategory");
const searchInput = document.getElementById("searchInput");
const transactionListEl = document.getElementById("transactionList");
const emptyHistoryMsg = document.getElementById("emptyHistoryMsg");
const categoryBreakdownEl = document.getElementById("categoryBreakdown");

// Initialize Date to Today
function setDefaultDate() {
  dateInput.value = new Date().toISOString().split("T")[0];
}

// Populate Category Dropdown in Form Based on Type
function updateFormCategories(selectedType, selectedCategory = "") {
  const options = CATEGORIES[selectedType] || [];
  categorySelect.innerHTML = options
    .map((cat) => `<option value="${cat}">${cat}</option>`)
    .join("");
  if (selectedCategory && options.includes(selectedCategory)) {
    categorySelect.value = selectedCategory;
  }
}

// Populate Category Filter Dropdown
function populateFilterCategories() {
  const allCategories = [...CATEGORIES.expense, ...CATEGORIES.income];
  filterCategorySelect.innerHTML =
    `<option value="all">All Categories</option>` +
    allCategories.map((cat) => `<option value="${cat}">${cat}</option>`).join("");
}

// Format Currency
function formatCurrency(num) {
  return "₹" + Number(num).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Save to Local Storage
function saveTransactions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

// Calculate Summary & Insights
function updateSummaryAndInsights() {
  const incomes = transactions.filter((t) => t.type === "income");
  const expenses = transactions.filter((t) => t.type === "expense");

  const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  totalBalanceEl.textContent =
    (balance < 0 ? "-" : "") + formatCurrency(Math.abs(balance));
  balanceStatusEl.textContent =
    balance >= 0 ? "Healthy positive balance" : "Warning: Expenses exceed income";

  totalIncomeEl.textContent = "+" + formatCurrency(totalIncome);
  incomeCountEl.textContent = `${incomes.length} transaction(s)`;

  totalExpenseEl.textContent = "-" + formatCurrency(totalExpense);
  expenseCountEl.textContent = `${expenses.length} transaction(s)`;

  // Savings Rate & Top Expense Category
  const savingsRate =
    totalIncome > 0
      ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100))
      : 0;
  savingsRateEl.textContent = `${savingsRate}% Saved`;

  const expenseTotalsByCategory = {};
  expenses.forEach((t) => {
    expenseTotalsByCategory[t.category] =
      (expenseTotalsByCategory[t.category] || 0) + t.amount;
  });

  const sortedCategories = Object.entries(expenseTotalsByCategory).sort(
    (a, b) => b[1] - a[1]
  );

  if (sortedCategories.length > 0) {
    const [topCat, topVal] = sortedCategories[0];
    topCategoryInsightEl.textContent = `Top expense: ${topCat} (${formatCurrency(topVal)})`;
  } else {
    topCategoryInsightEl.textContent = "Top expense: None";
  }

  renderCategoryBreakdown(sortedCategories, totalExpense);
}

// Render Expense Category Breakdown Bars
function renderCategoryBreakdown(sortedCategories, totalExpense) {
  if (sortedCategories.length === 0 || totalExpense === 0) {
    categoryBreakdownEl.innerHTML = `<p class="empty-text">No expenses recorded yet.</p>`;
    return;
  }

  categoryBreakdownEl.innerHTML = sortedCategories
    .map(([category, amount]) => {
      const percentage = Math.round((amount / totalExpense) * 100);
      return `
        <div class="breakdown-item">
          <div class="breakdown-header">
            <span>${category}</span>
            <span>${formatCurrency(amount)} (${percentage}%)</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" style="width: ${percentage}%"></div>
          </div>
        </div>
      `;
    })
    .join("");
}

// Render Filtered Transaction History
function renderTransactions() {
  const typeFilter = filterTypeSelect.value;
  const categoryFilter = filterCategorySelect.value;
  const searchQuery = searchInput.value.trim().toLowerCase();

  const filtered = transactions
    .filter((t) => {
      const matchesType = typeFilter === "all" || t.type === typeFilter;
      const matchesCategory =
        categoryFilter === "all" || t.category === categoryFilter;
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery) ||
        t.category.toLowerCase().includes(searchQuery);
      return matchesType && matchesCategory && matchesSearch;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (filtered.length === 0) {
    transactionListEl.innerHTML = "";
    emptyHistoryMsg.classList.remove("hidden");
    return;
  }

  emptyHistoryMsg.classList.add("hidden");

  transactionListEl.innerHTML = filtered
    .map((t) => {
      const sign = t.type === "income" ? "+" : "-";
      const amountClass =
        t.type === "income" ? "amount-income" : "amount-expense";

      return `
        <tr>
          <td>${t.date}</td>
          <td><strong>${escapeHTML(t.title)}</strong></td>
          <td><span class="badge">${escapeHTML(t.category)}</span></td>
          <td class="${amountClass}">${sign}${formatCurrency(t.amount)}</td>
          <td>
            <div class="action-btns">
              <button class="btn-sm btn-edit" onclick="startEditTransaction('${t.id}')">Edit</button>
              <button class="btn-sm btn-delete" onclick="deleteTransaction('${t.id}')">Delete</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

// Escape HTML to prevent XSS
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, (tag) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  }[tag]));
}

// Handle Form Submit (Add or Update)
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = titleInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const type = typeSelect.value;
  const category = categorySelect.value;
  const date = dateInput.value;
  const editId = editIdInput.value;

  if (!title || isNaN(amount) || amount <= 0 || !date) return;

  if (editId) {
    // Update existing transaction
    transactions = transactions.map((t) =>
      t.id === editId ? { ...t, title, amount, type, category, date } : t
    );
    resetEditMode();
  } else {
    // Add new transaction
    const newTransaction = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      title,
      amount,
      type,
      category,
      date
    };
    transactions.push(newTransaction);
  }

  saveTransactions();
  updateUI();
  form.reset();
  setDefaultDate();
  updateFormCategories(typeSelect.value);
});

// Edit Transaction
window.startEditTransaction = function (id) {
  const item = transactions.find((t) => t.id === id);
  if (!item) return;

  editIdInput.value = item.id;
  titleInput.value = item.title;
  amountInput.value = item.amount;
  typeSelect.value = item.type;
  updateFormCategories(item.type, item.category);
  dateInput.value = item.date;

  formTitle.textContent = "Edit Transaction";
  submitBtn.textContent = "Update Transaction";
  cancelEditBtn.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
};

function resetEditMode() {
  editIdInput.value = "";
  formTitle.textContent = "Add New Transaction";
  submitBtn.textContent = "Add Transaction";
  cancelEditBtn.classList.add("hidden");
}

cancelEditBtn.addEventListener("click", () => {
  resetEditMode();
  form.reset();
  setDefaultDate();
  updateFormCategories(typeSelect.value);
});

// Delete Transaction
window.deleteTransaction = function (id) {
  transactions = transactions.filter((t) => t.id !== id);
  if (editIdInput.value === id) resetEditMode();
  saveTransactions();
  updateUI();
};

// Clear All Data
clearAllBtn.addEventListener("click", () => {
  if (transactions.length === 0) return;
  if (confirm("Are you sure you want to delete all recorded transactions?")) {
    transactions = [];
    resetEditMode();
    saveTransactions();
    updateUI();
  }
});

// Event Listeners for Dynamic Categories and Filters
typeSelect.addEventListener("change", () => {
  updateFormCategories(typeSelect.value);
});

filterTypeSelect.addEventListener("change", renderTransactions);
filterCategorySelect.addEventListener("change", renderTransactions);
searchInput.addEventListener("input", renderTransactions);

// Master UI Update
function updateUI() {
  updateSummaryAndInsights();
  renderTransactions();
}

// Initial Setup
setDefaultDate();
updateFormCategories(typeSelect.value);
populateFilterCategories();
updateUI();