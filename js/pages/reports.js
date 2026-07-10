/* =============================================
   FinSight – Reports Page
   ============================================= */

function renderReports() {
  const now = new Date();
  const curMonth = String(now.getMonth() + 1).padStart(2,'0');
  const curYear = String(now.getFullYear());

  return `
<div class="page-header">
  <h1 class="page-title">Reports</h1>
  <p class="page-subtitle">Generate detailed financial summaries and export your data</p>
</div>

<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
  <!-- Monthly Summary -->
  <div class="card card-padded">
    <div class="chart-header">
      <div>
        <div class="chart-title">Monthly Summary</div>
        <div class="chart-subtitle">Income, expenses & net savings</div>
      </div>
    </div>
    <div style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap;">
      <select class="select-sm" id="reportMonth">
        ${Array.from({length:12},(_,i)=>{
          const d = new Date(now.getFullYear(), i);
          const m = String(i+1).padStart(2,'0');
          return `<option value="${m}" ${m===curMonth?'selected':''}>${d.toLocaleDateString('en-US',{month:'long'})}</option>`;
        }).join('')}
      </select>
      <select class="select-sm" id="reportYear">
        ${[now.getFullYear()-1, now.getFullYear()].map(y=>`<option value="${y}" ${String(y)===curYear?'selected':''}>${y}</option>`).join('')}
      </select>
      <button class="btn btn-primary btn-sm" onclick="generateMonthlyReport()">Generate</button>
    </div>
    <div id="monthlyReportResult">
      ${getMonthlyReportHtml(curMonth, curYear)}
    </div>
  </div>

  <!-- Yearly Summary -->
  <div class="card card-padded">
    <div class="chart-header">
      <div>
        <div class="chart-title">Yearly Summary</div>
        <div class="chart-subtitle">Full year financial overview</div>
      </div>
    </div>
    <div style="display:flex;gap:10px;margin-bottom:20px;">
      <select class="select-sm" id="reportYearOnly">
        ${[now.getFullYear()-1, now.getFullYear()].map(y=>`<option value="${y}" ${String(y)===curYear?'selected':''}>${y}</option>`).join('')}
      </select>
      <button class="btn btn-primary btn-sm" onclick="generateYearlyReport()">Generate</button>
    </div>
    <div id="yearlyReportResult">
      ${getYearlyReportHtml(curYear)}
    </div>
  </div>
</div>

<!-- Export Section -->
<div class="card card-padded">
  <div class="chart-header">
    <div>
      <div class="chart-title">Export Data</div>
      <div class="chart-subtitle">Download your transaction history</div>
    </div>
  </div>
  <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-end;">
    <div class="form-group" style="margin-bottom:0;">
      <label class="form-label">From Date</label>
      <input type="date" id="exportFrom" class="form-input" style="width:auto;" value="${new Date(now.getFullYear(),0,1).toISOString().split('T')[0]}">
    </div>
    <div class="form-group" style="margin-bottom:0;">
      <label class="form-label">To Date</label>
      <input type="date" id="exportTo" class="form-input" style="width:auto;" value="${now.toISOString().split('T')[0]}">
    </div>
    <button class="btn btn-primary" onclick="exportCSV()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      Export CSV
    </button>
  </div>
</div>`;
}

function getMonthlyReportHtml(month, year) {
  const key = `${year}-${month}`;
  const txns = AppData.transactions.filter(t => t.date.startsWith(key) && t.status !== 'failed');
  const income = txns.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0);
  const expenses = txns.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
  const savings = income - expenses;
  const topCats = getCategoryBreakdown(key).slice(0,3);
  const total = txns.length;

  return `
<div class="report-summary">
  <div class="report-stat"><div class="report-stat-label">Income</div><div class="report-stat-value" style="color:var(--success)">${formatCurrency(income)}</div></div>
  <div class="report-stat"><div class="report-stat-label">Expenses</div><div class="report-stat-value" style="color:var(--danger)">${formatCurrency(expenses)}</div></div>
  <div class="report-stat"><div class="report-stat-label">Net Savings</div><div class="report-stat-value" style="color:${savings>=0?'var(--success)':'var(--danger)'}">${formatCurrency(savings)}</div></div>
</div>
${topCats.length ? `
<div class="text-sm" style="font-weight:600;margin-bottom:8px;color:var(--text-secondary);">Top Spending Categories</div>
${topCats.map(([cat,amt])=>`
<div class="inline-stat">
  <div class="inline-stat-label" style="display:flex;align-items:center;gap:8px;"><span style="width:10px;height:10px;border-radius:3px;background:${getCatColor(cat)};display:inline-block;"></span>${cat}</div>
  <div class="inline-stat-value">${formatCurrency(amt)}</div>
</div>`).join('')}` : ''}
<div class="text-sm text-muted mt-3">${total} transactions in this period</div>`;
}

function getYearlyReportHtml(year) {
  const months = Array.from({length:12},(_,i)=>`${year}-${String(i+1).padStart(2,'0')}`);
  const allTxns = AppData.transactions.filter(t=>t.date.startsWith(year)&&t.status!=='failed');
  const totalIncome = allTxns.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0);
  const totalExpenses = allTxns.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
  const totalSavings = totalIncome - totalExpenses;

  return `
<div class="report-summary">
  <div class="report-stat"><div class="report-stat-label">Total Income</div><div class="report-stat-value" style="color:var(--success)">${formatCurrency(totalIncome)}</div></div>
  <div class="report-stat"><div class="report-stat-label">Total Expenses</div><div class="report-stat-value" style="color:var(--danger)">${formatCurrency(totalExpenses)}</div></div>
  <div class="report-stat"><div class="report-stat-label">Net Savings</div><div class="report-stat-value" style="color:${totalSavings>=0?'var(--success)':'var(--danger)'}">${formatCurrency(totalSavings)}</div></div>
</div>
<div class="text-sm" style="font-weight:600;margin:12px 0 8px;color:var(--text-secondary);">Month-by-Month</div>
${months.map(m=>{
  const mLabel = new Date(m+'-01').toLocaleDateString('en-US',{month:'short'});
  const mInc = getMonthlyIncome(m);
  const mExp = getMonthlyExpenses(m);
  if (mInc + mExp === 0) return '';
  return `
<div class="inline-stat">
  <div class="inline-stat-label">${mLabel} ${year}</div>
  <div style="display:flex;gap:12px;">
    <span style="color:var(--success);font-size:13px;font-weight:600;">+${formatCurrency(mInc)}</span>
    <span style="color:var(--danger);font-size:13px;font-weight:600;">-${formatCurrency(mExp)}</span>
  </div>
</div>`;
}).join('')}`;
}

function generateMonthlyReport() {
  const month = document.getElementById('reportMonth').value;
  const year = document.getElementById('reportYear').value;
  const el = document.getElementById('monthlyReportResult');
  if (el) el.innerHTML = getMonthlyReportHtml(month, year);
  showToast('Monthly report generated', 'success');
}

function generateYearlyReport() {
  const year = document.getElementById('reportYearOnly').value;
  const el = document.getElementById('yearlyReportResult');
  if (el) el.innerHTML = getYearlyReportHtml(year);
  showToast('Yearly report generated', 'success');
}

function exportCSV() {
  const from = new Date(document.getElementById('exportFrom').value);
  const to = new Date(document.getElementById('exportTo').value);
  to.setHours(23,59,59);

  const txns = AppData.transactions.filter(t => {
    const d = new Date(t.date);
    return d >= from && d <= to;
  });

  if (!txns.length) { showToast('No transactions in selected range', 'error'); return; }

  const headers = ['ID','Type','Amount','Category','Recipient/Source','Status','Date','Notes'];
  const rows = txns.map(t => [
    t.id, t.type, t.amount.toFixed(2), t.category, `"${t.recipientName}"`,
    t.status, new Date(t.date).toLocaleDateString('en-US'), `"${t.notes||''}"`
  ]);

  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `finsight_transactions_${from.toISOString().split('T')[0]}_${to.toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast(`Exported ${txns.length} transactions`, 'success');
}
