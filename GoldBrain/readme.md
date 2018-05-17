# Quick Start
* `node app.js` run main server
* `npm run build` to build every thing
* `npm run dev` to launch webpack dev server

**mongodb is required**
change db url at ./server/data/base.js

# TODO 2017 11/17
- [x] 成績表格
- [x] 題目編號、操作人性化    -ok
- [x] 老師畫面與投影畫面一致

# TODO 2017 12/1
- [x] 輸出QRCODE
- [x] 只有選擇題
- [x] 搶答單純用回答
- [x] 回答提倒數
- [x] 輸出答案本

#TODO 0206
* 題目字體大小調整
* 2 3 階段搶答6選項

# TODO 2018 5/1
- [x] 比賽投影畫面
    - 題目、選項內容排版
    - 排名、分數結算畫面UI設計
- [ ] 題目編輯畫面
    - 配分工具
    - 編輯介面放大
- [ ] 首頁UI設計
    [ ] 新背景圖
    - 內容排版

# TODO 2018 5/8
- 系統功能增強
    - [ ] 伺服器端倒數控制
    - [ ] 公布答案狀態紀錄 - 投影端修正
- 操作介面增強
    - [ ] 切換題目
    - [ ] realtime 狀態修正
        - 刪除作答紀錄?
- 設計
    - [x] 手機端介面


# TODO 2018 5/11 - 實測
- 功能
    - [x] 搶答題回答倒數
    - [ ] 公布答案顯示前面名次
- 介面
    - [x] 低解析度支援
    - [x] 部分按鈕沒有回饋
        - 返回場次: 不夠顯眼
        - 重新搶答: 沒有hover回塊
- 警示系統
    - [ ] 組別斷線提醒
    - [ ] 題目基礎檢測

# TODO 2018 5/17 - 規則調整
- [ ] 搶答題分數遞減及跳過題目功能
    - 每次遞減2分，到2分為止
    - 搶答五組均未達對，跳過此題
- [ ] 第三階段閱讀題
    - 