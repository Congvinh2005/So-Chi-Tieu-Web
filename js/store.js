/**
 * Store - Reactive State Management & LocalStorage/Supabase Data Storage
 */

const STORAGE_KEY = 'so_chi_tieu_pro_tx_v1';

const SAMPLE_TRANSACTIONS = [
  { id: 'tx_sample_1', type: 'income', amount: 22000000, category: 'Lương', date: getTodayString(), payment: 'Chuyển khoản', note: 'Lương tháng hiện tại' },
  { id: 'tx_sample_2', type: 'expense', amount: 150000, category: 'Ăn uống', date: getTodayString(), payment: 'Ví điện tử', note: 'Ăn trưa & Cà phê phin' },
  { id: 'tx_sample_3', type: 'expense', amount: 650000, category: 'Mua sắm', date: getTodayString(), payment: 'Thẻ tín dụng', note: 'Mua quần áo công sở' },
  { id: 'tx_sample_4', type: 'expense', amount: 1200000, category: 'Hóa đơn & Tiện ích', date: '2026-08-05', payment: 'Chuyển khoản', note: 'Tiền điện & internet FPT' },
  { id: 'tx_sample_5', type: 'expense', amount: 350000, category: 'Di chuyển', date: '2026-08-08', payment: 'Ví điện tử', note: 'Đổ xăng ô tô & xe máy' },
  { id: 'tx_sample_6', type: 'expense', amount: 450000, category: 'Giải trí', date: '2026-08-10', payment: 'Tiền mặt', note: 'Xem phim CGV cuối tuần' },
  { id: 'tx_sample_7', type: 'income', amount: 3500000, category: 'Thưởng', date: '2026-08-12', payment: 'Chuyển khoản', note: 'Thưởng dự án hoàn thành tốt' },
  { id: 'tx_sample_8', type: 'expense', amount: 800000, category: 'Sức khỏe', date: '2026-08-14', payment: 'Chuyển khoản', note: 'Mua thực phẩm chức năng & thuốc' },
  { id: 'tx_sample_9', type: 'expense', amount: 2000000, category: 'Giáo dục', date: '2026-08-01', payment: 'Chuyển khoản', note: 'Học phí khóa học Tiếng Anh' },
  { id: 'tx_sample_10', type: 'expense', amount: 120000, category: 'Ăn uống', date: '2026-08-02', payment: 'Tiền mặt', note: 'Cơm tấm sườn nướng' },
  { id: 'tx_sample_11', type: 'expense', amount: 500000, category: 'Chi khác', date: '2026-08-04', payment: 'Tiền mặt', note: 'Mừng cưới đồng nghiệp' },
  { id: 'tx_sample_12', type: 'income', amount: 1500000, category: 'Bán hàng', date: '2026-08-15', payment: 'Ví điện tử', note: 'Thanh lý tai nghe cũ' }
];

class Store {
  constructor() {
    this.transactions = this.loadFromStorage();
    this.listeners = [];
    this.syncPending = false;
  }

  async initFromSupabase() {
    const supabase = window.appSupabase;
    if (!supabase || !supabase.isReady()) return false;

    const session = await supabase.getSession();
    if (!session) return false;

    const remoteTxs = await supabase.listTransactions();
    this.transactions = Array.isArray(remoteTxs) ? remoteTxs : [];
    this.saveToStorage();
    this.notify();
    return true;
  }

  loadFromStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to load storage, using sample data:', e);
    }
    return [...SAMPLE_TRANSACTIONS];
  }

  saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.transactions));
    } catch (e) {
      console.error('Error saving data to localStorage:', e);
    }
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
  }

  notify() {
    this.listeners.forEach(cb => cb(this.transactions));
  }

  getTransactions() {
    return [...this.transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  getTransactionById(id) {
    return this.transactions.find(t => t.id === id);
  }

  async addTransaction(txData) {
    const supabase = window.appSupabase;
    if (!supabase || !supabase.isReady()) {
      return null;
    }

    const session = await supabase.getSession();
    if (!session) {
      return null;
    }

    const newTx = {
      id: generateId(),
      type: txData.type || 'expense',
      amount: Math.abs(Number(txData.amount)) || 0,
      category: txData.category || 'Chi khác',
      date: txData.date || getTodayString(),
      payment: txData.payment || 'Tiền mặt',
      note: txData.note || ''
    };

    const { data, error } = await supabase.addTransaction(newTx);
    if (!error && data && data[0]) {
      this.transactions = [
        { ...data[0], id: data[0].id || newTx.id },
        ...this.transactions.filter(item => item.id !== newTx.id)
      ];
      this.saveToStorage();
      return data[0];
    }

    return null;
  }

  async updateTransaction(id, updatedFields) {
    const supabase = window.appSupabase;
    if (!supabase || !supabase.isReady()) {
      return false;
    }

    const session = await supabase.getSession();
    if (!session) {
      return false;
    }

    const { data, error } = await supabase.updateTransaction(id, updatedFields);
    if (!error && data && data[0]) {
      this.transactions = this.transactions.map(tx => tx.id === id ? { ...tx, ...data[0] } : tx);
      this.saveToStorage();
      return true;
    }

    return false;
  }

  async deleteTransaction(id) {
    const supabase = window.appSupabase;
    if (!supabase || !supabase.isReady()) {
      return false;
    }

    const session = await supabase.getSession();
    if (!session) {
      return false;
    }

    const { error } = await supabase.deleteTransaction(id);
    if (!error) {
      this.transactions = this.transactions.filter(t => t.id !== id);
      this.saveToStorage();
      return true;
    }

    return false;
  }

  loadSampleData() {
    this.transactions = [...SAMPLE_TRANSACTIONS];
    this.saveToStorage();
  }

  clearAllData() {
    this.transactions = [];
    this.saveToStorage();
  }

  resetToGuestState() {
    this.transactions = [...SAMPLE_TRANSACTIONS];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.transactions));
    } catch (e) {
      console.error('Error restoring sample guest state:', e);
    }
    this.notify();
  }

  importData(dataArray) {
    if (Array.isArray(dataArray)) {
      const validItems = dataArray.filter(item => item && item.amount && item.category && item.date);
      if (validItems.length > 0) {
        this.transactions = validItems.map(item => ({
          id: item.id || generateId(),
          type: item.type === 'income' ? 'income' : 'expense',
          amount: Math.abs(Number(item.amount)),
          category: item.category,
          date: item.date,
          payment: item.payment || 'Tiền mặt',
          note: item.note || ''
        }));
        this.saveToStorage();
        return validItems.length;
      }
    }
    return 0;
  }

  getMetrics(monthStr = getCurrentMonthString()) {
    let balance = 0;
    let totalIncome = 0;
    let totalExpense = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    this.transactions.forEach(t => {
      const isCurrentMonth = t.date.startsWith(monthStr);
      if (t.type === 'income') {
        balance += t.amount;
        if (isCurrentMonth) {
          totalIncome += t.amount;
          incomeCount++;
        }
      } else {
        balance -= t.amount;
        if (isCurrentMonth) {
          totalExpense += t.amount;
          expenseCount++;
        }
      }
    });

    const netMonthly = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((netMonthly / totalIncome) * 100)) : 0;

    return {
      balance,
      totalIncome,
      totalExpense,
      incomeCount,
      expenseCount,
      savingsRate
    };
  }
}

window.appStore = new Store();
