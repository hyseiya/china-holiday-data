# 中国节假日数据

提供中国大陆全国性放假调休安排的静态年度 JSON。已整理 2026、2027 年国务院办公厅正式通知，放假日和调休补班日均有明确标识。

数据中的放假区间包含周末和调休，**不能把区间总天数理解为法定节假日天数**。不包含地方、少数民族或部分公民专属假期。

## 数据文件

| 年度 | 文件 | 放假日期数 | 补班日期数 | 依据公布日期 |
| --- | --- | ---: | ---: | --- |
| 2026 | [data/2026.json](data/2026.json) | 33 | 6 | 2025-11-04 |
| 2027 | [data/2027.json](data/2027.json) | 29 | 5 | 2026-11-05 |

jsDelivr 镜像拉取模板：

```text
https://cdn.jsdelivr.net/gh/hyseiya/china-holiday-data@main/data/{year}.json
```

镜像分发本仓库同一份数据。更新后应核对 `version`，镜像可能保留缓存。

GitHub `main` 分支的 Raw 拉取模板：

```text
https://raw.githubusercontent.com/hyseiya/china-holiday-data/main/data/{year}.json
```

具体年度：

- [2026 JSON](https://raw.githubusercontent.com/hyseiya/china-holiday-data/main/data/2026.json)
- [2027 JSON](https://raw.githubusercontent.com/hyseiya/china-holiday-data/main/data/2027.json)

无需 Token。未公布、未整理的年度不提供文件，HTTP 404 表示暂无数据；不能因此把该年当作没有节假日，也不能用空数组伪装已确认全年。

## 格式与使用

年度 JSON 格式 v1：

```json
{
  "year": 2026,
  "region": "CN",
  "version": "2026-20251104-v1",
  "complete": true,
  "coverageStart": "2026-01-01",
  "coverageEnd": "2026-12-31",
  "source": "国务院办公厅正式通知",
  "days": [
    { "date": "2026-01-01", "kind": "rest", "name": "元旦" },
    { "date": "2026-01-04", "kind": "work", "name": "元旦调休补班" }
  ]
}
```

上面仅为字段示例，完整年度请使用 `data/` 中的文件。

- `rest`：官方通知中的放假日期，包括放假区间内的周末。
- `work`：官方明确的调休补班日期。
- `days` 只包含官方通知中的调整日期，按日期升序排列。未列出的日期由使用方的普通周历决定；一般周一至周五工作、周六日休息。
- 日期采用中国本地民用日期 `YYYY-MM-DD`，不进行 UTC 时间换算。
- `complete: true` 表示该年度通知的放假和补班安排已完整整理，不表示 `days` 列出了全年每一天。
- `source` 为字符串；`sourceMetadata` 额外保留通知标题、原始链接、公布日期、文号及核对用转载链接。
- 正式通知有修订或整理错误得到修正时，更新对应文件并递增 `version`。本仓库手工核对维护，不承诺自动抓取未来年度。

## 官方依据与日期汇总

- 2026：[中国政府网原始通知](https://www.gov.cn/zhengce/content/202511/content_7047090.htm)，国办发明电〔2025〕7号，2025-11-04；已对照[北京市政府原文转载](https://www.beijing.gov.cn/zhengce/zhengcefagui/202511/t20251104_4258873.html)。
- 2027：[中国政府网原始通知](https://www.gov.cn/zhengce/content/202611/content_7085101.htm)，国办发明电〔2026〕10号，2026-11-05；已对照[国家林草局转载](https://www.forestry.gov.cn/lyj/1/szxx/20261105/695102.html)及[新华网转载](https://www.news.cn/politics/20261105/f90cd6ad4df94ab4833b141e52ccfc13/c.html)。

日期范围含首尾，两年度均为正式安排。

| 节日 | 2026 放假 | 2026 补班 | 2027 放假 | 2027 补班 |
| --- | --- | --- | --- | --- |
| 元旦 | 01-01～01-03 | 01-04 | 01-01～01-03 | 无 |
| 春节 | 02-15～02-23 | 02-14、02-28 | 02-05～02-13 | 01-31、02-14 |
| 清明节 | 04-04～04-06 | 无 | 04-03～04-05 | 无 |
| 劳动节 | 05-01～05-05 | 05-09 | 05-01～05-05 | 05-08 |
| 端午节 | 06-19～06-21 | 无 | 06-09 | 无 |
| 中秋节 | 09-25～09-27 | 无 | 09-15 | 无 |
| 国庆节 | 10-01～10-07 | 09-20、10-10 | 10-01～10-07 | 09-26、10-09 |

## 校验

使用 Node.js 20 或更新版本，无需安装依赖：

```sh
node --test tests/calendar-data.test.mjs
```

测试独立列举官方区间及补班，核对日期集合、节日名称、完整性、来源、排序、日期合法性和补班是否落在周末。未公布年度不能预先创建文件。

2026-11-08 验证：9 项数据测试通过；两个年度的匿名 Raw 和镜像请求均返回 HTTP 200，内容与仓库文件逐字一致，2028 返回 HTTP 404。

许可：[MIT](LICENSE)。
