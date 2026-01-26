import { db } from '../db/index.js';
import { transactions } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';

const deleteTransaction = async (c) => {
  try {
    const userId = c.get('user').id; // dari authMiddleware
    const transactionId = Number(c.req.param('id'));

    if (isNaN(transactionId)) {
      return c.json({
        success: false,
        message: 'ID transaksi tidak valid'
      }, 400);
    }

    // pastikan transaksi milik user
    const result = await db
      .delete(transactions)
      .where(
        and(
          eq(transactions.id, transactionId),
          eq(transactions.userId, userId)
        )
      );

    if (result.rowsAffected === 0) {
      return c.json({
        success: false,
        message: 'Transaksi tidak ditemukan'
      }, 404);
    }

    return c.json({
      success: true,
      message: 'Transaksi berhasil dihapus'
    });
  } catch (error) {
    console.error('Delete transaction error:', error);
    return c.json({
      success: false,
      message: 'Gagal menghapus transaksi'
    }, 500);
  }
};

export default deleteTransaction;
