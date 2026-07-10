/* =============================================
   FinSight – Charts Module
   Wraps Chart.js instances for each chart
   ============================================= */

// ---- Chart theme helpers ----
function getChartColors() {
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  return {
    grid: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    text: dark ? '#A0AABF' : '#8A94A6',
    tooltipBg: dark ? '#1E2A4A' : '#FFFFFF',
    tooltipText: dark ? '#F0F4FF' : '#1A1A1A'
  };
}

// ---- Destroy chart safely ----
function destroyChart(instance) {
  if (instance) { try { instance.destroy(); } catch(e) {} }
}

// ---- Income Bar Chart ----
let incomeChartInstance = null;

function renderIncomeChart(canvasId, period = 'this-month') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  destroyChart(incomeChartInstance);

  let months;
  if (period === 'this-month') months = getMonthsBack(1);
  else if (period === '3-months') months = getMonthsBack(3);
  else if (period === '6-months') months = getMonthsBack(6);
  else months = getMonthsBack(12);

  const labels = months.map(getMonthLabel);

  const fixedData = months.map(m => {
    return AppData.transactions
      .filter(t => t.date.startsWith(m) && t.type === 'income' && t.incomeType === 'fixed' && t.status !== 'failed')
      .reduce((s, t) => s + t.amount, 0);
  });

  const variableData = months.map(m => {
    return AppData.transactions
      .filter(t => t.date.startsWith(m) && t.type === 'income' && t.incomeType !== 'fixed' && t.status !== 'failed')
      .reduce((s, t) => s + t.amount, 0);
  });

  const colors = getChartColors();

  incomeChartInstance = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Fixed Income',
          data: fixedData,
          backgroundColor: '#2E3A8C',
          borderRadius: 6,
          borderSkipped: false
        },
        {
          label: 'Variable Income',
          data: variableData,
          backgroundColor: 'rgba(74,95,217,0.65)',
          borderRadius: 6,
          borderSkipped: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: colors.tooltipBg,
          titleColor: colors.tooltipText,
          bodyColor: colors.tooltipText,
          borderColor: '#E0E0E0',
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label(ctx) { return ` ${ctx.dataset.label}: $${ctx.raw.toLocaleString()}`; }
          }
        }
      },
      scales: {
        x: {
          stacked: false,
          grid: { display: false },
          ticks: { color: colors.text, font: { size: 12 } }
        },
        y: {
          stacked: false,
          grid: { color: colors.grid },
          ticks: {
            color: colors.text,
            font: { size: 12 },
            callback: v => '$' + (v >= 1000 ? (v/1000).toFixed(0)+'k' : v)
          },
          border: { display: false }
        }
      }
    }
  });
}

// ---- Budget Donut Chart ----
let budgetChartInstance = null;

function renderBudgetChart(canvasId, period = 'this-month') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  destroyChart(budgetChartInstance);

  const budgets = AppData.budgets;
  const colors = getChartColors();
  const bgColors = budgets.map(b => getCatColor(b.category));

  budgetChartInstance = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: budgets.map(b => b.category),
      datasets: [{
        data: budgets.map(b => b.spentAmount),
        backgroundColor: bgColors,
        borderWidth: 0,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '72%',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: colors.tooltipBg,
          titleColor: colors.tooltipText,
          bodyColor: colors.tooltipText,
          borderColor: '#E0E0E0',
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label(ctx) {
              const b = budgets[ctx.dataIndex];
              return ` $${b.spentAmount.toLocaleString()} / $${b.allocatedAmount.toLocaleString()}`;
            }
          }
        }
      }
    }
  });
}

// ---- Analytics: Spending Trend Line Chart ----
let spendingTrendChartInstance = null;

function renderSpendingTrendChart(canvasId, period = 'monthly') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  destroyChart(spendingTrendChartInstance);

  let months, labels;
  if (period === 'weekly') {
    months = getMonthsBack(4);
    labels = months.map(getMonthLabel);
  } else if (period === 'monthly') {
    months = getMonthsBack(6);
    labels = months.map(getMonthLabel);
  } else {
    months = getMonthsBack(12);
    labels = months.map(getMonthLabel);
  }

  const currentData = months.map(m => getMonthlyExpenses(m));
  const prevData = months.map((m, i) => {
    const prev = getMonthsBack(months.length * 2)[i];
    return prev ? getMonthlyExpenses(prev) : 0;
  });

  const colors = getChartColors();

  spendingTrendChartInstance = new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Current Period',
          data: currentData,
          borderColor: '#2E3A8C',
          backgroundColor: 'rgba(46,58,140,0.1)',
          borderWidth: 2.5,
          pointRadius: 4,
          pointBackgroundColor: '#2E3A8C',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Previous Period',
          data: prevData,
          borderColor: '#4A5FD9',
          backgroundColor: 'rgba(74,95,217,0.05)',
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: '#4A5FD9',
          tension: 0.4,
          fill: false,
          borderDash: [5, 5]
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: colors.tooltipBg,
          titleColor: colors.tooltipText,
          bodyColor: colors.tooltipText,
          borderColor: '#E0E0E0',
          borderWidth: 1,
          padding: 12,
          callbacks: { label: ctx => ` ${ctx.dataset.label}: $${ctx.raw.toLocaleString()}` }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: colors.text, font: { size: 12 } } },
        y: {
          grid: { color: colors.grid },
          ticks: { color: colors.text, font: { size: 12 }, callback: v => '$' + (v >= 1000 ? (v/1000).toFixed(0)+'k' : v) },
          border: { display: false }
        }
      }
    }
  });
}

// ---- Analytics: Category Breakdown Bar Chart ----
let categoryChartInstance = null;

function renderCategoryChart(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  destroyChart(categoryChartInstance);

  const month = getCurrentMonth();
  const breakdown = getCategoryBreakdown(month).slice(0, 7);
  const colors = getChartColors();

  categoryChartInstance = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: breakdown.map(([cat]) => cat),
      datasets: [{
        label: 'Spent',
        data: breakdown.map(([, amt]) => amt),
        backgroundColor: breakdown.map(([cat]) => getCatColor(cat)),
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: colors.tooltipBg,
          titleColor: colors.tooltipText,
          bodyColor: colors.tooltipText,
          borderColor: '#E0E0E0',
          borderWidth: 1,
          padding: 12,
          callbacks: { label: ctx => ` $${ctx.raw.toLocaleString()}` }
        }
      },
      scales: {
        x: {
          grid: { color: colors.grid },
          ticks: { color: colors.text, font: { size: 12 }, callback: v => '$' + (v >= 1000 ? (v/1000).toFixed(0)+'k' : v) },
          border: { display: false }
        },
        y: { grid: { display: false }, ticks: { color: colors.text, font: { size: 12 } } }
      }
    }
  });
}

// ---- Analytics: Income vs Expenses Bar Chart ----
let incomeExpenseChartInstance = null;

function renderIncomeExpenseChart(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  destroyChart(incomeExpenseChartInstance);

  const months = getMonthsBack(6);
  const labels = months.map(getMonthLabel);
  const incomeData = months.map(m => getMonthlyIncome(m));
  const expenseData = months.map(m => getMonthlyExpenses(m));
  const colors = getChartColors();

  incomeExpenseChartInstance = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Income', data: incomeData, backgroundColor: 'rgba(16,185,129,0.85)', borderRadius: 5, borderSkipped: false },
        { label: 'Expenses', data: expenseData, backgroundColor: 'rgba(239,68,68,0.75)', borderRadius: 5, borderSkipped: false }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: colors.tooltipBg,
          titleColor: colors.tooltipText,
          bodyColor: colors.tooltipText,
          borderColor: '#E0E0E0',
          borderWidth: 1,
          padding: 12,
          callbacks: { label: ctx => ` ${ctx.dataset.label}: $${ctx.raw.toLocaleString()}` }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: colors.text, font: { size: 12 } } },
        y: {
          grid: { color: colors.grid },
          ticks: { color: colors.text, font: { size: 12 }, callback: v => '$' + (v >= 1000 ? (v/1000).toFixed(0)+'k' : v) },
          border: { display: false }
        }
      }
    }
  });
}

// ---- Refresh all charts (on theme toggle) ----
function refreshAllCharts() {
  const page = window._currentPage;
  if (page === 'dashboard') {
    if (incomeChartInstance) {
      const sel = document.getElementById('incomeChartPeriod');
      renderIncomeChart('incomeChart', sel ? sel.value : 'this-month');
    }
    if (budgetChartInstance) {
      const sel = document.getElementById('budgetChartPeriod');
      renderBudgetChart('budgetChart', sel ? sel.value : 'this-month');
    }
  } else if (page === 'analytics') {
    const tSel = document.getElementById('trendPeriod');
    renderSpendingTrendChart('spendingTrendChart', tSel ? tSel.value : 'monthly');
    renderCategoryChart('categoryChart');
    renderIncomeExpenseChart('incomeExpenseChart');
  }
}
