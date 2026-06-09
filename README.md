# cozy-chat

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![pnpm](https://img.shields.io/badge/pnpm-%234a4a4a.svg?style=flat-square&logo=pnpm&logoColor=f69220)](https://pnpm.io/)
[![Next.js](https://img.shields.io/badge/Next.js-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express.js-%23404d59.svg?style=flat-square)](https://expressjs.com/)
[![Vitest](https://img.shields.io/badge/Vitest-%2344aa00.svg?style=flat-square&logo=vitest&logoColor=white)](https://vitest.dev/)
[![Mantine](https://img.shields.io/badge/Mantine-339af0?style=flat-square&logo=mantine&logoColor=white)](https://mantine.dev/)

---

## 📚 專欄與教學連結

本專案的完整建置與開發過程皆記錄於以下專欄，歡迎閱讀：

**熟悉的網聊最對味？來做個匿名聊天室吧！**

- **[iThome 鐵人賽](https://ithelp.ithome.com.tw/users/20169019/ironman/8482)**
- **[部落格](https://dev.penspulse.com/plans/cozy-chat/cozy-chat-day1/)**

---

## 📂 專案架構與目錄結構

本專案採用 Monorepo 架構，主要包含以下子專案與模組：

```text
cozy-chat/
├── apps/
│   ├── web/           # 前端應用 (Next.js 15, Mantine v8)
│   └── server/        # 後端應用 (Express 5, MongoDB, Socket.io)
├── packages/
│   └── lib/           # 共用套件 (提供常數、型別、驗證 schemas、工具函式)
├── docs/              # 專案相關文檔與指南
├── package.json       # 根目錄設定與全局開發指令
├── tsconfig.base.json # 全局基礎 TypeScript 設定
└── eslint.config.base.js # 全局基礎 ESLint 設定
```

### 1. 前端應用 (`apps/web`)
* **技術棧**：Next.js 15 (App Router)、React 19、Mantine UI v8、Socket.io-client
* **主要功能**：聊天室使用者介面、即時訊息串接、主題顏色設定等。

### 2. 後端應用 (`apps/server`)
* **技術棧**：Express 5、MongoDB、Socket.io、Node-cron
* **主要功能**：處理 WebSocket 即時連線、資料儲存與 API 提供。開發時支援 Docker Compose 自動啟動本地 MongoDB 服務。

### 3. 共用套件 (`packages/lib`)
* **主要功能**：作為內部私有套件 (`@packages/lib`)，提供前後端共享的資料型別、Zod 驗證 Schema、常數設定與通用工具函式，避免重複撰寫相同的邏輯。

---

## 🛠️ 開發環境與啟動指南

### 系統需求
- **Node.js** v22+
- **pnpm** v10+
- **Docker** (用於本地執行 MongoDB)

### 1. 安裝依賴項目
在專案根目錄下執行：
```bash
pnpm install
```

### 2. 環境變數設定
進入後端目錄 `apps/server` 並複製設定檔：
```bash
cd apps/server
cp .env.example .env
```
*(請根據需要修改 `.env` 內部的設定，例如 PORT 或 MongoDB 連線字串)*

### 3. 啟動開發伺服器

#### 🚀 啟動全部應用 (前端 + 後端)
在專案根目錄執行以下指令，將同時啟動後端（含 Docker MongoDB）與前端：
```bash
pnpm dev
```

#### 💻 單獨啟動前端開發環境
```bash
pnpm web:dev
```
啟動後可在瀏覽器開啟 [http://localhost:3000](http://localhost:3000)。

#### ⚙️ 單獨啟動後端開發環境
```bash
pnpm server:dev
```
此指令會自動執行 `docker compose up -d` 來啟動後端所需的 MongoDB 容器，並啟動 Express 伺服器監聽。

---

## 📋 常用管理指令

以下指令均可在專案**根目錄**直接執行：

| 指令 | 說明 |
| :--- | :--- |
| `pnpm build` | 編譯前端與後端子專案 |
| `pnpm lint` | 檢查所有專案程式碼風格 |
| `pnpm test` | 執行所有子專案的測試（Vitest） |
| `pnpm format` | 使用 Prettier 自動格式化專案內所有檔案 |
| `pnpm type-check` | 檢查所有 TypeScript 型別正確性 |

---

## 🤝 提交規範 (Commit Lint)

本專案配置了 Husky 與 commitlint，在進行 Git Commit 時請遵循 [Conventional Commits](https://www.conventionalcommits.org/) 規範，例如：
* `feat: 新增即時訊息功能`
* `fix: 修正 Socket.io 連線中斷問題`
* `docs: 更新 README 專欄連結`
