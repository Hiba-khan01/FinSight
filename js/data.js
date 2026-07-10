/* =============================================
   FinSight – Data Layer
   Models, localStorage helpers, seed data, computed helpers
   ============================================= */

const DB_KEY = 'finsight_data';

// ---- Default seed data ----
function createSeedData() {
  const now = new Date();
  const year = now.getFullYear();

  // Generate transactions for the past 12 months
  const transactions = [];
  let id = 1;

  const expenseCategories = ['Food & Grocery', 'Transportation', 'Entertainment', 'Healthcare', 'Shopping', 'Bills & Utilities', 'Travel', 'Education', 'Subscriptions', 'Other'];
  const incomeCategories = ['Salary', 'Freelance', 'Investments', 'Rental Income', 'Gifts', 'Refunds'];

  const expenseNames = ['Whole Foods Market', 'Uber Ride', 'Netflix', 'City Pharmacy', 'Amazon Purchase', 'Electric Bill', 'Flight Ticket', 'Coursera', 'Spotify', 'Coffee Shop', 'Gas Station', 'Movie Theatre', 'Doctor Visit', 'Apple Store', 'Internet Bill', 'Restaurant', 'Gym Membership', 'H&M Store'];
  const incomeNames = ['Monthly Salary', 'Freelance Project', 'Stock Dividend', 'Rental Payment', 'Birthday Gift', 'Tax Refund', 'Bonus Payment'];

  const statuses = ['completed', 'completed', 'completed', 'completed', 'pending', 'failed'];

  for (let m = 11; m >= 0; m--) {
    const monthDate = new Date(year, now.getMonth() - m, 1);
    const monthYear = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
    const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();

    // Salary (fixed income)
    transactions.push({
      id: `txn_${id++}`,
      type: 'income',
      amount: 5500 + Math.round(Math.random() * 500),
      category: 'Salary',
      recipientName: 'Monthly Salary',
      status: 'completed',
      date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).toISOString(),
      notes: 'Regular monthly salary',
      incomeType: 'fixed',
      createdAt: new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).toISOString()
    });

    // Variable income (1-2 per month)
    const varIncome = Math.floor(Math.random() * 2) + 1;
    for (let v = 0; v < varIncome; v++) {
      const cats = ['Freelance', 'Investments', 'Rental Income', 'Gifts', 'Refunds'];
      const cat = cats[Math.floor(Math.random() * cats.length)];
      const names = { 'Freelance': 'Freelance Project', 'Investments': 'Stock Dividend', 'Rental Income': 'Rental Payment', 'Gifts': 'Birthday Gift', 'Refunds': 'Tax Refund' };
      transactions.push({
        id: `txn_${id++}`,
        type: 'income',
        amount: Math.round(200 + Math.random() * 1800),
        category: cat,
        recipientName: names[cat] || cat,
        status: 'completed',
        date: new Date(monthDate.getFullYear(), monthDate.getMonth(), Math.floor(Math.random() * daysInMonth) + 1).toISOString(),
        notes: '',
        incomeType: 'variable',
        createdAt: new Date().toISOString()
      });
    }

    // Expenses (8-15 per month)
    const numExpenses = Math.floor(Math.random() * 8) + 8;
    for (let e = 0; e < numExpenses; e++) {
      const catIdx = Math.floor(Math.random() * expenseCategories.length);
      const nameIdx = Math.floor(Math.random() * expenseNames.length);
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const amounts = { 'Food & Grocery': [20, 180], 'Transportation': [10, 80], 'Entertainment': [10, 60], 'Healthcare': [30, 200], 'Shopping': [30, 300], 'Bills & Utilities': [50, 200], 'Travel': [100, 800], 'Education': [20, 150], 'Subscriptions': [5, 25], 'Other': [10, 100] };
      const [min, max] = amounts[expenseCategories[catIdx]] || [10, 100];
      transactions.push({
        id: `txn_${id++}`,
        type: 'expense',
        amount: Math.round(min + Math.random() * (max - min)),
        category: expenseCategories[catIdx],
        recipientName: expenseNames[nameIdx],
        status,
        date: new Date(monthDate.getFullYear(), monthDate.getMonth(), Math.floor(Math.random() * daysInMonth) + 1).toISOString(),
        notes: '',
        incomeType: null,
        createdAt: new Date().toISOString()
      });
    }
  }

  // Sort by date desc
  transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

  const cards = [
    { id: 'card_1', cardNumber: '4532', cardholderName: 'Hiba', expiryDate: '12/27', cardType: 'visa', nickname: 'Personal Visa', createdAt: new Date().toISOString() },
    { id: 'card_2', cardNumber: '8412', cardholderName: 'Hiba', expiryDate: '09/26', cardType: 'mastercard', nickname: 'Business MC', createdAt: new Date().toISOString() }
  ];

  const goals = [
    { id: 'goal_1', name: 'Emergency Fund', targetAmount: 15000, currentAmount: 8500, targetDate: new Date(year + 1, 5, 1).toISOString(), createdAt: new Date().toISOString() },
    { id: 'goal_2', name: 'Vacation to Japan', targetAmount: 5000, currentAmount: 2200, targetDate: new Date(year, 9, 15).toISOString(), createdAt: new Date().toISOString() },
    { id: 'goal_3', name: 'New Laptop', targetAmount: 2000, currentAmount: 2000, targetDate: new Date(year, 2, 1).toISOString(), createdAt: new Date().toISOString() },
    { id: 'goal_4', name: 'Down Payment', targetAmount: 50000, currentAmount: 12000, targetDate: new Date(year + 3, 0, 1).toISOString(), createdAt: new Date().toISOString() }
  ];

  const budgets = [
    { id: 'budget_1', category: 'Investment', allocatedAmount: 500, spentAmount: 320, month: getCurrentMonth() },
    { id: 'budget_2', category: 'Travelling', allocatedAmount: 300, spentAmount: 210, month: getCurrentMonth() },
    { id: 'budget_3', category: 'Food & Grocery', allocatedAmount: 600, spentAmount: 480, month: getCurrentMonth() },
    { id: 'budget_4', category: 'Entertainment', allocatedAmount: 200, spentAmount: 165, month: getCurrentMonth() },
    { id: 'budget_5', category: 'Healthcare', allocatedAmount: 250, spentAmount: 90, month: getCurrentMonth() }
  ];

  const user = {
    id: 'user_1',
    name: 'Hiba',
    email: 'hiba657@gmail.com',
    avatar: null,
    currency: 'USD',
    monthlySpendingLimit: 3500,
    createdAt: new Date().toISOString()
  };

  const notifications = [
    { id: 'n1', text: 'You\'ve spent 85% of your Food & Grocery budget', time: '2 hours ago', read: false },
    { id: 'n2', text: 'Monthly salary of $5,500 received', time: '1 day ago', read: false },
    { id: 'n3', text: 'New goal milestone: Emergency Fund at 56%', time: '3 days ago', read: false }
  ];

  return { user, transactions, cards, goals, budgets, notifications };
}

// ---- Helpers ----
function getCurrentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getPrevMonth() {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// ---- Storage ----
const DB = {
  load() {
    try {
      const raw = localStorage.getItem(DB_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  },

  save(data) {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(data));
    } catch (e) { console.error('Save failed', e); }
  },

  init() {
    let data = this.load();
    if (!data) {
      data = createSeedData();
    }
    // Always keep name/email up to date
    data.user.name  = 'Hiba';
    data.user.email = 'hiba@example.com';
    // Update card holder names too
    data.cards.forEach(c => { c.cardholderName = 'Hiba'; });
    this.save(data);
    return data;
  }
};

// ---- App State ----
let AppData = DB.init();

// ---- Persist helper ----
function persist() { DB.save(AppData); }

// ---- ID generator ----
function genId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ---- Format currency ----
function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

// ---- Format date ----
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

// ---- Initials from name ----
function getInitials(name) {
  if (!name) return '??';
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

// ---- Avatar color ----
function getAvatarColor(name) {
  const colors = ['#2E3A8C','#4A5FD9','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#06B6D4'];
  let hash = 0;
  for (const c of (name || 'X')) hash = c.charCodeAt(0) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

// ---- Financial computations ----
function getTransactionsByMonth(month) {
  return AppData.transactions.filter(t => t.date.startsWith(month));
}

function getTransactionsByPeriod(months) {
  // months: array of 'YYYY-MM' strings
  return AppData.transactions.filter(t => months.some(m => t.date.startsWith(m)));
}

function getMonthlyIncome(month) {
  return getTransactionsByMonth(month)
    .filter(t => t.type === 'income' && t.status !== 'failed')
    .reduce((s, t) => s + t.amount, 0);
}

function getMonthlyExpenses(month) {
  return getTransactionsByMonth(month)
    .filter(t => t.type === 'expense' && t.status !== 'failed')
    .reduce((s, t) => s + t.amount, 0);
}

function getMonthlySavings(month) {
  return getMonthlyIncome(month) - getMonthlyExpenses(month);
}

function getTotalBalance() {
  return AppData.transactions
    .filter(t => t.status !== 'failed')
    .reduce((s, t) => t.type === 'income' ? s + t.amount : s - t.amount, 0);
}

function getPercentChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / Math.abs(previous)) * 100);
}

// ---- Month range helper ----
function getMonthsBack(n) {
  const months = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return months;
}

function getMonthLabel(monthStr) {
  const [y, m] = monthStr.split('-').map(Number);
  return new Date(y, m - 1).toLocaleDateString('en-US', { month: 'short' });
}

// ---- Current spending total ----
function getCurrentMonthSpending() {
  const month = getCurrentMonth();
  return getTransactionsByMonth(month)
    .filter(t => t.type === 'expense' && t.status === 'completed')
    .reduce((s, t) => s + t.amount, 0);
}

// ---- Expense categories breakdown ----
function getCategoryBreakdown(month) {
  const txns = month
    ? getTransactionsByMonth(month).filter(t => t.type === 'expense' && t.status !== 'failed')
    : AppData.transactions.filter(t => t.type === 'expense' && t.status !== 'failed');
  const map = {};
  for (const t of txns) {
    map[t.category] = (map[t.category] || 0) + t.amount;
  }
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
}

// ---- Budget donut data ----
function getBudgetDonutData(period) {
  return AppData.budgets.map(b => ({
    category: b.category,
    allocated: b.allocatedAmount,
    spent: b.spentAmount,
    pct: Math.round((b.spentAmount / b.allocatedAmount) * 100)
  }));
}

// ---- CRUD: Transactions ----
const TransactionService = {
  getAll() { return [...AppData.transactions]; },
  getById(id) { return AppData.transactions.find(t => t.id === id); },
  add(data) {
    const txn = { id: genId('txn'), createdAt: new Date().toISOString(), incomeType: data.type === 'income' ? 'variable' : null, ...data };
    AppData.transactions.unshift(txn);
    persist();
    return txn;
  },
  update(id, data) {
    const idx = AppData.transactions.findIndex(t => t.id === id);
    if (idx === -1) return null;
    AppData.transactions[idx] = { ...AppData.transactions[idx], ...data };
    persist();
    return AppData.transactions[idx];
  },
  delete(id) {
    AppData.transactions = AppData.transactions.filter(t => t.id !== id);
    persist();
  }
};

// ---- CRUD: Cards ----
const CardService = {
  getAll() { return [...AppData.cards]; },
  add(data) {
    const card = { id: genId('card'), createdAt: new Date().toISOString(), ...data };
    AppData.cards.push(card);
    persist();
    return card;
  },
  update(id, data) {
    const idx = AppData.cards.findIndex(c => c.id === id);
    if (idx === -1) return null;
    AppData.cards[idx] = { ...AppData.cards[idx], ...data };
    persist();
    return AppData.cards[idx];
  },
  delete(id) {
    AppData.cards = AppData.cards.filter(c => c.id !== id);
    persist();
  }
};

// ---- CRUD: Goals ----
const GoalService = {
  getAll() { return [...AppData.goals]; },
  add(data) {
    const goal = { id: genId('goal'), currentAmount: 0, createdAt: new Date().toISOString(), ...data };
    AppData.goals.push(goal);
    persist();
    return goal;
  },
  update(id, data) {
    const idx = AppData.goals.findIndex(g => g.id === id);
    if (idx === -1) return null;
    AppData.goals[idx] = { ...AppData.goals[idx], ...data };
    persist();
    return AppData.goals[idx];
  },
  addMoney(id, amount) {
    const idx = AppData.goals.findIndex(g => g.id === id);
    if (idx === -1) return null;
    AppData.goals[idx].currentAmount = Math.min(AppData.goals[idx].currentAmount + amount, AppData.goals[idx].targetAmount);
    persist();
    return AppData.goals[idx];
  },
  delete(id) {
    AppData.goals = AppData.goals.filter(g => g.id !== id);
    persist();
  }
};

// ---- Notifications ----
const NotificationService = {
  getAll() { return [...AppData.notifications]; },
  clearAll() { AppData.notifications = []; persist(); },
  markAllRead() { AppData.notifications.forEach(n => n.read = true); persist(); }
};

// ---- Expense Categories ----
const EXPENSE_CATEGORIES = ['Food & Grocery','Transportation','Entertainment','Healthcare','Shopping','Bills & Utilities','Travel','Education','Subscriptions','Other'];
const INCOME_CATEGORIES  = ['Salary','Freelance','Investments','Rental Income','Gifts','Refunds','Other'];
const BUDGET_CATEGORIES  = ['Investment','Travelling','Food & Grocery','Entertainment','Healthcare'];

// ---- Category colors ----
const CAT_COLORS = {
  'Food & Grocery': '#10B981',
  'Transportation': '#3B82F6',
  'Entertainment':  '#8B5CF6',
  'Healthcare':     '#EF4444',
  'Shopping':       '#F59E0B',
  'Bills & Utilities': '#06B6D4',
  'Travel':         '#EC4899',
  'Education':      '#14B8A6',
  'Subscriptions':  '#F97316',
  'Other':          '#6B7280',
  'Investment':     '#2E3A8C',
  'Travelling':     '#EC4899',
  'Salary':         '#10B981',
  'Freelance':      '#4A5FD9',
  'Investments':    '#2E3A8C',
  'Rental Income':  '#06B6D4',
  'Gifts':          '#F59E0B',
  'Refunds':        '#14B8A6'
};

function getCatColor(cat) { return CAT_COLORS[cat] || '#8A94A6'; }
