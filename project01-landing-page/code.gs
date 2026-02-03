const SHEET_ID = '14dPVvqeqDfLMHKeIpFOrReMPI0_0jSKBE-J_wjcj30o';

function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('Contact Form | Amelia')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL); // Agar bisa di-embed jika perlu
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Fungsi untuk memproses data dari form
 * Nama fungsi diubah menjadi processForm agar sinkron dengan script.html
 */
function processForm(data) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    // Disarankan menggunakan Nama Sheet spesifik agar tidak salah tulis data
    // Ganti 'Sheet1' dengan nama tab di spreadsheet kamu, misal 'Pesan'
    const sheet = ss.getSheetByName('Sheet1') || ss.getSheets()[0];
    
    sheet.appendRow([
      new Date(),
      data.name,
      data.email,
      data.message
    ]);
    
    return 'success';
  } catch (error) {
    // Jika gagal, kirim pesan error ke klien
    throw new Error('Gagal menyimpan data: ' + error.toString());
  }
}
