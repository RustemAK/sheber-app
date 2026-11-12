/**
 * HairStudio / Sheber PWA - Public Client Booking & Self-Service Controller
 * File: js/book.js
 * Multi-language (KZ/RU) + Client Self-Service (Cancel/Reschedule via personal link)
 */

(function () {
  'use strict';

  // I18N Translations Dictionary
  const I18N = {
    ru: {
      titlePrefix: 'Запись к',
      titleSuffix: 'Sheber',
      waChat: 'Чат WhatsApp',
      route2Gis: '2ГИС (Маршрут)',
      step1: '1. Выберите услуги',
      step2: '2. Дата и свободное время',
      step3: '3. Ваши контакты',
      nameLabel: 'Ваше имя *',
      namePlaceholder: 'Как к вам обращаться?',
      phoneLabel: 'Номер WhatsApp *',
      noteLabel: 'Пожелание или комментарий (необязательно)',
      notePlaceholder: 'Особые пожелания к визиту, длина волос и т.д.',
      submitBtn: 'Записаться',
      submitting: 'Отправка заявки...',
      submitted: 'Заявка отправлена ✓',
      submitError: 'Ошибка при отправке заявки: ',
      submitFail: 'Не удалось отправить заявку. Попробуйте еще раз или напишите мастеру в WhatsApp напрямую.',
      selectTime: 'Выберите время',
      noServicesSelected: 'Услуги не выбраны',
      selectedCount: 'Выбрано',
      serviceOne: 'услуга',
      serviceFew: 'услуги',
      serviceMany: 'услуг',
      noServicesInCategory: 'В этой категории нет доступных услуг',
      firstSelectService: 'Сначала выберите хотя бы одну услугу выше ☝️',
      calculatingSlots: 'Расчет свободных окон...',
      noSlotsDay: 'На этот день все места заняты или мастер отдыхает. Пожалуйста, выберите другую дату выше 📅',
      periodMorning: '🌅 Утро',
      periodAfternoon: '☀️ День',
      periodEvening: '🌙 Вечер',
      hourShort: 'ч',
      minShort: 'мин',
      today: 'Сегодня',
      tomorrow: 'Завтра',
      monthsShort: ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
      monthsFull: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
      daysShort: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
      cats: {
        all: 'Все',
        haircut: 'Стрижки',
        coloring: 'Окрашивание',
        care: 'Уход',
        styling: 'Стилизация',
        other: 'Другое'
      },
      successTitle: 'Заявка отправлена!',
      successText: 'Мастер проверит свой рабочий график и подтвердит вашу запись сообщением в WhatsApp.',
      successDate: 'Дата:',
      successTime: 'Время:',
      successServices: 'Услуги:',
      successMaster: 'Мастер:',
      successAddress: 'Адрес:',
      successWhatsappBtn: 'Написать мастеру в WhatsApp',
      successCloseBtn: 'Закрыть',
      manageLinkTitle: '🔑 Персональная ссылка для управления',
      manageLinkDesc: 'Сохраните эту ссылку, чтобы при необходимости самостоятельно отменить или перенести запись без звонков мастеру:',
      copyBtn: 'Копировать',
      copiedBtn: 'Скопировано!',
      btnManageSelf: 'Открыть страницу управления записью',
      // Self-service screen
      manageTitle: '📱 Управление записью',
      statusPending: 'Ожидает подтверждения',
      statusConfirmed: 'Подтверждена',
      statusCancelled: 'Отменена',
      statusCompleted: 'Завершена',
      manageServices: 'Услуги:',
      manageDate: 'Дата:',
      manageTime: 'Время:',
      manageClient: 'Клиент:',
      manageMaster: 'Мастер:',
      btnReschedule: 'Перенести на другое время',
      btnCancel: 'Отменить запись',
      btnMakeNewBooking: 'Записаться снова',
      confirmCancelPrompt: 'Вы уверены, что хотите отменить эту запись? Слот мастера моментально освободится.',
      cancelSuccess: 'Запись успешно отменена.',
      chooseNewTime: '🔄 Выберите новую дату и время',
      btnConfirmNewTime: 'Подтвердить перенос',
      btnCancelReschedule: 'Назад',
      rescheduleSuccess: 'Запись успешно перенесена на новое время!',
      manageNotFound: 'Запись по указанной ссылке не найдена или устарела.',
      cancelling: 'Отмена...'
    },
    kk: {
      titlePrefix: 'Жазылу —',
      titleSuffix: 'Sheber',
      waChat: 'WhatsApp чаты',
      route2Gis: '2ГИС (Маршрут)',
      step1: '1. Қызметтерді таңдаңыз',
      step2: '2. Күні мен бос уақытты таңдаңыз',
      step3: '3. Байланыс деректеріңіз',
      nameLabel: 'Атыңыз *',
      namePlaceholder: 'Сізге қалай жүгінуге болады?',
      phoneLabel: 'Телефон нөмірі (WhatsApp) *',
      noteLabel: 'Қосымша тілек немесе сұрақ (міндетті емес)',
      notePlaceholder: 'Қосымша тілектеріңіз, шаш ұзындығы т.б.',
      submitBtn: 'Жазылу',
      submitting: 'Өтініш жіберілуде...',
      submitted: 'Өтініш жіберілді ✓',
      submitError: 'Өтінішті жіберу кезіндегі қате: ',
      submitFail: 'Өтініш жіберілмеді. Қайталап көріңіз немесе шеберге WhatsApp арқылы тікелей жазыңыз.',
      selectTime: 'Уақытты таңдаңыз',
      noServicesSelected: 'Қызметтер таңдалмаған',
      selectedCount: 'Таңдалды',
      serviceOne: 'қызмет',
      serviceFew: 'қызмет',
      serviceMany: 'қызмет',
      noServicesInCategory: 'Бұл санатта қолжетімді қызметтер жоқ',
      firstSelectService: 'Алдымен жоғарыдан кемінде бір қызметті таңдаңыз ☝️',
      calculatingSlots: 'Бос уақытты есептеу...',
      noSlotsDay: 'Бұл күні барлық орындар бос емес немесе шебер демалуда. Жоғарыдан басқа күнді таңдаңыз 📅',
      periodMorning: '🌅 Таңертең',
      periodAfternoon: '☀️ Түс',
      periodEvening: '🌙 Кеш',
      hourShort: 'сағ',
      minShort: 'мин',
      today: 'Бүгін',
      tomorrow: 'Ертең',
      monthsShort: ['қаң', 'ақп', 'нау', 'сәу', 'мам', 'мау', 'шіл', 'там', 'қыр', 'қаз', 'қар', 'жел'],
      monthsFull: ['қаңтар', 'ақпан', 'наурыз', 'сәуір', 'мамыр', 'маусым', 'шілде', 'тамыз', 'қыркүйек', 'қазан', 'қараша', 'желтоқсан'],
      daysShort: ['Жс', 'Дс', 'Сс', 'Ср', 'Бс', 'Жм', 'Сб'],
      cats: {
        all: 'Барлығы',
        haircut: 'Шаш қию',
        coloring: 'Бояу',
        care: 'Күтім',
        styling: 'Сәндеу',
        other: 'Басқа'
      },
      successTitle: 'Өтініш жіберілді!',
      successText: 'Шебер өз жұмыс кестесін тексеріп, жазылуыңызды WhatsApp арқылы растайды.',
      successDate: 'Күні:',
      successTime: 'Уақыты:',
      successServices: 'Қызметтер:',
      successMaster: 'Шебер:',
      successAddress: 'Мекенжайы:',
      successWhatsappBtn: 'Шеберге WhatsApp-қа жазу',
      successCloseBtn: 'Жабу',
      manageLinkTitle: '🔑 Басқаруға арналған жеке сілтеме',
      manageLinkDesc: 'Қажет болса, шеберге қоңырау шалмай-ақ жазылуды өз бетіңізше бас тарту немесе ауыстыру үшін осы сілтемені сақтап алыңыз:',
      copyBtn: 'Көшіру',
      copiedBtn: 'Көшірілді!',
      btnManageSelf: 'Жазылуды басқару бетін ашу',
      // Self-service screen
      manageTitle: '📱 Жазылуды басқару',
      statusPending: 'Растауды күтуде',
      statusConfirmed: 'Расталды',
      statusCancelled: 'Бас тартылды',
      statusCompleted: 'Аяқталды',
      manageServices: 'Қызметтер:',
      manageDate: 'Күні:',
      manageTime: 'Уақыты:',
      manageClient: 'Клиент:',
      manageMaster: 'Шебер:',
      btnReschedule: 'Басқа уақытқа ауыстыру',
      btnCancel: 'Жазылудан бас тарту',
      btnMakeNewBooking: 'Қайта жазылу',
      confirmCancelPrompt: 'Бұл жазылудан бас тартқыңыз келетініне сенімдісіз бе? Шебердің уақыт терезесі бірден босайды.',
      cancelSuccess: 'Жазылудан сәтті бас тартылды.',
      chooseNewTime: '🔄 Жаңа күн мен уақытты таңдаңыз',
      btnConfirmNewTime: 'Ауыстыруды растау',
      btnCancelReschedule: 'Артқа',
      rescheduleSuccess: 'Жазылу жаңа уақытқа сәтті ауыстырылды!',
      manageNotFound: 'Көрсетілген сілтеме бойынша жазылу табылмады немесе мерзімі өткен.',
      cancelling: 'Бас тартылуда...'
    }
  };

  // State
  let currentLang = localStorage.getItem('sheber_lang') || (navigator.language && navigator.language.startsWith('kk') ? 'kk' : 'ru');
  if (currentLang !== 'kk' && currentLang !== 'ru') currentLang = 'ru';

  const bookingState = {
    master: null,
    services: [],
    selectedServiceIds: new Set(),
    selectedDate: '',
    selectedSlot: null,
    busySlots: [],
    activeCategory: 'all',
    // Manage state
    manageBooking: null,
    manageNewDate: '',
    manageNewSlot: null
  };

  function t(key) {
    const dict = I18N[currentLang] || I18N.ru;
    return dict[key] || I18N.ru[key] || key;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatYMD(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function formatDisplayFullDate(ymd) {
    if (!ymd) return '';
    const [y, m, d] = ymd.split('-').map(Number);
    const months = (I18N[currentLang] || I18N.ru).monthsFull;
    return `${d} ${months[m - 1]} ${y}`;
  }

  function addMinutesToTime(timeStr, mins) {
    const [h, m] = timeStr.split(':').map(Number);
    const total = h * 60 + m + Number(mins);
    const nh = Math.floor(total / 60) % 24;
    const nm = total % 60;
    return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
  }

  function timeToMinutes(t) {
    const [h, m] = String(t).split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', async () => {
    setupLanguageSwitcher();
    setupPhoneMask();
    setupCategoryFilters();
    setupFormListeners();
    applyLanguage(currentLang);
    await loadMasterData();
  });

  // Language switcher setup
  function setupLanguageSwitcher() {
    const switchContainer = document.getElementById('langSwitch');
    if (!switchContainer) return;

    switchContainer.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang');
        if (lang && lang !== currentLang) {
          currentLang = lang;
          try {
            localStorage.setItem('sheber_lang', lang);
          } catch (e) {}
          applyLanguage(lang);
        }
      });
    });
  }

  function applyLanguage(lang) {
    currentLang = lang;
    const dict = I18N[lang] || I18N.ru;

    // Update switcher buttons UI
    document.querySelectorAll('#langSwitch .lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    // Header contacts
    const elWa = document.getElementById('labelWhatsappChat');
    if (elWa) elWa.innerText = dict.waChat;
    const el2Gis = document.getElementById('label2GisRoute');
    if (el2Gis) el2Gis.innerText = dict.route2Gis;

    // Step titles
    const s1 = document.getElementById('labelStepServices');
    if (s1) s1.innerText = dict.step1;
    const s2 = document.getElementById('labelStepDateTime');
    if (s2) s2.innerText = dict.step2;
    const s3 = document.getElementById('labelStepContacts');
    if (s3) s3.innerText = dict.step3;

    // Form inputs
    const lName = document.getElementById('labelClientName');
    if (lName) lName.innerText = dict.nameLabel;
    const inName = document.getElementById('clientNameInput');
    if (inName) inName.placeholder = dict.namePlaceholder;

    const lPhone = document.getElementById('labelClientPhone');
    if (lPhone) lPhone.innerText = dict.phoneLabel;

    const lNote = document.getElementById('labelClientNote');
    if (lNote) lNote.innerText = dict.noteLabel;
    const inNote = document.getElementById('clientNoteInput');
    if (inNote) inNote.placeholder = dict.notePlaceholder;

    // Submit button
    const btnSub = document.getElementById('labelBtnSubmit');
    if (btnSub) btnSub.innerText = dict.submitBtn;

    // Category chips
    document.querySelectorAll('#serviceCategoryChips .chip-btn').forEach(btn => {
      const catKey = btn.getAttribute('data-category');
      const label = dict.cats[catKey] || catKey;
      const span = btn.querySelector('.cat-label') || btn;
      span.innerText = label;
    });

    // Success modal elements
    const st = document.getElementById('labelSuccessTitle');
    if (st) st.innerText = dict.successTitle;
    const sText = document.getElementById('labelSuccessText');
    if (sText) sText.innerText = dict.successText;
    const sd = document.getElementById('labelSuccessDate');
    if (sd) sd.innerText = dict.successDate;
    const stm = document.getElementById('labelSuccessTime');
    if (stm) stm.innerText = dict.successTime;
    const ss = document.getElementById('labelSuccessServices');
    if (ss) ss.innerText = dict.successServices;
    const sm = document.getElementById('labelSuccessMaster');
    if (sm) sm.innerText = dict.successMaster;
    const sa = document.getElementById('labelSuccessAddress');
    if (sa) sa.innerText = dict.successAddress;
    const sw = document.getElementById('labelSuccessWhatsappBtn');
    if (sw) sw.innerText = dict.successWhatsappBtn;
    const sc = document.getElementById('labelSuccessCloseBtn');
    if (sc) sc.innerText = dict.successCloseBtn;

    // Manage link box in success modal
    const mlTitle = document.getElementById('labelManageLinkTitle');
    if (mlTitle) mlTitle.innerText = dict.manageLinkTitle;
    const mlDesc = document.getElementById('labelManageLinkDesc');
    if (mlDesc) mlDesc.innerText = dict.manageLinkDesc;
    const cBtn = document.getElementById('labelCopyBtn');
    if (cBtn) cBtn.innerText = dict.copyBtn;
    const msBtn = document.getElementById('labelBtnManageSelf');
    if (msBtn) msBtn.innerText = dict.btnManageSelf;

    // Manage screen elements
    const mTitle = document.getElementById('labelManageTitle');
    if (mTitle) mTitle.innerText = dict.manageTitle;
    const mServ = document.getElementById('labelManageServices');
    if (mServ) mServ.innerText = dict.manageServices;
    const mDate = document.getElementById('labelManageDate');
    if (mDate) mDate.innerText = dict.manageDate;
    const mTime = document.getElementById('labelManageTime');
    if (mTime) mTime.innerText = dict.manageTime;
    const mCli = document.getElementById('labelManageClient');
    if (mCli) mCli.innerText = dict.manageClient;
    const mMast = document.getElementById('labelManageMaster');
    if (mMast) mMast.innerText = dict.manageMaster;

    const bResched = document.getElementById('labelBtnReschedule');
    if (bResched) bResched.innerText = dict.btnReschedule;
    const bCancel = document.getElementById('labelBtnCancel');
    if (bCancel) bCancel.innerText = dict.btnCancel;
    const bNew = document.getElementById('labelBtnMakeNewBooking');
    if (bNew) bNew.innerText = dict.btnMakeNewBooking;

    const cnt = document.getElementById('labelChooseNewTime');
    if (cnt) cnt.innerText = dict.chooseNewTime;
    const bcn = document.getElementById('labelBtnConfirmNewTime');
    if (bcn) bcn.innerText = dict.btnConfirmNewTime;
    const bcr = document.getElementById('labelBtnCancelReschedule');
    if (bcr) bcr.innerText = dict.btnCancelReschedule;

    // Refresh dynamic parts
    if (bookingState.master) {
      document.title = `${dict.titlePrefix} ${bookingState.master.name || 'Sheber'} — ${dict.titleSuffix}`;
    }
    renderServices();
    updateDurationSummary();
    if (bookingState.selectedDate) {
      initDateStrip(bookingState.selectedDate);
    }
    if (bookingState.manageBooking) {
      updateManageStatusBadge(bookingState.manageBooking.status);
    }
  }

  // Phone mask for Kazakhstan (+7 (7XX) XXX-XX-XX)
  function setupPhoneMask() {
    const phoneInput = document.getElementById('clientPhoneInput');
    if (!phoneInput) return;

    phoneInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '');
      if (!val) {
        e.target.value = '';
        return;
      }
      if (val.length === 10 && (val[0] === '7' || val[0] === '6' || val[0] === '9')) {
        val = '7' + val;
      } else {
        if (val[0] === '8') val = '7' + val.slice(1);
        if (val[0] !== '7') val = '7' + val;
      }

      let formatted = '+7';
      if (val.length > 1) formatted += ' (' + val.substring(1, 4);
      if (val.length >= 4) formatted += ') ' + val.substring(4, 7);
      if (val.length >= 7) formatted += '-' + val.substring(7, 9);
      if (val.length >= 9) formatted += '-' + val.substring(9, 11);

      e.target.value = formatted;
      checkFormValidity();
    });
  }

  function isMasterBookingActive(master) {
    if (!master) return false;
    if (master.is_active === false) return false;
    if (master.subscription_status === 'expired') return false;

    if (master.subscription_ends_at) {
      const subEnd = new Date(master.subscription_ends_at).getTime();
      if (subEnd < Date.now()) {
        if (master.trial_ends_at) {
          const trialEnd = new Date(master.trial_ends_at).getTime();
          if (trialEnd < Date.now()) return false;
        } else {
          return false;
        }
      }
    } else if (master.trial_ends_at) {
      const trialEnd = new Date(master.trial_ends_at).getTime();
      if (trialEnd < Date.now()) return false;
    }

    return true;
  }

  function showInactiveBooking(master) {
    const stepsWrap = document.getElementById('bookingStepsWrapper');
    if (stepsWrap) stepsWrap.style.display = 'none';

    const bottomBar = document.querySelector('.bottom-booking-bar');
    if (bottomBar) bottomBar.style.display = 'none';

    const notice = document.getElementById('bookingInactiveNotice');
    if (notice) {
      notice.style.display = 'block';
      const waLink = document.getElementById('linkInactiveWhatsapp');
      if (waLink && master.phone) {
        let cleanPhone = master.phone.replace(/\D/g, '');
        if (cleanPhone.length === 11 && cleanPhone.startsWith('8')) cleanPhone = '7' + cleanPhone.slice(1);
        else if (cleanPhone.length === 10 && !cleanPhone.startsWith('7')) cleanPhone = '7' + cleanPhone;
        const msg = currentLang === 'kk' ? 'Сәлеметсіз бе! Сізге жазылғым келеді' : 'Здравствуйте! Хочу записаться к вам на приём';
        waLink.href = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
      }
    }
  }

  async function loadMasterData() {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('m') || 'demo';
    const manageToken = (urlParams.get('manage') || '').trim();

    try {
      const master = await window.HairSupabase.getMaster(slug);
      if (!master) {
        document.getElementById('masterName').innerText = currentLang === 'kk' ? 'Шебер табылмады' : 'Мастер не найден';
        return;
      }

      bookingState.master = master;
      renderMasterProfile(master);

      // Check if Client Self-Service Manage Mode (?manage=TOKEN)
      if (manageToken) {
        await initClientManageView(manageToken);
        return;
      }

      if (!isMasterBookingActive(master)) {
        showInactiveBooking(master);
        return;
      }

      const services = await window.HairSupabase.getServices(master.id);
      bookingState.services = services;
      renderServices();

      initDateStrip();
    } catch (err) {
      console.error('Error loading master data:', err);
      document.getElementById('masterName').innerText = currentLang === 'kk' ? 'Шебер уақытша қолжетімсіз' : 'Мастер временно недоступен';
    }
  }

  function renderMasterProfile(master) {
    document.getElementById('masterName').innerText = master.name || 'Мастер';
    const salonElem = document.getElementById('masterSalon');
    if (salonElem) salonElem.innerText = master.salon_name || 'Sheber';

    const city = (master.city || '').trim();
    let addr = (master.address || '').trim();
    let addressText = '';
    if (city && addr) {
      if (addr.toLowerCase().startsWith(city.toLowerCase())) {
        addressText = addr;
      } else {
        addressText = `${city}, ${addr}`.trim().replace(/^,\s*/, '');
      }
    } else {
      addressText = city || addr || (currentLang === 'kk' ? 'Қаланы шеберден нақтылаңыз' : 'Город уточняйте у мастера');
    }
    document.getElementById('masterAddress').innerText = addressText;
    document.title = `${t('titlePrefix')} ${master.name || 'Sheber'} — ${t('titleSuffix')}`;

    // 2GIS link
    let customGis = (master.gis_url && master.gis_url.startsWith('http')) ? master.gis_url : '';
    if (!customGis && master.subscription_notes) {
      try {
        const sn = JSON.parse(master.subscription_notes);
        if (sn.gis_url && sn.gis_url.startsWith('http')) customGis = sn.gis_url;
      } catch (e) {}
    }
    const gisTarget = customGis || `https://2gis.kz/search/${encodeURIComponent(addressText)}`;

    const locLink = document.getElementById('linkMasterLocation');
    if (locLink) locLink.href = gisTarget;

    const gisLink = document.getElementById('linkMaster2Gis');
    if (gisLink) gisLink.href = gisTarget;

    // WhatsApp link
    let cleanPhone = (master.phone || '+77011234567').replace(/\D/g, '');
    if (cleanPhone.length === 11 && cleanPhone.startsWith('8')) {
      cleanPhone = '7' + cleanPhone.slice(1);
    } else if (cleanPhone.length === 10 && !cleanPhone.startsWith('7')) {
      cleanPhone = '7' + cleanPhone;
    }
    const waLink = document.getElementById('linkMasterWhatsapp');
    if (waLink) {
      const msg = currentLang === 'kk' ? 'Сәлеметсіз бе! Мен онлайн-жазылу бойынша' : 'Здравствуйте! Я по поводу онлайн-записи';
      waLink.href = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    }

    // Instagram link
    const igLink = document.getElementById('linkMasterInstagram');
    if (igLink) {
      const rawIg = master.instagram || '';
      if (rawIg.trim()) {
        igLink.href = `https://instagram.com/${rawIg.replace('@', '').trim()}`;
        igLink.style.display = 'inline-flex';
      } else {
        igLink.style.display = 'none';
      }
    }
  }

  function setupCategoryFilters() {
    const filterWrap = document.getElementById('serviceCategoryChips');
    if (!filterWrap) return;
    filterWrap.addEventListener('click', (e) => {
      const btn = e.target.closest('.chip-btn');
      if (!btn) return;
      filterWrap.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      bookingState.activeCategory = btn.getAttribute('data-category');
      renderServices();
    });
  }

  function renderServices() {
    const container = document.getElementById('servicesList');
    if (!container) return;
    const filtered = bookingState.services.filter(s => {
      if (bookingState.activeCategory === 'all') return true;
      return s.category === bookingState.activeCategory;
    });

    if (filtered.length === 0) {
      container.innerHTML = `<div class="no-slots-alert">${t('noServicesInCategory')}</div>`;
      return;
    }

    const hShort = t('hourShort');
    const mShort = t('minShort');

    container.innerHTML = filtered.map(s => {
      const isSelected = bookingState.selectedServiceIds.has(s.id);
      const dur = s.duration_min >= 60 
        ? `${Math.floor(s.duration_min / 60)} ${hShort} ${s.duration_min % 60 ? (s.duration_min % 60) + ' ' + mShort : ''}`.trim()
        : `${s.duration_min} ${mShort}`;

      return `
        <div class="service-item ${isSelected ? 'selected' : ''}" data-service-id="${escapeHtml(s.id)}">
          <div class="service-info">
            <div class="service-name">${escapeHtml(s.name)}</div>
            <div class="service-duration">
              <span>⏱️</span>
              <span>${dur}</span>
            </div>
          </div>
          <div class="service-checkbox">${isSelected ? '✓' : ''}</div>
        </div>
      `;
    }).join('');

    // Attach clicks
    container.querySelectorAll('.service-item').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-service-id');
        if (bookingState.selectedServiceIds.has(id)) {
          bookingState.selectedServiceIds.delete(id);
        } else {
          bookingState.selectedServiceIds.add(id);
        }
        onServicesSelectionChanged();
      });
    });
  }

  function onServicesSelectionChanged() {
    bookingState.selectedSlot = null;
    const timeLabel = document.getElementById('barSelectedTimeLabel');
    if (timeLabel) timeLabel.innerText = t('selectTime');
    renderServices();
    updateDurationSummary();
    if (bookingState.selectedDate) {
      loadSlotsForDate(bookingState.selectedDate);
    }
    checkFormValidity();
  }

  function getTotalSelectedDuration() {
    let total = 0;
    bookingState.selectedServiceIds.forEach(id => {
      const s = bookingState.services.find(srv => srv.id === id);
      if (s) total += (Number(s.duration_min) || 45);
    });
    return total || 45;
  }

  function updateDurationSummary() {
    const count = bookingState.selectedServiceIds.size;
    const countBadge = document.getElementById('selectedCountBadge');
    if (countBadge) countBadge.innerText = `${t('selectedCount')}: ${count}`;

    const summaryBox = document.getElementById('durationSummary');
    const durationText = document.getElementById('totalDurationText');
    const barServices = document.getElementById('barSelectedServicesLabel');

    const hShort = t('hourShort');
    const mShort = t('minShort');

    if (count > 0) {
      if (summaryBox) summaryBox.style.display = 'flex';
      const totalMin = getTotalSelectedDuration();
      const durStr = totalMin >= 60
        ? `${Math.floor(totalMin / 60)} ${hShort} ${totalMin % 60 ? (totalMin % 60) + ' ' + mShort : ''}`.trim()
        : `${totalMin} ${mShort}`;
      if (durationText) durationText.innerText = durStr;
      if (barServices) {
        let word = t('serviceMany');
        if (count === 1) word = t('serviceOne');
        else if (count < 5) word = t('serviceFew');
        barServices.innerText = `${count} ${word} (~${durStr})`;
      }
    } else {
      if (summaryBox) summaryBox.style.display = 'none';
      if (barServices) barServices.innerText = t('noServicesSelected');
    }
  }

  function isMasterDayOff(dateStr) {
    const master = bookingState.master;
    if (!master) return false;
    if (master.working_hours) {
      try {
        const wh = typeof master.working_hours === 'string' ? JSON.parse(master.working_hours) : master.working_hours;
        const [y, m, d] = dateStr.split('-').map(Number);
        const dayOfWeek = new Date(y, m - 1, d).getDay();
        if (wh && wh[dayOfWeek] && wh[dayOfWeek].enabled === false) {
          return true;
        }
      } catch (e) {}
    }
    return false;
  }

  function initDateStrip(preselectedYmd) {
    const strip = document.getElementById('bookingDateStrip');
    if (!strip) return;
    const today = new Date();
    const pills = [];
    const dict = I18N[currentLang] || I18N.ru;

    const targetYmd = preselectedYmd || bookingState.selectedDate || formatYMD(today);

    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const ymd = formatYMD(d);
      const dayName = i === 0 ? dict.today : (i === 1 ? dict.tomorrow : dict.daysShort[d.getDay()]);
      const isSel = (ymd === targetYmd);
      const isOff = isMasterDayOff(ymd);

      pills.push(`
        <div class="date-pill ${isSel ? 'selected' : ''} ${isOff ? 'day-off' : ''}" data-ymd="${ymd}" ${isOff ? 'title="Выходной"' : ''}>
          <span class="pill-day">${dayName}</span>
          <span class="pill-num">${d.getDate()}</span>
          <span class="pill-month">${dict.monthsShort[d.getMonth()]}</span>
        </div>
      `);
    }

    strip.innerHTML = pills.join('');

    bookingState.selectedDate = targetYmd;
    loadSlotsForDate(bookingState.selectedDate);

    strip.querySelectorAll('.date-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        strip.querySelectorAll('.date-pill').forEach(p => p.classList.remove('selected'));
        pill.classList.add('selected');
        const ymd = pill.getAttribute('data-ymd');
        bookingState.selectedDate = ymd;
        bookingState.selectedSlot = null;
        loadSlotsForDate(ymd);
        checkFormValidity();
      });
    });
  }

  async function loadSlotsForDate(dateStr) {
    const container = document.getElementById('slotsContainer');
    if (!container) return;
    container.innerHTML = `<div class="no-slots-alert">${t('calculatingSlots')}</div>`;

    if (isMasterDayOff(dateStr)) {
      container.innerHTML = `<div class="no-slots-alert">${t('noSlotsDay')}</div>`;
      return;
    }

    if (bookingState.selectedServiceIds.size === 0) {
      container.innerHTML = `<div class="no-slots-alert">${t('firstSelectService')}</div>`;
      return;
    }

    const masterId = bookingState.master ? bookingState.master.id : null;
    const busySlots = await window.HairSupabase.getBusySlots(masterId, dateStr);
    bookingState.busySlots = busySlots;

    renderSlots(dateStr, busySlots);
  }

  function renderSlots(dateStr, busySlots) {
    const container = document.getElementById('slotsContainer');
    if (!container) return;
    const master = bookingState.master || {};
    const startHour = Number(master.work_start_hour) || 9;
    const endHour = Number(master.work_end_hour) || 21;
    const stepMin = Number(master.slot_step_min) || 30;
    const totalDuration = getTotalSelectedDuration();

    // Check if date is today and filter out past hours
    const now = new Date();
    const isToday = (dateStr === formatYMD(now));
    const currentMinutes = now.getHours() * 60 + now.getMinutes() + 15; // 15 min buffer

    const freeSlots = [];

    for (let m = startHour * 60; m <= (endHour * 60) - totalDuration; m += stepMin) {
      if (isToday && m < currentMinutes) {
        continue;
      }

      const slotStart = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
      const slotEnd = addMinutesToTime(slotStart, totalDuration);

      const slotStartMin = m;
      const slotEndMin = m + totalDuration;

      // Check overlap with busy slots
      const isOverlapping = Array.isArray(busySlots) && busySlots.some(busy => {
        const bStart = timeToMinutes(busy.start_time);
        const bEnd = timeToMinutes(busy.end_time);
        return Math.max(slotStartMin, bStart) < Math.min(slotEndMin, bEnd);
      });

      if (!isOverlapping) {
        freeSlots.push({ start: slotStart, end: slotEnd });
      }
    }

    if (freeSlots.length === 0) {
      container.innerHTML = `<div class="no-slots-alert">${t('noSlotsDay')}</div>`;
      return;
    }

    // Group slots by period
    const morning = freeSlots.filter(s => timeToMinutes(s.start) < 12 * 60);
    const afternoon = freeSlots.filter(s => timeToMinutes(s.start) >= 12 * 60 && timeToMinutes(s.start) < 17 * 60);
    const evening = freeSlots.filter(s => timeToMinutes(s.start) >= 17 * 60);

    let html = '';

    const makeGroup = (title, list) => {
      if (list.length === 0) return '';
      return `
        <div class="slots-period-group">
          <div class="period-title">${title}</div>
          <div class="slots-grid">
            ${list.map(s => {
              const isSel = bookingState.selectedSlot && bookingState.selectedSlot.start === s.start;
              return `<button type="button" class="slot-btn ${isSel ? 'selected' : ''}" data-slot="${s.start}" data-slot-end="${s.end}">${s.start}</button>`;
            }).join('')}
          </div>
        </div>
      `;
    };

    html += makeGroup(t('periodMorning'), morning);
    html += makeGroup(t('periodAfternoon'), afternoon);
    html += makeGroup(t('periodEvening'), evening);

    container.innerHTML = html;

    // Slot click listeners
    container.querySelectorAll('.slot-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        bookingState.selectedSlot = {
          start: btn.getAttribute('data-slot'),
          end: btn.getAttribute('data-slot-end')
        };
        onSlotSelected();
      });
    });
  }

  function onSlotSelected() {
    const timeLabel = document.getElementById('barSelectedTimeLabel');
    if (bookingState.selectedSlot && bookingState.selectedDate && timeLabel) {
      const [y, m, d] = bookingState.selectedDate.split('-').map(Number);
      const dict = I18N[currentLang] || I18N.ru;
      timeLabel.innerText = `${d} ${dict.monthsShort[m - 1]}, в ${bookingState.selectedSlot.start}`;
    }
    checkFormValidity();
  }

  function setupFormListeners() {
    const nameInput = document.getElementById('clientNameInput');
    if (nameInput) nameInput.addEventListener('input', checkFormValidity);

    const submitBtn = document.getElementById('btnSubmitBooking');
    if (submitBtn) submitBtn.addEventListener('click', handleSubmitBooking);

    const closeBtn = document.getElementById('btnCloseSuccess');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        const modal = document.getElementById('modalBookingSuccess');
        if (modal) modal.classList.remove('active');
      });
    }

    // Setup Copy Manage Link button
    const copyBtn = document.getElementById('btnCopyManageLink');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const input = document.getElementById('manageLinkInput');
        if (!input) return;
        input.select();
        try {
          navigator.clipboard.writeText(input.value);
        } catch (e) {
          document.execCommand('copy');
        }
        const label = document.getElementById('labelCopyBtn');
        if (label) {
          const oldText = label.innerText;
          label.innerText = t('copiedBtn');
          setTimeout(() => { label.innerText = oldText; }, 2000);
        }
      });
    }
  }

  function checkFormValidity() {
    const nameInput = document.getElementById('clientNameInput');
    const phoneInput = document.getElementById('clientPhoneInput');
    const submitBtn = document.getElementById('btnSubmitBooking');
    if (!submitBtn) return;

    const hasServices = bookingState.selectedServiceIds.size > 0;
    const hasSlot = Boolean(bookingState.selectedSlot && bookingState.selectedDate);
    const nameVal = nameInput ? nameInput.value.trim() : '';
    const phoneDigits = phoneInput ? phoneInput.value.replace(/\D/g, '') : '';
    const hasValidPhone = phoneDigits.length >= 10;

    if (hasServices && hasSlot && nameVal.length >= 2 && hasValidPhone) {
      submitBtn.disabled = false;
    } else {
      submitBtn.disabled = true;
    }
  }

  async function handleSubmitBooking() {
    const submitBtn = document.getElementById('btnSubmitBooking');
    if (!submitBtn) return;
    submitBtn.disabled = true;
    submitBtn.innerText = t('submitting');

    try {
      // Anti-bot honeypot verification
      const trap = document.getElementById('clientWebsiteTrap');
      if (trap && trap.value.trim() !== '') {
        console.warn('Bot attempt thwarted by honeypot');
        showSuccessModal({
          date: bookingState.selectedDate,
          start_time: bookingState.selectedSlot ? bookingState.selectedSlot.start : '10:00',
          end_time: bookingState.selectedSlot ? bookingState.selectedSlot.end : '11:00',
          service_names: 'Услуги',
          client_name: 'Клиент'
        }, 'sh_demo_bot_trap');
        return;
      }

      const nameInput = document.getElementById('clientNameInput');
      const phoneInput = document.getElementById('clientPhoneInput');
      const noteInput = document.getElementById('clientNoteInput');

      const selectedServices = bookingState.services.filter(s => bookingState.selectedServiceIds.has(s.id));
      const serviceNames = selectedServices.map(s => s.name).join(', ');
      const totalDuration = getTotalSelectedDuration();

      const bookingPayload = {
        master_id: bookingState.master.id,
        client_name: nameInput.value.trim(),
        client_phone: phoneInput.value.trim(),
        date: bookingState.selectedDate,
        start_time: bookingState.selectedSlot.start,
        end_time: bookingState.selectedSlot.end,
        service_names: serviceNames,
        duration_min: totalDuration,
        client_note: noteInput ? noteInput.value.trim() : ''
      };

      const res = await window.HairSupabase.submitBooking(bookingPayload);

      if (res.success) {
        showSuccessModal(bookingPayload, res.manage_token);
      } else {
        const errorMsg = res.error || t('submitFail');
        alert(errorMsg);
        submitBtn.disabled = false;
        submitBtn.innerText = `${t('submitBtn')} →`;
      }
    } catch (err) {
      console.error('Submit error:', err);
      alert(t('submitError') + err.message);
      submitBtn.disabled = false;
      submitBtn.innerText = `${t('submitBtn')} →`;
    }
  }

  function showSuccessModal(data, manageToken) {
    document.getElementById('successDateVal').innerText = formatDisplayFullDate(data.date);
    document.getElementById('successTimeVal').innerText = `${data.start_time} - ${data.end_time}`;
    document.getElementById('successServicesVal').innerText = data.service_names;
    document.getElementById('successMasterVal').innerText = bookingState.master.name;
    document.getElementById('successAddressVal').innerText = [bookingState.master?.city, bookingState.master?.address].filter(Boolean).join(', ') || (currentLang === 'kk' ? 'Мекенжайды шеберден нақтылаңыз' : 'Адрес уточняйте у мастера');

    // Self-Service Manage Link
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('m') || 'demo';
    const manageUrl = `${window.location.origin}${window.location.pathname}?m=${encodeURIComponent(slug)}&manage=${encodeURIComponent(manageToken || '')}`;

    const linkInput = document.getElementById('manageLinkInput');
    if (linkInput) linkInput.value = manageUrl;

    const directManageBtn = document.getElementById('btnOpenManageDirect');
    if (directManageBtn) directManageBtn.href = manageUrl;

    let cleanMasterPhone = (bookingState.master.phone || '+77011234567').replace(/\D/g, '');
    if (cleanMasterPhone.length === 11 && cleanMasterPhone.startsWith('8')) {
      cleanMasterPhone = '7' + cleanMasterPhone.slice(1);
    } else if (cleanMasterPhone.length === 10 && !cleanMasterPhone.startsWith('7')) {
      cleanMasterPhone = '7' + cleanMasterPhone;
    }
    
    const waMsg = currentLang === 'kk'
      ? `Сәлеметсіз бе, ${bookingState.master.name}! Мен онлайн жазылу өтінішін қалдырдым:\n✂️ Қызмет: ${data.service_names}\n📅 Күні: ${formatDisplayFullDate(data.date)}\n⏰ Уақыты: ${data.start_time}\n👤 Атым: ${data.client_name}`
      : `Здравствуйте, ${bookingState.master.name}! Я оставил(а) онлайн-заявку на запись:\n✂️ Услуга: ${data.service_names}\n📅 Дата: ${formatDisplayFullDate(data.date)}\n⏰ Время: ${data.start_time}\n👤 Имя: ${data.client_name}`;
    
    const waDirectBtn = document.getElementById('btnOpenMasterWhatsappDirect');
    if (waDirectBtn) {
      waDirectBtn.href = `https://wa.me/${cleanMasterPhone}?text=${encodeURIComponent(waMsg)}`;
    }

    const successModal = document.getElementById('modalBookingSuccess');
    if (successModal) successModal.classList.add('active');
    const submitBtn = document.getElementById('btnSubmitBooking');
    if (submitBtn) submitBtn.innerText = t('submitted');
  }

  // ==========================================
  // CLIENT SELF-SERVICE MANAGEMENT MODULE
  // ==========================================

  function updateManageStatusBadge(status) {
    const badge = document.getElementById('manageStatusBadge');
    if (!badge) return;

    badge.className = 'status-badge ' + (status || 'pending');
    if (status === 'confirmed') {
      badge.innerText = t('statusConfirmed');
    } else if (status === 'cancelled') {
      badge.innerText = t('statusCancelled');
    } else if (status === 'completed') {
      badge.innerText = t('statusCompleted');
    } else {
      badge.innerText = t('statusPending');
    }
  }

  async function initClientManageView(token) {
    const stepsWrap = document.getElementById('bookingStepsWrapper');
    if (stepsWrap) stepsWrap.style.display = 'none';

    const bottomBar = document.querySelector('.bottom-booking-bar');
    if (bottomBar) bottomBar.style.display = 'none';

    const manageView = document.getElementById('clientManageView');
    if (manageView) manageView.style.display = 'flex';

    try {
      const booking = await window.HairSupabase.getBookingByManageToken(token);
      if (!booking) {
        if (manageView) {
          manageView.innerHTML = `
            <section class="section-card" style="text-align: center; padding: 32px 16px;">
              <div style="font-size: 40px; margin-bottom: 12px;">⚠️</div>
              <h2 style="font-size: 18px; font-weight: 700; color: #f87171; margin-bottom: 8px;">${t('manageNotFound')}</h2>
              <a href="book.html?m=${encodeURIComponent(bookingState.master?.slug || 'demo')}" class="btn-contact whatsapp" style="display: inline-flex; margin-top: 16px; text-decoration: none;">
                ➕ ${t('btnMakeNewBooking')}
              </a>
            </section>
          `;
        }
        return;
      }

      bookingState.manageBooking = booking;

      // Populate details
      document.getElementById('manageServicesVal').innerText = booking.service_names || '--';
      document.getElementById('manageDateVal').innerText = formatDisplayFullDate(booking.date);
      document.getElementById('manageTimeVal').innerText = `${booking.start_time} - ${booking.end_time}`;
      document.getElementById('manageClientNameVal').innerText = booking.client_name || '--';
      document.getElementById('manageMasterVal').innerText = booking.master_name || bookingState.master?.name || 'Sheber';

      updateManageStatusBadge(booking.status);

      // Buttons logic
      const btnReschedule = document.getElementById('btnManageReschedule');
      const btnCancel = document.getElementById('btnManageCancel');
      const btnNew = document.getElementById('btnManageNewBooking');

      const urlParams = new URLSearchParams(window.location.search);
      const masterSlug = urlParams.get('m') || 'demo';
      if (btnNew) btnNew.href = `book.html?m=${encodeURIComponent(masterSlug)}`;

      if (booking.status === 'cancelled') {
        if (btnReschedule) btnReschedule.style.display = 'none';
        if (btnCancel) btnCancel.style.display = 'none';
        if (btnNew) btnNew.style.display = 'flex';
      } else {
        if (btnReschedule) btnReschedule.style.display = 'flex';
        if (btnCancel) btnCancel.style.display = 'flex';
        if (btnNew) btnNew.style.display = 'none';
      }

      // Wire Cancel button
      if (btnCancel) {
        btnCancel.onclick = async () => {
          if (!confirm(t('confirmCancelPrompt'))) return;
          btnCancel.disabled = true;
          const oldLabel = btnCancel.innerText;
          btnCancel.innerText = t('cancelling');

          try {
            const res = await window.HairSupabase.cancelBookingByManageToken(token);
            if (res.success) {
              booking.status = 'cancelled';
              bookingState.manageBooking.status = 'cancelled';
              updateManageStatusBadge('cancelled');
              btnCancel.style.display = 'none';
              if (btnReschedule) btnReschedule.style.display = 'none';
              const rSection = document.getElementById('manageRescheduleSection');
              if (rSection) rSection.style.display = 'none';
              if (btnNew) btnNew.style.display = 'flex';
              alert(t('cancelSuccess'));
            } else {
              alert(res.error || 'Ошибка отмены');
              btnCancel.disabled = false;
              btnCancel.innerText = oldLabel;
            }
          } catch (e) {
            console.error(e);
            alert('Ошибка: ' + e.message);
            btnCancel.disabled = false;
            btnCancel.innerText = oldLabel;
          }
        };
      }

      // Wire Reschedule button
      if (btnReschedule) {
        btnReschedule.onclick = () => {
          const rSection = document.getElementById('manageRescheduleSection');
          if (!rSection) return;
          rSection.style.display = rSection.style.display === 'none' ? 'block' : 'none';
          if (rSection.style.display === 'block') {
            initManageRescheduleCalendar(booking);
          }
        };
      }

      const btnCancelResched = document.getElementById('btnCancelRescheduleMode');
      if (btnCancelResched) {
        btnCancelResched.onclick = () => {
          const rSection = document.getElementById('manageRescheduleSection');
          if (rSection) rSection.style.display = 'none';
        };
      }

    } catch (err) {
      console.error('Error initClientManageView:', err);
    }
  }

  function initManageRescheduleCalendar(booking) {
    const strip = document.getElementById('manageDateStrip');
    const container = document.getElementById('manageSlotsContainer');
    const confirmBtn = document.getElementById('btnConfirmReschedule');
    if (!strip || !container || !confirmBtn) return;

    confirmBtn.disabled = true;
    bookingState.manageNewSlot = null;

    const today = new Date();
    const pills = [];
    const dict = I18N[currentLang] || I18N.ru;

    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const ymd = formatYMD(d);
      const dayName = i === 0 ? dict.today : (i === 1 ? dict.tomorrow : dict.daysShort[d.getDay()]);

      pills.push(`
        <div class="date-pill ${i === 0 ? 'selected' : ''}" data-ymd="${ymd}">
          <span class="pill-day">${dayName}</span>
          <span class="pill-num">${d.getDate()}</span>
          <span class="pill-month">${dict.monthsShort[d.getMonth()]}</span>
        </div>
      `);
    }

    strip.innerHTML = pills.join('');
    bookingState.manageNewDate = formatYMD(today);
    loadManageSlotsForDate(bookingState.manageNewDate, booking);

    strip.querySelectorAll('.date-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        strip.querySelectorAll('.date-pill').forEach(p => p.classList.remove('selected'));
        pill.classList.add('selected');
        const ymd = pill.getAttribute('data-ymd');
        bookingState.manageNewDate = ymd;
        bookingState.manageNewSlot = null;
        confirmBtn.disabled = true;
        loadManageSlotsForDate(ymd, booking);
      });
    });

    confirmBtn.onclick = async () => {
      if (!bookingState.manageNewDate || !bookingState.manageNewSlot) return;
      confirmBtn.disabled = true;
      confirmBtn.innerText = t('submitting');

      try {
        const res = await window.HairSupabase.rescheduleBookingByManageToken(
          booking.manage_token,
          bookingState.manageNewDate,
          bookingState.manageNewSlot.start,
          bookingState.manageNewSlot.end,
          booking.duration_min || 60
        );

        if (res.success) {
          booking.date = bookingState.manageNewDate;
          booking.start_time = bookingState.manageNewSlot.start;
          booking.end_time = bookingState.manageNewSlot.end;
          booking.status = 'pending';

          document.getElementById('manageDateVal').innerText = formatDisplayFullDate(booking.date);
          document.getElementById('manageTimeVal').innerText = `${booking.start_time} - ${booking.end_time}`;
          updateManageStatusBadge('pending');

          const rSection = document.getElementById('manageRescheduleSection');
          if (rSection) rSection.style.display = 'none';

          alert(t('rescheduleSuccess'));
        } else {
          alert(res.error || 'Ошибка переноса');
        }
      } catch (e) {
        console.error(e);
        alert('Ошибка: ' + e.message);
      } finally {
        confirmBtn.disabled = false;
        confirmBtn.innerText = t('btnConfirmNewTime');
      }
    };
  }

  async function loadManageSlotsForDate(dateStr, booking) {
    const container = document.getElementById('manageSlotsContainer');
    if (!container) return;
    container.innerHTML = `<div class="no-slots-alert">${t('calculatingSlots')}</div>`;

    const masterId = booking.master_id || (bookingState.master ? bookingState.master.id : null);
    const busySlots = await window.HairSupabase.getBusySlots(masterId, dateStr);

    const master = bookingState.master || {};
    const startHour = Number(master.work_start_hour) || 9;
    const endHour = Number(master.work_end_hour) || 21;
    const stepMin = Number(master.slot_step_min) || 30;
    const duration = Number(booking.duration_min) || 60;

    const now = new Date();
    const isToday = (dateStr === formatYMD(now));
    const currentMinutes = now.getHours() * 60 + now.getMinutes() + 15;

    const freeSlots = [];

    for (let m = startHour * 60; m <= (endHour * 60) - duration; m += stepMin) {
      if (isToday && m < currentMinutes) continue;

      const slotStart = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
      const slotEnd = addMinutesToTime(slotStart, duration);

      const slotStartMin = m;
      const slotEndMin = m + duration;

      const isOverlapping = Array.isArray(busySlots) && busySlots.some(busy => {
        const bStart = timeToMinutes(busy.start_time);
        const bEnd = timeToMinutes(busy.end_time);
        return Math.max(slotStartMin, bStart) < Math.min(slotEndMin, bEnd);
      });

      if (!isOverlapping) {
        freeSlots.push({ start: slotStart, end: slotEnd });
      }
    }

    if (freeSlots.length === 0) {
      container.innerHTML = `<div class="no-slots-alert">${t('noSlotsDay')}</div>`;
      return;
    }

    const morning = freeSlots.filter(s => timeToMinutes(s.start) < 12 * 60);
    const afternoon = freeSlots.filter(s => timeToMinutes(s.start) >= 12 * 60 && timeToMinutes(s.start) < 17 * 60);
    const evening = freeSlots.filter(s => timeToMinutes(s.start) >= 17 * 60);

    let html = '';
    const makeGroup = (title, list) => {
      if (list.length === 0) return '';
      return `
        <div class="slots-period-group">
          <div class="period-title">${title}</div>
          <div class="slots-grid">
            ${list.map(s => `
              <button type="button" class="slot-btn" data-slot="${s.start}" data-slot-end="${s.end}">${s.start}</button>
            `).join('')}
          </div>
        </div>
      `;
    };

    html += makeGroup(t('periodMorning'), morning);
    html += makeGroup(t('periodAfternoon'), afternoon);
    html += makeGroup(t('periodEvening'), evening);

    container.innerHTML = html;

    const confirmBtn = document.getElementById('btnConfirmReschedule');

    container.querySelectorAll('.slot-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        bookingState.manageNewSlot = {
          start: btn.getAttribute('data-slot'),
          end: btn.getAttribute('data-slot-end')
        };
        if (confirmBtn) confirmBtn.disabled = false;
      });
    });
  }

})();
