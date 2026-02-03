const SHEET_ID = '10nUy_DogmjVboSOdbSBFpQaUSASkzw-eg106lFF3Nf4';

function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('E-Absensi | Modern Dashboard')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(file) {
  return HtmlService.createHtmlOutputFromFile(file).getContent();
}

/* ================= LOGIN ================= */
function login(nim) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('data_mahasiswa');
    const data = sheet.getDataRange().getValues(); // Gunakan getValues agar lebih cepat
    
    // Gunakan find untuk mencari data dengan lebih efisien
    const student = data.find(row => row[0].toString().trim() === nim.toString().trim());
    
    if (student) {
      return { 
        status: 'success', 
        nim: student[0], 
        nama: student[1], 
        prodi: student[2] 
      };
    }
    return { status: 'error', message: 'NIM tidak terdaftar di sistem' };
  } catch (e) {
    return { status: 'error', message: 'Terjadi kesalahan sistem' };
  }
}

/* ================= ABSENSI ================= */
function submitAbsensi(data) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName('data_absensi');
    
    sheet.appendRow([
      new Date(),
      data.nim,
      data.makul,
      data.status
    ]);
    
    return { status: 'success', message: 'Absensi berhasil disimpan!' };
  } catch (e) {
    return { status: 'error', message: e.toString() };
  }
}

/* ================= LOAD DATA (OPTIMIZED) ================= */
function getAbsensiList() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const absensiData = ss.getSheetByName('data_absensi').getDataRange().getValues();
  const mhsData = ss.getSheetByName('data_mahasiswa').getDataRange().getValues();
  
  // Buat Map Mahasiswa untuk lookup cepat
  const mhsMap = new Map();
  mhsData.slice(1).forEach(row => {
    mhsMap.set(row[0].toString().trim(), { nama: row[1], prodi: row[2] });
  });

  // Gabungkan data (Ambil 50 data terbaru saja agar tidak berat)
  return absensiData.slice(1).reverse().slice(0, 50).map(row => {
    const nim = row[1].toString().trim();
    const infoMhs = mhsMap.get(nim) || { nama: 'Unknown', prodi: '-' };
    
    return {
      nama: infoMhs.nama,
      nim: nim,
      prodi: infoMhs.prodi,
      jam: Utilities.formatDate(new Date(row[0]), "GMT+7", "dd/MM/yyyy HH:mm"),
      makul: row[2],
      status: row[3]
    };
  });
}
