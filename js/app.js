/**
 * App Main Controller - Event Listeners, Filtering, Tab Navigation & Report Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  const store = window.appStore;
  const ui = window.appUI;

  // DOM Elements References
  const mainHeader = document.getElementById('mainHeader');
  const currentDateSubtitle = document.getElementById('currentDateSubtitle');
  const themeToggleBtn = document.getElementById('themeToggleBtn');

  // Navigation Links
  const navButtons = document.querySelectorAll('.nav-btn, .mobile-nav-item');
  const tabPanels = document.querySelectorAll('.tab-panel');

  // Metrics Elements
  const metricTotalBalance = document.getElementById('metricTotalBalance');
  const metricTotalIncome = document.getElementById('metricTotalIncome');
  const metricIncomeCount = document.getElementById('metricIncomeCount');
  const metricTotalExpense = document.getElementById('metricTotalExpense');
  const metricExpenseCount = document.getElementById('metricExpenseCount');
  const metricSavingsRate = document.getElementById('metricSavingsRate');
  const metricSavingsProgress = document.getElementById('metricSavingsProgress');

  // Filter Elements
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const filterType = document.getElementById('filterType');
  const filterCategory = document.getElementById('filterCategory');
  const filterTime = document.getElementById('filterTime');
  const sortOrder = document.getElementById('sortOrder');
  const txMainList = document.getElementById('txMainList');
  const dashRecentTxList = document.getElementById('dashRecentTxList');

  // Filter Summary Bar
  const matchingCount = document.getElementById('matchingCount');
  const summaryIncome = document.getElementById('summaryIncome');
  const summaryExpense = document.getElementById('summaryExpense');

  // Modal & Form Elements
  const headerAddTxBtn = document.getElementById('headerAddTxBtn');
  const txAddBtn = document.getElementById('txAddBtn');
  const mobileFabBtn = document.getElementById('mobileFabBtn');
  const txModalCloseBtn = document.getElementById('modalTxCloseBtn');
  const txModalCancelBtn = document.getElementById('modalTxCancelBtn');
  const txForm = document.getElementById('txForm');
  const txAmountInput = document.getElementById('txAmount');

  const authActionBtn = document.getElementById('authActionBtn');
  const authModal = document.getElementById('authModal');
  const authModalCloseBtn = document.getElementById('authModalCloseBtn');
  const authForm = document.getElementById('authForm');
  const authModeToggleBtn = document.getElementById('authModeToggleBtn');
  const authSubmitBtn = document.getElementById('authSubmitBtn');
  const authModalTitle = document.getElementById('authModalTitle');
  const authNameGroup = document.getElementById('authNameGroup');
  const authFullName = document.getElementById('authFullName');
  const authEmail = document.getElementById('authEmail');
  const authPassword = document.getElementById('authPassword');
  const amountPreview = document.getElementById('amountPreview');
  const radioExpense = document.getElementById('txTypeExpense');
  const radioIncome = document.getElementById('txTypeIncome');
  const typeExpenseLabel = document.getElementById('typeExpenseLabel');
  const typeIncomeLabel = document.getElementById('typeIncomeLabel');
  const txCategorySelect = document.getElementById('txCategory');

  // Confirm Modal
  const confirmModalCloseBtn = document.getElementById('confirmModalCloseBtn');
  const confirmModalCancelBtn = document.getElementById('confirmModalCancelBtn');

  // Settings Buttons
  const loadSampleDataBtn = document.getElementById('loadSampleDataBtn');
  const exportCsvBtn = document.getElementById('exportCsvBtn');
  const exportJsonBtn = document.getElementById('exportJsonBtn');
  const triggerImportBtn = document.getElementById('triggerImportBtn');
  const importJsonInput = document.getElementById('importJsonInput');
  const clearAllDataBtn = document.getElementById('clearAllDataBtn');

  // Report Controls
  const reportTabDaily = document.getElementById('reportTabDaily');
  const reportTabMonthly = document.getElementById('reportTabMonthly');
  const reportMonthPickerWrapper = document.getElementById('reportMonthPickerWrapper');
  const reportYearPickerWrapper = document.getElementById('reportYearPickerWrapper');
  const reportMonthPicker = document.getElementById('reportMonthPicker');
  const reportYearPicker = document.getElementById('reportYearPicker');

  // Report Metrics & Chart Containers
  const repStat1Label = document.getElementById('repStat1Label');
  const repStat1Value = document.getElementById('repStat1Value');
  const repStat2Label = document.getElementById('repStat2Label');
  const repStat2Value = document.getElementById('repStat2Value');
  const repStat3Label = document.getElementById('repStat3Label');
  const repStat3Value = document.getElementById('repStat3Value');
  const barChartTitle = document.getElementById('barChartTitle');
  const reportBarCanvas = document.getElementById('reportBarCanvas');
  const reportDonutWrapper = document.getElementById('reportDonutWrapper');
  const reportChartLegend = document.getElementById('reportChartLegend');
  const dashDonutWrapper = document.getElementById('dashDonutWrapper');
  const dashChartLegend = document.getElementById('dashChartLegend');
  const reportTableBody = document.getElementById('reportTableBody');
  const tableReportTitle = document.getElementById('tableReportTitle');
  const thPeriodCol = document.getElementById('thPeriodCol');

  let currentTab = 'dashboard';
  let reportMode = 'daily'; // 'daily' or 'monthly'
  let authMode = 'login';

  function updateAuthUi() {
    if (!authModalTitle || !authSubmitBtn || !authModeToggleBtn || !authNameGroup) return;

    if (authMode === 'login') {
      authModalTitle.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Đăng nhập';
      authSubmitBtn.textContent = 'Đăng nhập';
      authModeToggleBtn.textContent = 'Tạo tài khoản';
      authNameGroup.classList.add('hidden');
    } else {
      authModalTitle.innerHTML = '<i class="fa-solid fa-user-plus"></i> Đăng ký';
      authSubmitBtn.textContent = 'Đăng ký';
      authModeToggleBtn.textContent = 'Đã có tài khoản';
      authNameGroup.classList.remove('hidden');
    }
  }

  async function syncUserData() {
    const supabase = window.appSupabase;
    if (!supabase || !supabase.isReady()) {
      return;
    }

    const session = await supabase.getSession();
    if (!session) {
      if (authActionBtn) authActionBtn.textContent = 'Đăng nhập';
      return;
    }

    if (authActionBtn) {
      authActionBtn.textContent = 'Đăng xuất';
    }

    await store.initFromSupabase();
  }

  // --- INITIALIZATION ---
  function init() {
    updateCurrentDateDisplay();
    populateCategoryFilterDropdown();
    populateYearPickerDropdown();

    // Default report view and selectors
    const currentYear = new Date().getFullYear().toString();
    if (reportMonthPicker) {
      reportMonthPicker.value = getCurrentMonthString();
    }
    if (reportYearPicker) {
      reportYearPicker.value = currentYear;
    }
    reportMode = 'daily';
    if (reportTabDaily) reportTabDaily.classList.add('active');
    if (reportTabMonthly) reportTabMonthly.classList.remove('active');
    if (reportMonthPickerWrapper) reportMonthPickerWrapper.classList.remove('hidden');
    if (reportYearPickerWrapper) reportYearPickerWrapper.classList.add('hidden');

    // Subscribe to store updates
    store.subscribe(() => {
      renderAll();
    });

    renderAll();
    updateAuthUi();
    setupEventListeners();
    syncUserData();
  }

  function updateCurrentDateDisplay() {
    if (currentDateSubtitle) {
      const now = new Date();
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      currentDateSubtitle.textContent = `Hôm nay: ${now.toLocaleDateString('vi-VN', options)}`;
    }
  }

  function populateCategoryFilterDropdown() {
    if (!filterCategory) return;
    filterCategory.replaceChildren();

    const optAll = document.createElement('option');
    optAll.value = 'all';
    optAll.textContent = 'Tất cả danh mục';
    filterCategory.appendChild(optAll);

    const allCats = [...CATEGORIES.expense, ...CATEGORIES.income];
    allCats.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.name;
      opt.textContent = cat.name;
      filterCategory.appendChild(opt);
    });
  }

  function populateYearPickerDropdown() {
    if (!reportYearPicker) return;
    reportYearPicker.replaceChildren();
    const currentYear = new Date().getFullYear();
    for (let y = currentYear; y >= currentYear - 5; y--) {
      const opt = document.createElement('option');
      opt.value = y.toString();
      opt.textContent = `Năm ${y}`;
      reportYearPicker.appendChild(opt);
    }
  }

  // --- RENDER ALL ENGINE ---
  function renderAll() {
    renderDashboardMetrics();
    renderFilteredTransactions();
    renderReports();
  }

  // --- 1. RENDER DASHBOARD METRICS ---
  function renderDashboardMetrics() {
    const metrics = store.getMetrics(getCurrentMonthString());

    if (metricTotalBalance) metricTotalBalance.textContent = formatVND(metrics.balance);
    if (metricTotalIncome) metricTotalIncome.textContent = formatVND(metrics.totalIncome);
    if (metricIncomeCount) metricIncomeCount.textContent = `${metrics.incomeCount} khoản thu`;
    if (metricTotalExpense) metricTotalExpense.textContent = formatVND(metrics.totalExpense);
    if (metricExpenseCount) metricExpenseCount.textContent = `${metrics.expenseCount} khoản chi`;
    
    if (metricSavingsRate) metricSavingsRate.textContent = `${metrics.savingsRate}%`;
    if (metricSavingsProgress) metricSavingsProgress.style.width = `${metrics.savingsRate}%`;

    // Render Recent Transactions (Top 5)
    const recent = store.getTransactions().slice(0, 5);
    dashRecentTxList.replaceChildren();

    if (recent.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'text-muted text-center padding-lg';
      empty.textContent = 'Chưa có giao dịch nào được ghi chép.';
      dashRecentTxList.appendChild(empty);
    } else {
      recent.forEach(tx => {
        const itemNode = ui.createTransactionItemNode(
          tx,
          (t) => ui.openTxModal(t),
          (id) => ui.openConfirmModal(id, 'Xác nhận xóa giao dịch này?', (delId) => {
            store.deleteTransaction(delId);
            ui.showToast('Đã xóa giao dịch thành công', 'success');
          })
        );
        dashRecentTxList.appendChild(itemNode);
      });
    }

    // Render Dashboard Donut Chart (Current Month Expenses)
    const currentMonthTxs = store.getTransactions().filter(t => t.type === 'expense' && t.date.startsWith(getCurrentMonthString()));
    const catTotals = {};
    let monthTotalExp = 0;
    currentMonthTxs.forEach(t => {
      catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
      monthTotalExp += t.amount;
    });

    renderDonutChart(dashDonutWrapper, dashChartLegend, catTotals, monthTotalExp);
  }

  // --- 2. RENDER FILTERED TRANSACTIONS LIST ---
  function getFilteredTransactions() {
    let txs = store.getTransactions();

    // 1. Search filter
    const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
    if (query) {
      txs = txs.filter(t => 
        (t.note || '').toLowerCase().includes(query) ||
        (t.category || '').toLowerCase().includes(query) ||
        (t.payment || '').toLowerCase().includes(query)
      );
    }

    // 2. Type filter
    const typeVal = filterType ? filterType.value : 'all';
    if (typeVal !== 'all') {
      txs = txs.filter(t => t.type === typeVal);
    }

    // 3. Category filter
    const catVal = filterCategory ? filterCategory.value : 'all';
    if (catVal !== 'all') {
      txs = txs.filter(t => t.category === catVal);
    }

    // 4. Time filter
    const timeVal = filterTime ? filterTime.value : 'this_month';
    const todayStr = getTodayString();
    const thisMonthStr = getCurrentMonthString();

    if (timeVal === 'today') {
      txs = txs.filter(t => t.date === todayStr);
    } else if (timeVal === 'this_month') {
      txs = txs.filter(t => t.date.startsWith(thisMonthStr));
    } else if (timeVal === 'last_month') {
      const now = new Date();
      now.setMonth(now.getMonth() - 1);
      const lastMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      txs = txs.filter(t => t.date.startsWith(lastMonthStr));
    } else if (timeVal === 'this_week') {
      const now = new Date();
      const firstDay = new Date(now.setDate(now.getDate() - now.getDay() + 1));
      const firstDayStr = firstDay.toISOString().split('T')[0];
      txs = txs.filter(t => t.date >= firstDayStr);
    }

    // 5. Sorting
    const sortVal = sortOrder ? sortOrder.value : 'date_desc';
    if (sortVal === 'date_desc') {
      txs.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortVal === 'date_asc') {
      txs.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortVal === 'amount_desc') {
      txs.sort((a, b) => b.amount - a.amount);
    } else if (sortVal === 'amount_asc') {
      txs.sort((a, b) => a.amount - b.amount);
    }

    return txs;
  }

  function renderFilteredTransactions() {
    if (!txMainList) return;

    const filtered = getFilteredTransactions();
    txMainList.replaceChildren();

    // Summary calculation
    let totalInc = 0;
    let totalExp = 0;

    filtered.forEach(t => {
      if (t.type === 'income') totalInc += t.amount;
      else totalExp += t.amount;
    });

    if (matchingCount) matchingCount.textContent = filtered.length;
    if (summaryIncome) summaryIncome.textContent = formatVND(totalInc);
    if (summaryExpense) summaryExpense.textContent = formatVND(totalExp);

    if (filtered.length === 0) {
      const emptyBox = document.createElement('div');
      emptyBox.className = 'content-card padding-lg text-center';
      
      const icon = document.createElement('div');
      icon.className = 'text-muted margin-bottom-sm';
      icon.innerHTML = '<i class="fa-solid fa-folder-open fa-3x"></i>';

      const title = document.createElement('h3');
      title.textContent = 'Không tìm thấy giao dịch nào';

      const desc = document.createElement('p');
      desc.className = 'text-muted font-size-sm';
      desc.textContent = 'Thử thay đổi bộ lọc tìm kiếm hoặc thêm khoản thu chi mới.';

      emptyBox.appendChild(icon);
      emptyBox.appendChild(title);
      emptyBox.appendChild(desc);

      txMainList.appendChild(emptyBox);
      return;
    }

    // Group transactions by Date
    const grouped = {};
    filtered.forEach(t => {
      if (!grouped[t.date]) grouped[t.date] = [];
      grouped[t.date].push(t);
    });

    Object.keys(grouped).forEach(dateStr => {
      const groupCard = document.createElement('div');
      groupCard.className = 'content-card margin-bottom-md';

      const groupHeader = document.createElement('div');
      groupHeader.className = 'card-header';
      groupHeader.style.padding = '0.75rem 1.25rem';
      groupHeader.style.background = 'var(--bg-secondary)';

      const dateLabel = document.createElement('h4');
      dateLabel.style.fontSize = '0.9rem';
      dateLabel.style.fontWeight = '700';
      dateLabel.innerHTML = `<i class="fa-regular fa-calendar"></i> ${formatDateVN(dateStr)}`;

      // Calculate daily balance total
      let dayExp = 0;
      let dayInc = 0;
      grouped[dateStr].forEach(t => {
        if (t.type === 'income') dayInc += t.amount;
        else dayExp += t.amount;
      });

      const daySummary = document.createElement('span');
      daySummary.className = 'text-muted font-size-xs';
      daySummary.style.fontSize = '0.8rem';
      daySummary.textContent = `Thu: +${formatVND(dayInc)} | Chi: -${formatVND(dayExp)}`;

      groupHeader.appendChild(dateLabel);
      groupHeader.appendChild(daySummary);

      const groupBody = document.createElement('div');
      groupBody.className = 'card-body tx-list-container';
      groupBody.style.padding = '0.9rem';

      grouped[dateStr].forEach(tx => {
        const itemNode = ui.createTransactionItemNode(
          tx,
          (t) => ui.openTxModal(t),
          (id) => ui.openConfirmModal(id, 'Bạn chắc chắn muốn xoá giao dịch này?', (delId) => {
            store.deleteTransaction(delId);
            ui.showToast('Đã xóa giao dịch thành công', 'success');
          })
        );
        groupBody.appendChild(itemNode);
      });

      groupCard.appendChild(groupHeader);
      groupCard.appendChild(groupBody);

      txMainList.appendChild(groupCard);
    });
  }

  // --- 3. RENDER REPORTS & ANALYTICS ---
  function renderReports() {
    const allTxs = store.getTransactions();

    if (reportMode === 'daily') {
      const selectedMonth = reportMonthPicker ? reportMonthPicker.value : getCurrentMonthString();
      const monthTxs = allTxs.filter(t => t.date.startsWith(selectedMonth));
      const daysInMonth = new Date(selectedMonth.split('-')[0], selectedMonth.split('-')[1], 0).getDate();

      const dailyTotals = {};
      const dailyIncomeTotals = {};
      for (let d = 1; d <= daysInMonth; d++) {
        const dayKey = `${selectedMonth}-${String(d).padStart(2, '0')}`;
        dailyTotals[dayKey] = 0;
        dailyIncomeTotals[dayKey] = 0;
      }

      let totalMonthExp = 0;
      let maxExpenseDay = '--';
      let maxExpenseVal = 0;
      const catTotals = {};

      monthTxs.forEach(t => {
        if (t.type === 'expense') {
          dailyTotals[t.date] = (dailyTotals[t.date] || 0) + t.amount;
          catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
          totalMonthExp += t.amount;

          if (dailyTotals[t.date] > maxExpenseVal) {
            maxExpenseVal = dailyTotals[t.date];
            maxExpenseDay = formatDateVN(t.date);
          }
        } else {
          dailyIncomeTotals[t.date] = (dailyIncomeTotals[t.date] || 0) + t.amount;
        }
      });

      const avgDaily = daysInMonth > 0 ? Math.round(totalMonthExp / daysInMonth) : 0;

      if (repStat1Label) repStat1Label.textContent = `Tổng Chi Tiêu (${selectedMonth})`;
      if (repStat1Value) repStat1Value.textContent = formatVND(totalMonthExp);
      if (repStat2Label) repStat2Label.textContent = `Trung Bình / Ngày (${daysInMonth} Ngày)`;
      if (repStat2Value) repStat2Value.textContent = formatVND(avgDaily);
      if (repStat3Label) repStat3Label.textContent = `Ngày Chi Nhiều Nhất`;
      if (repStat3Value) repStat3Value.textContent = maxExpenseVal > 0 ? `${maxExpenseDay} (${formatVND(maxExpenseVal)})` : '--';

      if (barChartTitle) barChartTitle.innerHTML = `<i class="fa-solid fa-chart-column"></i> Biểu Đồ Thu Chi Ngày (${selectedMonth})`;

      const labels = Object.keys(dailyTotals).map(d => d.split('-')[2]);
      const expSeries = Object.values(dailyTotals);
      const incSeries = Object.values(dailyIncomeTotals);

      renderBarChart(reportBarCanvas, labels, incSeries, expSeries);
      renderDonutChart(reportDonutWrapper, reportChartLegend, catTotals, totalMonthExp);
      renderReportTable(dailyTotals, dailyIncomeTotals, 'daily');

    } else {
      const selectedYear = reportYearPicker ? reportYearPicker.value : new Date().getFullYear().toString();
      const yearTxs = allTxs.filter(t => t.date.startsWith(selectedYear));

      const monthlyExpTotals = {};
      const monthlyIncTotals = {};
      const catTotals = {};

      for (let m = 1; m <= 12; m++) {
        const mKey = `${selectedYear}-${String(m).padStart(2, '0')}`;
        monthlyExpTotals[mKey] = 0;
        monthlyIncTotals[mKey] = 0;
      }

      let totalYearExp = 0;
      let maxMonth = '--';
      let maxMonthVal = 0;

      yearTxs.forEach(t => {
        const mKey = t.date.substring(0, 7);
        if (t.type === 'expense') {
          monthlyExpTotals[mKey] = (monthlyExpTotals[mKey] || 0) + t.amount;
          catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
          totalYearExp += t.amount;

          if (monthlyExpTotals[mKey] > maxMonthVal) {
            maxMonthVal = monthlyExpTotals[mKey];
            maxMonth = `Tháng ${mKey.split('-')[1]}/${selectedYear}`;
          }
        } else {
          monthlyIncTotals[mKey] = (monthlyIncTotals[mKey] || 0) + t.amount;
        }
      });

      const avgMonthly = Math.round(totalYearExp / 12);

      if (repStat1Label) repStat1Label.textContent = `Tổng Chi Tiêu Năm ${selectedYear}`;
      if (repStat1Value) repStat1Value.textContent = formatVND(totalYearExp);
      if (repStat2Label) repStat2Label.textContent = `Trung Bình / Tháng`;
      if (repStat2Value) repStat2Value.textContent = formatVND(avgMonthly);
      if (repStat3Label) repStat3Label.textContent = `Tháng Chi Nhiều Nhất`;
      if (repStat3Value) repStat3Value.textContent = maxMonthVal > 0 ? `${maxMonth} (${formatVND(maxMonthVal)})` : '--';

      if (barChartTitle) barChartTitle.innerHTML = `<i class="fa-solid fa-chart-column"></i> Biểu Đồ Thu Chi Các Tháng Trong Năm ${selectedYear}`;

      const labels = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
      const expSeries = Object.values(monthlyExpTotals);
      const incSeries = Object.values(monthlyIncTotals);

      renderBarChart(reportBarCanvas, labels, incSeries, expSeries);
      renderDonutChart(reportDonutWrapper, reportChartLegend, catTotals, totalYearExp);
      renderReportTable(monthlyExpTotals, monthlyIncTotals, 'monthly');
    }
  }

  function renderReportTable(expMap, incMap, mode) {
    if (!reportTableBody) return;
    reportTableBody.replaceChildren();

    if (thPeriodCol) thPeriodCol.textContent = mode === 'daily' ? 'Ngày' : 'Tháng';
    if (tableReportTitle) tableReportTitle.innerHTML = `<i class="fa-solid fa-table-list"></i> Bảng Chi Tiết Thu Chi (${mode === 'daily' ? 'Hàng Ngày' : 'Hàng Tháng'})`;

    const keys = Object.keys(expMap).sort().reverse();

    keys.forEach(k => {
      const exp = expMap[k] || 0;
      const inc = incMap[k] || 0;

      const tr = document.createElement('tr');

      const tdPeriod = document.createElement('td');
      tdPeriod.style.fontWeight = '700';
      tdPeriod.textContent = mode === 'daily' ? formatDateVN(k) : `Tháng ${k.split('-')[1]}/${k.split('-')[0]}`;

      const tdInc = document.createElement('td');
      tdInc.className = 'text-right text-success';
      tdInc.textContent = inc > 0 ? `+${formatVND(inc)}` : '0 ₫';

      const tdExp = document.createElement('td');
      tdExp.className = 'text-right text-danger';
      tdExp.textContent = exp > 0 ? `-${formatVND(exp)}` : '0 ₫';

      const diff = inc - exp;
      const tdDiff = document.createElement('td');
      tdDiff.className = `text-right ${diff >= 0 ? 'text-success' : 'text-danger'}`;
      tdDiff.style.fontWeight = '700';
      tdDiff.textContent = `${diff >= 0 ? '+' : ''}${formatVND(diff)}`;

      const tdAction = document.createElement('td');
      tdAction.className = 'text-center';

      const filterBtn = document.createElement('button');
      filterBtn.className = 'btn-text-only';
      filterBtn.innerHTML = '<i class="fa-solid fa-filter"></i> Xem';
      filterBtn.addEventListener('click', () => {
        switchTab('transactions');
        if (filterTime) filterTime.value = 'all';
        if (searchInput) searchInput.value = mode === 'daily' ? formatDateVN(k) : k;
        renderFilteredTransactions();
      });

      tdAction.appendChild(filterBtn);

      tr.appendChild(tdPeriod);
      tr.appendChild(tdInc);
      tr.appendChild(tdExp);
      tr.appendChild(tdDiff);
      tr.appendChild(tdAction);

      reportTableBody.appendChild(tr);
    });
  }

  // --- TAB SWITCHING ---
  function switchTab(targetTab) {
    currentTab = targetTab;
    navButtons.forEach(btn => {
      if (btn.dataset.tab === targetTab) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    tabPanels.forEach(panel => {
      if (panel.id === `tab-${targetTab}`) {
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
    renderAll();
  }

  // --- EVENT LISTENERS BINDING ---
  function setupEventListeners() {
    // Nav Tab Buttons
    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        switchTab(btn.dataset.tab);
      });
    });

    // Brand Logo click -> Dashboard
    const brandLogoBtn = document.getElementById('brandLogoBtn');
    if (brandLogoBtn) {
      brandLogoBtn.addEventListener('click', (e) => {
        e.preventDefault();
        switchTab('dashboard');
      });
    }

    // Quick Action Buttons
    const viewFullReportBtn = document.getElementById('viewFullReportBtn');
    if (viewFullReportBtn) viewFullReportBtn.addEventListener('click', () => switchTab('reports'));

    const viewAllTxBtn = document.getElementById('viewAllTxBtn');
    if (viewAllTxBtn) viewAllTxBtn.addEventListener('click', () => switchTab('transactions'));

    // Open Modal Triggers
    if (headerAddTxBtn) headerAddTxBtn.addEventListener('click', () => ui.openTxModal());
    if (txAddBtn) txAddBtn.addEventListener('click', () => ui.openTxModal());
    if (mobileFabBtn) mobileFabBtn.addEventListener('click', () => ui.openTxModal());

    if (authActionBtn) {
      authActionBtn.addEventListener('click', async () => {
        const supabase = window.appSupabase;
        if (!supabase || !supabase.isReady()) {
          ui.showToast('Supabase chưa được cấu hình. Vui lòng cập nhật supabase-config.js.', 'danger');
          return;
        }

        const session = await supabase.getSession();
        if (session) {
          await supabase.signOut();
          ui.showToast('Bạn đã đăng xuất.', 'success');
          authActionBtn.textContent = 'Đăng nhập';
          return;
        }

        authMode = 'login';
        updateAuthUi();
        authModal.classList.remove('hidden');
      });
    }

    if (authModalCloseBtn) authModalCloseBtn.addEventListener('click', () => authModal.classList.add('hidden'));

    if (authModeToggleBtn) {
      authModeToggleBtn.addEventListener('click', () => {
        authMode = authMode === 'login' ? 'signup' : 'login';
        updateAuthUi();
      });
    }

    if (authForm) {
      authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const supabase = window.appSupabase;
        if (!supabase || !supabase.isReady()) {
          ui.showToast('Supabase chưa được cấu hình. Vui lòng cập nhật supabase-config.js.', 'danger');
          return;
        }

        const email = authEmail.value.trim();
        const password = authPassword.value.trim();
        const fullName = authFullName ? authFullName.value.trim() : '';

        if (!email || !password) {
          ui.showToast('Vui lòng nhập email và mật khẩu.', 'danger');
          return;
        }

        if (authMode === 'signup') {
          const { data, error } = await supabase.signUp({ email, password, full_name: fullName });
          if (error) {
            ui.showToast(error.message || 'Đăng ký thất bại.', 'danger');
            return;
          }
          ui.showToast('Đăng ký thành công! Kiểm tra email để xác nhận.', 'success');
          authModal.classList.add('hidden');
          authForm.reset();
          return;
        }

        const { data, error } = await supabase.signIn({ email, password });
        if (error) {
          ui.showToast(error.message || 'Đăng nhập thất bại.', 'danger');
          return;
        }

        ui.showToast('Đăng nhập thành công!', 'success');
        authModal.classList.add('hidden');
        authForm.reset();
        await syncUserData();
      });
    }

    // Preset Chips
    document.querySelectorAll('.preset-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const cat = chip.dataset.category;
        const type = chip.dataset.type;
        ui.openTxModal(null, cat, type);
      });
    });

    // Close Modal Triggers
    if (txModalCloseBtn) txModalCloseBtn.addEventListener('click', () => ui.closeTxModal());
    if (txModalCancelBtn) txModalCancelBtn.addEventListener('click', () => ui.closeTxModal());

    if (confirmModalCloseBtn) confirmModalCloseBtn.addEventListener('click', () => ui.closeConfirmModal());
    if (confirmModalCancelBtn) confirmModalCancelBtn.addEventListener('click', () => ui.closeConfirmModal());

    // Type Radio Change inside Modal
    if (radioExpense) {
      radioExpense.addEventListener('change', () => {
        typeExpenseLabel.className = 'type-option active-expense';
        typeIncomeLabel.className = 'type-option';
        ui.populateCategoryDropdown(txCategorySelect, 'expense');
      });
    }

    if (radioIncome) {
      radioIncome.addEventListener('change', () => {
        typeIncomeLabel.className = 'type-option active-income';
        typeExpenseLabel.className = 'type-option';
        ui.populateCategoryDropdown(txCategorySelect, 'income');
      });
    }

    // Live Amount Preview Formatting
    if (txAmountInput) {
      txAmountInput.addEventListener('input', () => {
        amountPreview.textContent = formatVND(txAmountInput.value);
      });
    }

    // Transaction Form Submit (Save / Update)
    if (txForm) {
      txForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('txFormId').value;
        const amount = document.getElementById('txAmount').value;
        const category = document.getElementById('txCategory').value;
        const date = document.getElementById('txDate').value;
        const payment = document.getElementById('txPayment').value;
        const note = document.getElementById('txNote').value;
        const type = document.querySelector('input[name="txType"]:checked').value;

        if (id) {
          // Update
          store.updateTransaction(id, { type, amount, category, date, payment, note });
          ui.showToast('Cập nhật giao dịch thành công!', 'success');
        } else {
          // Add
          store.addTransaction({ type, amount, category, date, payment, note });
          ui.showToast('Đã thêm giao dịch mới!', 'success');
        }

        ui.closeTxModal();
      });
    }

    // Realtime Search & Filters
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        if (clearSearchBtn) {
          if (searchInput.value.trim().length > 0) clearSearchBtn.classList.remove('hidden');
          else clearSearchBtn.classList.add('hidden');
        }
        renderFilteredTransactions();
      });
    }

    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearSearchBtn.classList.add('hidden');
        renderFilteredTransactions();
      });
    }

    if (filterType) filterType.addEventListener('change', renderFilteredTransactions);
    if (filterCategory) filterCategory.addEventListener('change', renderFilteredTransactions);
    if (filterTime) filterTime.addEventListener('change', renderFilteredTransactions);
    if (sortOrder) sortOrder.addEventListener('change', renderFilteredTransactions);

    // Report Mode Switcher
    if (reportTabDaily) {
      reportTabDaily.addEventListener('click', () => {
        reportMode = 'daily';
        reportTabDaily.classList.add('active');
        reportTabMonthly.classList.remove('active');
        reportMonthPickerWrapper.classList.remove('hidden');
        reportYearPickerWrapper.classList.add('hidden');
        renderReports();
      });
    }

    if (reportTabMonthly) {
      reportTabMonthly.addEventListener('click', () => {
        reportMode = 'monthly';
        reportTabMonthly.classList.add('active');
        reportTabDaily.classList.remove('active');
        reportMonthPickerWrapper.classList.add('hidden');
        reportYearPickerWrapper.classList.remove('hidden');
        renderReports();
      });
    }

    if (reportMonthPicker) reportMonthPicker.addEventListener('change', renderReports);
    if (reportYearPicker) reportYearPicker.addEventListener('change', renderReports);

    // Theme Switcher Toggle
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.body.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('so_chi_tieu_theme', newTheme);
        ui.showToast(`Đã chuyển sang giao diện ${newTheme === 'dark' ? 'Tối' : 'Sáng'}`, 'info');
      });

      // Saved Theme preference
      const savedTheme = localStorage.getItem('so_chi_tieu_theme');
      if (savedTheme) {
        document.body.setAttribute('data-theme', savedTheme);
      }
    }

    // Data Management Buttons
    if (loadSampleDataBtn) {
      loadSampleDataBtn.addEventListener('click', () => {
        store.loadSampleData();
        ui.showToast('Nạp dữ liệu mẫu thành công!', 'success');
      });
    }

    if (exportCsvBtn) {
      exportCsvBtn.addEventListener('click', () => {
        const success = exportToCSV(store.getTransactions());
        if (success) ui.showToast('Đã xuất file CSV thành công!', 'success');
        else ui.showToast('Không có dữ liệu để xuất!', 'danger');
      });
    }

    if (exportJsonBtn) {
      exportJsonBtn.addEventListener('click', () => {
        const success = exportToJSON(store.getTransactions());
        if (success) ui.showToast('Đã xuất file JSON backup!', 'success');
      });
    }

    if (triggerImportBtn && importJsonInput) {
      triggerImportBtn.addEventListener('click', () => importJsonInput.click());

      importJsonInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target.result);
            const count = store.importData(data);
            if (count > 0) {
              ui.showToast(`Đã phục hồi ${count} giao dịch thành công!`, 'success');
            } else {
              ui.showToast('Định dạng tệp JSON không hợp lệ!', 'danger');
            }
          } catch (err) {
            ui.showToast('Lỗi đọc tệp JSON!', 'danger');
          }
        };
        reader.readAsText(file);
      });
    }

    if (clearAllDataBtn) {
      clearAllDataBtn.addEventListener('click', () => {
        ui.openConfirmModal('ALL', '⚠️ Bạn có chắc chắn muốn xoá toàn bộ dữ liệu khỏi trình duyệt?', () => {
          store.clearAllData();
          ui.showToast('Đã xoá toàn bộ dữ liệu', 'info');
        });
      });
    }
  }

  // Start application
  init();
});
