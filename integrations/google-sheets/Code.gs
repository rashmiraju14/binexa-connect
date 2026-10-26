// Paste into Extensions > Apps Script in the Binexa Connect sign-in sheet.
// Set WEBHOOK_SECRET in Project Settings > Script Properties before deployment.
var SPREADSHEET_ID = '12AeiRvTk2iSu7YOEH_ioEmL-CX5iywzbsxsIH553KPA';
var TAB_NAME = 'Sheet1';

function doPost(e) {
  var lock;
  try {
    var secret = PropertiesService.getScriptProperties().getProperty('WEBHOOK_SECRET');
    if (!secret || !e || !e.postData || e.postData.contents.length > 12000) return reply({ ok: false });
    var envelope = JSON.parse(e.postData.contents);
    if (typeof envelope.payload !== 'string' || typeof envelope.signature !== 'string') return reply({ ok: false });
    var expected = Utilities.computeHmacSha256Signature(envelope.payload, secret, Utilities.Charset.UTF_8).map(function (b) { return ('0' + ((b + 256) % 256).toString(16)).slice(-2); }).join('');
    if (!equalSignature(expected, envelope.signature)) return reply({ ok: false });
    var data = JSON.parse(envelope.payload);
    if (typeof data.sentAt !== 'number' || Math.abs(Date.now() - data.sentAt) > 300000 || !/^[a-f0-9-]{36}$/i.test(data.userId) || typeof data.signedInAt !== 'string' || !isFinite(Date.parse(data.signedInAt))) return reply({ ok: false });
    if ([data.name, data.email, data.phone].some(function (v) { return typeof v !== 'string' || v.length > 500; })) return reply({ ok: false });
    lock = LockService.getScriptLock();
    lock.waitLock(10000);
    var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(TAB_NAME);
    if (!sheet) throw new Error('Missing tab');
    var topRows = sheet.getRange(1, 1, Math.min(25, sheet.getMaxRows()), 5).getDisplayValues();
    var headerIndex = topRows.findIndex(function (r) { return r.map(function (h) { return h.toLowerCase().replace(/[^a-z]/g, ''); }).join(',') === 'userid,name,emailid,signintime,phonenumber'; });
    if (headerIndex < 0) throw new Error('Unexpected headers');
    var firstDataRow = headerIndex + 2;
    var eventId = data.userId + ':' + data.signedInAt;
    var lastRow = sheet.getLastRow();
    if (lastRow >= firstDataRow && sheet.getRange(firstDataRow, 1, lastRow - firstDataRow + 1, 1).getNotes().some(function (r) { return r[0] === eventId; })) return reply({ ok: true, duplicate: true });
    var dataColumn = lastRow >= firstDataRow ? sheet.getRange(firstDataRow, 1, lastRow - firstDataRow + 1, 1).getDisplayValues() : [];
    var footerIndex = dataColumn.findIndex(function (r) { return /^Status Highlighting Key:/i.test(r[0]); });
    var row = Math.max(firstDataRow, lastRow + 1);
    if (footerIndex >= 0) { row = firstDataRow + footerIndex; sheet.insertRowsBefore(row, 1); }
    if (row > sheet.getMaxRows()) sheet.insertRowsAfter(sheet.getMaxRows(), 100);
    sheet.getRange(row, 1, 1, 5).setNumberFormat('@').setValues([[data.userId, safeCell(data.name), safeCell(data.email), data.signedInAt, safeCell(data.phone)]]);
    sheet.getRange(row, 4).setValue(new Date(data.signedInAt)).setNumberFormat('yyyy-mm-dd hh:mm:ss');
    sheet.getRange(row, 1).setNote(eventId);
    SpreadsheetApp.flush();
    return reply({ ok: true });
  } catch (_) { return reply({ ok: false }); }
  finally { if (lock && lock.hasLock()) lock.releaseLock(); }
}

function safeCell(value) { return /^[=+\-@\t\r\n]/.test(value) ? "'" + value : value; }
function equalSignature(a, b) {
  if (a.length !== b.length) return false;
  var different = 0;
  for (var i = 0; i < a.length; i++) different |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return different === 0;
}
function reply(value) { return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON); }
