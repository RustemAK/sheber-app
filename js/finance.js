/**
 * HairStudio PWA - Finance, Expenses & Profit Analytics Controller
 * File: js/finance.js
 * Calculates revenue, expenses, net profit, average checks and top services.
 */

import { state } from './state.js';
import { escapeHtml, formatDateToYMD, formatDisplayDate, isAppointmentCompleted, RU_MONTHS_FULL, showToast } from './utils.js';

export function renderFinance() {
  const period = state.financePeriod;
  const now = new Date();
  const todayStr = formatDateToYMD(now);

  let filteredAppointments = [];
  let filteredExpenses = [];
  let subText = 'Ваш реальный чистый доход за выбранный период';

  if (period === 'today') {
    filteredAppointments = state.appointments.filter(a => a.date === todayStr);
    filteredExpenses = state.expenses.filter(e => e.date === todayStr);
    subText = 'Чистый доход за сегодня';
  } else if (period === 'week') {
    const firstDay = new Date(now);
    const dayIndex = (now.getDay() + 6) % 7;
    firstDay.setDate(now.getDate() - dayIndex);
    const firstDayStr = formatDateToYMD(firstDay);

    filteredAppointments = state.appointments.filter(a => a.date >= firstDayStr && a.date <= todayStr);
    filteredExpenses = state.expenses.filter(e => e.date >= firstDayStr && e.date <= todayStr);
    subText = 'Чистый доход за текущую неделю';
  } else if (period === 'month') {
    const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    filteredAppointments = state.appointments.filter(a => (a.date || '').startsWith(monthPrefix));
    filteredExpenses = state.expenses.filter(e => (e.date || '').startsWith(monthPrefix));
    subText = `Чистый доход за ${RU_MONTHS_FULL[now.getMonth()]} ${now.getFullYear()}`;
  } else if (period === 'prev_month') {
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthPrefix = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
    filteredAppointments = state.appointments.filter(a => (a.date || '').startsWith(prevMonthPrefix));
    filteredExpenses = state.expenses.filter(e => (e.date || '').startsWith(prevMonthPrefix));
    subText = `Чистый доход за ${RU_MONTHS_FULL[prevDate.getMonth()]} ${prevDate.getFullYear()}`;
  } else {
    filteredAppointments = state.appointments;
    filteredExpenses = state.expenses;
    subText = 'Чистый доход за всё время';
  }

  const completedApps = filteredAppointments.filter(isAppointmentCompleted);
  const revenue = completedApps.reduce((sum, a) => sum + (Number(a.totalPrice) || 0), 0);
  const expensesTotal = filteredExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const netProfit = revenue - expensesTotal;
  const avgCheck = completedApps.length > 0 ? Math.round(revenue / completedApps.length) : 0;
  const margin = revenue > 0 ? Math.round((netProfit / revenue) * 100) : 0;

  const profitElem = document.getElementById('statNetProfit');
  if (profitElem) {
    profitElem.innerText = `${netProfit.toLocaleString('ru-RU')} ₸`;
    profitElem.className = `stat-card-value ${netProfit >= 0 ? 'profit' : 'expense'}`;
  }

  const subElem = document.getElementById('statNetProfitSub');
  if (subElem) subElem.innerText = subText;

  const setTxt = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
  };

  setTxt('statTotalRevenue', `${revenue.toLocaleString('ru-RU')} ₸`);
  setTxt('statAppointmentsCount', `${completedApps.length} вып. записей`);
  setTxt('statTotalExpenses', `${expensesTotal.toLocaleString('ru-RU')} ₸`);
  setTxt('statExpensesCount', `${filteredExpenses.length} закупок`);
  setTxt('statAvgCheck', `${avgCheck.toLocaleString('ru-RU')} ₸`);
  setTxt('statMargin', `${margin}%`);

  // Top Services Breakdown
  const topServicesBox = document.getElementById('topServicesContainer');
  if (!topServicesBox) return;
  topServicesBox.innerHTML = '';

  const serviceStats = {};
  completedApps.forEach(a => {
    (a.services || []).forEach(s => {
      if (!serviceStats[s.name]) {
        serviceStats[s.name] = { count: 0, revenue: 0 };
      }
      serviceStats[s.name].count += 1;
      serviceStats[s.name].revenue += Number(s.price) || 0;
    });
  });

  const sortedServices = Object.entries(serviceStats)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 5);

  if (sortedServices.length === 0) {
    topServicesBox.innerHTML = '<div style="font-size: 12px; color: var(--text-muted);">Нет данных за выбранный период</div>';
  } else {
    sortedServices.forEach(([name, data]) => {
      const row = document.createElement('div');
      row.style.cssText = 'display: flex; justify-content: space-between; align-items: center; font-size: 13px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;';
      row.innerHTML = `
        <div>
          <div style="font-weight: 600; color: var(--text-main);">${escapeHtml(name)}</div>
          <div style="font-size: 11px; color: var(--text-muted);">${data.count} раз(а)</div>
        </div>
        <div style="font-weight: 700; color: var(--accent-gold-light);">${data.revenue.toLocaleString('ru-RU')} ₸</div>
      `;
      topServicesBox.appendChild(row);
    });
  }
}

let expensesCurrentPage = 1;
const EXPENSES_PER_PAGE = 30;

export function renderExpenses(resetPagination = true) {
  const container = document.getElementById('expensesList');
  if (!container) return;
  
  if (resetPagination) {
    expensesCurrentPage = 1;
  }
  container.innerHTML = '';

  const now = new Date();
  const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthExpenses = state.expenses.filter(e => (e.date || '').startsWith(currentMonthPrefix));
  const monthTotal = monthExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const monthTotalEl = document.getElementById('expensesMonthTotal');
  if (monthTotalEl) {
    monthTotalEl.innerText = `${monthTotal.toLocaleString('ru-RU')} ₸`;
  }

  let list = state.expenses;
  if (state.expenseCategory !== 'all') {
    list = list.filter(e => e.category === state.expenseCategory);
  }

  list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📦</div>
        <div style="margin-bottom: 12px;">В этой категории расходов нет</div>
        <button type="button" class="btn-primary" style="width: auto; padding: 10px 22px; font-size: 13px; display: inline-flex; align-items: center; gap: 6px;" onclick="window.openExpenseModal()">
          <span>➕</span> <span>Внести расход</span>
        </button>
      </div>
    `;
    return;
  }

  if (!container._hasItemClickListener) {
    container._hasItemClickListener = true;
    container.addEventListener('click', (e) => {
      const editBtn = e.target.closest('.btn-edit-exp');
      const card = e.target.closest('.data-item-card');
      if (editBtn || card) {
        const id = editBtn ? editBtn.dataset.id : card.querySelector('.btn-edit-exp')?.dataset.id;
        if (id) {
          const exp = state.expenses.find(item => String(item.id) === String(id));
          if (exp) openExpenseModal(exp);
        }
      }
    });
  }

  const totalCount = list.length;
  const visibleList = list.slice(0, expensesCurrentPage * EXPENSES_PER_PAGE);

  const fragment = document.createDocumentFragment();
  visibleList.forEach(exp => {
    const card = document.createElement('div');
    card.className = 'data-item-card';
    card.style.cursor = 'pointer';
    card.innerHTML = `
      <div class="item-left">
        <div class="item-title">${escapeHtml(exp.title)}</div>
        <div class="item-meta">
          <span>📅 ${formatDisplayDate(exp.date)}</span>
          <span>📁 ${escapeHtml(exp.category)}</span>
          ${exp.quantity ? `<span>🔢 ${escapeHtml(exp.quantity)}</span>` : ''}
        </div>
        ${exp.notes ? `<div style="font-size: 11px; color: var(--text-subtle); margin-top: 2px;">${escapeHtml(exp.notes)}</div>` : ''}
      </div>
      <div class="item-right">
        <div class="item-price expense">-${(Number(exp.amount) || 0).toLocaleString('ru-RU')} ₸</div>
        <button class="btn-action-small btn-edit-exp" data-id="${exp.id}" title="Редактировать">✏️</button>
      </div>
    `;
    fragment.appendChild(card);
  });
  container.appendChild(fragment);

  // Pagination button
  if (visibleList.length < totalCount) {
    const loadMoreBtn = document.createElement('button');
    loadMoreBtn.className = 'btn-secondary';
    loadMoreBtn.style.cssText = 'width: 100%; margin: 12px 0 24px; padding: 12px; font-size: 13px; font-weight: 600;';
    loadMoreBtn.innerText = `Показать ещё (${totalCount - visibleList.length})`;
    loadMoreBtn.onclick = () => {
      expensesCurrentPage++;
      renderExpenses(false);
    };
    container.appendChild(loadMoreBtn);
  }
}

export function openExpenseModal(exp = null) {
  state.editingExpenseId = exp ? exp.id : null;
  const titleEl = document.getElementById('modalExpenseTitle');
  const deleteBtn = document.getElementById('btnDeleteExpense');
  if (titleEl) titleEl.innerText = exp ? 'Редактировать расход' : 'Новая закупка';
  if (deleteBtn) deleteBtn.style.display = exp ? 'block' : 'none';

  if (exp) {
    document.getElementById('expenseId').value = exp.id;
    document.getElementById('expenseTitle').value = exp.title;
    document.getElementById('expenseCategory').value = exp.category;
    document.getElementById('expenseAmount').value = exp.amount;
    document.getElementById('expenseQuantity').value = exp.quantity || '';
    document.getElementById('expenseDate').value = exp.date;
    document.getElementById('expenseNotes').value = exp.notes || '';
  } else {
    document.getElementById('expenseId').value = '';
    document.getElementById('expenseTitle').value = '';
    document.getElementById('expenseCategory').value = 'Красители';
    document.getElementById('expenseAmount').value = '';
    document.getElementById('expenseQuantity').value = '';
    document.getElementById('expenseDate').value = formatDateToYMD(new Date());
    document.getElementById('expenseNotes').value = '';
  }

  if (window.openModal) window.openModal('modalExpense');
}

export async function handleExpenseSubmit(e, onDataChanged) {
  e.preventDefault();
  const expData = {
    title: document.getElementById('expenseTitle').value.trim(),
    category: document.getElementById('expenseCategory').value,
    amount: Number(document.getElementById('expenseAmount').value) || 0,
    quantity: document.getElementById('expenseQuantity').value.trim(),
    date: document.getElementById('expenseDate').value,
    notes: document.getElementById('expenseNotes').value.trim()
  };

  if (!expData.title) {
    showToast('Введите название расхода', 'error');
    return;
  }

  if (state.editingExpenseId) {
    expData.id = Number(state.editingExpenseId);
    await window.db.updateExpense(expData);
    showToast('Расход обновлен');
  } else {
    await window.db.addExpense(expData);
    showToast('Закупка материалов сохранена');
  }

  if (window.closeModal) window.closeModal('modalExpense');
  if (typeof onDataChanged === 'function') await onDataChanged();

  if (window.HairSupabase && window.HairSupabase.syncMasterExpenses) {
    const masterId = state.currentMaster ? state.currentMaster.id : null;
    if (masterId) window.HairSupabase.syncMasterExpenses(masterId, state.expenses).catch(console.warn);
  }
}

export async function handleExpenseDelete(onDataChanged) {
  if (!state.editingExpenseId) return;
  if (confirm('Удалить эту запись о расходе?')) {
    await window.db.deleteExpense(state.editingExpenseId);
    if (window.closeModal) window.closeModal('modalExpense');
    showToast('Расход удален');
    if (typeof onDataChanged === 'function') await onDataChanged();

    if (window.HairSupabase && window.HairSupabase.syncMasterExpenses) {
      const masterId = state.currentMaster ? state.currentMaster.id : null;
      if (masterId) window.HairSupabase.syncMasterExpenses(masterId, state.expenses).catch(console.warn);
    }
  }
}

// ==========================================
// MODULE 4: WAREHOUSE MATERIALS INVENTORY
// ==========================================

let activeInventoryCategory = 'all';
let activeMaterialsSubTab = 'expenses';
let editingInventoryId = null;

export function setupMaterialsSubTabs() {
  const btnExpenses = document.getElementById('btnSubTabExpenses');
  const btnInventory = document.getElementById('btnSubTabInventory');
  const sectionExpenses = document.getElementById('materialsExpensesSection');
  const sectionInventory = document.getElementById('materialsInventorySection');

  if (btnExpenses && !btnExpenses._hasTabListener) {
    btnExpenses._hasTabListener = true;
    btnExpenses.addEventListener('click', () => {
      activeMaterialsSubTab = 'expenses';
      btnExpenses.classList.add('active');
      if (btnInventory) btnInventory.classList.remove('active');
      if (sectionExpenses) sectionExpenses.style.display = 'block';
      if (sectionInventory) sectionInventory.style.display = 'none';
      renderExpenses();
    });

    if (btnInventory) {
      btnInventory.addEventListener('click', () => {
        activeMaterialsSubTab = 'inventory';
        btnInventory.classList.add('active');
        btnExpenses.classList.remove('active');
        if (sectionExpenses) sectionExpenses.style.display = 'none';
        if (sectionInventory) sectionInventory.style.display = 'block';
        renderInventory();
      });
    }
  }

  // Inventory category filter chips
  const invFilter = document.getElementById('inventoryCategoryFilter');
  if (invFilter && !invFilter._hasCatListener) {
    invFilter._hasCatListener = true;
    invFilter.addEventListener('click', (e) => {
      const btn = e.target.closest('.chip-btn');
      if (!btn) return;
      invFilter.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeInventoryCategory = btn.dataset.category || 'all';
      renderInventory();
    });
  }

  const btnAddInv = document.getElementById('btnOpenAddInventory');
  if (btnAddInv && !btnAddInv._hasAddListener) {
    btnAddInv._hasAddListener = true;
    btnAddInv.addEventListener('click', () => openInventoryModal(null));
  }

  // Tax report export button (Module 6)
  const btnTax = document.getElementById('btnExportTaxReport');
  if (btnTax && !btnTax._hasTaxListener) {
    btnTax._hasTaxListener = true;
    btnTax.addEventListener('click', exportTaxReportCSV);
  }
}

export function renderInventory() {
  const container = document.getElementById('inventoryList');
  if (!container) return;
  container.innerHTML = '';

  const list = state.inventory || [];
  const lowStockCount = list.filter(item => {
    const stock = Number(item.current_stock) || 0;
    const threshold = Number(item.min_threshold) || 0;
    return threshold > 0 && stock <= threshold;
  }).length;

  const totalEl = document.getElementById('inventoryStatsTotal');
  if (totalEl) totalEl.innerText = `${list.length} позиций`;

  const warnEl = document.getElementById('inventoryStatsWarning');
  if (warnEl) {
    if (lowStockCount > 0) {
      warnEl.innerHTML = `<span style="color: #f87171; font-weight: 700;">🔴 Заканчивается: ${lowStockCount} поз.</span>`;
    } else {
      warnEl.innerText = 'Все запасы в норме ✓';
    }
  }

  let filtered = list;
  if (activeInventoryCategory !== 'all') {
    filtered = filtered.filter(item => item.category === activeInventoryCategory);
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📦</div>
        <div style="margin-bottom: 12px;">На складе пока нет материалов в этой категории</div>
        <button type="button" class="btn-primary" style="width: auto; padding: 10px 22px; font-size: 13px; display: inline-flex; align-items: center; gap: 6px;" onclick="window.openInventoryModal()">
          <span>➕</span> <span>Добавить материал</span>
        </button>
      </div>
    `;
    return;
  }

  // Sort: low stock first, then alphabetically
  filtered.sort((a, b) => {
    const aLow = (Number(a.min_threshold) > 0 && Number(a.current_stock) <= Number(a.min_threshold)) ? 1 : 0;
    const bLow = (Number(b.min_threshold) > 0 && Number(b.current_stock) <= Number(b.min_threshold)) ? 1 : 0;
    if (bLow !== aLow) return bLow - aLow;
    return (a.name || '').localeCompare(b.name || '', 'ru');
  });

  const fragment = document.createDocumentFragment();
  filtered.forEach(item => {
    const stock = Number(item.current_stock) || 0;
    const threshold = Number(item.min_threshold) || 0;
    const isLow = (threshold > 0 && stock <= threshold);
    const unit = item.unit || 'г';

    const card = document.createElement('div');
    card.className = `inventory-item-card${isLow ? ' is-low-stock' : ''}`;
    card.dataset.id = item.id;

    card.innerHTML = `
      <div class="inventory-info">
        <div class="inventory-name" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</div>
        <div class="inventory-meta">
          <span>📁 ${escapeHtml(item.category || 'Материалы')}</span>
          <span class="inventory-stock-badge ${isLow ? 'low' : ''}">
            ${isLow ? '🔴' : '📦'} ${stock} ${unit}
            ${threshold > 0 ? ` (мин: ${threshold} ${unit})` : ''}
          </span>
          ${isLow ? '<span style="color: #f87171; font-weight: 700; font-size: 11px;">Заканчивается!</span>' : ''}
        </div>
      </div>
      <div class="inventory-actions">
        <button type="button" class="inventory-quick-btn btn-stock-minus" data-id="${item.id}" title="Списать">-</button>
        <button type="button" class="inventory-quick-btn btn-stock-plus" data-id="${item.id}" title="Добавить">+</button>
        <button type="button" class="btn-action-small btn-edit-inventory" data-id="${item.id}" title="Редактировать">✏️</button>
      </div>
    `;

    fragment.appendChild(card);
  });

  container.appendChild(fragment);

  // Wire buttons
  container.querySelectorAll('.btn-stock-minus').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const item = state.inventory.find(i => String(i.id) === String(id));
      const step = (item && (item.unit === 'шт' || item.unit === 'уп' || item.unit === 'рул')) ? 1 : 10;
      handleQuickStockAdjust(id, -step);
    };
  });

  container.querySelectorAll('.btn-stock-plus').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const item = state.inventory.find(i => String(i.id) === String(id));
      const step = (item && (item.unit === 'шт' || item.unit === 'уп' || item.unit === 'рул')) ? 1 : 10;
      handleQuickStockAdjust(id, step);
    };
  });

  container.querySelectorAll('.btn-edit-inventory').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const item = state.inventory.find(i => String(i.id) === String(id));
      if (item) openInventoryModal(item);
    };
  });

  container.querySelectorAll('.inventory-item-card').forEach(card => {
    card.onclick = (e) => {
      if (e.target.closest('button')) return;
      const id = card.dataset.id;
      const item = state.inventory.find(i => String(i.id) === String(id));
      if (item) openInventoryModal(item);
    };
  });
}

export function openInventoryModal(item = null) {
  editingInventoryId = item ? item.id : null;
  const title = document.getElementById('modalInventoryTitle');
  const btnDelete = document.getElementById('btnDeleteInventoryItem');
  if (title) title.innerText = item ? 'Редактировать материал' : 'Новый материал на склад';
  if (btnDelete) btnDelete.style.display = item ? 'block' : 'none';

  document.getElementById('inventoryId').value = item ? item.id : '';
  document.getElementById('inventoryName').value = item ? item.name : '';
  document.getElementById('inventoryCategory').value = item ? (item.category || 'Красители') : 'Красители';
  document.getElementById('inventoryStock').value = item ? item.current_stock : '';
  document.getElementById('inventoryUnit').value = item ? (item.unit || 'г') : 'г';
  document.getElementById('inventoryMinThreshold').value = (item && item.min_threshold) ? item.min_threshold : '';

  if (window.openModal) window.openModal('modalInventoryItem');
}

export async function handleInventorySubmit(e, onDataChanged) {
  e.preventDefault();
  const name = document.getElementById('inventoryName').value.trim();
  const category = document.getElementById('inventoryCategory').value;
  const current_stock = Number(document.getElementById('inventoryStock').value) || 0;
  const unit = document.getElementById('inventoryUnit').value;
  const min_threshold = Number(document.getElementById('inventoryMinThreshold').value) || 0;

  if (!name) {
    showToast('Введите наименование материала', 'error');
    return;
  }

  const itemData = {
    name,
    category,
    current_stock,
    unit,
    min_threshold,
    updated_at: new Date().toISOString()
  };

  if (editingInventoryId) {
    itemData.id = Number(editingInventoryId);
    await window.db.updateInventoryItem(itemData);
    showToast('Материал обновлен на складе');
  } else {
    await window.db.addInventoryItem(itemData);
    showToast('Материал добавлен на склад');
  }

  if (window.closeModal) window.closeModal('modalInventoryItem');
  if (typeof onDataChanged === 'function') await onDataChanged();
  renderInventory();
}

export async function handleInventoryDelete(onDataChanged) {
  if (!editingInventoryId) return;
  if (confirm('Удалить этот материал со склада?')) {
    await window.db.deleteInventoryItem(editingInventoryId);
    if (window.closeModal) window.closeModal('modalInventoryItem');
    showToast('Материал удален со склада');
    if (typeof onDataChanged === 'function') await onDataChanged();
    renderInventory();
  }
}

export async function handleQuickStockAdjust(id, delta, onDataChanged) {
  const item = state.inventory.find(i => String(i.id) === String(id));
  if (!item) return;

  const newStock = Math.max(0, (Number(item.current_stock) || 0) + Number(delta));
  item.current_stock = newStock;
  item.updated_at = new Date().toISOString();

  await window.db.updateInventoryItem(item);
  showToast(`${item.name}: ${newStock} ${item.unit || 'г'}`);
  renderInventory();
  if (typeof onDataChanged === 'function') await onDataChanged();
}

// ==========================================
// MODULE 6: TAX REPORT EXPORT (e-Salyq / Form 910)
// ==========================================

export function exportTaxReportCSV() {
  const completedApps = (state.appointments || []).filter(isAppointmentCompleted);
  const expenses = state.expenses || [];

  if (completedApps.length === 0 && expenses.length === 0) {
    showToast('Нет данных для формирования налогового отчета', 'warning');
    return;
  }

  const records = [];

  completedApps.forEach(a => {
    const rev = Number(a.totalPrice) || 0;
    const servNames = (a.services || []).map(s => s.name).join(', ') || 'Услуги бьюти-мастера';
    records.push({
      date: a.date || '',
      type: 'Доход от оказания услуг',
      counterparty: `${a.clientName || 'Клиент'} (${servNames})`,
      paymentMethod: a.channel === 'whatsapp' ? 'Kaspi QR / Перевод' : 'Наличные / Терминал',
      income: rev,
      expense: 0,
      netBase: rev
    });
  });

  expenses.forEach(e => {
    const exp = Number(e.amount) || 0;
    records.push({
      date: e.date || '',
      type: 'Расход на материалы и аренду',
      counterparty: `${e.title || 'Закупка'} (${e.category || 'Материалы'})`,
      paymentMethod: 'Безналичный расчет / QR',
      income: 0,
      expense: exp,
      netBase: -exp
    });
  });

  records.sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  let totalIncome = 0;
  let totalExpense = 0;
  let totalNet = 0;

  const header = [
    'Дата операции',
    'Тип операции',
    'Клиент / Наименование закупки',
    'Способ оплаты',
    'Доход (₸)',
    'Расход на материалы (₸)',
    'Чистая база (₸)'
  ];

  const escapeCSV = (val) => {
    const s = String(val == null ? '' : val).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = [header.map(escapeCSV).join(';')];

  records.forEach(r => {
    totalIncome += r.income;
    totalExpense += r.expense;
    totalNet += r.netBase;

    rows.push([
      escapeCSV(r.date),
      escapeCSV(r.type),
      escapeCSV(r.counterparty),
      escapeCSV(r.paymentMethod),
      escapeCSV(r.income),
      escapeCSV(r.expense),
      escapeCSV(r.netBase)
    ].join(';'));
  });

  rows.push('');
  rows.push([
    escapeCSV('ИТОГО:'),
    escapeCSV(`Всего записей: ${records.length}`),
    escapeCSV(''),
    escapeCSV('ИТОГОВЫЙ БАЛАНС'),
    escapeCSV(totalIncome),
    escapeCSV(totalExpense),
    escapeCSV(totalNet)
  ].join(';'));

  // UTF-8 BOM (\uFEFF)
  const csvContent = '\uFEFF' + rows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const now = new Date();
  const dateStr = `${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, '0')}_${String(now.getDate()).padStart(2, '0')}`;
  a.download = `sheber_tax_report_910_${dateStr}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast('Налоговый отчет (Excel/CSV) успешно сформирован!');
}

// Window globals for inline calls
if (typeof window !== 'undefined') {
  window.openInventoryModal = openInventoryModal;
  window.exportTaxReportCSV = exportTaxReportCSV;
}
