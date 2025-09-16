/**
 * Web App: ค้นหาด้วยคอลัมน์ ID เท่านั้น
 * พารามิเตอร์รับเข้า: sheetId, id
 * ตอบกลับ: { ok, found, data?, error? }
 * หมายเหตุ: ไม่เรียก setHeader เพราะ ContentService.TextOutput ไม่มีเมธอดนี้
 */
function doGet(e) {
  try {
    var sheetId = e.parameter.sheetId || '1TK7U_TbNzF2AY4tIY71GnunPyygx69X6dLamA0VjnN8';
    var qId = (e.parameter.id || '').toString().trim();

    var ss = SpreadsheetApp.openById(sheetId);
    var sh = ss.getSheets()[0]; // ใช้ชีตแรก หรือแก้เป็นชื่อชีตที่ต้องการ
    var values = sh.getDataRange().getValues();
    if (values.length < 2) return json({ ok:false, found:false, error:"ไม่มีข้อมูลในชีต" });

    // ต้องมีหัวคอลัมน์ "ID" และ "url" (สำหรับรูป)
    var header = values.shift();
    var H = Object.fromEntries(header.map(function(h,i){ return [String(h).trim(), i]; }));
    if (H['ID'] === undefined) return json({ ok:false, found:false, error:"ไม่พบคอลัมน์ ID" });

    if (!qId) return json({ ok:true, found:false, error:"กรุณาระบุ id" });

    var row = values.find(function(r){ return String(r[H['ID']]).trim() === qId; });
    if (!row) return json({ ok:true, found:false });

    var obj = {};
    header.forEach(function(h, i){ obj[h] = rSafe(row[i]); });

    // แนบ imageUrl จากคอลัมน์ 'url' ถ้ามี
    if (H['url'] !== undefined) {
      var u = String(row[H['url']] || '');
      obj.imageUrl = u; // ใช้ URL ตามชีต (ต้องเปิดสาธารณะเอง)
    }

    return json({ ok:true, found:true, data: obj });
  } catch (err) {
    return json({ ok:false, found:false, error: err.message });
  }
}

function rSafe(v){ return (v===null || v===undefined) ? "" : v; }

function json(payload){
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
