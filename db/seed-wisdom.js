import 'dotenv/config';
import { db } from './index.js';
import { financialWisdom } from './schema.js';

async function seedWisdom() {
  console.log('Seeding financial wisdom...');
  
  await db.delete(financialWisdom);
  
  const wisdomData = [
    // QURAN VERSES
    {
      type: 'quran',
      text: 'Hai orang-orang beriman, infakkanlah sebagian dari rezeki yang telah Kami berikan kepadamu sebelum datang hari ketika tidak ada lagi jual beli, persahabatan, dan syafaat.',
      source: 'QS. Al-Baqarah: 254',
      theme: 'infaq'
    },
    {
      type: 'quran',
      text: 'Perumpamaan orang yang menginfakkan hartanya di jalan Allah seperti sebutir biji yang menumbuhkan tujuh tangkai, pada setiap tangkai ada seratus biji.',
      source: 'QS. Al-Baqarah: 261',
      theme: 'infaq'
    },
    {
      type: 'quran',
      text: 'Dan janganlah kamu jadikan tanganmu terbelenggu pada lehermu dan janganlah kamu terlalu mengulurkannya, nanti kamu menjadi tercela dan menyesal.',
      source: 'QS. Al-Isra: 29',
      theme: 'hemat'
    },
    {
      type: 'quran',
      text: 'Ambillah zakat dari sebagian harta mereka, dengan zakat itu kamu membersihkan dan mensucikan mereka.',
      source: 'QS. At-Taubah: 103',
      theme: 'zakat'
    },
    {
      type: 'quran',
      text: 'Dan orang-orang yang dalam hartanya tersedia bagian tertentu, bagi orang miskin yang meminta dan orang yang tidak mempunyai apa-apa.',
      source: 'QS. Al-Maarij: 24-25',
      theme: 'sedekah'
    },
    
    // HADITH
    {
      type: 'hadis',
      text: 'Tangan di atas lebih baik daripada tangan di bawah. Tangan di atas adalah pemberi, tangan di bawah adalah peminta.',
      source: 'HR. Bukhari & Muslim',
      theme: 'infaq'
    },
    {
      type: 'hadis',
      text: 'Sedekah tidak akan mengurangi harta. Tidak ada orang yang memberi maaf kecuali Allah akan menambah kemuliaannya.',
      source: 'HR. Muslim',
      theme: 'sedekah'
    },
    {
      type: 'hadis',
      text: 'Barangsiapa memberi pinjaman kepada Allah, pinjaman yang baik, maka Allah akan melipatgandakan balasannya dengan lipat ganda yang banyak.',
      source: 'HR. Bukhari',
      theme: 'infaq'
    },
    {
      type: 'hadis',
      text: 'Harta yang baik adalah untuk orang yang baik. Hati yang bersih ada pada orang yang bersih.',
      source: 'HR. Ahmad',
      theme: 'keberkahan'
    },
    
      // QUOTES ULAMA AHLUSSUNNAH WAL JAMA'AH
  {
    type: 'quote',
    text: 'Harta yang halal akan membawa keberkahan, sedangkan harta yang haram akan membawa kehancuran.',
    source: 'Imam Syafi\'i',
    theme: 'kehalalan'
  },
  {
    type: 'quote',
    text: 'Zakat itu membersihkan jiwa dari sifat kikir, dan membersihkan harta dari hak orang lain.',
    source: 'Ibnu Qayyim Al-Jauziyyah',
    theme: 'zakat'
  },
  {
    type: 'quote',
    text: 'Sesungguhnya sedekah dengan harta yang halal adalah obat bagi penyakit hati dan badan.',
    source: 'Imam Al-Ghazali',
    theme: 'sedekah'
  },
  {
    type: 'quote',
    text: 'Orang yang berakal tidak akan mengumpulkan harta untuk ahli warisnya, tetapi untuk bekal akhiratnya.',
    source: 'Umar bin Abdul Aziz',
    theme: 'akhirat'
  },
  {
    type: 'quote',
    text: 'Hendaklah kamu bersedekah dengan harta yang halal, karena Allah tidak menerima kecuali yang baik.',
    source: 'Ibnu Katsir',
    theme: 'kehalalan'
  },
  {
    type: 'quote',
    text: 'Kekayaan sejati bukanlah banyaknya harta, tetapi kekayaan jiwa yang qana\'ah (merasa cukup).',
    source: 'Imam Nawawi',
    theme: 'qanaah'
  },
  {
    type: 'quote',
    text: 'Infaq di jalan Allah akan mengembangkan harta, sedangkan menimbunnya akan membuatnya binasa.',
    source: 'Hasan Al-Bashri',
    theme: 'infaq'
  },
  {
    type: 'quote',
    text: 'Harta yang engkau makan akan habis, yang engkau pakai akan usang, dan yang engkau sedekahkan akan kekal.',
    source: 'Ibnu Rajab Al-Hanbali',
    theme: 'sedekah'
  },
  {
    type: 'quote',
    text: 'Orang yang paling bahagia adalah yang hartanya menjadi jalan ketaatan kepada Allah.',
    source: 'Ibnu Taimiyah',
    theme: 'ketaatan'
  },
  {
    type: 'quote',
    text: 'Jangan sampai dunia menguasai hatimu, karena hati yang cinta dunia akan buta dari akhirat.',
    source: 'Imam Malik',
    theme: 'zuhud'
  },
  {
    type: 'quote',
    text: 'Harta yang berkah adalah yang digunakan untuk ketaatan, bukan yang disimpan untuk kesombongan.',
    source: 'Syaikh Abdul Qadir Jailani',
    theme: 'keberkahan'
  },
  {
    type: 'quote',
    text: 'Sedikit harta dengan syukur, lebih baik daripada banyak harta dengan kufur nikmat.',
    source: 'Imam Ahmad bin Hanbal',
    theme: 'syukur'
  },
  {
    type: 'quote',
    text: 'Investasi terbaik adalah sedekah, karena pahalanya terus mengalir meskipun kita telah tiada.',
    source: 'Ibnu Hajar Al-Asqalani',
    theme: 'sedekah'
  },
  {
    type: 'quote',
    text: 'Kaya sejati adalah yang kaya hati, bukan yang banyak hartanya.',
    source: 'Imam Bukhari',
    theme: 'qanaah'
  },
  {
    type: 'quote',
    text: 'Harta adalah amanah Allah, maka gunakanlah di jalan yang Dia ridhai.',
    source: 'Imam Syafi\'i',
    theme: 'amanah'
  }
];

  
  await db.insert(financialWisdom).values(wisdomData);
  
  console.log(`✅ Seeded ${wisdomData.length} wisdom entries!`);
  process.exit(0);
}

seedWisdom().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});