# Sổ Chi Tiêu Pro

Ứng dụng quản lý chi tiêu cá nhân chạy trên frontend thuần bằng HTML/CSS/JavaScript, với khả năng chuyển sang Supabase cho đăng nhập, đăng ký và lưu dữ liệu theo user.

## 1. Cài đặt nhanh

### Dùng local hiện tại

```bash
cd /Users/vinhdv/Tai_lieu/Clone/SoChiTieu
python3 -m http.server 8080
```

Mở trình duyệt: http://localhost:8080

---

## 2. Chuyển sang Supabase

### Bước 1: tạo project trên Supabase

- Vào https://supabase.com
- Tạo project mới
- Copy URL và anon key từ project settings > API

### Bước 2: cập nhật file cấu hình

Sửa file `supabase-config.js`:

```js
window.SUPABASE_CONFIG = {
  url: 'https://YOUR_PROJECT_REF.supabase.co',
  anonKey: 'YOUR_ANON_KEY'
};
```

### Bước 3: thêm bảng `transactions`

```sql
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  amount numeric not null check (amount >= 0),
  category text not null,
  date date not null,
  payment text default 'Tiền mặt',
  note text default '',
  created_at timestamptz not null default now()
);

alter table public.transactions enable row level security;

create policy "Users can view own transactions"
on public.transactions
for select
using (auth.uid() = user_id);

create policy "Users can insert own transactions"
on public.transactions
for insert
with check (auth.uid() = user_id);

create policy "Users can update own transactions"
on public.transactions
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own transactions"
on public.transactions
for delete
using (auth.uid() = user_id);
```

### Bước 4: thêm login/signup frontend

- Chạy app trên localhost
- Sử dụng Supabase Auth email/password
- Dùng `window.appSupabase.signUp(...)` hoặc `signIn(...)`

---

## 3. Khởi chạy app với Supabase

```bash
cd /Users/vinhdv/Tai_lieu/Clone/SoChiTieu
python3 -m http.server 8080
```

Mở: http://localhost:8080

---

## 4. Lưu ý

- App hiện tại vẫn giữ fallback `localStorage` nếu chưa cấu hình Supabase.
- Khi đã cấu hình Supabase, có thể tiếp tục mở rộng UI cho login/signup và chuyển CRUD từ localStorage sang Supabase API.

## 5. Gợi ý mở rộng tiếp theo

- Tạo màn hình đăng nhập / đăng ký riêng
- Sau khi login, `transactions` load từ database
- Thêm `user_id` vào mọi record
- Sử dụng RLS để user chỉ nhìn thấy dữ liệu của mình
- Thêm loading state khi đang sync dữ liệu
