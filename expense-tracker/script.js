
const form = document.getElementById("transactionForm");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");

const transactionList = document.getElementById("transactionList");
const searchInput = document.getElementById("search");

let transactions = JSON.parse(
  localStorage.getItem("transactions")
) || [];

let expenseChart;

// Set today's date automatically
dateInput.value = new Date().toISOString().split("T")[0];

// Save data in LocalStorage
function saveTransactions() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

// Add transaction
form.addEventListener("submit", function (e) {
  e.preventDefault();

  const transaction = {
    id: Date.now(),
    title: titleInput.value.trim(),
    amount: Number(amountInput.value),
    type: typeInput.value,
    category: categoryInput.value,
    date: dateInput.value
  };

  if (!transaction.title || transaction.amount <= 0 || !transaction.date) {
    alert("Please enter valid transaction details.");
    return;
  }

  transactions.push(transaction);

  saveTransactions();
  updateDashboard();

  form.reset();
  dateInput.value = new Date().toISOString().split("T")[0];
});

// Delete transaction
function deleteTransaction(id) {
  transactions = transactions.filter(function (item) {
    return item.id !== id;
  });

  saveTransactions();
  updateDashboard();
}

// Display transactions
function displayTransactions() {
  const searchText = searchInput.value.toLowerCase();

  const filteredTransactions = transactions.filter(function (item) {
    return (
      item.title.toLowerCase().includes(searchText) ||
      item.category.toLowerCase().includes(searchText)
    );
  });

  transactionList.innerHTML = "";

  if (filteredTransactions.length === 0) {
    transactionList.innerHTML =
      '<p class="empty">No transactions found.</p>';
    return;
  }

  filteredTransactions.slice().reverse().forEach(function (item) {
    const div = document.createElement("div");
    div.className = "transaction";

    const details = document.createElement("div");
    const name = document.createElement("strong");
    const info = document.createElement("small");

    name.textContent = item.title;
    info.textContent = `${item.category} • ${item.date}`;

    details.append(name, info);

    const right = document.createElement("div");

    const amount = document.createElement("span");
    amount.className = item.type;
    amount.textContent =
      `${item.type === "income" ? "+" : "-"}₹${item.amount}`;

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", function () {
      deleteTransaction(item.id);
    });

    right.append(amount, deleteButton);
    div.append(details, right);
    transactionList.appendChild(div);
  });
}

// Calculate income, expenses and balance
function updateSummary() {
  const totalIncome = transactions
    .filter(item => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalExpense = transactions
    .filter(item => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);

  document.getElementById("income").textContent = `₹${totalIncome}`;
  document.getElementById("expense").textContent = `₹${totalExpense}`;
  document.getElementById("balance").textContent =
    `₹${totalIncome - totalExpense}`;
}

// Monthly expense summary
function updateMonthlySummary() {
  const now = new Date();

  const monthlyExpenses = transactions
    .filter(item => {
      const date = new Date(item.date + "T00:00:00");

      return (
        item.type === "expense" &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, item) => sum + item.amount, 0);

  document.getElementById("monthSummary").textContent =
    `This month's expenses: ₹${monthlyExpenses}`;
}

// Category-wise expense chart
function updateChart() {
  const categoryTotals = {};

  transactions
    .filter(item => item.type === "expense")
    .forEach(item => {
      categoryTotals[item.category] =
        (categoryTotals[item.category] || 0) + item.amount;
    });

  const labels = Object.keys(categoryTotals);
  const values = Object.values(categoryTotals);

  const ctx = document.getElementById("expenseChart");

  if (expenseChart) {
    expenseChart.destroy();
  }

  expenseChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [{
        data: values
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom"
        }
      }
    }
  });
}

// Search transactions
searchInput.addEventListener("input", displayTransactions);

// Update complete dashboard
function updateDashboard() {
  updateSummary();
  updateMonthlySummary();
  displayTransactions();
  updateChart();
}

// Show saved transactions when page opens
updateDashboard();
