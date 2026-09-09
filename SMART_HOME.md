# 智慧家庭互動原型

專案位於 `smart-home/`。

- 以 `output/office.glb` 作為空間模型，加入 Google Nest Hub、空氣清淨機及掃地機器人的 3D 示意物件。
- 點選模型裡的設備或其標籤即可打開控制面板。
- 掃地機器人的「開始清掃」會沿預設路線移動；支援暫停、繼續及回充。
- 清淨機可開關與調風速，氣流及模擬 PM2.5 讀值會同步更新。
- Hub 提供音量示意及設備入口；沒有真正帳戶、麥克風或音訊連線。

這版使用固定辦公室模型與模擬設備。使用者模型上傳、設備綁定及 Google Home/Matter 真實控制是下一階段；詳見 `smart-home/README.md`。

本機啟動：
```sh
cd smart-home
npm run dev
```
