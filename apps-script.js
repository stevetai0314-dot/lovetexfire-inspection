// ═══════════════════════════════════════════════════
//  Google Apps Script — 消防設備巡檢
//  貼入 Apps Script 後，選「管理部署」→ 編輯現有版本 → 儲存新版本
//  部署設定：執行身分「我」、存取「所有人（含匿名）」
// ═══════════════════════════════════════════════════

function doGet(e) {
  const action = (e && e.parameter) ? e.parameter.action : '';

  if (action === 'whitelist') {
    try {
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('白名單');
      if (!sheet) return jsonOut({ status: 'error', message: '找不到白名單分頁' });
      const data = sheet.getRange('A:A').getValues().flat().filter(v => v !== '');
      return jsonOut({ status: 'ok', whitelist: data });
    } catch (err) {
      return jsonOut({ status: 'error', message: err.toString() });
    }
  }

  return jsonOut({ status: 'ok', message: '消防巡檢系統運行中' });
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const serverTime = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyy/MM/dd HH:mm:ss');

    if (data.type === '消防栓') {
      let sheet = ss.getSheetByName('消防栓記錄');
      if (!sheet) sheet = ss.insertSheet('消防栓記錄');

      if (sheet.getLastRow() === 0) {
        const h = ['時間', '巡檢人', '地點', '門可開/無障礙物', '有水帶/噴頭', '外箱清潔', '伺服器時間'];
        sheet.appendRow(h);
        sheet.getRange(1, 1, 1, h.length).setFontWeight('bold')
          .setBackground('#2b6cb0').setFontColor('#ffffff');
      }

      sheet.appendRow([
        data.timestamp,
        data.inspector,
        data.location,
        data.checklist[0] ? '✓' : '✗',
        data.checklist[1] ? '✓' : '✗',
        data.checklist[2] ? '✓' : '✗',
        serverTime
      ]);

    } else if (data.type === '滅火器') {
      let sheet = ss.getSheetByName('滅火器記錄');
      if (!sheet) sheet = ss.insertSheet('滅火器記錄');

      if (sheet.getLastRow() === 0) {
        const h = ['時間', '巡檢人', '地點', '壓力表正常', '伺服器時間'];
        sheet.appendRow(h);
        sheet.getRange(1, 1, 1, h.length).setFontWeight('bold')
          .setBackground('#e53e3e').setFontColor('#ffffff');
      }

      sheet.appendRow([
        data.timestamp,
        data.inspector,
        data.location,
        data.checklist[0] ? '✓' : '✗',
        serverTime
      ]);

    } else {
      return jsonOut({ status: 'error', message: '未知設備類型: ' + data.type });
    }

    return jsonOut({ status: 'ok' });

  } catch (err) {
    return jsonOut({ status: 'error', message: err.toString() });
  }
}

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
