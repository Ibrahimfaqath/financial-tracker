import { db } from '../db/index.js';
import { transactions } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';

const updateTransaction = async (c) => {
  try {
    const userId = c.get('user').id;
    const transactionId = Number(c.req.param('id'));
    const body = await c.req.json();

    if (isNaN(transactionId)) {
      return c.json({
        success: false,
        message: 'ID transaksi tidak valid'
      }, 400);
    }

    const {
      nominal,
      transactionDate,
      status,
      description
    } = body;

    const updateData = {};
    if (nominal != null) updateData.nominal = nominal;
    if (transactionDate != null) updateData.transactionDate = transactionDate;
    if (status != null) updateData.status = status;
    if (description != null) updateData.description = description;

    if (Object.keys(updateData).length === 0) {
      return c.json({
        success: false,
        message: 'Tidak ada data yang diupdate'
      }, 400);
    }

    const result = await db
      .update(transactions)
      .set(updateData)
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
      message: 'Transaksi berhasil diupdate'
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    return c.json({
      success: false,
      message: 'Gagal mengupdate transaksi'
    }, 500);
  }
};

export default updateTransaction;
