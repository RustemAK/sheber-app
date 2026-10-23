/**
 * HairStudio PWA - Clients CRM & Notes Controller
 * File: js/clients.js
 * Manages client database, appointment history, formula notes, deduplication and quick contacts.
 */

import { state } from './state.js';
import { escapeHtml, cleanPhoneForWhatsapp, cleanPhoneForTel, formatDisplayDate, isAppointmentCompleted, showToast } from './utils.js';

let clientsCurrentPage = 1;
const CLIENTS_PER_PAGE = 30;

export function renderClients(searchQuery = '', resetPagination = true) {
  const container = document.getElementById('clientsList');
  if (!container) return;

  if (resetPagination) {
    clientsCurrentPage = 1;
    container.innerHTML = '';
  }

  let list = state.clients;
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    list = list.filter(c => 
      (c.name || '').toLowerCase().includes(q) ||
      (c.phone || '').includes(q)
    );
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">👥</div>
        <div>Клиенты не найдены</div>
      </div>
    `;
    return;
  }

  // Pre-index appointments by phone and name in a single pass O(N)
  const appsByPhone = new Map();
  const appsByName = new Map();
  for (let i = 0; i < state.appointments.length; i++) {
    const a = state.appointments[i];
    if (a.clientPhone) {
      let arr = appsByPhone.get(a.clientPhone);
      if (!arr) { arr = []; appsByPhone.set(a.clientPhone, arr); }
      arr.push(a);
    }
    if (a.clientName) {
      const nameKey = a.clientName.trim().toLowerCase();
      let arr = appsByName.get(nameKey);
      if (!arr) { arr = []; appsByName.set(nameKey, arr); }
      arr.push(a);
    }
  }

  if (!container._hasClientClickListener) {
    container._hasClientClickListener = true;
    container.addEventListener('click', (e) => {
      if (e.target.closest('a')) return;
      const viewBtn = e.target.closest('.btn-view-client');
      const card = e.target.closest('.data-item-card');
      if (viewBtn || card) {
        const clientId = viewBtn ? viewBtn.dataset.clientId : card.querySelector('.btn-view-client')?.dataset.clientId;
        if (clientId) {
          const client = state.clients.find(c => String(c.id) === String(clientId));
          if (client) {
            const clientApps = state.appointments.filter(a =>
              (a.clientPhone && client.phone && a.clientPhone === client.phone) ||
              (a.clientName && client.name && a.clientName.toLowerCase() === client.name.toLowerCase())
            );
            openClientDetailsModal(client, clientApps, (app) => {
              if (window.closeModal) window.closeModal('modalClientDetails');
              if (window.app && window.app.openAppointmentModal) window.app.openAppointmentModal(app);
            });
          }
        }
      }
    });
  }

  // Pagination slice (prevents DOM explosion on mobile)
  const totalCount = list.length;
  const visibleList = list.slice(0, clientsCurrentPage * CLIENTS_PER_PAGE);

  const fragment = document.createDocumentFragment();

  visibleList.forEach(c => {
    // Instant O(1) lookup
    const phoneApps = c.phone ? appsByPhone.get(c.phone) : null;
    const nameApps = c.name ? appsByName.get(c.name.trim().toLowerCase()) : null;

    let clientApps = [];
    if (phoneApps && nameApps && phoneApps !== nameApps) {
      const set = new Set(phoneApps.map(a => a.id));
      clientApps = [...phoneApps];
      nameApps.forEach(a => { if (!set.has(a.id)) clientApps.push(a); });
    } else {
      clientApps = phoneApps || nameApps || [];
    }

    const totalSpent = clientApps
      .filter(isAppointmentCompleted)
      .reduce((sum, a) => sum + (Number(a.totalPrice) || 0), 0);

    const phoneClean = cleanPhoneForWhatsapp(c.phone);
    const waLink = phoneClean ? `https://wa.me/${phoneClean}` : null;
    const telLink = phoneClean ? `tel:${cleanPhoneForTel(c.phone)}` : null;

    const card = document.createElement('div');
    card.className = 'data-item-card';
    card.style.cursor = 'pointer';
    card.innerHTML = `
      <div class="item-left">
        <div class="item-title">${escapeHtml(c.name)}</div>
        <div class="item-meta">
          <span>📞 ${escapeHtml(c.phone || 'без телефона')}</span>
          <span>📅 ${clientApps.length} визит(ов)</span>
          <span>💰 ${totalSpent.toLocaleString('ru-RU')} ₸</span>
        </div>
        ${c.notes ? `<div style="font-size: 11px; color: var(--accent-gold-light); margin-top: 2px;">🎨 ${escapeHtml(c.notes)}</div>` : ''}
      </div>
      <div class="item-right">
        <div class="quick-actions">
          ${waLink ? `<a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn-action-small whatsapp" title="WhatsApp">💬</a>` : ''}
          ${telLink ? `<a href="${telLink}" class="btn-action-small call" title="Позвонить">📞</a>` : ''}
          <button class="btn-action-small btn-view-client" data-client-id="${c.id}" title="Карточка клиента">📋</button>
        </div>
      </div>
    `;

    fragment.appendChild(card);
  });

  container.innerHTML = '';
  container.appendChild(fragment);

  // Load more button for pagination
  if (visibleList.length < totalCount) {
    const loadMoreBtn = document.createElement('button');
    loadMoreBtn.className = 'btn-secondary';
    loadMoreBtn.style.cssText = 'width: 100%; margin: 12px 0 24px; padding: 12px; font-size: 13px; font-weight: 600;';
    loadMoreBtn.innerText = `Показать ещё (${totalCount - visibleList.length})`;
    loadMoreBtn.onclick = () => {
      clientsCurrentPage++;
      renderClients(searchQuery, false);
    };
    container.appendChild(loadMoreBtn);
  }
}

export function openClientDetailsModal(client, clientApps, onOpenAppointment) {
  state.viewingClientId = client.id;
  const nameEl = document.getElementById('clientDetailsName');
  const phoneEl = document.getElementById('clientDetailsPhone');
  const visitsEl = document.getElementById('clientDetailsVisitsCount');
  const notesEl = document.getElementById('clientDetailsNotes');

  if (nameEl) nameEl.innerText = client.name;
  if (phoneEl) phoneEl.innerText = client.phone || 'Телефон не указан';
  if (visitsEl) {
    const total = clientApps.filter(isAppointmentCompleted).reduce((sum, a) => sum + (Number(a.totalPrice) || 0), 0);
    visitsEl.innerText = `${clientApps.length} визит(ов) • Всего: ${total.toLocaleString('ru-RU')} ₸`;
  }
  if (notesEl) notesEl.value = client.notes || '';

  // Actions
  const phoneClean = cleanPhoneForWhatsapp(client.phone);
  const actionsBox = document.getElementById('clientDetailsActions');
  if (actionsBox) {
    actionsBox.innerHTML = `
      ${phoneClean ? `<a href="https://wa.me/${phoneClean}" target="_blank" rel="noopener noreferrer" class="btn-action-small whatsapp">💬</a>` : ''}
      ${phoneClean ? `<a href="tel:${cleanPhoneForTel(client.phone)}" class="btn-action-small call">📞</a>` : ''}
    `;
  }

  // Merge button setup
  const btnMerge = document.getElementById('btnMergeClient');
  if (btnMerge) {
    btnMerge.onclick = () => handleMergePrompt(client);
  }

  // History list
  const histBox = document.getElementById('clientVisitHistory');
  if (histBox) {
    histBox.innerHTML = '';
    if (clientApps.length === 0) {
      histBox.innerHTML = '<div style="font-size: 12px; color: var(--text-muted);">Записей пока нет</div>';
    } else {
      clientApps.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      clientApps.forEach(a => {
        const item = document.createElement('div');
        item.style.cssText = 'background: var(--bg-card); padding: 8px 12px; border-radius: var(--radius-md); border: 1px solid var(--border-color); font-size: 13px; cursor: pointer; transition: transform 0.15s, border-color 0.15s;';
        item.title = 'Нажмите для редактирования записи';
        item.innerHTML = `
          <div style="display: flex; justify-content: space-between; font-weight: 600;">
            <span>${formatDisplayDate(a.date)} ${a.startTime}</span>
            <span style="color: var(--accent-gold-light);">${(Number(a.totalPrice) || 0).toLocaleString('ru-RU')} ₸</span>
          </div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
            ${(a.services || []).map(s => escapeHtml(s.name)).join(', ')}
          </div>
          ${a.materialsUsed ? `<div style="font-size: 11px; color: var(--accent-gold); margin-top: 2px;">Расход: ${escapeHtml(a.materialsUsed)}</div>` : ''}
        `;
        item.addEventListener('click', () => {
          if (window.closeModal) window.closeModal('modalClientDetails');
          if (typeof onOpenAppointment === 'function') onOpenAppointment(a);
        });
        histBox.appendChild(item);
      });
    }
  }

  if (window.openModal) window.openModal('modalClientDetails');
}

export async function handleSaveClientNotes(onDataChanged) {
  if (!state.viewingClientId) return;
  const client = state.clients.find(c => c.id === state.viewingClientId);
  if (!client) return;

  const notesInput = document.getElementById('clientDetailsNotes');
  client.notes = notesInput ? notesInput.value.trim() : '';
  await window.db.updateClient(client);

  if (window.HairSupabase && window.HairSupabase.syncMasterClients) {
    const masterId = state.currentMaster ? state.currentMaster.id : null;
    if (masterId) window.HairSupabase.syncMasterClients(masterId, state.clients).catch(console.warn);
  }

  showToast('Формулы и заметки сохранены');
  if (typeof onDataChanged === 'function') await onDataChanged();
}

export async function handleDeleteClient(onDataChanged) {
  if (!state.viewingClientId) return;
  const client = state.clients.find(c => c.id === state.viewingClientId);
  if (!client) return;

  if (confirm(`Удалить клиента "${client.name}" из базы?\n\nЗаписи клиента в расписании сохранятся.`)) {
    await window.db.deleteClient(state.viewingClientId);
    if (window.closeModal) window.closeModal('modalClientDetails');

    if (window.HairSupabase && window.HairSupabase.syncMasterClients) {
      const masterId = state.currentMaster ? state.currentMaster.id : null;
      if (masterId) window.HairSupabase.syncMasterClients(masterId, state.clients).catch(console.warn);
    }

    showToast('Клиент удалён из базы');
    if (typeof onDataChanged === 'function') await onDataChanged();
  }
}

/**
 * Client Deduplication: Merge duplicate client records into primary
 */
export async function mergeClients(primaryClientId, duplicateClientId) {
  const primary = state.clients.find(c => String(c.id) === String(primaryClientId));
  const duplicate = state.clients.find(c => String(c.id) === String(duplicateClientId));
  if (!primary || !duplicate || String(primary.id) === String(duplicate.id)) return false;

  // 1. Reassign appointments of duplicate to primary
  const dupNameLower = (duplicate.name || '').trim().toLowerCase();
  for (const app of state.appointments) {
    let changed = false;
    if (duplicate.phone && app.clientPhone === duplicate.phone) {
      app.clientPhone = primary.phone || app.clientPhone;
      app.clientName = primary.name;
      changed = true;
    } else if (app.clientName && app.clientName.trim().toLowerCase() === dupNameLower) {
      app.clientName = primary.name;
      if (primary.phone && !app.clientPhone) app.clientPhone = primary.phone;
      changed = true;
    }
    if (changed) {
      await window.db.updateAppointment(app);
    }
  }

  // 2. Append notes
  if (duplicate.notes && duplicate.notes.trim()) {
    primary.notes = (primary.notes ? primary.notes + '\n' : '') + `[Объединено с «${duplicate.name}»]: ${duplicate.notes}`;
    await window.db.updateClient(primary);
  }

  // 3. Delete duplicate
  await window.db.deleteClient(duplicate.id);

  if (window.HairSupabase && window.HairSupabase.syncMasterClients) {
    const masterId = state.currentMaster ? state.currentMaster.id : null;
    if (masterId) {
      window.HairSupabase.syncMasterClients(masterId, state.clients).catch(console.warn);
      window.HairSupabase.syncMasterAppointments(masterId, state.appointments).catch(console.warn);
    }
  }

  showToast(`Клиент «${duplicate.name}» объединен с «${primary.name}»!`);
  if (window.closeModal) window.closeModal('modalClientDetails');
  if (window.app && window.app.reloadData) await window.app.reloadData();
  return true;
}

function handleMergePrompt(currentClient) {
  const query = prompt(`Введите имя или телефон дубликата для объединения с «${currentClient.name}»:`);
  if (!query || !query.trim()) return;

  const q = query.trim().toLowerCase();
  const matches = state.clients.filter(c => 
    String(c.id) !== String(currentClient.id) &&
    ((c.name || '').toLowerCase().includes(q) || (c.phone || '').includes(q))
  );

  if (matches.length === 0) {
    alert('Похожих клиентов не найдено.');
    return;
  }

  let promptText = `Найдено совпадений: ${matches.length}.\nВведите номер строки нужного дубликата для объединения в «${currentClient.name}»:\n\n`;
  matches.forEach((m, idx) => {
    promptText += `${idx + 1}. ${m.name} (${m.phone || 'без телефона'})\n`;
  });

  const chosenIndexStr = prompt(promptText, '1');
  if (!chosenIndexStr) return;

  const chosenIndex = parseInt(chosenIndexStr, 10) - 1;
  if (chosenIndex >= 0 && chosenIndex < matches.length) {
    const duplicate = matches[chosenIndex];
    if (confirm(`Объединить «${duplicate.name}» с «${currentClient.name}»?\n\nВсе визиты и формулы будут перенесены на ${currentClient.name}, а дубликат удален.`)) {
      mergeClients(currentClient.id, duplicate.id);
    }
  } else {
    alert('Неверный выбор.');
  }
}
