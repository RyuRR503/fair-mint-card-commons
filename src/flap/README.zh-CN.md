# Flap 沙箱专用（零图片文件、零外网）

- `inline-assets.ts`：CATCH 原版字标五个字母切片 + 光泽遮罩 + 上海夜景原图，全部以内嵌数据写在代码里，不是图片文件，也不需要上传密钥。
- `FlapArtwork.tsx`：
  - `<FlapCatchLettering />` 替换原来的 `CatchLettering`（原图、逐字升起和金色扫光完全一致）。
  - `<FlapCityBackdrop />` 放在首页背景层，替换金色光晕。
- `FlapOfflineMap.tsx`：可拖动、滚轮/双指缩放的离线地图，不用地图库、不拉瓦片、不调用逐帧测量接口。
  - `points` 传点位（id、lat、lng、label、cooling），`me` 传 `useGeolocation()` 的坐标，`onSelect` 点击点位。
  - 点城市自动放大到街区级，「我」按钮直接定位到用户。
  - 说明：没有街道底图（街道需要瓦片），放大后显示的是点位与用户的精确相对位置和店名。

## 排版：`FlapMiniApp.tsx`（直接当 MiniApp 首页用）

竖屏单屏、整页不滚动，四层：
1. 顶栏 52px：CATCH 字标 + 城市 + 钱包地址
2. 雷达地图 45% 屏高：`FlapOfflineMap`，`me` 接 `useGeolocation()`
3. 附近点位列表（剩余高度，内部滚动）：按距离排序，点击弹出底部「捕获」抽屉，50 米内才可捕获，显示 15 分钟领取码
4. 底部 3 个 Tab：寻宝雷达 / 9 股金库 / 我的记录

参数：`spawns`（点位）、`me`（定位）、`wallet`（钱包地址）、`onCatch`（调用我们后端拿领取码）。不传时用内置上海演示数据，方便直接看效果。
股票图标用品牌色圆章 + 代号，纯代码，无图片。

## 怎么用（给 Flap）
1. 把整个 `src/flap/` 复制进 MiniApp 模板，入口页直接渲染 `<FlapMiniApp />`，外层不要再套官网的顶栏/页脚。
2. `me` 接 `useGeolocation()` 返回的 latitude/longitude。
3. `onCatch` 里调用 catch.fun 后端拿 15 分钟领取码（签名私钥只在我们后端）。
4. `spawns` 换成后端点位接口数据；不传时显示上海演示数据。
