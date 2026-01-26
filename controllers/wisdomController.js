import { db } from '../db/index.js';
import { eq, desc, sql } from 'drizzle-orm';

const wisdom = async (c) => {
  try {
    // Get random wisdom from database
    const wisdom = await db.query.financialWisdom.findFirst({
      orderBy: sql`RANDOM()`, // Random order
    });
    
    return c.json({ 
      success: true, 
      data: wisdom 
    });
  } catch (error) {
    console.error("Error getting wisdom:", error);
    return c.json({ 
      success: false, 
      message: 'Gagal mengambil nasihat' 
    }, 500);
  }
}

export default wisdom;