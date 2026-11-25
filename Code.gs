// Google Apps Script สำหรับบันทึกคำสั่งซื้อจากเว็บไซต์ลง Google Sheets
// 1) สร้าง Google Sheet ใหม่ ตั้งชื่อชีตแรกว่า Orders
// 2) Extensions > Apps Script แล้ววางโค้ดนี้
// 3) Deploy > New deployment > Web app
//    Execute as: Me | Who has access: Anyone
// 4) คัดลอก Web app URL ไปใส่ใน config.js ของเว็บไซต์

function doPost(e) {
  try {
    var order = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Orders') || ss.insertSheet('Orders');
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Order ID','วันที่','ชื่อลูกค้า','เบอร์โทร','ที่อยู่','สินค้า (SKU)','จำนวนรวม','ยอดรวม','สถานะ','เลขพัสดุ','หมายเหตุ']);
    }
    var itemText = (order.items || []).map(function(item) {
      return item.sku + ' - ' + item.product + ' x ' + item.qty;
    }).join(' | ');
    var qty = (order.items || []).reduce(function(sum, item) { return sum + Number(item.qty || 0); }, 0);
    sheet.appendRow([
      order.orderId || '', order.createdAt || '', order.customer || '',
      order.phone || '', order.address || '', itemText, qty,
      Number(order.total || 0), order.status || 'รอหยิบสินค้า',
      order.tracking || '', order.note || ''
    ]);
    return ContentService.createTextOutput(JSON.stringify({ok:true}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ok:false,error:String(err)}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput('Honey House order endpoint is ready.');
}