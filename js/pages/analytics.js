/* =============================================
   FinSight – Analytics Page
   ============================================= */

function renderAnalytics() {
  const month = getCurrentMonth();
  const topExpenses = AppData.transactions
    .filter(t => t.type === 'expense' && t.status === 'completed' && t.date.startsWith(month))
    .sort((a,b) => b.amount - a.amount)
    .slice(0, 6);

  return `
<div class="page-header">
  <h1 class="page-title">Analytics</h1>
  <p class="page-subtitle">Visualize your spending patterns and financial trends</p>
</div>

<div class="analytics-grid" style="margin-bottom:20px;">
  <!-- Spending Trends -->
  <div class="card card-padded">
    <div class="chart-header">
      <div>
        <div class="chart-title">Spending Trends</div>
        <div class="chart-subtitle">Current vs previous period</div>
      </div>
      <select class="select-sm" id="trendPeriod" onchange="renderSpendingTrendChart('spendingTrendChart', this.value)">
        <option value="weekly">Weekly</option>
        <option value="monthly" selected>Monthly</option>
        <option value="yearly">Yearly</option>
      </select>
    </div>
    <div class="chart-container" style="height:240px;">
      <canvas id="spendingTrendChart"></canvas>
    </div>
    <div class="chart-legend mt-3">
      <div class="legend-item"><span class="legend-dot" style="background:#2E3A8C"></span>Current Period</div>
      <div class="legend-item"><span class="legend-dot" style="background:#4A5FD9;border:2px dashed #4A5FD9;background:transparent;"></span>Previous Period</div>
    </div>
  </div>

  <!-- Category Breakdown -->
  <div class="card card-padded">
    <div class="chart-header">
      <div>
        <div class="chart-title">Category Breakdown</div>
        <div class="chart-subtitle">Spending by category this month</div>
      </div>
    </div>
    <div class="chart-container" style="height:240px;">
      <canvas id="categoryChart"></canvas>
    </div>
  </div>
</div>

<div class="analytics-grid">
  <!-- Income vs Expenses -->
  <div class="card card-padded">
    <div class="chart-header">
      <div>
        <div class="chart-title">Income vs Expenses</div>
        <div class="chart-subtitle">6-month comparison</div>
      </div>
    </div>
    <div class="chart-container" style="height:220px;">
      <canvas id="incomeExpenseChart"></canvas>
    </div>
    <div class="chart-legend mt-3">
      <div class="legend-item"><span class="legend-dot" style="background:rgba(16,185,129,0.85)"></span>Income</div>
      <div class="legend-item"><span class="legend-dot" style="background:rgba(239,68,68,0.75)"></span>Expenses</div>
    </div>
  </div>

  <!-- Top Expenses -->
  <div class="card card-padded">
    <div class="chart-header">
      <div>
        <div class="chart-title">Top Expenses</div>
        <div class="chart-subtitle">Highest spending this month</div>
      </div>
    </div>
    ${topExpenses.length ? `
    <div class="top-expenses-list">
      ${topExpenses.map((t,i) => `
      <div class="top-expense-item">
        <div class="expense-rank">${i+1}</div>
        <div class="table-avatar" style="background:${getAvatarColor(t.recipientName)};width:32px;height:32px;font-size:11px;">${getInitials(t.recipientName)}</div>
        <div class="expense-info">
          <div class="expense-name">${t.recipientName}</div>
          <div class="expense-cat">${t.category}</div>
        </div>
        <div class="expense-amount">-${formatCurrency(t.amount)}</div>
      </div>`).join('')}
    </div>` : `<div class="empty-state" style="padding:24px;"><div class="empty-state-title">No expenses this month</div></div>`}
  </div>
</div>`;
}
