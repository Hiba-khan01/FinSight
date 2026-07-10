/* =============================================
   FinSight – Transactions Page
   ============================================= */

let txnState = {
  search: '',
  type: 'all',
  category: 'all',
  status: 'all',
  sort: 'date-desc',
  page: 1,
  perPage: 10
};

function renderTransactions() {
  return `
<div class="page-header" style="display:flex;justify-content:space-between;align-items:flex-start;">
  <div>
    <h1 class="page-title">Transactions</h1>
    <p class="page-subtitle">Manage and track all your financial transactions</p>
  </div>
  <button class="btn btn-primary" id="addTxnBtn" onclick="openAddTransactionModal()">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
    Add Transaction
  </button>
</div>

<div class="card card-padded">
  <!-- Filters -->
  <div class="filters-row">
    <div class="filter-search">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input type="text" id="txnSearch" placeholder="Search by name, ID..." value="${txnState.search}" oninput="onTxnSearch(this.value)" />
    </div>
    <select class="select-sm" id="txnTypeFilter" onchange="onTxnFilter('type', this.value)">
      <option value="all" ${txnState.type==='all'?'selected':''}>All Types</option>
      <option value="income" ${txnState.type==='income'?'selected':''}>Income</option>
      <option value="expense" ${txnState.type==='expense'?'selected':''}>Expense</option>
    </select>
    <select class="select-sm" id="txnCatFilter" onchange="onTxnFilter('category', this.value)">
      <option value="all">All Categories</option>
      ${[...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].filter((v,i,a)=>a.indexOf(v)===i).map(c=>`<option value="${c}" ${txnState.category===c?'selected':''}>${c}</option>`).join('')}
    </select>
    <select class="select-sm" id="txnStatusFilter" onchange="onTxnFilter('status', this.value)">
      <option value="all" ${txnState.status==='all'?'selected':''}>All Status</option>
      <option value="completed" ${txnState.status==='completed'?'selected':''}>Completed</option>
      <option value="pending" ${txnState.status==='pending'?'selected':''}>Pending</option>
      <option value="failed" ${txnState.status==='failed'?'selected':''}>Failed</option>
    </select>
    <select class="select-sm" id="txnSort" onchange="onTxnFilter('sort', this.value)">
      <option value="date-desc" ${txnState.sort==='date-desc'?'selected':''}>Newest First</option>
      <option value="date-asc" ${txnState.sort==='date-asc'?'selected':''}>Oldest First</option>
      <option value="amount-desc" ${txnState.sort==='amount-desc'?'selected':''}>Highest Amount</option>
      <option value="amount-asc" ${txnState.sort==='amount-asc'?'selected':''}>Lowest Amount</option>
    </select>
  </div>

  <!-- Table -->
  <div class="table-wrapper" id="txnTableBody">
    ${renderTxnTable()}
  </div>

  <!-- Pagination -->
  <div id="txnPagination">
    ${renderTxnPagination()}
  </div>
</div>`;
}

function getFilteredTxns() {
  let data = AppData.transactions;
  if (txnState.search) {
    const q = txnState.search.toLowerCase();
    data = data.filter(t => t.recipientName.toLowerCase().includes(q) || t.id.toLowerCase().includes(q) || (t.notes || '').toLowerCase().includes(q));
  }
  if (txnState.type !== 'all') data = data.filter(t => t.type === txnState.type);
  if (txnState.category !== 'all') data = data.filter(t => t.category === txnState.category);
  if (txnState.status !== 'all') data = data.filter(t => t.status === txnState.status);

  // Sort
  data = [...data].sort((a, b) => {
    if (txnState.sort === 'date-desc') return new Date(b.date) - new Date(a.date);
    if (txnState.sort === 'date-asc') return new Date(a.date) - new Date(b.date);
    if (txnState.sort === 'amount-desc') return b.amount - a.amount;
    if (txnState.sort === 'amount-asc') return a.amount - b.amount;
    return 0;
  });
  return data;
}

function renderTxnTable() {
  const all = getFilteredTxns();
  const start = (txnState.page - 1) * txnState.perPage;
  const page = all.slice(start, start + txnState.perPage);

  if (!page.length) return `<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg><div class="empty-state-title">No transactions found</div><div class="empty-state-text">Try adjusting your search or filters</div></div>`;

  return `
<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Transaction ID</th>
      <th>Category</th>
      <th>Status</th>
      <th>Date</th>
      <th style="text-align:right;">Amount</th>
      <th style="text-align:center;">Actions</th>
    </tr>
  </thead>
  <tbody>
    ${page.map(t => `
    <tr>
      <td>
        <div class="table-name-cell">
          <div class="table-avatar" style="background:${getAvatarColor(t.recipientName)}">${getInitials(t.recipientName)}</div>
          <div>
            <div class="table-name">${t.recipientName}</div>
            <div class="table-sub">${t.notes || ''}</div>
          </div>
        </div>
      </td>
      <td class="text-sm text-muted">${t.id}</td>
      <td class="text-sm">${t.category}</td>
      <td><span class="badge-status badge-${t.status}">${capitalize(t.status)}</span></td>
      <td class="text-sm text-muted">${formatDateTime(t.date)}</td>
      <td style="text-align:right;" class="${t.type==='income'?'amount-positive':'amount-negative'}">${t.type==='income'?'+':'-'}${formatCurrency(t.amount)}</td>
      <td style="text-align:center;">
        <div style="display:flex;gap:6px;justify-content:center;">
          <button class="btn btn-sm btn-ghost" title="Edit" onclick="openEditTransactionModal('${t.id}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn btn-sm" style="background:rgba(239,68,68,0.1);color:var(--danger);border:none;" title="Delete" onclick="confirmDeleteTransaction('${t.id}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>
      </td>
    </tr>`).join('')}
  </tbody>
</table>
<div class="text-sm text-muted" style="margin-top:12px;">Showing ${start+1}–${Math.min(start+txnState.perPage, all.length)} of ${all.length} transactions</div>`;
}

function renderTxnPagination() {
  const all = getFilteredTxns();
  const totalPages = Math.ceil(all.length / txnState.perPage);
  if (totalPages <= 1) return '';

  let btns = `<div class="pagination">`;
  btns += `<button class="page-btn" onclick="changeTxnPage(${txnState.page-1})" ${txnState.page===1?'disabled':''}>‹</button>`;
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - txnState.page) <= 2) {
      btns += `<button class="page-btn ${p===txnState.page?'active':''}" onclick="changeTxnPage(${p})">${p}</button>`;
    } else if (Math.abs(p - txnState.page) === 3) {
      btns += `<span class="page-btn" style="border:none;background:none;color:var(--text-muted)">…</span>`;
    }
  }
  btns += `<button class="page-btn" onclick="changeTxnPage(${txnState.page+1})" ${txnState.page===totalPages?'disabled':''}>›</button>`;
  btns += `</div>`;
  return btns;
}

function onTxnSearch(val) {
  txnState.search = val;
  txnState.page = 1;
  refreshTxnTable();
}

function onTxnFilter(key, val) {
  txnState[key] = val;
  txnState.page = 1;
  refreshTxnTable();
}

function changeTxnPage(p) {
  txnState.page = Math.max(1, p);
  refreshTxnTable();
}

function refreshTxnTable() {
  const tableEl = document.getElementById('txnTableBody');
  const pagEl = document.getElementById('txnPagination');
  if (tableEl) tableEl.innerHTML = renderTxnTable();
  if (pagEl) pagEl.innerHTML = renderTxnPagination();
}

// ---- Add/Edit Modal ----
function openAddTransactionModal(prefill = {}) {
  openTxnModal(prefill, null);
}

function openEditTransactionModal(id) {
  const t = TransactionService.getById(id);
  if (!t) return;
  openTxnModal(t, id);
}

function openTxnModal(data, editId) {
  const isEdit = !!editId;
  const isoDate = data.date ? new Date(data.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
  const typeVal = data.type || 'expense';
  const cats = typeVal === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const html = `
<div class="modal-overlay" id="txnModal" onclick="closeTxnModalOnOverlay(event)">
  <div class="modal">
    <div class="modal-header">
      <h2 class="modal-title">${isEdit ? 'Edit Transaction' : 'Add Transaction'}</h2>
      <button class="modal-close" onclick="closeModal('txnModal')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <form id="txnForm" onsubmit="saveTxn(event,'${editId||''}')">
      <div class="form-group">
        <label class="form-label">Type</label>
        <div class="type-toggle">
          <button type="button" class="type-toggle-btn ${typeVal==='expense'?'active':''}" onclick="switchTxnType('expense')">Expense</button>
          <button type="button" class="type-toggle-btn ${typeVal==='income'?'active':''}" onclick="switchTxnType('income')">Income</button>
        </div>
        <input type="hidden" id="txnTypeInput" value="${typeVal}">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Amount ($)</label>
          <input type="number" id="txnAmount" class="form-input" placeholder="0.00" min="0.01" step="0.01" value="${data.amount||''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Category</label>
          <select id="txnCategory" class="form-select">
            ${cats.map(c=>`<option value="${c}" ${(data.category||'')==c?'selected':''}>${c}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Recipient / Source Name</label>
        <input type="text" id="txnName" class="form-input" placeholder="e.g. Whole Foods, Monthly Salary" value="${data.recipientName||''}" required>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Date</label>
          <input type="date" id="txnDate" class="form-input" value="${isoDate}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select id="txnStatus" class="form-select">
            <option value="completed" ${(data.status||'')==='completed'?'selected':''}>Completed</option>
            <option value="pending" ${(data.status||'')==='pending'?'selected':''}>Pending</option>
            <option value="failed" ${(data.status||'')==='failed'?'selected':''}>Failed</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Notes (optional)</label>
        <textarea id="txnNotes" class="form-textarea" rows="2" placeholder="Any additional notes...">${data.notes||''}</textarea>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-ghost" onclick="closeModal('txnModal')">Cancel</button>
        <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Add Transaction'}</button>
      </div>
    </form>
  </div>
</div>`;

  document.getElementById('modalContainer').innerHTML = html;
}

function switchTxnType(type) {
  document.getElementById('txnTypeInput').value = type;
  document.querySelectorAll('.type-toggle-btn').forEach((btn, i) => {
    btn.classList.toggle('active', (i === 0 && type === 'expense') || (i === 1 && type === 'income'));
  });
  // Rebuild categories
  const cats = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const sel = document.getElementById('txnCategory');
  sel.innerHTML = cats.map(c => `<option value="${c}">${c}</option>`).join('');
}

function saveTxn(e, editId) {
  e.preventDefault();
  const data = {
    type: document.getElementById('txnTypeInput').value,
    amount: parseFloat(document.getElementById('txnAmount').value),
    category: document.getElementById('txnCategory').value,
    recipientName: document.getElementById('txnName').value.trim(),
    date: new Date(document.getElementById('txnDate').value).toISOString(),
    status: document.getElementById('txnStatus').value,
    notes: document.getElementById('txnNotes').value.trim(),
    incomeType: document.getElementById('txnTypeInput').value === 'income' ? 'variable' : null
  };

  if (editId) {
    TransactionService.update(editId, data);
    showToast('Transaction updated', 'success');
  } else {
    TransactionService.add(data);
    showToast('Transaction added', 'success');
  }
  closeModal('txnModal');
  refreshTxnTable();
}

function closeTxnModalOnOverlay(e) {
  if (e.target.id === 'txnModal') closeModal('txnModal');
}

function confirmDeleteTransaction(id) {
  const t = TransactionService.getById(id);
  if (!t) return;
  const html = `
<div class="modal-overlay" id="confirmModal" onclick="if(event.target.id==='confirmModal')closeModal('confirmModal')">
  <div class="modal" style="max-width:380px;">
    <div class="confirm-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg></div>
    <p class="confirm-message">Are you sure you want to delete <strong>${t.recipientName}</strong>? This action cannot be undone.</p>
    <div class="modal-footer" style="justify-content:center;">
      <button class="btn btn-ghost" onclick="closeModal('confirmModal')">Cancel</button>
      <button class="btn btn-danger" onclick="deleteTxn('${id}')">Delete</button>
    </div>
  </div>
</div>`;
  document.getElementById('modalContainer').innerHTML = html;
}

function deleteTxn(id) {
  TransactionService.delete(id);
  closeModal('confirmModal');
  showToast('Transaction deleted', 'info');
  refreshTxnTable();
}
