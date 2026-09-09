# Home3D 空間智慧控制

以既有 `office.glb` 辦公室模型建立的互動原型。使用者可直接點選場景裡的設備，透過專屬面板操作；左側清單提供鍵盤及小螢幕的替代入口。

## 已實作

- Three.js 真正 3D 場景：旋轉、縮放、俯視與視角重設。
- Matter 窗簾模擬：兩扇窗同步開合、0–100% 目標位置、中途停止、離線暫停；UI 的 100% 表示全開，控制 adapter 須轉換設備端座標。
- 空調模擬：電源、冷氣/暖氣/送風、16–30°C 設定、風速、出風動畫及逐步變化的室溫。
- Google Nest Hub 示意模型與模擬音量、設備入口。
- 清淨機：開關、1–100% 風速、三個快捷風速、隨風速呈現的氣流與模擬 PM2.5 變化。
- 掃地機器人：開始、暫停、繼續、回充；約 70 秒的預設展示路線與位置、進度更新。
- 模擬指令等待及回應、操作紀錄、離線鎖定與復原。
- 空氣狀態示意圖層、響應式控制面板。

所有設備與環境資料均為模擬；不連接 Google 帳戶、Matter fabric、麥克風或實體家電。重新整理會重設模擬。圖層不代表真實流體模擬或空氣品質測量。路線為預先繪製，沒有完整導航/避障；並非所有機器人都能提供定位或指定區域清掃。

## 開發與驗證

```sh
npm install
npm run dev
node --experimental-strip-types lib/simulation.test.ts
npx tsc --noEmit
npm run build
```

`lib/simulation.ts` 是可替換的狀態與指令層；`app/three-scene.ts` 負責模型、設備幾何、命中測試、投影標籤與動畫；`app/page.tsx` 負責控制面板及指令回饋。

已加入 feature-detected WebMCP 工具 `read_simulated_home` 與 `control_simulated_device`，共用畫面上的操作邏輯。當前工具環境沒有可用的 WebMCP 驗證上下文，因此未驗證瀏覽器內的工具註冊與呼叫。此為漸進增強，不影響一般操作。

## 未來替換成使用者自己的家

此版本固定使用辦公室模型，尚未提供模型上傳/配對功能。下一階段須把以下資料分開保存：

1. `SpaceModel`：GLB、尺度、向上軸、座標原點與房間分區。
2. `DeviceAnchor`：已授權設備的穩定 ID、房間、3D 位置、朝向、可點選範圍。
3. `DeviceCapabilities`：從真實設備讀取開關、風速、執行模式與其他實際支援能力。
4. `DeviceState`：reported state、連線狀態、時間戳、待確認指令；以設備回報為準。
5. `ControlAdapter`：目前是模擬；真實版本應接 Google Home 原生 SDK 或經授權的家庭閘道，不把登入權杖或 Matter 憑證放進模型。

流程：匯入模型 → 校正比例/原點 → 授權家庭與設備 → 把设备綁定到模型物件/位置 → 依 capabilities 顯示可用操作 → 送指令 → 等待真實回報。設備清單仍保留供可及性、離線、模型缺失或不方便使用 3D 的情境。

## Google Home / Matter 邊界（2026-09-09 查閱）

Google 官方支援表列出 Matter 空氣清淨機與掃地機器人；實際支援 trait、控制入口及廠牌韌體仍需逐項確認。清淨機本身不必然帶有 PM2.5 感測器。即時座標、地圖與指定區域清掃不應因設備具備 Matter 就假設存在。本版 Hub 音量也是概念模擬，不能視為可由 Matter 普遍控制的 trait。

- https://developers.home.google.com/matter/supported-devices
- https://developers.home.google.com/apis
- https://developers.home.google.com/apis/android/supported-device-types
- https://support.google.com/googlehome/answer/12391458?hl=en

Google Home APIs 的原生平台 SDK 是未來整合的候選入口。瀏覽器中的 3D 畫面不等於可直接連線 Nest Hub 或發送任意 Matter 指令。

新增設備依 Google Home Home APIs 的 Room Air Conditioner 與 Window Covering 類型設計控制概念，但不表示所有 Google Home 控制入口或照片中的實體產品支援這些能力。真實接入須驗證設備/橋接器、韌體與可用 traits。
