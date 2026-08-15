/**
 * UI Service - Safe DOM Manipulation, Modals, Toast Notifications & Views
 */

class UIService {
  constructor() {
    this.toastContainer = document.getElementById('toastContainer');
    this.txModal = document.getElementById('txModal');
    this.confirmModal = document.getElementById('confirmModal');
    this.pendingDeleteId = null;
  }

  /**
   * Shows a toast notification cleanly
   */
  showToast(message, type = 'info') {
    if (!this.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icon = document.createElement('i');
    if (type === 'success') icon.className = 'fa-solid fa-circle-check text-success';
    else if (type === 'danger') icon.className = 'fa-solid fa-circle-xmark text-danger';
    else icon.className = 'fa-solid fa-circle-info text-info';

    const textSpan = document.createElement('span');
    textSpan.textContent = message;

    toast.appendChild(icon);
    toast.appendChild(textSpan);

    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(40px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  /**
   * Renders single transaction DOM element strictly with XSS-safe textContent
   */
  createTransactionItemNode(tx, onEdit, onDelete) {
    const isIncome = tx.type === 'income';
    const catInfo = getCategoryInfo(tx.category, tx.type);

    const item = document.createElement('div');
    item.className = 'tx-item';

    // Left block
    const left = document.createElement('div');
    left.className = 'tx-left';

    const iconBox = document.createElement('div');
    iconBox.className = 'tx-icon-box';
    iconBox.style.backgroundColor = isIncome ? 'var(--color-success-bg)' : 'var(--color-danger-bg)';
    iconBox.style.color = catInfo.color;

    const iconI = document.createElement('i');
    iconI.className = `fa-solid ${catInfo.icon}`;
    iconBox.appendChild(iconI);

    const details = document.createElement('div');
    details.className = 'tx-details';

    const catSpan = document.createElement('span');
    catSpan.className = 'tx-category';
    catSpan.textContent = tx.category;

    const subinfo = document.createElement('div');
    subinfo.className = 'tx-subinfo';

    const dateSpan = document.createElement('span');
    dateSpan.textContent = formatDateVN(tx.date);

    const paymentBadge = document.createElement('span');
    paymentBadge.className = 'tx-badge-payment';
    paymentBadge.textContent = tx.payment || 'Tiền mặt';

    subinfo.appendChild(dateSpan);
    subinfo.appendChild(paymentBadge);

    details.appendChild(catSpan);
    details.appendChild(subinfo);

    if (tx.note) {
      const noteSpan = document.createElement('span');
      noteSpan.className = 'tx-note';
      noteSpan.textContent = tx.note;
      details.appendChild(noteSpan);
    }

    left.appendChild(iconBox);
    left.appendChild(details);

    // Right block
    const right = document.createElement('div');
    right.className = 'tx-right';

    const amountSpan = document.createElement('span');
    amountSpan.className = `tx-amount ${isIncome ? 'text-success' : 'text-danger'}`;
    amountSpan.textContent = `${isIncome ? '+' : '-'}${formatVND(tx.amount)}`;

    const actions = document.createElement('div');
    actions.className = 'tx-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'tx-action-btn edit-btn';
    editBtn.ariaLabel = 'Sửa giao dịch';
    editBtn.title = 'Chỉnh sửa';
    editBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (onEdit) onEdit(tx);
    });

    const delBtn = document.createElement('button');
    delBtn.className = 'tx-action-btn delete-btn';
    delBtn.ariaLabel = 'Xoá giao dịch';
    delBtn.title = 'Xóa';
    delBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (onDelete) onDelete(tx.id);
    });

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    right.appendChild(amountSpan);
    right.appendChild(actions);

    item.appendChild(left);
    item.appendChild(right);

    return item;
  }

  /**
   * Renders category select dropdown options based on Expense or Income mode
   */
  populateCategoryDropdown(selectEl, type = 'expense') {
    selectEl.replaceChildren();
    const categories = CATEGORIES[type] || CATEGORIES.expense;

    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.name;
      opt.textContent = cat.name;
      selectEl.appendChild(opt);
    });
  }

  /**
   * Opens the Transaction Add/Edit Modal
   */
  openTxModal(txToEdit = null, presetCategory = null, presetType = 'expense') {
    const form = document.getElementById('txForm');
    const title = document.getElementById('modalTxTitle');
    const formId = document.getElementById('txFormId');
    const amountInput = document.getElementById('txAmount');
    const dateInput = document.getElementById('txDate');
    const categorySelect = document.getElementById('txCategory');
    const paymentSelect = document.getElementById('txPayment');
    const noteInput = document.getElementById('txNote');
    const preview = document.getElementById('amountPreview');

    const radioExpense = document.getElementById('txTypeExpense');
    const radioIncome = document.getElementById('txTypeIncome');
    const labelExpense = document.getElementById('typeExpenseLabel');
    const labelIncome = document.getElementById('typeIncomeLabel');

    if (txToEdit) {
      // Edit mode
      title.replaceChildren();
      const icon = document.createElement('i');
      icon.className = 'fa-solid fa-pen-to-square';
      title.appendChild(icon);
      title.appendChild(document.createTextNode(' Cập Nhật Giao Dịch'));

      formId.value = txToEdit.id;
      amountInput.value = txToEdit.amount;
      dateInput.value = txToEdit.date;
      noteInput.value = txToEdit.note || '';
      paymentSelect.value = txToEdit.payment || 'Tiền mặt';

      if (txToEdit.type === 'income') {
        radioIncome.checked = true;
        labelIncome.className = 'type-option active-income';
        labelExpense.className = 'type-option';
        this.populateCategoryDropdown(categorySelect, 'income');
      } else {
        radioExpense.checked = true;
        labelExpense.className = 'type-option active-expense';
        labelIncome.className = 'type-option';
        this.populateCategoryDropdown(categorySelect, 'expense');
      }

      categorySelect.value = txToEdit.category;
      preview.textContent = formatVND(txToEdit.amount);

    } else {
      // Create mode
      title.replaceChildren();
      const icon = document.createElement('i');
      icon.className = 'fa-solid fa-plus';
      title.appendChild(icon);
      title.appendChild(document.createTextNode(' Thêm Giao Dịch Mới'));

      form.reset();
      formId.value = '';
      dateInput.value = getTodayString();

      const type = presetType || 'expense';
      if (type === 'income') {
        radioIncome.checked = true;
        labelIncome.className = 'type-option active-income';
        labelExpense.className = 'type-option';
        this.populateCategoryDropdown(categorySelect, 'income');
      } else {
        radioExpense.checked = true;
        labelExpense.className = 'type-option active-expense';
        labelIncome.className = 'type-option';
        this.populateCategoryDropdown(categorySelect, 'expense');
      }

      if (presetCategory) {
        categorySelect.value = presetCategory;
      }
      preview.textContent = '0 VNĐ';
    }

    this.txModal.classList.remove('hidden');
    amountInput.focus();
  }

  /**
   * Closes the transaction modal
   */
  closeTxModal() {
    this.txModal.classList.add('hidden');
  }

  /**
   * Opens delete confirmation modal
   */
  openConfirmModal(id, message, onConfirm) {
    this.pendingDeleteId = id;
    const messageEl = document.getElementById('confirmModalMessage');
    messageEl.textContent = message || 'Bạn có chắc chắn muốn xóa giao dịch này?';

    const okBtn = document.getElementById('confirmModalOkBtn');
    const newOkBtn = okBtn.cloneNode(true);
    okBtn.parentNode.replaceChild(newOkBtn, okBtn);

    newOkBtn.addEventListener('click', () => {
      if (onConfirm) onConfirm(this.pendingDeleteId);
      this.closeConfirmModal();
    });

    this.confirmModal.classList.remove('hidden');
  }

  /**
   * Closes delete confirmation modal
   */
  closeConfirmModal() {
    this.confirmModal.classList.add('hidden');
    this.pendingDeleteId = null;
  }
}

window.appUI = new UIService();
