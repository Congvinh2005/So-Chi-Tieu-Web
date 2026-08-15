/**
 * Utility functions for currency formatting, date manipulation, export/import & XSS prevention
 */

const CATEGORIES = {
  expense: [
    { name: 'Ăn uống', icon: 'fa-utensils', color: '#ef4444' },
    { name: 'Di chuyển', icon: 'fa-gas-pump', color: '#f59e0b' },
    { name: 'Mua sắm', icon: 'fa-bag-shopping', color: '#ec4899' },
    { name: 'Hóa đơn & Tiện ích', icon: 'fa-file-invoice-dollar', color: '#3b82f6' },
    { name: 'Giải trí', icon: 'fa-gamepad', color: '#8b5cf6' },
    { name: 'Sức khỏe', icon: 'fa-heart-pulse', color: '#10b981' },
    { name: 'Giáo dục', icon: 'fa-graduation-cap', color: '#06b6d4' },
    { name: 'Chi khác', icon: 'fa-ellipsis-h', color: '#64748b' }
  ],
  income: [
    { name: 'Lương', icon: 'fa-hand-holding-dollar', color: '#10b981' },
    { name: 'Thưởng', icon: 'fa-gift', color: '#f59e0b' },
    { name: 'Đầu tư', icon: 'fa-chart-line', color: '#6366f1' },
    { name: 'Bán hàng', icon: 'fa-store', color: '#8b5cf6' },
    { name: 'Thu khác', icon: 'fa-coins', color: '#06b6d4' }
  ]
};

/**
 * Formats a raw number to Vietnamese Dong currency format (e.g. 150.000 ₫)
 */
function formatVND(amount) {
  const value = Number(amount) || 0;
  return new Intl.NumberFormat('vi-VN').format(value) + ' ₫';
}

/**
 * Returns today's date string in YYYY-MM-DD format for HTML date inputs
 */
function getTodayString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns current YYYY-MM string for month inputs
 */
function getCurrentMonthString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Formats YYYY-MM-DD date string to Vietnamese friendly format (DD/MM/YYYY)
 */
function formatDateVN(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

/**
 * Gets category metadata (icon class, color) by category name
 */
function getCategoryInfo(categoryName, type = 'expense') {
  const list = CATEGORIES[type] || [...CATEGORIES.expense, ...CATEGORIES.income];
  const found = list.find(c => c.name === categoryName);
  if (found) return found;
  
  // Fallback check in other list if not matched
  const altList = type === 'expense' ? CATEGORIES.income : CATEGORIES.expense;
  const altFound = altList.find(c => c.name === categoryName);
  if (altFound) return altFound;

  return { name: categoryName, icon: 'fa-tag', color: '#6366f1' };
}

/**
 * Generates a safe unique ID
 */
function generateId() {
  return 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
}

/**
 * Escapes HTML characters to prevent XSS vulnerabilities when generating strings
 */
function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Exports transaction list to CSV format for Excel downloads
 */
function exportToCSV(transactions) {
  if (!transactions || transactions.length === 0) {
    return false;
  }
  
  const headers = ['Mã Giao Dịch', 'Loại', 'Số Tiền (VNĐ)', 'Danh Mục', 'Ngày', 'Hình Thức Thanh Toán', 'Ghi Chú'];
  const rows = transactions.map(t => [
    t.id,
    t.type === 'expense' ? 'Chi Tiêu' : 'Thu Nhập',
    t.amount,
    `"${(t.category || '').replace(/"/g, '""')}"`,
    t.date,
    `"${(t.payment || '').replace(/"/g, '""')}"`,
    `"${(t.note || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `SoChiTieu_Export_${getTodayString()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
}

/**
 * Exports transactions to JSON format for data backup
 */
function exportToJSON(transactions) {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(transactions, null, 2));
  const a = document.createElement('a');
  a.href = dataStr;
  a.download = `SoChiTieu_Backup_${getTodayString()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  return true;
}
