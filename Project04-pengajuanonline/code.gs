/*************************
* CONFIG
*************************/
const PROJECT_ID = 'project4pengajuan';
const LOCATION = 'us';
const DATASET_ID = 'app_pengajuan';
const TABLE_MAHASISWA = 'data_mahasiswa';
const SPREADSHEET_ID = '10nOKfaFi4TPS-y4ORo5ZVMMB73LmbNsqz_rEJZbaJAM';
const SHEET_PENGAJUAN = 'data_pengajuan';

/*************************
* BIGQUERY HELPER (READ)
*************************/
function runQuery(sql) {
const request = {
query: sql,
useLegacySql: false,
location: LOCATION
};

const res = BigQuery.Jobs.query(request, PROJECT_ID);
return res.rows || [];
}
/*************************
* WEB APP
*************************/
function doGet() {
return HtmlService
.createTemplateFromFile('index')
.evaluate()
.setTitle('Sistem Pengajuan Online');
}

function include(file) {
return HtmlService
.createHtmlOutputFromFile(file)
.getContent();
}
/*************************
* LOGIN (BIGQUERY)
*************************/
function loginMahasiswa(nim) {
const nimInt = Number(nim);
if (!nimInt) {
return { status: 'error', message: 'NIM tidak valid' };
}
const sql = `
SELECT nim, nama, prodi
FROM \`${PROJECT_ID}.${DATASET_ID}.${TABLE_MAHASISWA}\`
WHERE nim = ${nimInt}
LIMIT 1
`;
const rows = runQuery(sql);
if (rows.length === 0) {
return { status: 'error', message: 'NIM tidak terdaftar' };
}
return {
status: 'success',
nim: rows[0].f[0].v,
nama: rows[0].f[1].v,
prodi: rows[0].f[2].v
};
}
/*************************
* SUBMIT PENGAJUAN (SHEET)
*************************/
function submitPengajuan(data) {
if (!data || !data.nim || !data.jenis || !data.keterangan) {
return { status: 'error', message: 'Data tidak lengkap' };
}
const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
const sheet = ss.getSheetByName(SHEET_PENGAJUAN);
if (!sheet) {
return { status: 'error', message: 'Sheet data_pengajuan tidak ditemukan' };
}
const id = 'PJ-' + Date.now();
sheet.appendRow([
id,
Number(data.nim),
data.jenis,
data.keterangan,
'Pending',
new Date()
]);
return {
status: 'success',
message: 'Pengajuan berhasil disimpan'
};
}
/*************************
* RIWAYAT PENGAJUAN (SHEET)
*************************/
function getRiwayatPengajuan(nim) {
const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
const sheet = ss.getSheetByName(SHEET_PENGAJUAN);
const values = sheet.getDataRange().getValues();
const hasil = [];
for (let i = 1; i < values.length; i++) {
const row = values[i];
if (String(row[1]) !== String(nim)) continue;
let tanggal = '-';
if (row[5] instanceof Date) {
tanggal = Utilities.formatDate(
row[5],
'Asia/Jakarta',
'yyyy-MM-dd HH:mm'
);
}
hasil.push({
tanggal,
jenis: row[2],
keterangan: row[3],
status: row[4]
});
}
return hasil.reverse();
}
