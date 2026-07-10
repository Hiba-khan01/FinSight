/* =============================================
   FinSight – Dashboard Page
   ============================================= */

function renderDashboard() {
  const month = getCurrentMonth();
  const prevMonth = getPrevMonth();

  const balance = getTotalBalance();
  const income = getMonthlyIncome(month);
  const expenses = getMonthlyExpenses(month);
  const savings = getMonthlySavings(month);

  const prevIncome = getMonthlyIncome(prevMonth);
  const prevExpenses = getMonthlyExpenses(prevMonth);
  const prevSavings = getMonthlySavings(prevMonth);

  // prev balance: rough estimate
  const prevBalance = balance - (income - expenses) + (prevIncome - prevExpenses);

  const balanceChange = getPercentChange(balance, prevBalance);
  const incomeChange  = getPercentChange(income, prevIncome);
  const expenseChange = getPercentChange(expenses, prevExpenses);
  const savingsChange = getPercentChange(savings, prevSavings);

  const spending = getCurrentMonthSpending();
  const spendingLimit = AppData.user.monthlySpendingLimit;
  const spendingPct = Math.min(Math.round((spending / spendingLimit) * 100), 100);
  const spendingClass = spendingPct >= 90 ? 'danger' : spendingPct >= 70 ? 'warning' : '';

  const recentTxns = AppData.transactions.slice(0, 8);
  const cards = AppData.cards;

  return `
<div class="page-header">
  <h1 class="page-title">Welcome Hiba 👋</h1>
  <p class="page-subtitle">Here's your financial overview for today.</p>
</div>

<!-- Metrics -->
<div class="metrics-grid">
  ${metricCard('Total Balance', formatCurrency(balance), balanceChange, 'from last month',
    '<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>',
    '#2E3A8C', 'rgba(46,58,140,0.12)')}
  ${metricCard('Monthly Income', formatCurrency(income), incomeChange, 'vs last month',
    '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
    '#10B981', 'rgba(16,185,129,0.12)')}
  ${metricCard('Monthly Expenses', formatCurrency(expenses), expenseChange, 'vs last month',
    '<polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/>',
    '#EF4444', 'rgba(239,68,68,0.12)', true)}
  ${metricCard('Total Savings', formatCurrency(savings), savingsChange, 'vs last month',
    '<path d="M19 14H5c-1.1 0-2-.9-2-2V7h18v5c0 1.1-.9 2-2 2z"/><path d="M3 7V5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v2"/><path d="M8 21h8"/><path d="M12 17v4"/>',
    '#4A5FD9', 'rgba(74,95,217,0.12)')}
</div>

<!-- Charts Row -->
<div class="dashboard-grid">
  <!-- Income Chart -->
  <div class="card card-padded">
    <div class="chart-header">
      <div>
        <div class="chart-title">Total Income</div>
        <div class="chart-subtitle">Fixed vs Variable income breakdown</div>
      </div>
      <select class="select-sm" id="incomeChartPeriod" onchange="renderIncomeChart('incomeChart', this.value)">
        <option value="this-month">This month</option>
        <option value="3-months" selected>Last 3 months</option>
        <option value="6-months">Last 6 months</option>
        <option value="year">This year</option>
      </select>
    </div>
    <div class="chart-container">
      <canvas id="incomeChart"></canvas>
    </div>
    <div class="chart-legend mt-3">
      <div class="legend-item"><span class="legend-dot" style="background:#2E3A8C"></span>Fixed Income</div>
      <div class="legend-item"><span class="legend-dot" style="background:rgba(74,95,217,0.65)"></span>Variable Income</div>
    </div>
  </div>

  <!-- Budget Donut -->
  <div class="card card-padded">
    <div class="chart-header">
      <div>
        <div class="chart-title">Budget Overview</div>
        <div class="chart-subtitle">Spending by category</div>
      </div>
      <select class="select-sm" id="budgetChartPeriod" onchange="renderBudgetChart('budgetChart', this.value)">
        <option value="this-month" selected>This month</option>
        <option value="last-month">Last month</option>
        <option value="this-year">This year</option>
      </select>
    </div>
    <div class="donut-outer" style="position:relative;height:180px;">
      <canvas id="budgetChart" style="height:180px;"></canvas>
      <div class="donut-center">
        <div class="donut-center-label">Budget</div>
        <div class="donut-center-value">${formatCurrency(AppData.budgets.reduce((s,b)=>s+b.allocatedAmount,0))}</div>
        <div class="donut-center-label mt-1">Spent</div>
        <div class="donut-center-value" style="color:var(--danger)">${formatCurrency(AppData.budgets.reduce((s,b)=>s+b.spentAmount,0))}</div>
      </div>
    </div>
    <div class="chart-legend mt-3" style="flex-wrap:wrap;gap:10px;">
      ${AppData.budgets.map(b=>`<div class="legend-item"><span class="legend-dot" style="background:${getCatColor(b.category)}"></span>${b.category}</div>`).join('')}
    </div>
  </div>
</div>

<!-- Bottom Row -->
<div class="dashboard-grid-3" style="margin-bottom:20px;">
  <!-- Recent Transactions -->
  <div class="card card-padded col-span-2">
    <div class="section-header">
      <div class="section-title">Recent Transactions</div>
      <div style="display:flex;align-items:center;gap:12px;">
        <select class="select-sm" id="txnFilter" onchange="refreshDashboardTxns()">
          <option value="week">This week</option>
          <option value="month" selected>This month</option>
          <option value="all">All</option>
        </select>
        <span class="see-all-link" onclick="navigateTo('transactions')">See all →</span>
      </div>
    </div>
    <div class="table-wrapper" id="dashTxnTable">
      ${renderTxnTableRows(recentTxns)}
    </div>
  </div>

  <!-- Right column -->
  <div style="display:flex;flex-direction:column;gap:16px;">
    <!-- Spending Limit -->
    <div class="card spending-limit-widget">
      <div class="section-title mb-2">Spending Limit</div>
      <div class="spending-info">
        <div>
          <div class="spending-label">Spent this month</div>
          <div class="spending-amount">${formatCurrency(spending)}</div>
        </div>
        <div style="text-align:right;">
          <div class="spending-limit-label">Monthly Limit</div>
          <div class="spending-limit-val">${formatCurrency(spendingLimit)}</div>
        </div>
      </div>
      <div class="progress-wrap">
        <div class="progress-bar ${spendingClass}" style="width:${spendingPct}%"></div>
      </div>
      <div class="spending-pct mt-2">${spendingPct}% of limit used · ${formatCurrency(spendingLimit - spending)} remaining</div>
    </div>

    <!-- My Cards -->
    <div class="card card-padded">
      <div class="section-header mb-2">
        <div class="section-title">My Cards</div>
        <button class="btn btn-sm btn-primary" onclick="navigateTo('wallet')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add
        </button>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px;" id="dashCards">
        ${cards.length === 0 ? '<div class="empty-state" style="padding:20px;"><div class="empty-state-title">No cards added</div></div>' :
          cards.slice(0,2).map(c => miniCardHtml(c)).join('')}
      </div>
    </div>
  </div>
</div>`;
}

function metricCard(label, value, change, changeLabel, iconPath, iconColor, iconBg, invertChange = false) {
  const isPos = change >= 0;
  const showPos = invertChange ? !isPos : isPos;
  const sign = change >= 0 ? '+' : '';
  const arrow = isPos
    ? '<polyline points="18 15 12 9 6 15"/>'
    : '<polyline points="6 9 12 15 18 9"/>';
  return `
<div class="metric-card" style="--accent-color:${iconColor}">
  <div class="metric-top">
    <span class="metric-label">${label}</span>
    <div class="metric-icon-wrap" style="background:${iconBg};">
      <svg viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${iconPath}</svg>
    </div>
  </div>
  <div class="metric-value">${value}</div>
  <div class="metric-change ${showPos ? 'positive' : 'negative'}">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${arrow}</svg>
    ${sign}${change}%
    <span class="metric-change-label">${changeLabel}</span>
  </div>
</div>`;
}

function renderTxnTableRows(txns) {
  if (!txns.length) return `<div class="empty-state"><div class="empty-state-title">No transactions found</div></div>`;
  return `
<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Transaction ID</th>
      <th>Status</th>
      <th>Date</th>
      <th style="text-align:right;">Amount</th>
    </tr>
  </thead>
  <tbody>
    ${txns.map(t => `
    <tr>
      <td>
        <div class="table-name-cell">
          <div class="table-avatar" style="background:${getAvatarColor(t.recipientName)}">${getInitials(t.recipientName)}</div>
          <div>
            <div class="table-name">${t.recipientName}</div>
            <div class="table-sub">${t.category}</div>
          </div>
        </div>
      </td>
      <td class="text-sm text-muted">${t.id.slice(0,14)}...</td>
      <td><span class="badge-status badge-${t.status}">${capitalize(t.status)}</span></td>
      <td class="text-sm text-muted">${formatDateTime(t.date)}</td>
      <td style="text-align:right;" class="${t.type === 'income' ? 'amount-positive' : 'amount-negative'}">
        ${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}
      </td>
    </tr>`).join('')}
  </tbody>
</table>`;
}

function miniCardHtml(c) {
  return `
<div class="payment-card ${c.cardType}" style="min-height:120px;padding:16px;border-radius:12px;" onclick="navigateTo('wallet')">
  <div class="card-top">
    <span class="card-network" style="font-size:14px;font-weight:700;">${c.cardType.toUpperCase()}</span>
    <div class="card-chip" style="width:24px;height:18px;"></div>
  </div>
  <div class="card-number" style="font-size:13px;letter-spacing:2px;">•••• •••• •••• ${c.cardNumber}</div>
  <div class="card-bottom">
    <div><div class="card-holder-label">Card Holder</div><div class="card-holder-name" style="font-size:12px;">${c.cardholderName}</div></div>
    <div><div class="card-expiry-label">Expires</div><div class="card-expiry" style="font-size:12px;">${c.expiryDate}</div></div>
  </div>
</div>`;
}

function refreshDashboardTxns() {
  const filter = document.getElementById('txnFilter').value;
  const now = new Date();
  let txns = AppData.transactions;
  if (filter === 'week') {
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    txns = txns.filter(t => new Date(t.date) >= weekAgo);
  } else if (filter === 'month') {
    const month = getCurrentMonth();
    txns = txns.filter(t => t.date.startsWith(month));
  }
  document.getElementById('dashTxnTable').innerHTML = renderTxnTableRows(txns.slice(0, 8));
}

function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }
