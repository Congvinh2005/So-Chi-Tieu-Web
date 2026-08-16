(async () => {
  const session = await window.appSupabase.getSession();
  if (!session) {
    console.log('Chưa đăng nhập, hãy login trước đã.');
    return;
  }

  const today = new Date().toISOString().slice(0, 10);

  const data = [
    { amount: 20000, note: 'food' },
    { amount: 13000, note: 'food' },
    { amount: 13000, note: 'food' },
    { amount: 8000, note: 'food' },
    { amount: 30000, note: 'food' },
    { amount: 20000, note: 'food' },
    { amount: 48000, note: 'food' },
    { amount: 6000, note: 'food' },
    { amount: 39000, note: 'food' },
    { amount: 50000, note: 'chả' },
    { amount: 10000, note: 'cà chua' },
    { amount: 110000, note: 'gà' },
    { amount: 33000, note: 'rau' },
    { amount: 10000, note: 'đậu' },
    { amount: 20000, note: 'rau' },
    { amount: 500000, note: 'ga' },
    { amount: 70000, note: 'bún bò' },
    { amount: 56000, note: 'mắm to' },
    { amount: 35000, note: 'trứng cà chua' },
    { amount: 5000, note: 'dưa muối' },
    { amount: 10000, note: 'rau, hành nếu' }
  ];

  const results = [];
  for (const item of data) {
    const payload = {
      type: 'expense',
      amount: Number(item.amount),
      category: 'Ăn uống',
      date: today,
      payment: 'Tiền mặt',
      note: item.note || ''
    };

    const { data: inserted, error } = await window.appSupabase.addTransaction(payload);

    if (error) {
      console.error('Lỗi insert:', payload, error);
    } else {
      results.push(inserted?.[0] || payload);
    }
  }

  console.log('Đã lưu vào Supabase:', results.length, 'dòng');
  console.log(results);
})();