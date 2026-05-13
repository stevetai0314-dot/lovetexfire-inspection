# 消防設備巡檢系統 / Hệ thống Kiểm tra PCCC

工廠消防設備巡檢 Web App，支援手機掃描 QR Code 記錄巡檢結果，資料自動同步至 Google Sheets。介面以越文呈現，適合越籍員工操作。

---

## 功能特色

- **QR Code 掃描**：用手機鏡頭掃描貼於設備上的 QR Code
- **白名單驗證**：只接受預先建立的合法 QR Code，防止誤掃
- **雙設備類型**：消防栓（3 項核查）、滅火器（1 項核查）
- **離線支援**：無網路時自動存至本機，上線後補同步
- **台越雙語**：系統設定為越文介面，後台中文管理
- **即時上雲**：巡檢完成後自動寫入 Google Sheets

---

## 系統架構

```
手機瀏覽器 (index.html)
    │
    ├─ 掃描 QR Code（html5-qrcode）
    ├─ 顯示核查表（越文）
    ├─ 暫存至 localStorage（離線備援）
    │
    └─ HTTP POST ──► Google Apps Script (apps-script.js)
                          │
                          └─ 寫入 Google Sheets
                               ├─ 消防栓記錄（分頁）
                               └─ 滅火器記錄（分頁）
```

---

## 檔案結構

```
├── index.html        # 前端 Web App（掃描介面、核查表、離線同步）
└── apps-script.js    # Google Apps Script 後端（接收資料、寫入 Sheets）
```

---

## 部署步驟

### 1. 建立 Google Sheets

建立一個 Google Sheets，名稱隨意。  
系統會自動建立兩個分頁：`消防栓記錄`、`滅火器記錄`。

### 2. 部署 Apps Script

1. 開啟 Google Sheets → 上方選單「擴充功能」→「Apps Script」
2. 將 `apps-script.js` 的內容貼入編輯器
3. 點選「部署」→「管理部署」→「新增部署」
4. 設定：
   - 類型：**網頁應用程式**
   - 執行身分：**我**
   - 存取權限：**所有人（含匿名）**
5. 複製產生的部署網址（`SHEET_URL`）

### 3. 設定前端

開啟 `index.html`，找到以下這行並替換為你的部署網址：

```js
const SHEET_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_URL/exec';
```

### 4. 建立白名單

在 Google Sheets 新增一個分頁，命名為 `白名單`，  
A 欄填入所有合法的 QR Code 內容，每列一筆。

QR Code 命名規則：
- 消防栓：`消防栓-1F-走廊A`（開頭必須是 `消防栓`）
- 滅火器：`滅火器-2F-倉庫B`（開頭必須是 `滅火器`）

### 5. 部署前端

將 `index.html` 上傳至任意靜態主機（GitHub Pages、Cloudflare Pages 等），或直接在手機開啟本地檔案。

---

## 使用方式

1. 用手機開啟網頁
2. 輸入巡檢人員姓名（越文）
3. 對準設備上的 QR Code 掃描
4. 勾選核查項目後送出
5. 資料自動上傳 Google Sheets，右側綠點代表已同步

若無網路，資料暫存於手機本機，下次上線自動補傳。

---

## Google Sheets 欄位說明

### 消防栓記錄

| 時間 | 巡檢人 | 地點 | 門可開/無障礙物 | 有水帶/噴頭 | 外箱清潔 | 伺服器時間 |
|------|--------|------|----------------|------------|---------|-----------|

### 滅火器記錄

| 時間 | 巡檢人 | 地點 | 壓力表正常 | 伺服器時間 |
|------|--------|------|-----------|-----------|

> 伺服器時間使用越南時區（Asia/Ho_Chi_Minh，UTC+7）

---

## 技術依賴

- [html5-qrcode](https://github.com/mebjas/html5-qrcode) v2.3.8 — QR Code 掃描
- Google Apps Script — 無伺服器後端
- Google Sheets — 資料儲存
- 原生 localStorage — 離線備援

無需 Node.js、無需框架、無需資料庫。
