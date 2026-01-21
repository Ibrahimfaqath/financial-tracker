import { db } from '../db/index.js';
import { transactions } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';

const seeTransaction = async (c) => {
  try {
    const user = c.get('user');
    const { year, month } = c.req.query(); // Ambil tahun dan bulan dari query string

    if (!year || !month) return c.json({ success: false, message: 'Tahun dan bulan wajib diisi' }, 400)

    // validasi 
    const yearNum = parseInt(year) || new Date().getFullYear();
    const monthNum = parseInt(month) || new Date().getMonth() + 1;

    // Filter  berdasarkan user_id DAN rentang bulan
    const startOfMonth = `${yearNum}-${String(monthNum).padStart(2, '0')}-01`;
    const endOfMonth = new Date(yearNum, monthNum, 1).toISOString().split('T')[0];

    const userTransactions = await db.query.transactions.findMany({
      where: (t, { eq, and, gte, lt }) => and(
        eq(t.userId, user.id),
        gte(t.transactionDate, startOfMonth),
        lt(t.transactionDate, endOfMonth)
      ),
      orderBy: desc(transactions.transactionDate),
    });

    // Hitung Total Laporan keuangan
    const totalIncome = userTransactions
      .filter(t => t.status === 'income')
      .reduce((sum, t) => sum + parseFloat(t.nominal), 0);

    const totalOutcome = userTransactions
      .filter(t => t.status === 'outcome')
      .reduce((sum, t) => sum + parseFloat(t.nominal), 0);

    const balance = totalIncome - totalOutcome;

    return c.json({
      success: true,
      data: userTransactions,
      summary: { totalIncome, totalOutcome, balance }
    });
  } catch (error) {
    console.error("error", error);
    return c.json({ success: false, message: 'Gagal mengambil transaksi' }, 500);
  }
}


export default seeTransaction;