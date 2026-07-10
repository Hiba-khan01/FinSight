/* =============================================
   FinSight – App Router & Shell
   Handles navigation, dark mode, notifications, modals, toasts
   ============================================= */

window._currentPage = 'dashboard';

// ---- Router ----
function navigateTo(page) {
  window.location.hash = page;
}

function handleRoute() {
  const hash = window.location.hash.replace('#', '') || 'dashboard';
  const validPages = ['dashboard', 'transactions', 'wallet', 'goals', 'analytics', 'reports'];
  const page = validPages.includes(hash) ? hash : 'dashboard';
  window._currentPage = page;
  loadPage(page);
  updateNavActive(page);
}

function loadPage(page) {
  const content = document.getElementById('pageContent');
  let html = '';

  switch (page) {
    case 'dashboard':    html = renderDashboard(); break;
    case 'transactions': html = renderTransactions(); break;
    case 'wallet':       html = renderWallet(); break;
    case 'goals':        html = renderGoals(); break;
    case 'analytics':    html = renderAnalytics(); break;
    case 'reports':      html = renderReports(); break;
    default:             html = renderDashboard();
  }

  content.innerHTML = html;
  content.scrollTop = 0;

  // Attach charts after DOM is rendered
  requestAnimationFrame(() => {
    if (page === 'dashboard') {
      renderIncomeChart('incomeChart', '3-months');
      renderBudgetChart('budgetChart', 'this-month');
    } else if (page === 'analytics') {
      renderSpendingTrendChart('spendingTrendChart', 'monthly');
      renderCategoryChart('categoryChart');
      renderIncomeExpenseChart('incomeExpenseChart');
    }
  });

  // Attach global search if on transactions
  if (page !== 'transactions') {
    document.getElementById('globalSearch').value = '';
  }
}

function updateNavActive(page) {
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });
}

// ---- Theme Toggle ----
function initTheme() {
  const saved = localStorage.getItem('finsight_theme') || 'light';
  applyTheme(saved);
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('finsight_theme', theme);
  const btn = document.getElementById('themeToggle');
  const icon = document.getElementById('themeIcon');
  if (!btn || !icon) return;

  if (theme === 'dark') {
    btn.querySelector('span').textContent = 'Dark Mode';
    icon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`;
  } else {
    btn.querySelector('span').textContent = 'Light Mode';
    icon.innerHTML = `<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>`;
  }
}

// ---- Sidebar Toggle ----
function initSidebarToggle() {
  const toggleBtn = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  const main = document.querySelector('.main-wrapper');

  let collapsed = false;
  toggleBtn.addEventListener('click', () => {
    collapsed = !collapsed;
    sidebar.classList.toggle('collapsed', collapsed);
    main.classList.toggle('full', collapsed);
  });
}

// ---- User Profile ----
function initUserProfile() {
  const user = AppData.user;
  const nameEl = document.getElementById('userName');
  const emailEl = document.getElementById('userEmail');
  const avatarEl = document.getElementById('userAvatar');

  if (nameEl) nameEl.textContent = user.name;
  if (emailEl) emailEl.textContent = user.email;
  if (avatarEl) avatarEl.textContent = getInitials(user.name);
}

// ---- Notifications ----
function initNotifications() {
  renderNotifList();
  document.getElementById('notifBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('notifDropdown').classList.toggle('open');
  });
  document.getElementById('clearNotifs').addEventListener('click', () => {
    NotificationService.clearAll();
    renderNotifList();
    document.getElementById('notifBadge').textContent = '0';
    document.getElementById('notifBadge').style.display = 'none';
  });
  document.addEventListener('click', (e) => {
    const dropout = document.getElementById('notifDropdown');
    if (!dropout.contains(e.target) && e.target.id !== 'notifBtn') {
      dropout.classList.remove('open');
    }
  });
}

function renderNotifList() {
  const list = document.getElementById('notifList');
  const notifs = NotificationService.getAll();
  const badge = document.getElementById('notifBadge');

  if (!list) return;
  const unread = notifs.filter(n => !n.read).length;
  if (badge) {
    badge.textContent = unread;
    badge.style.display = unread > 0 ? 'flex' : 'none';
  }

  if (!notifs.length) {
    list.innerHTML = `<div class="empty-state" style="padding:24px;"><div class="empty-state-title">No notifications</div></div>`;
    return;
  }

  list.innerHTML = notifs.map(n => `
<div class="notif-item" onclick="markNotifRead('${n.id}')">
  <div class="notif-dot" style="${n.read?'display:none':''}"></div>
  <div>
    <div class="notif-text">${n.text}</div>
    <div class="notif-time">${n.time}</div>
  </div>
</div>`).join('');
}

function markNotifRead(id) {
  const n = AppData.notifications.find(n => n.id === id);
  if (n) { n.read = true; persist(); renderNotifList(); }
}

// ---- Global Search ----
function initGlobalSearch() {
  document.getElementById('globalSearch').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const q = e.target.value.trim();
      if (q) {
        navigateTo('transactions');
        setTimeout(() => {
          const searchInput = document.getElementById('txnSearch');
          if (searchInput) {
            searchInput.value = q;
            onTxnSearch(q);
          }
        }, 100);
      }
    }
  });
}

// ---- Modal Helpers ----
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

// ---- Toast ----
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const id = 'toast_' + Date.now();
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  const div = document.createElement('div');
  div.className = `toast ${type}`;
  div.id = id;
  div.innerHTML = `<span class="toast-icon">${icons[type]||'ℹ'}</span><span>${message}</span>`;
  container.appendChild(div);
  setTimeout(() => {
    div.classList.add('toast-fade');
    setTimeout(() => div.remove(), 300);
  }, 3000);
}

// ---- Settings Modal ----
function initSettings() {
  document.getElementById('settingsBtn').addEventListener('click', openSettingsModal);
}

function openSettingsModal() {
  const user = AppData.user;
  const html = `
<div class="modal-overlay" id="settingsModal" onclick="if(event.target.id==='settingsModal')closeModal('settingsModal')">
  <div class="modal modal-lg">
    <div class="modal-header">
      <h2 class="modal-title">Settings</h2>
      <button class="modal-close" onclick="closeModal('settingsModal')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <form onsubmit="saveSettings(event)">
      <div class="text-sm" style="font-weight:600;color:var(--text-secondary);margin-bottom:16px;text-transform:uppercase;letter-spacing:0.5px;">Profile</div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Full Name</label>
          <input type="text" id="setName" class="form-input" value="${user.name}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Email</label>
          <input type="email" id="setEmail" class="form-input" value="${user.email}" required>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Currency</label>
          <select id="setCurrency" class="form-select">
            <option value="USD" ${user.currency==='USD'?'selected':''}>USD – US Dollar</option>
            <option value="EUR" ${user.currency==='EUR'?'selected':''}>EUR – Euro</option>
            <option value="GBP" ${user.currency==='GBP'?'selected':''}>GBP – British Pound</option>
            <option value="INR" ${user.currency==='INR'?'selected':''}>INR – Indian Rupee</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Monthly Spending Limit ($)</label>
          <input type="number" id="setLimit" class="form-input" value="${user.monthlySpendingLimit}" min="0" required>
        </div>
      </div>
      <div class="text-sm" style="font-weight:600;color:var(--text-secondary);margin:16px 0 16px;text-transform:uppercase;letter-spacing:0.5px;">Danger Zone</div>
      <button type="button" class="btn btn-danger btn-sm" onclick="confirmResetData()">Reset All Data</button>
      <div class="modal-footer">
        <button type="button" class="btn btn-ghost" onclick="closeModal('settingsModal')">Cancel</button>
        <button type="submit" class="btn btn-primary">Save Settings</button>
      </div>
    </form>
  </div>
</div>`;
  document.getElementById('modalContainer').innerHTML = html;
}

function saveSettings(e) {
  e.preventDefault();
  AppData.user.name = document.getElementById('setName').value.trim();
  AppData.user.email = document.getElementById('setEmail').value.trim();
  AppData.user.currency = document.getElementById('setCurrency').value;
  AppData.user.monthlySpendingLimit = parseFloat(document.getElementById('setLimit').value) || 3500;
  persist();
  initUserProfile();
  closeModal('settingsModal');
  showToast('Settings saved', 'success');
  // Reload page to reflect changes
  loadPage(window._currentPage);
}

function confirmResetData() {
  const html = `
<div class="modal-overlay" id="resetModal" onclick="if(event.target.id==='resetModal')closeModal('resetModal')">
  <div class="modal" style="max-width:380px;">
    <div class="confirm-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
    <p class="confirm-message"><strong>Reset all data?</strong><br>This will permanently delete all transactions, cards, and goals. Seed data will be restored.</p>
    <div class="modal-footer" style="justify-content:center;">
      <button class="btn btn-ghost" onclick="closeModal('resetModal')">Cancel</button>
      <button class="btn btn-danger" onclick="resetAllData()">Reset Everything</button>
    </div>
  </div>
</div>`;
  document.getElementById('modalContainer').innerHTML = html;
}

function resetAllData() {
  localStorage.removeItem(DB_KEY);
  AppData = DB.init();
  closeModal('resetModal');
  closeModal('settingsModal');
  showToast('Data has been reset', 'info');
  loadPage('dashboard');
}

// ---- Init ----
function init() {
  initTheme();
  initUserProfile();
  initNotifications();
  initGlobalSearch();
  initSidebarToggle();
  initSettings();

  // Theme toggle button
  document.getElementById('themeToggle').addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme');
    const next = cur === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    refreshAllCharts();
  });

  // Nav items
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(item.dataset.page);
    });
  });

  // Hash-based routing
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

document.addEventListener('DOMContentLoaded', init);
