import { db } from '../db/index.js';
import { transactions } from '../db/schema.js';

const addTransaction = async (c) => {
  try {
    const user = c.get('user');
    const { nominal, transactionDate, status, description } = await c.req.json();
    const newTransaction = await db.insert(transactions)
      .values({
        userId: user.id,
        nominal: nominal.toString(), // Simpan nominal sebagai string
        transactionDate: transactionDate,
        status: status,
        description: description
      })
      .returning();
    return c.json({ success: true, data: newTransaction[0] }, 201);
  } catch (error) {
    console.error("error", error);
    return c.json({ success: false, message: 'Gagal menambah transaksi' }, 400);
  }
}

export default addTransaction;