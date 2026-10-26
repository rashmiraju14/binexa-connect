const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const vm = require('node:vm');
const fs = require('node:fs');
function fixture() {
  const written = [], notes = [];
  const sheet = { getLastRow: () => written.length + 1, getMaxRows: () => 1000, getRange(row, col, rows, cols) {
    return { getDisplayValues: () => [['User-ID', 'Name', 'Email-ID', 'Sign-in Time', 'Phone- number']], getNotes: () => notes.map(n => [n]), setNumberFormat() { return this; }, setValue(value) { return this; }, setValues(values) { written.push(values[0]); return this; }, setNote(value) { notes.push(value); return this; } };
  } };
  const context = { PropertiesService: { getScriptProperties: () => ({ getProperty: () => 'test-secret' }) }, Utilities: { Charset: { UTF_8: 'utf8' }, computeHmacSha256Signature: (p, s) => [...crypto.createHmac('sha256', s).update(p).digest()] }, SpreadsheetApp: { openById: () => ({ getSheetByName: () => sheet }), flush() {} }, LockService: { getScriptLock: () => ({ waitLock() {}, hasLock: () => true, releaseLock() {} }) }, ContentService: { MimeType: { JSON: 'json' }, createTextOutput: value => ({ setMimeType: () => JSON.parse(value) }) } };
  vm.createContext(context); vm.runInContext(fs.readFileSync(__dirname + '/Code.gs', 'utf8'), context);
  function send(data = {}, invalid = false) {
    const payload = JSON.stringify({ sentAt: Date.now(), userId: '11111111-1111-4111-8111-111111111111', name: '=BAD()', email: 'member@example.test', signedInAt: '2026-10-25T12:00:00.000Z', phone: '+15550000000', ...data });
    return context.doPost({ postData: { contents: JSON.stringify({ payload, signature: invalid ? 'invalid' : crypto.createHmac('sha256', 'test-secret').update(payload).digest('hex') }) } });
  }
  return { written, send };
}
test('records the five columns and neutralizes spreadsheet formulas', () => { const f = fixture(); assert.equal(f.send().ok, true); assert.equal(f.written.length, 1); assert.equal(f.written[0].length, 5); assert.equal(f.written[0][1], "'=BAD()"); assert.equal(f.written[0][4], "'+15550000000"); });
test('deduplicates retries but records a later sign-in', () => { const f = fixture(); f.send(); assert.equal(f.send().duplicate, true); f.send({ signedInAt: '2026-10-25T13:00:00.000Z' }); assert.equal(f.written.length, 2); });
test('rejects invalid signatures and expired requests without writing', () => { const f = fixture(); assert.equal(f.send({}, true).ok, false); assert.equal(f.send({ sentAt: Date.now() - 600000 }).ok, false); assert.equal(f.written.length, 0); });
test('rejects invalid rows without writing', () => { const f = fixture(); assert.equal(f.send({ userId: 'invalid' }).ok, false); assert.equal(f.send({ signedInAt: 'invalid' }).ok, false); assert.equal(f.written.length, 0); });
