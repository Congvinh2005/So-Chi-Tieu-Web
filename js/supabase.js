(function () {
  const config = window.SUPABASE_CONFIG || {};
  const url = (config.url || '').trim();
  const anonKey = (config.anonKey || '').trim();

  class SupabaseService {
    constructor() {
      this.client = null;
      this.ready = false;

      if (url && anonKey && !url.includes('your-project') && !anonKey.includes('your-anon-key')) {
        this.client = window.supabase.createClient(url, anonKey);
        this.ready = true;
      }
    }

    isReady() {
      return Boolean(this.client);
    }

    async getSession() {
      if (!this.client) return null;
      const { data, error } = await this.client.auth.getSession();
      if (error) {
        console.error('Supabase getSession error:', error);
        return null;
      }
      return data.session;
    }

    async signUp({ email, password, full_name }) {
      if (!this.client) {
        return { data: null, error: new Error('Supabase chưa được cấu hình.') };
      }

      const { data, error } = await this.client.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: full_name || ''
          }
        }
      });

      return { data, error };
    }

    async signIn({ email, password }) {
      if (!this.client) {
        return { data: null, error: new Error('Supabase chưa được cấu hình.') };
      }

      const { data, error } = await this.client.auth.signInWithPassword({ email, password });
      return { data, error };
    }

    async signOut() {
      if (!this.client) return { error: null };
      return this.client.auth.signOut();
    }

    async getCurrentUser() {
      if (!this.client) return null;
      const { data, error } = await this.client.auth.getUser();
      if (error) {
        console.error('Supabase getCurrentUser error:', error);
        return null;
      }
      return data.user;
    }

    async updateProfile({ full_name }) {
      if (!this.client) return { data: null, error: new Error('Supabase chưa được cấu hình.') };
      return this.client.auth.updateUser({
        data: {
          full_name: full_name || ''
        }
      });
    }

    async updatePassword(password) {
      if (!this.client) return { data: null, error: new Error('Supabase chưa được cấu hình.') };
      return this.client.auth.updateUser({ password });
    }

    async listTransactions() {
      if (!this.client) return [];

      const { data: sessionData } = await this.client.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) return [];

      const { data, error } = await this.client
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Supabase listTransactions error:', error);
        return [];
      }

      return (data || []).map(row => ({
        id: row.id,
        type: row.type,
        amount: row.amount,
        category: row.category,
        date: row.date,
        payment: row.payment,
        note: row.note
      }));
    }

    async addTransaction(tx) {
      if (!this.client) return { data: null, error: new Error('Supabase chưa được cấu hình.') };

      const { data: sessionData } = await this.client.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) {
        return { data: null, error: new Error('Người dùng chưa đăng nhập.') };
      }

      const payload = {
        user_id: user.id,
        type: tx.type || 'expense',
        amount: Math.abs(Number(tx.amount || 0)),
        category: tx.category || 'Chi khác',
        date: tx.date || new Date().toISOString().slice(0, 10),
        payment: tx.payment || 'Tiền mặt',
        note: tx.note || ''
      };

      return this.client.from('transactions').insert(payload).select();
    }

    async updateTransaction(id, fields) {
      if (!this.client) return { data: null, error: new Error('Supabase chưa được cấu hình.') };

      const payload = {
        ...fields,
        amount: fields.amount !== undefined ? Math.abs(Number(fields.amount || 0)) : undefined
      };

      return this.client.from('transactions').update(payload).eq('id', id).select();
    }

    async deleteTransaction(id) {
      if (!this.client) return { data: null, error: new Error('Supabase chưa được cấu hình.') };
      return this.client.from('transactions').delete().eq('id', id);
    }
  }

  window.appSupabase = new SupabaseService();
})();
