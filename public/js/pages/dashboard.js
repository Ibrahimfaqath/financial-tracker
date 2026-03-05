import api from '../api.js';
import { toast } from '../app.js';
import Router from '../router.js';

// Helpers
function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateInput(dateStr) {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

let state = {
  transactions: [],
  summary: { totalIncome: 0, totalOutcome: 0, balance: 0 },
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
  search: '',
  filter: 'all',
  sort: 'newest',
  loading: true,
  wisdom: null,
  chart: null,
};

function getFilteredTransactions() {
  let list = [...state.transactions];

  // Search
  if (state.search) {
    const q = state.search.toLowerCase();
    list = list.filter(t => (t.description || '').toLowerCase().includes(q));
  }

  // Filter by status
  if (state.filter !== 'all') {
    list = list.filter(t => t.status === state.filter);
  }

  // Sort
  if (state.sort === 'oldest') {
    list.reverse();
  }

  return list;
}

async function loadTransactions() {
  state.loading = true;
  renderTransactionsTable();
  try {
    const res = await api.getTransactions(state.year, state.month);
    state.transactions = res.data || [];
    state.summary = res.summary || { totalIncome: 0, totalOutcome: 0, balance: 0 };
  } catch (err) {
    toast(err.message || 'Failed to load transactions', 'error');
    state.transactions = [];
    state.summary = { totalIncome: 0, totalOutcome: 0, balance: 0 };
  }
  state.loading = false;
  renderSummaryCards();
  renderTransactionsTable();
  renderChart();
}

async function loadWisdom() {
  try {
    const res = await api.getWisdom();
    state.wisdom = res.data;
    renderWisdom();
  } catch {
    // Silently fail
  }
}

// --- Render functions ---

function renderSummaryCards() {
  const el = document.getElementById('summary-cards');
  if (!el) return;

  el.innerHTML = `
    <div class="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-2xl p-5 flex flex-col gap-1">
      <div class="flex items-center gap-2 text-txt-secondary dark:text-txt-secondary-dark text-sm font-medium">
        <svg class="w-4 h-4 text-income" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 19V5m0 0l-4 4m4-4l4 4"/></svg>
        Income
      </div>
      <p class="text-2xl font-bold text-income">${formatCurrency(state.summary.totalIncome)}</p>
    </div>
    <div class="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-2xl p-5 flex flex-col gap-1">
      <div class="flex items-center gap-2 text-txt-secondary dark:text-txt-secondary-dark text-sm font-medium">
        <svg class="w-4 h-4 text-expense" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14m0 0l4-4m-4 4l-4-4"/></svg>
        Expenses
      </div>
      <p class="text-2xl font-bold text-expense">${formatCurrency(state.summary.totalOutcome)}</p>
    </div>
    <div class="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-2xl p-5 flex flex-col gap-1">
      <div class="flex items-center gap-2 text-txt-secondary dark:text-txt-secondary-dark text-sm font-medium">
        <svg class="w-4 h-4 text-accent" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 6l3 1m0 0l-3 9a5 5 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5 5 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/></svg>
        Balance
      </div>
      <p class="text-2xl font-bold ${state.summary.balance >= 0 ? 'text-accent' : 'text-expense'}">${formatCurrency(state.summary.balance)}</p>
    </div>
  `;
}

function renderChart() {
  const canvas = document.getElementById('overview-chart');
  if (!canvas) return;

  if (state.chart) {
    state.chart.destroy();
  }

  const isDark = document.documentElement.classList.contains('dark');
  const gridColor = isDark ? '#27272a' : '#e4e4e7';
  const textColor = isDark ? '#a1a1aa' : '#71717a';

  // Group transactions by day
  const daysInMonth = new Date(state.year, state.month, 0).getDate();
  const incomeByDay = new Array(daysInMonth).fill(0);
  const expenseByDay = new Array(daysInMonth).fill(0);

  state.transactions.forEach(t => {
    const day = new Date(t.transactionDate).getDate() - 1;
    if (day >= 0 && day < daysInMonth) {
      const amount = parseFloat(t.nominal);
      if (t.status === 'income') {
        incomeByDay[day] += amount;
      } else {
        expenseByDay[day] += amount;
      }
    }
  });

  const labels = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  state.chart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Income',
          data: incomeByDay,
          backgroundColor: isDark ? '#059669' : '#34d399',
          borderRadius: 4,
          barPercentage: 0.6,
        },
        {
          label: 'Expenses',
          data: expenseByDay,
          backgroundColor: isDark ? '#e11d48' : '#fb7185',
          borderRadius: 4,
          barPercentage: 0.6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: { color: textColor, usePointStyle: true, pointStyle: 'circle', padding: 16, font: { size: 12 } },
        },
        tooltip: {
          backgroundColor: isDark ? '#27272a' : '#fff',
          titleColor: isDark ? '#fafafa' : '#09090b',
          bodyColor: isDark ? '#a1a1aa' : '#71717a',
          borderColor: gridColor,
          borderWidth: 1,
          cornerRadius: 8,
          padding: 10,
          callbacks: {
            label(ctx) {
              return `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: textColor, font: { size: 10 }, maxTicksLimit: 15 },
        },
        y: {
          grid: { color: gridColor },
          ticks: {
            color: textColor,
            font: { size: 10 },
            callback(val) {
              if (val >= 1000000) return (val / 1000000).toFixed(0) + 'M';
              if (val >= 1000) return (val / 1000).toFixed(0) + 'K';
              return val;
            },
          },
        },
      },
    },
  });
}

function renderTransactionsTable() {
  const el = document.getElementById('transactions-body');
  if (!el) return;

  if (state.loading) {
    el.innerHTML = Array.from({ length: 5 }, () => `
      <tr class="border-b border-border dark:border-border-dark">
        <td class="py-3 px-4"><div class="skeleton h-4 w-20 rounded"></div></td>
        <td class="py-3 px-4"><div class="skeleton h-4 w-32 rounded"></div></td>
        <td class="py-3 px-4"><div class="skeleton h-5 w-16 rounded-full"></div></td>
        <td class="py-3 px-4 text-right"><div class="skeleton h-4 w-24 rounded ml-auto"></div></td>
        <td class="py-3 px-4 text-right"><div class="skeleton h-7 w-16 rounded ml-auto"></div></td>
      </tr>
    `).join('');
    return;
  }

  const filtered = getFilteredTransactions();

  if (filtered.length === 0) {
    el.innerHTML = `
      <tr>
        <td colspan="5" class="py-16 text-center">
          <div class="flex flex-col items-center gap-2">
            <svg class="w-10 h-10 text-txt-secondary/30 dark:text-txt-secondary-dark/30" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"/>
            </svg>
            <p class="text-sm text-txt-secondary dark:text-txt-secondary-dark">No transactions found</p>
            <p class="text-xs text-txt-secondary/60 dark:text-txt-secondary-dark/60">Add a new transaction to get started</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  el.innerHTML = filtered.map(t => `
    <tr class="border-b border-border dark:border-border-dark hover:bg-subtle/50 dark:hover:bg-subtle-dark/50 transition-colors">
      <td class="py-3 px-4 text-sm text-txt-secondary dark:text-txt-secondary-dark whitespace-nowrap">${formatDate(t.transactionDate)}</td>
      <td class="py-3 px-4 text-sm text-txt-primary dark:text-txt-primary-dark">${escapeHtml(t.description || '-')}</td>
      <td class="py-3 px-4">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${t.status === 'income' ? 'badge-income' : 'badge-expense'}">
          ${t.status === 'income' ? 'Income' : 'Expense'}
        </span>
      </td>
      <td class="py-3 px-4 text-sm font-medium text-right whitespace-nowrap ${t.status === 'income' ? 'text-income' : 'text-expense'}">
        ${t.status === 'income' ? '+' : '-'}${formatCurrency(parseFloat(t.nominal))}
      </td>
      <td class="py-3 px-4 text-right">
        <div class="flex items-center justify-end gap-1">
          <button onclick="window.__editTx(${t.id})" class="p-1.5 rounded-lg hover:bg-subtle dark:hover:bg-subtle-dark text-txt-secondary dark:text-txt-secondary-dark hover:text-accent transition-colors" aria-label="Edit transaction" title="Edit">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/></svg>
          </button>
          <button onclick="window.__deleteTx(${t.id})" class="p-1.5 rounded-lg hover:bg-expense-light dark:hover:bg-expense-darkbg text-txt-secondary dark:text-txt-secondary-dark hover:text-expense transition-colors" aria-label="Delete transaction" title="Delete">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderWisdom() {
  const el = document.getElementById('wisdom-card');
  if (!el || !state.wisdom) return;

  el.innerHTML = `
    <div class="flex items-start gap-3">
      <div class="shrink-0 mt-0.5">
        <svg class="w-5 h-5 text-accent" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/>
        </svg>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm leading-relaxed text-txt-primary dark:text-txt-primary-dark italic">"${escapeHtml(state.wisdom.text)}"</p>
        <p class="text-xs text-txt-secondary dark:text-txt-secondary-dark mt-2">-- ${escapeHtml(state.wisdom.source)}</p>
      </div>
      <button onclick="window.__refreshWisdom()" class="shrink-0 p-1.5 rounded-lg hover:bg-white/60 dark:hover:bg-white/10 text-txt-secondary dark:text-txt-secondary-dark transition-colors" aria-label="Get new wisdom" title="New quote">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182"/></svg>
      </button>
    </div>
  `;
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// --- Modals ---

function showModal(html) {
  const container = document.getElementById('modal-container');
  container.innerHTML = `
    <div class="modal-backdrop fixed inset-0 bg-black/40 dark:bg-black/60 z-50 flex items-center justify-center px-4" id="modal-overlay">
      <div class="modal-content bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-2xl shadow-xl w-full max-w-md p-6" onclick="event.stopPropagation()">
        ${html}
      </div>
    </div>
  `;
  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
}

function closeModal() {
  const container = document.getElementById('modal-container');
  container.innerHTML = '';
}

function showTransactionModal(tx = null) {
  const isEdit = tx != null;
  const title = isEdit ? 'Edit Transaction' : 'Add Transaction';
  const submitText = isEdit ? 'Save Changes' : 'Add Transaction';

  const nominalVal = isEdit ? parseFloat(tx.nominal) : '';
  const dateVal = isEdit ? formatDateInput(tx.transactionDate) : new Date().toISOString().split('T')[0];
  const statusVal = isEdit ? tx.status : 'outcome';
  const descVal = isEdit ? (tx.description || '') : '';

  showModal(`
    <h2 class="text-lg font-semibold text-txt-primary dark:text-txt-primary-dark mb-4">${title}</h2>
    <form id="tx-form" class="flex flex-col gap-4">
      <div>
        <label for="tx-nominal" class="block text-sm font-medium mb-1.5 text-txt-primary dark:text-txt-primary-dark">Amount</label>
        <input
          type="number"
          id="tx-nominal"
          name="nominal"
          required
          min="1"
          step="any"
          placeholder="Enter amount"
          value="${nominalVal}"
          class="w-full px-3 py-2.5 rounded-xl border border-border dark:border-border-dark bg-ground dark:bg-ground-dark text-txt-primary dark:text-txt-primary-dark text-sm"
        />
      </div>
      <div>
        <label for="tx-date" class="block text-sm font-medium mb-1.5 text-txt-primary dark:text-txt-primary-dark">Date</label>
        <input
          type="date"
          id="tx-date"
          name="transactionDate"
          required
          value="${dateVal}"
          class="w-full px-3 py-2.5 rounded-xl border border-border dark:border-border-dark bg-ground dark:bg-ground-dark text-txt-primary dark:text-txt-primary-dark text-sm"
        />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1.5 text-txt-primary dark:text-txt-primary-dark">Type</label>
        <div class="flex gap-2">
          <label class="flex-1 cursor-pointer">
            <input type="radio" name="status" value="income" class="sr-only peer" ${statusVal === 'income' ? 'checked' : ''} />
            <div class="peer-checked:border-income peer-checked:bg-income-light dark:peer-checked:bg-income-darkbg peer-checked:text-income text-center py-2.5 rounded-xl border border-border dark:border-border-dark text-sm font-medium text-txt-secondary dark:text-txt-secondary-dark transition-colors">
              Income
            </div>
          </label>
          <label class="flex-1 cursor-pointer">
            <input type="radio" name="status" value="outcome" class="sr-only peer" ${statusVal === 'outcome' ? 'checked' : ''} />
            <div class="peer-checked:border-expense peer-checked:bg-expense-light dark:peer-checked:bg-expense-darkbg peer-checked:text-expense text-center py-2.5 rounded-xl border border-border dark:border-border-dark text-sm font-medium text-txt-secondary dark:text-txt-secondary-dark transition-colors">
              Expense
            </div>
          </label>
        </div>
      </div>
      <div>
        <label for="tx-desc" class="block text-sm font-medium mb-1.5 text-txt-primary dark:text-txt-primary-dark">Description</label>
        <textarea
          id="tx-desc"
          name="description"
          rows="2"
          placeholder="What was this for?"
          class="w-full px-3 py-2.5 rounded-xl border border-border dark:border-border-dark bg-ground dark:bg-ground-dark text-txt-primary dark:text-txt-primary-dark text-sm resize-none"
        >${escapeHtml(descVal)}</textarea>
      </div>
      <div id="tx-error" class="hidden text-sm text-expense rounded-lg bg-expense-light dark:bg-expense-darkbg dark:text-red-300 px-3 py-2"></div>
      <div class="flex gap-3 mt-1">
        <button type="button" onclick="window.__closeModal()" class="flex-1 py-2.5 rounded-xl border border-border dark:border-border-dark text-sm font-medium text-txt-secondary dark:text-txt-secondary-dark hover:bg-subtle dark:hover:bg-subtle-dark transition-colors">
          Cancel
        </button>
        <button type="submit" id="tx-submit" class="flex-1 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          ${submitText}
        </button>
      </div>
    </form>
  `);

  const form = document.getElementById('tx-form');
  const errorEl = document.getElementById('tx-error');
  const submitBtn = document.getElementById('tx-submit');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.classList.add('hidden');

    const nominal = parseFloat(document.getElementById('tx-nominal').value);
    const transactionDate = document.getElementById('tx-date').value;
    const status = form.querySelector('input[name="status"]:checked')?.value;
    const description = document.getElementById('tx-desc').value.trim();

    if (!nominal || nominal <= 0) {
      errorEl.textContent = 'Please enter a valid amount.';
      errorEl.classList.remove('hidden');
      return;
    }
    if (!transactionDate) {
      errorEl.textContent = 'Please select a date.';
      errorEl.classList.remove('hidden');
      return;
    }
    if (!status) {
      errorEl.textContent = 'Please select a type.';
      errorEl.classList.remove('hidden');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = isEdit ? 'Saving...' : 'Adding...';

    try {
      if (isEdit) {
        await api.updateTransaction(tx.id, { nominal, transactionDate, status, description });
        toast('Transaction updated', 'success');
      } else {
        await api.addTransaction({ nominal, transactionDate, status, description });
        toast('Transaction added', 'success');
      }
      closeModal();
      await loadTransactions();
    } catch (err) {
      errorEl.textContent = err.message || 'Something went wrong.';
      errorEl.classList.remove('hidden');
      submitBtn.disabled = false;
      submitBtn.textContent = isEdit ? 'Save Changes' : 'Add Transaction';
    }
  });
}

function showDeleteModal(tx) {
  showModal(`
    <div class="text-center">
      <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-expense-light dark:bg-expense-darkbg mb-4">
        <svg class="w-6 h-6 text-expense" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/></svg>
      </div>
      <h2 class="text-lg font-semibold text-txt-primary dark:text-txt-primary-dark mb-1">Delete Transaction</h2>
      <p class="text-sm text-txt-secondary dark:text-txt-secondary-dark mb-1">Are you sure you want to delete this transaction?</p>
      <p class="text-sm font-medium text-txt-primary dark:text-txt-primary-dark mb-6">${escapeHtml(tx.description || 'No description')} - ${formatCurrency(parseFloat(tx.nominal))}</p>
      <div class="flex gap-3">
        <button onclick="window.__closeModal()" class="flex-1 py-2.5 rounded-xl border border-border dark:border-border-dark text-sm font-medium text-txt-secondary dark:text-txt-secondary-dark hover:bg-subtle dark:hover:bg-subtle-dark transition-colors">
          Cancel
        </button>
        <button id="delete-confirm" class="flex-1 py-2.5 rounded-xl bg-expense hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          Delete
        </button>
      </div>
    </div>
  `);

  document.getElementById('delete-confirm').addEventListener('click', async () => {
    const btn = document.getElementById('delete-confirm');
    btn.disabled = true;
    btn.textContent = 'Deleting...';
    try {
      await api.deleteTransaction(tx.id);
      toast('Transaction deleted', 'success');
      closeModal();
      await loadTransactions();
    } catch (err) {
      toast(err.message || 'Failed to delete', 'error');
      btn.disabled = false;
      btn.textContent = 'Delete';
    }
  });
}

// --- CSV Export ---

function exportCSV() {
  const filtered = getFilteredTransactions();
  if (filtered.length === 0) {
    toast('No transactions to export', 'error');
    return;
  }

  const headers = ['Date', 'Description', 'Type', 'Amount'];
  const rows = filtered.map(t => [
    formatDate(t.transactionDate),
    `"${(t.description || '').replace(/"/g, '""')}"`,
    t.status === 'income' ? 'Income' : 'Expense',
    `${t.status === 'income' ? '' : '-'}${parseFloat(t.nominal)}`,
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `transactions-${state.year}-${String(state.month).padStart(2, '0')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast('CSV exported', 'success');
}

// --- Global handlers (called from inline onclick) ---

window.__editTx = (id) => {
  const tx = state.transactions.find(t => t.id === id);
  if (tx) showTransactionModal(tx);
};

window.__deleteTx = (id) => {
  const tx = state.transactions.find(t => t.id === id);
  if (tx) showDeleteModal(tx);
};

window.__closeModal = closeModal;

window.__refreshWisdom = () => loadWisdom();

// --- Main render ---

export async function renderDashboard(container) {
  const user = window.__user;

  // Build month/year options
  const yearOptions = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear - 5; y <= currentYear + 1; y++) {
    yearOptions.push(`<option value="${y}" ${y === state.year ? 'selected' : ''}>${y}</option>`);
  }

  const monthOptions = MONTHS.map((m, i) =>
    `<option value="${i + 1}" ${i + 1 === state.month ? 'selected' : ''}>${m}</option>`
  ).join('');

  container.innerHTML = `
    <!-- Header -->
    <header class="sticky top-0 z-40 bg-surface/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-border dark:border-border-dark">
      <div class="max-w-6xl mx-auto flex items-center justify-between px-4 py-3 lg:px-6">
        <div class="flex items-center gap-3">
          <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-accent text-white">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <span class="font-semibold text-txt-primary dark:text-txt-primary-dark">FinTrack</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="hidden sm:inline text-sm text-txt-secondary dark:text-txt-secondary-dark">${escapeHtml(user?.username || '')}</span>
          <button id="dark-toggle" class="p-2 rounded-xl hover:bg-subtle dark:hover:bg-subtle-dark text-txt-secondary dark:text-txt-secondary-dark transition-colors" aria-label="Toggle dark mode" title="Toggle dark mode">
            <svg class="w-5 h-5 dark:hidden" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"/></svg>
            <svg class="w-5 h-5 hidden dark:block" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"/></svg>
          </button>
          <button id="logout-btn" class="p-2 rounded-xl hover:bg-expense-light dark:hover:bg-expense-darkbg text-txt-secondary dark:text-txt-secondary-dark hover:text-expense transition-colors" aria-label="Logout" title="Logout">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"/></svg>
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-4 py-6 lg:px-6 flex flex-col gap-6">
      <!-- Wisdom -->
      <div id="wisdom-card" class="wisdom-card rounded-2xl border border-border dark:border-border-dark p-4">
        <div class="flex items-center gap-3">
          <div class="skeleton h-4 w-4 rounded shrink-0"></div>
          <div class="flex-1 flex flex-col gap-2">
            <div class="skeleton h-4 w-3/4 rounded"></div>
            <div class="skeleton h-3 w-1/3 rounded"></div>
          </div>
        </div>
      </div>

      <!-- Summary cards -->
      <div id="summary-cards" class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        ${Array.from({ length: 3 }, () => `
          <div class="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-2xl p-5 flex flex-col gap-2">
            <div class="skeleton h-4 w-16 rounded"></div>
            <div class="skeleton h-7 w-28 rounded"></div>
          </div>
        `).join('')}
      </div>

      <!-- Chart -->
      <div class="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-2xl p-5">
        <h2 class="text-sm font-semibold text-txt-primary dark:text-txt-primary-dark mb-4">Daily Overview</h2>
        <div class="chart-container">
          <canvas id="overview-chart"></canvas>
        </div>
      </div>

      <!-- Controls Bar -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
        <div class="flex items-center gap-2">
          <select id="month-select" class="px-3 py-2 rounded-xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-txt-primary dark:text-txt-primary-dark text-sm">
            ${monthOptions}
          </select>
          <select id="year-select" class="px-3 py-2 rounded-xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-txt-primary dark:text-txt-primary-dark text-sm">
            ${yearOptions.join('')}
          </select>
        </div>
        <div class="flex-1"></div>
        <div class="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          <div class="relative flex-1 sm:flex-initial">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-secondary dark:text-txt-secondary-dark" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>
            <input
              type="text"
              id="search-input"
              placeholder="Search..."
              class="w-full sm:w-44 pl-9 pr-3 py-2 rounded-xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-txt-primary dark:text-txt-primary-dark text-sm placeholder:text-txt-secondary/50"
            />
          </div>
          <select id="filter-select" class="px-3 py-2 rounded-xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-txt-primary dark:text-txt-primary-dark text-sm">
            <option value="all">All</option>
            <option value="income">Income</option>
            <option value="outcome">Expense</option>
          </select>
          <button id="sort-btn" class="p-2 rounded-xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-txt-secondary dark:text-txt-secondary-dark hover:text-accent transition-colors" aria-label="Toggle sort" title="Sort by date">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5"/></svg>
          </button>
          <button id="export-btn" class="p-2 rounded-xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-txt-secondary dark:text-txt-secondary-dark hover:text-accent transition-colors" aria-label="Export CSV" title="Export CSV">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/></svg>
          </button>
          <button id="add-tx-btn" class="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
            Add
          </button>
        </div>
      </div>

      <!-- Transactions Table -->
      <div class="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-2xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="border-b border-border dark:border-border-dark bg-subtle/50 dark:bg-subtle-dark/50">
                <th class="py-3 px-4 text-xs font-semibold text-txt-secondary dark:text-txt-secondary-dark uppercase tracking-wider">Date</th>
                <th class="py-3 px-4 text-xs font-semibold text-txt-secondary dark:text-txt-secondary-dark uppercase tracking-wider">Description</th>
                <th class="py-3 px-4 text-xs font-semibold text-txt-secondary dark:text-txt-secondary-dark uppercase tracking-wider">Type</th>
                <th class="py-3 px-4 text-xs font-semibold text-txt-secondary dark:text-txt-secondary-dark uppercase tracking-wider text-right">Amount</th>
                <th class="py-3 px-4 text-xs font-semibold text-txt-secondary dark:text-txt-secondary-dark uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody id="transactions-body">
            </tbody>
          </table>
        </div>
      </div>
    </main>
  `;

  // --- Wire up event handlers ---

  // Dark mode toggle
  document.getElementById('dark-toggle').addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('fintrack-dark', document.documentElement.classList.contains('dark') ? '1' : '0');
    // Re-render chart with correct colors
    renderChart();
  });

  // Logout
  document.getElementById('logout-btn').addEventListener('click', async () => {
    try {
      await api.logout();
    } catch {
      // ignore
    }
    window.__user = null;
    toast('Logged out', 'success');
    Router.navigate('#/login');
  });

  // Month / Year selectors
  document.getElementById('month-select').addEventListener('change', (e) => {
    state.month = parseInt(e.target.value);
    loadTransactions();
  });

  document.getElementById('year-select').addEventListener('change', (e) => {
    state.year = parseInt(e.target.value);
    loadTransactions();
  });

  // Search
  let searchTimeout;
  document.getElementById('search-input').addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      state.search = e.target.value.trim();
      renderTransactionsTable();
    }, 200);
  });

  // Filter
  document.getElementById('filter-select').addEventListener('change', (e) => {
    state.filter = e.target.value;
    renderTransactionsTable();
  });

  // Sort
  document.getElementById('sort-btn').addEventListener('click', () => {
    state.sort = state.sort === 'newest' ? 'oldest' : 'newest';
    renderTransactionsTable();
    toast(`Sorted: ${state.sort === 'newest' ? 'Newest first' : 'Oldest first'}`, 'info');
  });

  // Export
  document.getElementById('export-btn').addEventListener('click', exportCSV);

  // Add transaction
  document.getElementById('add-tx-btn').addEventListener('click', () => {
    showTransactionModal();
  });

  // Load data
  await Promise.all([loadTransactions(), loadWisdom()]);
}
