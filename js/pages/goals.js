/* =============================================
   FinSight – Goals Page
   ============================================= */

function renderGoals() {
  const goals = GoalService.getAll();
  const totalTarget = goals.reduce((s,g)=>s+g.targetAmount,0);
  const totalSaved = goals.reduce((s,g)=>s+g.currentAmount,0);

  return `
<div class="page-header" style="display:flex;justify-content:space-between;align-items:flex-start;">
  <div>
    <h1 class="page-title">Savings Goals</h1>
    <p class="page-subtitle">Track progress towards your financial goals</p>
  </div>
  <button class="btn btn-primary" onclick="openAddGoalModal()">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
    New Goal
  </button>
</div>

<!-- Summary -->
<div class="metrics-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:24px;">
  ${goalMetric('Total Goals', goals.length, 'Goals', '#2E3A8C','rgba(46,58,140,0.12)')}
  ${goalMetric('Total Saved', formatCurrency(totalSaved), 'Across all goals', '#10B981','rgba(16,185,129,0.12)')}
  ${goalMetric('Total Target', formatCurrency(totalTarget), 'Combined target', '#4A5FD9','rgba(74,95,217,0.12)')}
</div>

<div class="goals-grid" id="goalsGrid">
  ${goals.length ? goals.map(g=>goalCardHtml(g)).join('') : `<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg><div class="empty-state-title">No goals yet</div><div class="empty-state-text">Create your first savings goal to start tracking progress</div></div>`}
</div>`;
}

function goalMetric(label, value, sub, iconColor, iconBg) {
  return `
<div class="metric-card">
  <div class="metric-top">
    <span class="metric-label">${label}</span>
    <div class="metric-icon-wrap" style="background:${iconBg};">
      <svg viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
    </div>
  </div>
  <div class="metric-value">${value}</div>
  <div class="text-sm text-muted mt-1">${sub}</div>
</div>`;
}

function goalCardHtml(g) {
  const pct = Math.min(Math.round((g.currentAmount / g.targetAmount) * 100), 100);
  const done = g.currentAmount >= g.targetAmount;
  const deadline = new Date(g.targetDate);
  const daysLeft = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));
  const deadlineStr = deadline.toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'});
  const barColor = done ? 'var(--success)' : pct >= 80 ? 'var(--primary-hover)' : 'var(--primary)';

  return `
<div class="goal-card">
  <div class="goal-header">
    <div class="goal-name">${g.name}</div>
    ${done ? `<span class="goal-badge" style="background:rgba(16,185,129,0.1);color:var(--success);">✓ Completed</span>` : `<span class="goal-badge">${pct}%</span>`}
  </div>
  <div class="goal-amounts">
    <div>
      <div class="text-muted text-sm">Saved</div>
      <div class="goal-current">${formatCurrency(g.currentAmount)}</div>
    </div>
    <div style="text-align:right;">
      <div class="text-muted text-sm">Target</div>
      <div style="font-size:18px;font-weight:700;color:var(--text-secondary);">${formatCurrency(g.targetAmount)}</div>
    </div>
  </div>
  <div class="goal-percent">${pct}% achieved · ${formatCurrency(g.targetAmount - g.currentAmount)} remaining</div>
  <div class="progress-wrap">
    <div class="progress-bar" style="width:${pct}%;background:${barColor};"></div>
  </div>
  <div class="goal-deadline">
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
    ${deadlineStr} ${daysLeft > 0 ? `· ${daysLeft} days left` : daysLeft === 0 ? '· Due today' : '· Overdue'}
  </div>
  ${done ? `<div class="goal-completed-banner">🎉 Goal Achieved!</div>` : ''}
  <div class="goal-actions">
    ${!done ? `<button class="btn btn-primary btn-sm" style="flex:1;" onclick="openAddMoneyModal('${g.id}')">+ Add Money</button>` : ''}
    <button class="btn btn-ghost btn-sm" onclick="openEditGoalModal('${g.id}')">Edit</button>
    <button class="btn btn-sm" style="background:rgba(239,68,68,0.1);color:var(--danger);border:1px solid rgba(239,68,68,0.2);" onclick="confirmDeleteGoal('${g.id}')">Delete</button>
  </div>
</div>`;
}

// ---- Add Goal Modal ----
function openAddGoalModal() { openGoalModal({}, null); }
function openEditGoalModal(id) {
  const g = GoalService.getAll().find(g=>g.id===id);
  if (g) openGoalModal(g, id);
}

function openGoalModal(data, editId) {
  const isEdit = !!editId;
  const dateVal = data.targetDate ? new Date(data.targetDate).toISOString().split('T')[0] : '';
  const html = `
<div class="modal-overlay" id="goalModal" onclick="if(event.target.id==='goalModal')closeModal('goalModal')">
  <div class="modal">
    <div class="modal-header">
      <h2 class="modal-title">${isEdit ? 'Edit Goal' : 'New Savings Goal'}</h2>
      <button class="modal-close" onclick="closeModal('goalModal')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <form onsubmit="saveGoal(event,'${editId||''}')">
      <div class="form-group">
        <label class="form-label">Goal Name</label>
        <input type="text" id="goalName" class="form-input" placeholder="e.g. Emergency Fund, Vacation" value="${data.name||''}" required>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Target Amount ($)</label>
          <input type="number" id="goalTarget" class="form-input" placeholder="5000" min="1" value="${data.targetAmount||''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Target Date</label>
          <input type="date" id="goalDate" class="form-input" value="${dateVal}" required>
        </div>
      </div>
      ${!isEdit ? `
      <div class="form-group">
        <label class="form-label">Initial Deposit ($, optional)</label>
        <input type="number" id="goalInitial" class="form-input" placeholder="0" min="0">
      </div>` : ''}
      <div class="modal-footer">
        <button type="button" class="btn btn-ghost" onclick="closeModal('goalModal')">Cancel</button>
        <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Create Goal'}</button>
      </div>
    </form>
  </div>
</div>`;
  document.getElementById('modalContainer').innerHTML = html;
}

function saveGoal(e, editId) {
  e.preventDefault();
  const data = {
    name: document.getElementById('goalName').value.trim(),
    targetAmount: parseFloat(document.getElementById('goalTarget').value),
    targetDate: new Date(document.getElementById('goalDate').value).toISOString()
  };
  if (!editId) {
    const init = parseFloat(document.getElementById('goalInitial').value) || 0;
    data.currentAmount = Math.min(init, data.targetAmount);
    GoalService.add(data);
    showToast('Goal created!', 'success');
  } else {
    GoalService.update(editId, data);
    showToast('Goal updated', 'success');
  }
  closeModal('goalModal');
  refreshGoalsGrid();
}

function openAddMoneyModal(id) {
  const g = GoalService.getAll().find(g=>g.id===id);
  const remaining = g ? g.targetAmount - g.currentAmount : 0;
  const html = `
<div class="modal-overlay" id="addMoneyModal" onclick="if(event.target.id==='addMoneyModal')closeModal('addMoneyModal')">
  <div class="modal" style="max-width:380px;">
    <div class="modal-header">
      <h2 class="modal-title">Add Money</h2>
      <button class="modal-close" onclick="closeModal('addMoneyModal')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <p class="text-sm text-muted mb-4">Adding to: <strong style="color:var(--text-primary)">${g ? g.name : ''}</strong><br>Remaining needed: ${formatCurrency(remaining)}</p>
    <form onsubmit="addMoneyToGoal(event,'${id}')">
      <div class="form-group">
        <label class="form-label">Amount ($)</label>
        <input type="number" id="addMoneyAmt" class="form-input" placeholder="0.00" min="0.01" max="${remaining}" step="0.01" required>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-ghost" onclick="closeModal('addMoneyModal')">Cancel</button>
        <button type="submit" class="btn btn-primary">Add Funds</button>
      </div>
    </form>
  </div>
</div>`;
  document.getElementById('modalContainer').innerHTML = html;
}

function addMoneyToGoal(e, id) {
  e.preventDefault();
  const amt = parseFloat(document.getElementById('addMoneyAmt').value);
  if (isNaN(amt) || amt <= 0) { showToast('Enter a valid amount', 'error'); return; }
  const goal = GoalService.addMoney(id, amt);
  closeModal('addMoneyModal');
  showToast(`${formatCurrency(amt)} added to ${goal.name}!`, 'success');
  refreshGoalsGrid();
}

function confirmDeleteGoal(id) {
  const g = GoalService.getAll().find(g=>g.id===id);
  const html = `
<div class="modal-overlay" id="confirmGoalModal" onclick="if(event.target.id==='confirmGoalModal')closeModal('confirmGoalModal')">
  <div class="modal" style="max-width:380px;">
    <div class="confirm-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div>
    <p class="confirm-message">Delete goal <strong>${g?.name}</strong>? All progress will be lost.</p>
    <div class="modal-footer" style="justify-content:center;">
      <button class="btn btn-ghost" onclick="closeModal('confirmGoalModal')">Cancel</button>
      <button class="btn btn-danger" onclick="deleteGoal('${id}')">Delete</button>
    </div>
  </div>
</div>`;
  document.getElementById('modalContainer').innerHTML = html;
}

function deleteGoal(id) {
  GoalService.delete(id);
  closeModal('confirmGoalModal');
  showToast('Goal deleted', 'info');
  refreshGoalsGrid();
}

function refreshGoalsGrid() {
  const g = document.getElementById('goalsGrid');
  const goals = GoalService.getAll();
  if (g) g.innerHTML = goals.length ? goals.map(g=>goalCardHtml(g)).join('') : `<div class="empty-state"><div class="empty-state-title">No goals yet</div></div>`;
}
