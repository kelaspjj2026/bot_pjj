/**
 * Google Apps Script Web App Handler (v2.8.3)
 * ===========================================
 * Template ini harus diletakkan di kedua Google Sheets:
 * 1. Data mahasiswa pjj
 * 2. Arsib bot
 *
 * Instruksi:
 * 1. Buka Google Sheets → Extensions → Apps Script
 * 2. Paste seluruh kode ini ke Code.gs
 * 3. Deploy → New Deployment → Web App → Execute as: Me → Access: Anyone
 * 4. Copy URL deployment dan simpan di Settings database
 * 5. Jalankan fungsi setupTrigger() sekali dari editor untuk memasang onChange trigger
 *
 * Format Header Sheet Mahasiswa: nomor | nama | nim | wa
 * Format Header Sheet Pengumuman: judul | isi | schedule_time | repeat_days | is_active | is_recurring
 * Format Header Sheet Tugas: matkul | judul | deskripsi | deadline | status
 * Format Header Sheet Rangkuman: matkul | judul | isi | tugas_tambahan | gdoc_link
 *
 * === GAS LIBRARY ID ===
 * Library ID: 1tymqZa1CXCxYVqiqFzPAhu3xD9GLMUaTqvP3RNkwlLii1CbSrepRJbf9
 * Gunakan Library ID ini saat mengimpor library di Google Apps Script editor:
 *   1. Buka Google Sheets → Extensions → Apps Script
 * 2. Klik ikon "+" di panel Libraries
 * 3. Paste Library ID: 1tymqZa1CXCxYVqiqFzPAhu3xD9GLMUaTqvP3RNkwlLii1CbSrepRJbf9
 * 4. Klik "Add"
 *
 * Library ini menyediakan fungsi helper untuk manipulasi spreadsheet dan
 * konsolidasi logic sinkronisasi data arsip bot (Pengumuman, Tugas, Rangkuman).
 *
 * v2.8.3: Full Arsip Bot Sync — onChange trigger otomatis mendeteksi tab Pengumuman,
 *         Tugas, dan Rangkuman di Google Sheets Arsip Bot saat ada perubahan sel.
 *         Auto-sync ke backend webhook tanpa intervensi manual.
 *         Library ID terintegrasi untuk konsolidasi helper functions.
 */

// ============ HANDLER GET ============
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'GAS Web App is Active',
    timestamp: new Date().toISOString(),
    version: 'v2.8.3'
  })).setMimeType(ContentService.MimeType.JSON);
}

// ============ HANDLER POST ============
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    let { action, sheet_type, identifier, data } = payload;

    if (!action) {
      return jsonResponse({ status: 'error', message: 'Missing required field: action' });
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Auto-detect sheet_type from headers jika tidak disediakan (multi-tab support)
    if (!sheet_type) {
      var headers = getHeaders(sheet);
      var headerLower = headers.map(function(h) { return String(h).toLowerCase().trim(); });
      if (headerLower.some(function(h) { return h === 'nim' || h.indexOf('nim') !== -1; })) {
        sheet_type = 'mahasiswa';
      } else if (headerLower.some(function(h) { return h === 'tugas_tambahan' || h === 'gdoc_link'; })) {
        sheet_type = 'rangkuman';
      } else if (headerLower.some(function(h) { return h === 'deadline' || h === 'deskripsi'; })) {
        sheet_type = 'tugas';
      } else {
        sheet_type = 'pengumuman';
      }
      Logger.log('Auto-detected sheet_type: ' + sheet_type);
    }

    switch (action) {
      case 'UPDATE':
        return handleUpdate(sheet, sheet_type, identifier, data || {});
      case 'DELETE':
        return handleDelete(sheet, sheet_type, identifier);
      case 'INSERT':
        return handleInsert(sheet, sheet_type, data || {});
      case 'PING':
        return jsonResponse({ status: 'success', action: 'PONG', sheet_type, timestamp: new Date().toISOString() });
      default:
        return jsonResponse({ status: 'error', message: `Unknown action: ${action}` });
    }
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.message });
  }
}

// ============ HANDLERS ============
function handleUpdate(sheet, sheetType, identifier, data) {
  const headers = getHeaders(sheet);
  const identifierCol = getIdentifierColumn(headers, sheetType);
  const allData = sheet.getDataRange().getValues();

  // Cari baris berdasarkan identifier
  let targetRow = -1;
  for (let i = 1; i < allData.length; i++) {
    if (String(allData[i][identifierCol]).trim() === String(identifier).trim()) {
      targetRow = i + 1;
      break;
    }
  }

  if (targetRow === -1) {
    // Baris tidak ditemukan — INSERT baru
    return handleInsert(sheet, sheetType, { ...data, [getIdentifierKey(sheetType)]: identifier });
  }

  // Update baris yang ditemukan
  headers.forEach((h, idx) => {
    const key = h.toLowerCase().trim();
    if (data[key] !== undefined && data[key] !== null) {
      sheet.getRange(targetRow, idx + 1).setValue(data[key]);
    }
  });

  return jsonResponse({ status: 'success', action: 'UPDATED', identifier, row: targetRow });
}

function handleInsert(sheet, sheetType, data) {
  const headers = getHeaders(sheet);
  const newRow = headers.map(h => {
    const key = h.toLowerCase().trim();
    return data[key] !== undefined && data[key] !== null ? data[key] : '';
  });
  sheet.appendRow(newRow);
  return jsonResponse({ status: 'success', action: 'INSERTED', sheet_type: sheetType, row: sheet.getLastRow() });
}

function handleDelete(sheet, sheetType, identifier) {
  const headers = getHeaders(sheet);
  const identifierCol = getIdentifierColumn(headers, sheetType);
  const allData = sheet.getDataRange().getValues();

  let targetRow = -1;
  for (let i = 1; i < allData.length; i++) {
    if (String(allData[i][identifierCol]).trim() === String(identifier).trim()) {
      targetRow = i + 1;
      break;
    }
  }

  if (targetRow === -1) {
    return jsonResponse({ status: 'not_found', message: `Row "${identifier}" not found` });
  }

  sheet.deleteRow(targetRow);
  return jsonResponse({ status: 'success', action: 'DELETED', identifier, row: targetRow });
}

// ============ HELPERS ============
function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getHeaders(sheet) {
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
}

function getIdentifierColumn(headers, sheetType) {
  var key = getIdentifierKey(sheetType);
  for (var i = 0; i < headers.length; i++) {
    if (headers[i].toLowerCase().trim() === key) return i;
  }
  // Fallback: cari header yang mengandung key (case-insensitive)
  for (var i = 0; i < headers.length; i++) {
    if (headers[i].toLowerCase().trim().indexOf(key) !== -1) return i;
  }
  return 0;
}

function getIdentifierKey(sheetType) {
  const map = { mahasiswa: 'nim', pengumuman: 'judul', tugas: 'judul', rangkuman: 'judul' };
  return map[sheetType] || 'judul';
}

// ============ TRIGGER SETUP ============
function setupTrigger() {
  // Hapus trigger lama yang sudah ada
  var triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function(t) { ScriptApp.deleteTrigger(t); });

  // Pasang onChange trigger
  ScriptApp.newTrigger('onChangeTrigger')
    .forSpreadsheet(SpreadsheetApp.getActive())
    .onChange()
    .create();

  // Set default webhook URL jika belum ada
  var props = PropertiesService.getScriptProperties();
  if (!props.getProperty('BACKEND_WEBHOOK_URL')) {
    props.setProperty('BACKEND_WEBHOOK_URL', 'https://cswa.latifdev.com/bot');
  }

  Logger.log('Trigger onChange berhasil dipasang! Webhook: ' + props.getProperty('BACKEND_WEBHOOK_URL'));
  return jsonResponse({ status: 'success', message: 'Trigger onChange berhasil dipasang. Sheet aktif akan otomatis sync ke backend.' });
}

function onChangeTrigger(e) {
  try {
    Logger.log('onChange fired: ' + (e ? e.changeType : 'unknown'));

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var sheetName = sheet.getName();
    var headers = getHeaders(sheet);
    var headerLower = headers.map(function(h) { return String(h).toLowerCase().trim(); });

    // Deteksi sheet type dari header kolom secara case-insensitive (multi-tab support)
    var sheetType = null;
    if (headerLower.some(function(h) { return h === 'nim' || h.indexOf('nim') !== -1; })) {
      sheetType = 'mahasiswa';
    } else if (headerLower.some(function(h) { return h === 'judul'; }) && headerLower.some(function(h) { return h === 'isi'; })) {
      // Cek lebih spesifik: tugas punya 'deadline', rangkuman punya 'tugas_tambahan', pengumuman punya 'schedule_time'
      if (headerLower.some(function(h) { return h === 'schedule_time' || h === 'repeat_days'; })) {
        sheetType = 'pengumuman';
      } else if (headerLower.some(function(h) { return h === 'tugas_tambahan' || h === 'gdoc_link'; })) {
        sheetType = 'rangkuman';
      } else if (headerLower.some(function(h) { return h === 'deadline' || h === 'deskripsi'; })) {
        sheetType = 'tugas';
      } else {
        sheetType = 'pengumuman'; // default fallback
      }
    }

    if (!sheetType) {
      Logger.log('Sheet type tidak dikenali dari tab "' + sheetName + '". Headers: ' + headers.join(', '));
      return;
    }

    Logger.log('Detected: ' + sheetType + ' (tab: "' + sheetName + '")');

    // Baca semua data dari sheet aktif
    var allData = sheet.getDataRange().getValues();
    if (allData.length < 2) {
      Logger.log('Sheet kosong atau hanya header, skip sync.');
      return;
    }

    // Mapping header → array of objects (per-row try-catch agar baris bermasalah tidak menghentikan seluruh sync)
    var rows = [];
    var skippedRows = 0;
    // Flexible WA header mapping: normalisasi berbagai nama kolom WA → 'wa'
    var waAliases = ['whatsapp', 'phone', 'no_wa', 'nomor_wa', 'no.wa', 'telp', 'telepon', 'hp', 'handphone'];
    for (var i = 1; i < allData.length; i++) {
      try {
        var row = {};
        var isEmpty = true;
        for (var j = 0; j < headers.length; j++) {
          try {
            var val = allData[i][j];
            var key = headers[j].toLowerCase().trim();
            // Normalisasi semua varian header WhatsApp ke 'wa'
            if (key === 'wa' || waAliases.indexOf(key) !== -1) {
              key = 'wa';
            }
            row[key] = val;
            if (val !== '' && val !== null && val !== undefined) isEmpty = false;
          } catch (cellErr) {
            Logger.log('Cell error row ' + (i + 1) + ' col ' + j + ': ' + cellErr.message);
          }
        }
        if (!isEmpty) rows.push(row);
      } catch (rowErr) {
        skippedRows++;
        Logger.log('Row ' + (i + 1) + ' skipped: ' + rowErr.message);
      }
    }
    if (skippedRows > 0) Logger.log(skippedRows + ' baris bermasalah di-skip, ' + rows.length + ' baris valid tersisa.');

    if (rows.length === 0) {
      Logger.log('Tidak ada data valid untuk sync.');
      return;
    }

    Logger.log('Mem-sync ' + rows.length + ' baris data ' + sheetType + '...');

    // Kirim ke backend webhook
    var webhookUrl = PropertiesService.getScriptProperties().getProperty('BACKEND_WEBHOOK_URL');
    if (!webhookUrl) {
      webhookUrl = 'https://cswa.latifdev.com/bot/api/sync/' + sheetType;
    } else {
      webhookUrl = webhookUrl + '/api/sync/' + sheetType;
    }

    var options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(rows),
      muteHttpExceptions: true
    };

    var response = UrlFetchApp.fetch(webhookUrl, options);
    var statusCode = response.getResponseCode();
    var body = response.getContentText();
    Logger.log('Webhook response [' + statusCode + ']: ' + body);

  } catch (err) {
    Logger.log('onChangeTrigger error: ' + err.message + ' | Stack: ' + err.stack);
  }
}

// ============ TEST FUNCTIONS ============
function testPing() {
  const e = { postData: { contents: JSON.stringify({ action: 'PING', sheet_type: 'test' }) } };
  Logger.log(doPost(e).getContent());
}

function testUpdate() {
  const e = { postData: { contents: JSON.stringify({
    action: 'UPDATE', sheet_type: 'mahasiswa',
    identifier: 'A18.2026.00230',
    data: { nama: 'Test Update', nim: 'A18.2026.00230', wa: '081234567890' }
  }) } };
  Logger.log(doPost(e).getContent());
}

function testGet() {
  const e = {};
  Logger.log(doGet(e).getContent());
}
