/* =============================================
   FinSight – Wallet Page
   ============================================= */

function renderWallet() {
  const cards = CardService.getAll();

  return `
<div class="page-header" style="display:flex;justify-content:space-between;align-items:flex-start;">
  <div>
    <h1 class="page-title">Wallet</h1>
    <p class="page-subtitle">Manage your saved payment cards</p>
  </div>
  <button class="btn btn-primary" onclick="openAddCardModal()">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
    Add Card
  </button>
</div>

<div id="walletCardsList">
  ${renderWalletCards(cards)}
</div>

<div class="card card-padded" style="margin-top:20px;">
  <div class="section-title mb-2">Card Security Notice</div>
  <p class="text-sm text-muted" style="line-height:1.6;">FinSight stores only the last 4 digits of your card number for display purposes. No actual payment information is stored or processed. This wallet is for reference only.</p>
</div>`;
}

function renderWalletCards(cards) {
  if (!cards.length) {
    return `<div class="empty-state" style="padding:48px;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg><div class="empty-state-title">No cards added yet</div><div class="empty-state-text">Add your first card to get started</div></div>`;
  }
  return `<div class="cards-grid">${cards.map(c => walletCardHtml(c)).join('')}</div>`;
}

function walletCardHtml(c) {
  return `
<div style="display:flex;flex-direction:column;gap:10px;">
  <div class="payment-card ${c.cardType}" id="wcard_${c.id}">
    <div class="card-top">
      <span class="card-network">${c.cardType === 'visa' ? 'VISA' : c.cardType === 'mastercard' ? 'MASTERCARD' : c.cardType === 'amex' ? 'AMEX' : c.cardType.toUpperCase()}</span>
      <div class="card-chip"></div>
    </div>
    <div class="card-number">•••• •••• •••• ${c.cardNumber}</div>
    <div class="card-bottom">
      <div>
        <div class="card-holder-label">Card Holder</div>
        <div class="card-holder-name">${c.cardholderName}</div>
      </div>
      <div>
        <div class="card-expiry-label">Expires</div>
        <div class="card-expiry">${c.expiryDate}</div>
      </div>
    </div>
    <svg class="contactless-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>
  </div>
  ${c.nickname ? `<div class="text-sm text-muted" style="text-align:center;font-weight:500;">${c.nickname}</div>` : ''}
  <div style="display:flex;gap:8px;">
    <button class="btn btn-secondary btn-sm w-full" onclick="openEditCardModal('${c.id}')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      Edit
    </button>
    <button class="btn btn-sm w-full" style="background:rgba(239,68,68,0.1);color:var(--danger);border:1px solid rgba(239,68,68,0.2);" onclick="confirmDeleteCard('${c.id}')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
      Delete
    </button>
  </div>
</div>`;
}

function openAddCardModal() { openCardModal({}, null); }
function openEditCardModal(id) {
  const c = CardService.getAll().find(c => c.id === id);
  if (c) openCardModal(c, id);
}

function openCardModal(data, editId) {
  const isEdit = !!editId;
  const html = `
<div class="modal-overlay" id="cardModal" onclick="if(event.target.id==='cardModal')closeModal('cardModal')">
  <div class="modal">
    <div class="modal-header">
      <h2 class="modal-title">${isEdit ? 'Edit Card' : 'Add New Card'}</h2>
      <button class="modal-close" onclick="closeModal('cardModal')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <form onsubmit="saveCard(event,'${editId||''}')">
      <div class="form-group">
        <label class="form-label">Last 4 digits of Card Number</label>
        <input type="text" id="cardNumber" class="form-input" placeholder="1234" maxlength="4" pattern="[0-9]{4}" value="${data.cardNumber||''}" required>
      </div>
      <div class="form-group">
        <label class="form-label">Cardholder Name</label>
        <input type="text" id="cardName" class="form-input" placeholder="John Doe" value="${data.cardholderName||''}" required>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Expiry Date (MM/YY)</label>
          <input type="text" id="cardExpiry" class="form-input" placeholder="MM/YY" maxlength="5" value="${data.expiryDate||''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Card Network</label>
          <select id="cardType" class="form-select">
            <option value="visa" ${(data.cardType||'')==='visa'?'selected':''}>Visa</option>
            <option value="mastercard" ${(data.cardType||'')==='mastercard'?'selected':''}>Mastercard</option>
            <option value="amex" ${(data.cardType||'')==='amex'?'selected':''}>American Express</option>
            <option value="other" ${(data.cardType||'')==='other'?'selected':''}>Other</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Card Nickname (optional)</label>
        <input type="text" id="cardNickname" class="form-input" placeholder="e.g. Personal Visa" value="${data.nickname||''}">
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-ghost" onclick="closeModal('cardModal')">Cancel</button>
        <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Add Card'}</button>
      </div>
    </form>
  </div>
</div>`;
  document.getElementById('modalContainer').innerHTML = html;
}

function saveCard(e, editId) {
  e.preventDefault();
  const num = document.getElementById('cardNumber').value.trim();
  if (!/^\d{4}$/.test(num)) { showToast('Enter exactly 4 digits', 'error'); return; }
  const expiry = document.getElementById('cardExpiry').value.trim();
  if (!/^\d{2}\/\d{2}$/.test(expiry)) { showToast('Use MM/YY format', 'error'); return; }

  const data = {
    cardNumber: num,
    cardholderName: document.getElementById('cardName').value.trim(),
    expiryDate: expiry,
    cardType: document.getElementById('cardType').value,
    nickname: document.getElementById('cardNickname').value.trim() || null
  };

  if (editId) {
    CardService.update(editId, data);
    showToast('Card updated', 'success');
  } else {
    CardService.add(data);
    showToast('Card added', 'success');
  }
  closeModal('cardModal');
  document.getElementById('walletCardsList').innerHTML = renderWalletCards(CardService.getAll());
}

function confirmDeleteCard(id) {
  const c = CardService.getAll().find(c => c.id === id);
  const html = `
<div class="modal-overlay" id="confirmCardModal" onclick="if(event.target.id==='confirmCardModal')closeModal('confirmCardModal')">
  <div class="modal" style="max-width:380px;">
    <div class="confirm-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg></div>
    <p class="confirm-message">Remove card ending in <strong>${c.cardNumber}</strong>?</p>
    <div class="modal-footer" style="justify-content:center;">
      <button class="btn btn-ghost" onclick="closeModal('confirmCardModal')">Cancel</button>
      <button class="btn btn-danger" onclick="deleteCard('${id}')">Remove</button>
    </div>
  </div>
</div>`;
  document.getElementById('modalContainer').innerHTML = html;
}

function deleteCard(id) {
  CardService.delete(id);
  closeModal('confirmCardModal');
  showToast('Card removed', 'info');
  document.getElementById('walletCardsList').innerHTML = renderWalletCards(CardService.getAll());
}
