/**
 * Google Apps Script untuk membuat Google Docs otomatis dari Bot WhatsApp PJJ
 * 
 * Cara penggunaan:
 * 1. Buka script.google.com
 * 2. Buat project baru
 * 3. Copy-paste kode ini ke editor
 * 3. Simpan dan Deploy > New deployment
 * 4. Pilih type: Web app
 * 4. Execute as: Me
 * 5. Who has access: Anyone
 * 6. Deploy dan copy URL Web App
 * 7. Masukkan URL ke environment variable GAS_WEBHOOK_URL atau settings database
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    
    // Validasi data yang diperlukan
    if (!data.matkul || !data.judul || !data.isi) {
      return ContentService.createTextOutput(JSON.stringify({ 
        status: "error", 
        message: "Missing required fields: matkul, judul, isi" 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Buat Google Doc baru
    var docTitle = data.matkul + " - " + data.judul;
    var doc = DocumentApp.create(docTitle);
    var body = doc.getBody();
    
    // Tambahkan judul
    body.appendParagraph(data.judul).setHeading(DocumentApp.ParagraphHeading.HEADING1);
    
    // Tambahkan info mata kuliah
    body.appendParagraph("Mata Kuliah: " + data.matkul);
    
    // Tambahkan isi ringkuman
    body.appendParagraph("\n" + data.isi);
    
    // Tambahkan tugas tambahan jika ada
    if (data.tugas_tambahan) {
      body.appendParagraph("\nTugas Tambahan:\n" + data.tugas_tambahan);
    }
    
    // Tambahkan timestamp
    body.appendParagraph("\n---");
    body.appendParagraph("Dibuat pada: " + new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }));
    body.appendParagraph("Dibuat oleh: Bot WhatsApp PJJ Informatika Udinus");
    
    doc.saveAndClose();
    
    // Set sharing to anyone with link can view
    var file = DriveApp.getFileById(doc.getId());
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "success", 
      gdoc_link: doc.getUrl(),
      doc_id: doc.getId()
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    console.error('GAS Error:', err);
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "error", 
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Fungsi helper untuk testing di GAS editor
 */
function testCreateDoc() {
  var testData = {
    matkul: "KALKULUS",
    judul: "Limit Fungsi - Pertemuan 1",
    isi: "Materi membahas tentang limit fungsi, definisi epsilon-delta, dan contoh soal.",
    tugas_tambahan: "Kerjakan soal halaman 45 nomor 1-5"
  };
  
  var mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  var result = doPost({ postData: { contents: JSON.stringify(testData) } });
  Logger.log(result.getContent());
}