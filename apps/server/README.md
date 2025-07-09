# Express TypeScript 專案模板

這是一個 Express + TypeScript 專案模板，
包含基礎的開發工具設定，讓你能快速啟動新的 Express 專案。

你可以點擊 Use this template 將這個專案模板生成為你的 repository，  
並根據自己的偏好重新設定這些預設的工具鏈。

## 🚀 特色功能

- **Express 5.x** - 最新版本的 Express.js
- **TypeScript** - 完整的型別支援與現代 JavaScript 功能
- **ESM** - 使用 ES Modules，支援現代模組系統
- **開發工具鏈**:
  - ESLint - 程式碼品質檢查
  - Prettier - 程式碼格式化
  - Vitest - 快速的單元測試框架
  - Husky + lint-staged - Git hooks 自動化
  - Commitlint - 提交訊息規範

## 📋 系統需求

- Node.js v22.16.0

## 🛠️ 安裝與設定

1. **複製專案**

   ```bash
   git clone <your-repo-url>
   cd express-ts-template
   ```

2. **安裝套件**

   ```bash
   npm install
   ```

3. **建立環境變數檔案**
   ```bash
   cp .env.example .env
   ```
   編輯 `.env` 檔案設定你的環境變數（如 PORT）

## 🚀 開發指令

- **開發模式** (含熱重新載入)

  ```bash
  npm run dev
  ```

- **建置專案**

  ```bash
  npm run build
  ```

- **執行建置後的程式**

  ```bash
  npm start
  ```

- **執行測試**

  ```bash
  npm test          # 監看模式
  npm run test:run  # 單次執行
  npm run test:ui   # 開啟測試 UI
  ```

- **程式碼品質檢查**

  ```bash
  npm run lint      # 檢查程式碼
  npm run lint:fix  # 自動修復
  npm run format    # 格式化程式碼
  npm run type-check # TypeScript 型別檢查
  ```

- **測試涵蓋率**
  ```bash
  npm run coverage
  ```

## 📂 專案結構

```
express-ts-template/
├── src/
│   ├── index.ts          # 應用程式進入點
│   ├── utils/            # 工具函數
│   └── tests/            # 測試檔案
├── dist/                 # 建置輸出目錄
├── .husky/              # Git hooks 設定
├── .vscode/             # VS Code 設定
├── package.json         # 專案相依套件與腳本
├── tsconfig.json        # TypeScript 設定
├── tsconfig.build.json  # 建置專用 TypeScript 設定
├── eslint.config.js     # ESLint 設定
├── vitest.config.js     # Vitest 測試設定
├── .prettierrc          # Prettier 格式化設定
├── .nvmrc              # Node.js 版本指定
└── .gitignore          # Git 忽略檔案
```

## 🔧 設定說明

### TypeScript

- 使用 `@tsconfig/node22` 作為基礎設定
- 支援路徑別名 `@/*` 對應到 `src/*`
- 輸出至 `dist/` 目錄

### ESLint

- 基於 `@eslint/js` 推薦設定
- 使用 TypeScript ESLint 嚴格規則
- 整合 Perfectionist 外掛進行程式碼排序
- 針對測試檔案有特殊規則設定

### Prettier

- 使用分號、單引號
- 2 個空格縮排
- 最大行寬 100 字元
- 尾隨逗號

### Git Hooks

- **pre-commit**: 自動執行 lint 和格式檢查
- **commit-msg**: 檢查提交訊息格式（遵循 Conventional Commits）

## 📝 開發建議

1. **提交訊息格式**: 請遵循 [Conventional Commits](https://www.conventionalcommits.org/) 規範

   ```
   feat: 新增使用者登入功能
   fix: 修復密碼驗證錯誤
   docs: 更新 API 文件
   ```

2. **程式碼風格**: 專案已設定自動格式化，建議在 VS Code 中啟用「儲存時格式化」

3. **測試**: 請為新功能撰寫對應的單元測試

## 📦 部署

1. 建置專案：

   ```bash
   npm run build
   ```

2. 設定正式環境變數

3. 啟動應用程式：
   ```bash
   npm start
   ```

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request 來改善這個模板！

## 📄 授權

本專案採用 MIT 授權條款。

## 📚 參考資料

此專案模板的建置方式參考了以下文章：

- [Node.js 2025 Guide: How to setup Express.js with TypeScript, ESLint and Prettier](https://medium.com/@gabrieldrouin/node-js-2025-guide-how-to-setup-express-js-with-typescript-eslint-and-prettier-b342cd21c30d#2245)
