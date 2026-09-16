# PCB 手工贴片辅助

Python 解析 CSV/TXT/XLSX 坐标与可选 BOM，输出内嵌数据、样式和 JavaScript 的单个 SVG HTML。页面无需网络、Web Server 或 Node.js；XLSX 导入所需 JSZip 已内嵌。

## 使用

Python 3.10+。CSV/TXT 使用标准库；读取 XLSX 需要 openpyxl。

```bash
python -m pip install -r requirements.txt
python pcb_map.py examples/placement.csv
```

双击生成的 `placement.html`。其他输入方式：

```bash
python pcb_map.py placement.csv bom.xlsx
python pcb_map.py placement.csv
python pcb_map.py examples/placement.csv examples/bom.csv -o demo.html
python -m unittest discover -s tests -v
```

默认输出到当前工作目录，会覆盖同名 HTML；需要保留旧文件时使用 `-o` 指定不同名称。

## 项目结构

- `pcb_map.py`：命令行入口。
- `pcbmap/models.py`：Component 数据模型。
- `pcbmap/parser.py`：编码、分隔符、字段识别及坐标解析。
- `pcbmap/bom.py`：BOM 位号展开、匹配和诊断。
- `pcbmap/render.py`：安全内嵌 JSON、板子指纹和 HTML 生成。
- `templates/viewer.html`：完整原生前端。
- `templates/stage1.html`：第一阶段基础 SVG 验证快照。
- `examples/placement.csv`、`bom.csv`：四元件演示数据。
- `tests/`：解析、BOM、实际文件及 HTML 数据安全测试。
- `dist/index.html`、`preview.mjs`：Sites 页面与开发验证入口；离线使用不需要。

## 输入数据模型

| 字段 | 类型 | 规则 |
|---|---|---|
| designator | str | 唯一、大写位号 |
| device | str | 型号/MPN，可空 |
| footprint | str | 封装，可空 |
| x / y | float | Mid X/Mid Y，统一 mm，允许负数 |
| layer | str | Top / Bottom；不接受未知层 |
| value | str | BOM 参数，或坐标内 Comment/Value |
| bom | dict | 原始相关字段，用于详情 |
| rotation | float | 有 Rotation 时使用，默认 0 |

坐标优先 Mid X/Mid Y，其次 Center X/Center Y、PosX/PosY、X/Y，**不使用 Ref/Pad 坐标替代中心**。支持逗号、Tab、分号及 UTF-8 BOM、UTF-16 BOM、GB18030；mm/mil/in 后缀转毫米，无后缀按 mm。

XLSX 读取第一个含位号表头的工作表，不合并多个工作表。BOM 支持英文/中文列名、逗号/分号/空白分隔位号和 C1-C8 范围。实际数量始终来自唯一坐标位号；BOM 数量保留在详情，不自动生成缺失坐标。BOM 重复位号报错，未匹配位号输出提示。

没有独立 BOM 时仍可运行。若坐标表也没有参数，仅提供元件列表；坐标表含 Comment 时可直接分组。同参数但不同型号或封装分开，防止误混料。

## 操作

- 搜索完整位号自动切层并定位；搜索参数/型号后 Enter 选择匹配项。
- 左侧物料清单按**当前层及筛选条件**列出，点击后高亮，保持视图；完成按钮默认只作用于当前面已选元件；勾选“同时标记正反面”后才处理两面。
- 默认点击查看详情，启用“贴片模式”后单击元件即完成；底部可撤销当前元件已贴状态。
- 滚轮以指针位置缩放，拖动平移，双击或 F 复位；T/B 切层，/ 搜索，Space 完成，Esc 取消。
- Bottom 默认绕元件范围竖直中心轴左右镜像，即左右翻板；也可选择原始坐标方向。文字保持可读。
- 封装优先识别名称中的 L/W，再识别英制 0402/0603/0805 等常见尺寸。矩形为估算外形，没有焊盘/引脚 1 指示，不能据此判断极性。
- 位号按缩放及标签碰撞自动隐藏；选中位号优先显示。
- 进度存储在 localStorage，以板子数据指纹隔离。刷新不会清除；清理浏览器数据、私密模式、换浏览器/文件路径可能导致状态不可用。浏览器拒绝存储时页面明确提示。
- 在线与离线页面不自动同步进度；下载 HTML 携带板子数据，不包含贴片进度。

## 当前边界

PDF 仅用于人工核对布局，未解析成背景。无 Gerber、真实板框或 Pad。虚线仅是元件范围；封装和角度来自导出数据，复杂封装可能与实际外壳不同。尚未验证所有 EDA 导出变体；字段歧义或缺失会报错，避免静默猜测。

## 网页内导入板子

点击顶部“导入板子”，选择 CSV/TXT/TSV/XLSX 坐标文件，可同时选择 BOM，点击“导入并切换”。文件在浏览器本地解析，无需服务器或 CDN。XLSX 读取使用随单文件嵌入的 JSZip 3.10.1（许可证见 vendor/）。旧版 XLS 需另存为 XLSX。

自动识别位号、Mid X/Mid Y（或 X/Y、PosX/PosY）、Layer/Side/层，以及型号、参数、封装等常用表头。支持 mm/mil/inch、正负坐标、UTF-8/GB18030/带 BOM 的 UTF-16。重复位号、无效坐标、未知层、无匹配 BOM 会阻止切换，保留当前板。BOM 支持多位号及范围，合并后显示匹配统计。

各板进度按文件名（不含扩展名）、位号、坐标、层及角度隔离；重新导入同名同坐标板可恢复。浏览器会记住最近导入的板子，BOM 改动不会清除该板进度。改名或修改坐标视为新板。数据和进度仅保存在当前浏览器，清除浏览器数据会丢失；导出 HTML 包含当前板数据，进度仍保存在各浏览器本机。

浏览器导入解析回归：`node tests/test_importer.cjs`。

## 精确与模糊物料匹配

精确匹配要求元件类型、封装、有效值及型号一致。当前明确参数的元件为黄色，其他精确匹配元件为蓝色。

模糊匹配仅用于贴片电阻、电容：一方没有有效值时，从参数/名称中的型号描述、Device 型号或相同型号其他元件推测数值。统一 nF/uF、Ω/kΩ/4K7 等写法，忽略耐压等附加信息，用同类型、同封装、相同数值查找候选；红色表示可能相同，需人工核对。匹配双向生效；颜色按元件自身参数判断：缺少有效值、需要推测的元件显示红色，有明确值的相关元件显示蓝色。主动选择无有效值元件时，它自身保持红色，不会把有明确值的候选一起变红。

型号中的长数字串只在同封装已知值中存在唯一解释时拆分，多解或无依据时不强行匹配。不对电感、芯片或插装元件进行模糊匹配。精确组保留在物料清单中，模糊候选不会被改写为确定物料。详情显示识别来源并保留原始字段。

“标记已贴”和“取消标记”默认只处理当前面全部已选元件（包括当前面的红色候选）。勾选“同时标记正反面”后才一次处理两面；高亮和背面提醒不受该选项影响。单击即完成模式仍只标记实际点击的单个元件。

回归：`node tests/test_materials.cjs`。

贴片电阻支持从与封装一致的“尺寸＋精度字母＋三/四位阻值编码”型号段推断阻值。Comment 可识别时优先于 Device；从型号编码推断的值始终标红，参与同值同封装匹配和批量标记，保留原始字段供人工核对。

导入选中文件时立即校验格式，PDF 布局图会提示导出坐标文件。元件外形周围增加 10 屏幕像素的最近元件点击容差，位号文字支持点击；移动超过 7 像素才拖动，双击元件不会复位视图。

排针尺寸估算识别封装名的 R（行数）、C（列数）、P（针距）、S（排距），避免将多排连接器按总针数画成单排。行列与总针数不一致时使用默认外形；明确的 L/W 尺寸仍优先。外形尺寸为估算，旋转沿用坐标文件。

识别 Test-Point-尺寸（及 TestPad）裸测试焊盘，保留圆形定位参考，但排除物料分组、待贴筛选、批量标记和进度；旧进度中测试点记录加载时忽略。不仅依据 TP 位号排除，实体测试环仍可贴装。
DF40C-90DS 及带下划线的自定义封装别名使用 20.6 × 3.38 mm 外形参考，来源 https://www.hirose.com/product/p/CL0684-4124-8-51 ，方向沿用坐标文件；这不代表读取了自定义封装的真实焊盘或庭院。

默认工作台不内置任何板子：运行 `python build_site.py` 生成空白 placement.html 和 dist/index.html。导入后的板子仍在本机恢复；兼容旧版工作台已导入的本机缓存。Python 坐标文件入口仍可生成携带指定板子的离线页面。
前端回归使用 `python pcb_map.py examples/placement.csv -o /tmp/pcb-test.html` 生成测试夹具，然后通过 `PCB_TEST_HTML=/tmp/pcb-test.html node tests/test_materials.cjs` 运行；test_search.cjs、test_export.cjs 同样指定夹具。
## 前端回归

先运行 `python tests/make_fixture.py` 生成合成测试数据，再运行 `node tests/test_materials.cjs`、`node tests/test_search.cjs`、`node tests/test_export.cjs` 和 `node tests/test_importer.cjs`。不包含任何实际板子文件。
