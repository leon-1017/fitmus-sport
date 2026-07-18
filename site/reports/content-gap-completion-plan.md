# Fitmus Sport 内容补齐分步计划

> 创建日期：2026-07-17  
> 依据：[`original-site-content-gap-audit.md`](./original-site-content-gap-audit.md) 与 [`legacy-url-comparison.json`](./legacy-url-comparison.json)  
> 执行方式：后续任务一次只执行一个阶段；阶段完成后验证、提交并停止，等待确认后再进入下一阶段。
> 当前状态：阶段 C4-AA 已完成，等待阶段 C4-AB。

## 1. 范围约束

本计划补齐新站遗漏的产品、文章、图片和必要的内容发现能力，不追求旧站像素级还原。

明确不做：

- 不制作联系表单，不接入提交接口、邮件、CRM、验证码或反垃圾服务。
- 不恢复产品目录的邮件订阅门槛；目录如继续使用，采用直接下载。
- 不恢复旧版图片型 mega menu、Avada 小部件样式或旧站动画。
- 不默认复制旧站地图插件、API 密钥、统计脚本和 WordPress 配置。

所有阶段共同遵守：

1. 先检查本地是否已有图片，再决定是否从原站取得源文件；生产页面不得热链旧站图片。
2. 保留原始 slug 和可验证的正文、日期、分类及媒体关系，不为填满页面虚构内容。
3. 批量生成前先修复/复用生成脚本，避免只手工修改生成产物。
4. 每阶段只提交本阶段文件；发现来源不确定或内容冲突时停止并记录。

## 2. 阶段总览

| 阶段 | 目标 | 对应差距 | 主要产物 |
| --- | --- | --- | --- |
| C0 | 建立可执行清单和状态基线 | G-01、G-02、G-03 | 96 条内容状态清单、来源与分类字段 |
| C1 | 补齐首页关联的两个产品 | G-01 | 2 个产品详情、图片、原路径 |
| C2 | 分批补齐其余 41 个产品 | G-02 | 完整产品记录及分类归属 |
| C3 | 分批补齐 53 篇文章 | G-03 | 文章正文、日期、图片和原路径 |
| C4 | 补齐产品图库与相关推荐 | G-05、G-06 | 可复用图库和 related-products 组件 |
| C5 | 补齐首页辅助内容 | G-07、G-08、G-09 | 目录直链、视频区、分类说明 |
| C6 | 补齐低优先级发现能力 | G-10、G-11、G-12 | 静态位置入口、文章发现、目录筛选方案 |
| C7 | 全站回归与收口 | 全部 | 更新后的差距报告和验收记录 |

## 3. 分阶段执行说明

### 阶段 C0：内容清单与来源基线

目标：把现有报告中的 43 个产品和 53 篇文章转为后续可以逐条勾选、复核和验收的工作清单。

执行内容：

- 从 `legacy-url-comparison.json` 提取全部 96 个遗漏路径。
- 为每条记录增加：类型、原 slug、原 URL、标题、分类、来源状态、正文状态、主图状态、图库状态、处理决定和备注。
- 处理决定只允许：`pending`、`migrate`、`approved-redirect`、`retired`、`done`。
- 标记首页两个优先产品，并把剩余产品按八个产品一级分类分组。
- 检查 `site/public/images`、本地解析数据和内容集合，识别“已有但未引用”的资源，避免重复下载。

完成标准：

- 清单恰好覆盖 43 个产品和 53 篇文章，路径无重复。
- 每条记录都有处理状态和可追溯来源；未知项明确标记，不猜测。
- 首页两个产品排在首批，产品分类分组可直接用于阶段 C2。

建议提交：`Create content completion inventory`

---

### 阶段 C1：首页两个缺失产品

目标：恢复原首页仍重点展示的两个产品及其原始详情路径。

执行内容：

- 补齐 `Wall Mount Rig`：正文、产品分类、SEO 字段、主图 `14feet-free-standing-rig.jpg` 和可验证图库。
- 补齐 `Wall mounted Rig for Crossfit 3-3`：正文、产品分类、SEO 字段、主图 `wall-mounted-rig-3-3.jpg` 和可验证图库。
- 生成 `/product/wall-mount-rig/` 与 `/product/wall-mounted-rig-for-crossfit-3-3/`。
- 将首页产品卡片指向恢复后的详情页；不改变已确认的首页导航结构。

完成标准：

- 两个原路径都直接返回对应产品详情，不再落到产品总览。
- 卡片、主图、正文和分类在桌面及移动端可用。
- 构建、内部链接和本地资源检查通过，页面不热链旧站图片。

建议提交：`Restore homepage featured product records`

---

### 阶段 C2：其余 41 个产品

目标：按产品分类分批恢复其余遗漏产品，避免一次性大规模改动难以复核。

执行内容：

- 按八个产品分类执行小批次；单次建议 5–10 个产品。
- 每个产品补齐标题、slug、正文、分类、主图、可验证图库、SEO 字段和原路径。
- 同名、近似名或疑似重复产品必须对比正文和图片后再决定迁移或批准重定向。
- 每批更新 C0 状态清单与 URL 覆盖报告。

完成标准：

- 本阶段 41 条记录全部为 `done`、`approved-redirect` 或 `retired`，后两种必须写明理由。
- 分类页能够发现迁移后的产品，原路径无未解释 404。
- 图片和链接检查无新增问题。

建议提交：每个分类或每 5–10 个产品一个提交，例如 `Restore missing weight lifting products`。

---

### 阶段 C3：53 篇遗漏文章

目标：恢复有价值的历史内容和原始文章路径。

执行内容：

- 优先处理有商业价值、站内引用或外部入口的常青文章，再处理其余记录。
- 单次建议 8–12 篇，补齐标题、slug、发布日期、正文、分类、特色图片和 SEO 摘要。
- 清理旧 WordPress 短代码、表单、脚本、失效嵌入和 Avada 布局残留。
- 对确实不再适用的活动页或感谢页，记录 `retired` 或批准重定向的业务理由。

完成标准：

- 53 条记录全部有明确最终状态。
- 已迁移文章的原路径直接展示正文，日期和图片可验证。
- HTML 安全扫描、构建、链接和资源检查通过。

建议提交：按主题或每 8–12 篇一个提交。

---

### 阶段 C4：产品图库与相关推荐

目标：让结构化产品数据中的图片和产品关系真正显示在详情页。

执行内容：

- 创建可复用、响应式、键盘可用的产品图库；没有图库时保持单图布局。
- 只使用已验证的原图，过滤 66×66 等缩略图重复项。
- 增加 `Related Products` 组件：优先显式关系，其次同分类规则；限制数量并避免当前产品和重复项。
- 为缺图、单图、横图、竖图及多图产品建立测试样本。

完成标准：

- 图库支持移动端浏览、键盘操作和合理 alt 文本，无布局跳动或坏图。
- 相关推荐全部指向存在的产品，内容不足时允许不显示。
- 产品详情页构建和自动检查通过。

建议提交：`Add product galleries and related products`

---

### 阶段 C5：首页辅助内容

目标：补齐原站有业务价值、且适合新站信息架构的首页内容。

执行内容：

- 核实产品目录 PDF 是否仍有效；有效则本地化并增加直接下载 CTA，无订阅表单。
- 增加精简的视频内容区，链接到确认后的 YouTube 频道或播放列表，不迁移视频文件。
- 为八个产品分类整理简短说明，并复用到分类入口或分类落地页。
- 延续现有浅色顶部导航，不恢复旧站 mega menu。

完成标准：

- 目录链接有效、文件受控、没有邮件收集交互。
- 视频和分类链接可访问，外链行为清晰。
- 首页在关键尺寸下无横向溢出，新增内容不影响核心加载体验。

建议提交：`Complete homepage supporting content`

---

### 阶段 C6：低优先级内容发现能力

目标：在不引入不必要后端的情况下，改善位置、文章和产品发现。

执行内容：

- Contact Us 仅增加静态位置卡片和外部导航链接（如确认需要）；保持静态联系方式，不增加表单。
- 在文章详情页增加小型 Recent Posts／Categories 模块，数据来自内容集合。
- 根据产品数量和用户路径选择产品筛选方式：优先已有分类页，必要时再增加轻量客户端筛选或搜索。

完成标准：

- 联系页没有失效表单控件或误导性的提交按钮。
- 文章发现链接和产品筛选结果全部指向有效页面。
- 不引入旧站插件、私密配置或不必要的运行时服务。

建议提交：按位置、文章发现、产品筛选分别提交，避免混合改动。

---

### 阶段 C7：全站回归与收口

目标：确认所有批准补齐项完成，并留下可追溯的最终结论。

执行内容：

- 重新生成 URL 对比、内部链接、资源和 SEO 报告。
- 复核所有 C0 清单状态，确认没有未解释的 `pending`。
- 检查首页、五个一级导航页面、八个产品分类、代表性产品和文章详情。
- 检查 360、768、1024、1440 px 关键宽度和键盘访问。
- 更新原站差距审计，记录已完成项、批准重定向和明确保留的差异。

完成标准：

- 遗漏清单中 `pending` 为 0，未解释缺失 URL 为 0。
- 构建、链接、资源、SEO 和危险 HTML 检查全部通过。
- 新站不依赖旧站提供页面或图片；已批准外链除外。
- 联系页保持静态信息展示，无表单交互。

建议提交：`Close original-site content gap audit`

## 4. 每阶段汇报模板

```markdown
### 内容补齐阶段 Cx 完成记录

- 完成范围：
- 新增或恢复的记录：
- 图片处理：
- 批准重定向／退役：
- 验证命令与结果：
- 提交：
- 遗留问题：
- 是否可以进入下一阶段：是 / 否
```

## 5. 下一步

下一次任务从“阶段 C4-V：继续清理产品图库候选媒体（下一批 12 个产品）”开始。该批完成并汇报后停止，待确认再继续后续媒体整理。

## 6. 阶段完成记录

### 阶段 C0 完成记录

- 完成范围：新增可重复执行的内容差距清单生成脚本、机器可读 JSON 清单和 Markdown 人工检查清单。
- 清单数量：96 条唯一旧站路径，其中产品 43 条、文章 53 条。
- 阶段分配：C1 为 2 个首页优先产品，C2 为其余 41 个产品，C3 为 53 篇文章。
- 初始决定：2 条为 `migrate`，其余 94 条为 `pending`；没有擅自批准重定向或退役内容。
- 来源状态：96 条均在 `data/parsed-local.json` 中找到标题、正文和分类信息。
- 图片状态：96 张主图均已在本地；清单引用到 153 个唯一的本地资源，缺失资源为 0。
- 分类状态：43 个产品均已映射到当前八个一级产品分类，没有未知分类。
- 注意事项：旧数据的 `gallery` 数组可能混入共享的 66×66 页脚／侧栏缩略图，C1、C2 和 C4 必须先筛选，不能直接全部作为产品图库展示。
- 验证：`npm run report:content-gaps` 通过；连续生成的 JSON 和 Markdown SHA-256 一致；状态值与路径唯一性断言通过。
- 提交说明：`Create content completion inventory`。
- 是否可以进入下一阶段：是。

### 阶段 C1 完成记录

- 完成范围：恢复首页优先的 `Wall Mount Rig` 与 `Wall mounted Rig for Crossfit 3-3` 两个结构化产品记录。
- 恢复路径：`/product/wall-mount-rig/` 与 `/product/wall-mounted-rig-for-crossfit-3-3/`。
- 内容处理：基于本地解析源数据整理产品说明、规格、SEO 字段、一级分类和已验证主图；未把旧站共享的 66×66 侧栏缩略图混入产品图库。
- 首页处理：Featured Products 已改回指向这两个原始 slug，替换了之前的近似替代产品条目。
- 清单状态：96 条固定基线保留；2 条 C1 记录标为 `done` 且覆盖状态为 `restored`，剩余 94 条保持待处理。
- URL 覆盖：已保留旧路径 496 条；当前预期遗漏为 94 条（产品 41、文章 53），未解释遗漏为 0。
- 验证：Node 22 公开模式构建成功，生成 507 页；`check:dist` 0 问题，`check:seo` 0 问题，内容清单和覆盖状态一致。
- 提交说明：`Restore homepage featured product records`。
- 是否可以进入下一阶段：是。

### 阶段 C2-A 完成记录

- 完成范围：恢复 Weight Lifting Equipment（3 个）与 Body Weight & Gymnastic（4 个）首批共 7 个产品。
- 恢复产品：`Weight Bar Gripz`、`WEIGHT LIFTING CHAINS`、`Women's Light Weight Vinyl Dipping Neoprene Dumbbell`、`wall ball`、`Wall Ball Soft Medicine Ball - Crossfit`、`Weighted Bouncy Ball – Rubber Medicine Balls`、`Wood Gymnastic Rings`。
- 内容处理：使用本地解析源的标题、分类、主图和正文，整理为符合 Astro 集合 schema 的 Markdown；每个记录只保留已验证主图，候选图库留待 C4 筛选。
- 清单状态：C2-A 的 7 条标为 `done`；固定 96 条基线中已恢复 9 条，剩余 87 条。
- URL 覆盖：已保留旧路径 503 条；当前预期遗漏为 87 条（产品 34、文章 53），未解释遗漏为 0。
- 验证：Node 22 公开模式构建成功，生成 514 页；`check:dist` 0 问题，`check:seo` 0 问题，分类页和 7 条原始产品路径均已生成。
- 提交说明：`Restore first C2 product batch`。
- 是否可以继续 C2-B：是，待确认。

### 阶段 C2-B 完成记录

- 完成范围：恢复 Strength & Condition 的 8 个产品。
- 恢复产品：`Weight Vest 10KG`、`Weight Vest 30KG`、`Weightlifting Drop Pads`、`Wood Jerk Box set`、`Wood Parallettes`、`wooden jerk box`、`Wooden Puzzle Plyo Box`、`Wooden Trapezium Plyo Boxes 12" 18" 24" 30"`。
- 内容处理：使用本地解析源的标题、分类、主图和正文，整理为符合 Astro 集合 schema 的 Markdown；每个记录只保留已验证主图，候选图库留待 C4 筛选。
- 清单状态：C2-B 的 8 条标为 `done`；固定 96 条基线中已恢复 17 条，剩余 79 条。
- URL 覆盖：已保留旧路径 511 条；当前预期遗漏为 79 条（产品 26、文章 53），未解释遗漏为 0。
- 验证：Node 22 公开模式构建成功，生成 522 页；`check:dist` 0 问题，`check:seo` 0 问题，Strength & Condition 分类页和 8 条原始产品路径均已生成。
- 提交说明：`Restore second C2 product batch`。
- 是否可以继续 C2-C：是，待确认。

### 阶段 C2-C 完成记录

- 完成范围：恢复 Crossfit Racks & Rigs 的首批 6 个产品。
- 恢复产品：`Wall ball Target`、`Wall Crossfit Rack`、`Wall Mount Rig`（`wall-mount-rig-2`）、`Wall Mount Rig`（`wall-mount-rig-3`）、`Wall Mount Single Rig`、`wall mounted monkey pull up bar`。
- 内容处理：使用本地解析源的标题、分类、主图和正文，整理为符合 Astro 集合 schema 的 Markdown；每个记录只保留已验证主图，候选图库留待 C4 筛选。
- 清单状态：C2-C 的 6 条标为 `done`；固定 96 条基线中已恢复 23 条，剩余 73 条。
- URL 覆盖：已保留旧路径 517 条；当前预期遗漏为 73 条（产品 20、文章 53），未解释遗漏为 0。
- 验证：Node 22 公开模式构建成功，生成 528 页；`check:dist` 0 问题，`check:seo` 0 问题，Crossfit Racks & Rigs 分类页和 6 条原始产品路径均已生成。
- 提交说明：`Restore first C2-C product batch`。
- 是否可以继续 C2-D：是，待确认。

### 阶段 C2-D 完成记录

- 完成范围：恢复 Crossfit Racks & Rigs 的第二批 5 个产品。
- 恢复产品：`Wall mounted pull up Bar`、`Wall mounted pull up bar`、`wall mounted Rig 1-1`、`Wall mounted Rig`、`Wall mounted rig 2-2`。
- 内容处理：使用本地解析源的标题、分类、主图和正文，整理为符合 Astro 集合 schema 的 Markdown；每个记录只保留已验证主图，候选图库留待 C4 筛选。
- 清单状态：C2-D 的 5 条标为 `done`；固定 96 条基线中已恢复 28 条，剩余 68 条。
- URL 覆盖：已保留旧路径 522 条；当前预期遗漏为 68 条（产品 15、文章 53），未解释遗漏为 0。
- 验证：Node 22 公开模式构建成功，生成 533 页；`check:dist` 0 问题，`check:seo` 0 问题，Crossfit Racks & Rigs 分类页和 5 条原始产品路径均已生成。
- 提交说明：`Restore second C2-C product batch`。
- 是否可以继续 C2-E：是，待确认。

### 阶段 C2-E 完成记录

- 完成范围：恢复 Crossfit Racks & Rigs 的最后 5 个产品，至此该分类在固定基线中的产品已全部恢复。
- 恢复产品：`Wall mounted Rig for Crossfit 4-4`、`Wall mounted wood Peg board`、`Folding Wall Squat Rack`、`X-Frame 6 Rack Package`、`X-Frame Chin Up Max Pack`。
- 内容处理：使用本地解析源的标题、分类、主图和正文，整理为符合 Astro 集合 schema 的 Markdown；每个记录只保留已验证主图，候选图库留待 C4 筛选。
- 清单状态：C2-E 的 5 条标为 `done`；固定 96 条基线中已恢复 33 条，剩余 63 条（产品 10、文章 53）。
- URL 覆盖：已保留旧路径 527 条；当前预期遗漏为 63 条（产品 10、文章 53），未解释遗漏为 0。
- 验证：Node 22 公开模式构建成功，生成 538 页；`check:dist` 0 问题，`check:seo` 0 问题，Crossfit Racks & Rigs 分类页和 5 条原始产品路径均已生成。
- 提交说明：`Complete Crossfit Racks & Rigs restoration`。
- 是否可以继续 C2-F：是，待确认。

### 阶段 C2-F 完成记录

- 完成范围：恢复 Strongman Equipment（1 个）、Equipment Storage（3 个）和 Balance & Mobility（3 个），共 7 个产品；这三个分类在固定基线中的产品已全部恢复。
- 恢复产品：`Yoke Walk`、`VIPR Storage Rack`、`Wall Mount Speed Jump Rope Hanger`、`Weight Plate Storage Stand`、`Wooden Balance Board`、`Yoga Foam Block`、`Yoga Wheel Back Stretcher Wheel`。
- 内容处理：使用本地解析源的标题、分类、主图和正文，整理为符合 Astro 集合 schema 的 Markdown；每个记录只保留已验证主图，候选图库留待 C4 筛选。
- 清单状态：C2-F 的 7 条标为 `done`；固定 96 条基线中已恢复 40 条，剩余 56 条（产品 3、文章 53）。
- URL 覆盖：已保留旧路径 534 条；当前预期遗漏为 56 条（产品 3、文章 53），未解释遗漏为 0。
- 验证：Node 22 公开模式构建成功，生成 545 页；`check:dist` 0 问题，`check:seo` 0 问题，三个分类页和 7 条原始产品路径均已生成。
- 提交说明：`Restore C2-F product categories`。
- 是否可以继续 C2-G：是，待确认。

### 阶段 C2-G 完成记录

- 完成范围：恢复 Cardio Equipment & Accessories 的最后 3 个产品，至此固定基线中的 43 个产品已全部恢复。
- 恢复产品：`Water Rowing Machine`、`Women's Activewear Yoga Pants High Rise Workout Gym Spanx Tights Leggings`、`Womens Net Patch Compression Running Yoga Sports Fitness Gym Stretch Pants Exercise Leggings`。
- 内容处理：使用本地解析源的标题、分类、主图和正文，整理为符合 Astro 集合 schema 的 Markdown；每个记录只保留已验证主图，候选图库留待 C4 筛选。
- 清单状态：C2-G 的 3 条标为 `done`；固定 96 条基线中已恢复 43 条，剩余 53 条，全部为文章。
- URL 覆盖：已保留旧路径 537 条；当前预期遗漏为 53 条（产品 0、文章 53），未解释遗漏为 0。
- 验证：Node 22 公开模式构建成功，生成 548 页；`check:dist` 0 问题，`check:seo` 0 问题，Cardio Equipment & Accessories 分类页和 3 条原始产品路径均已生成。
- 提交说明：`Complete product content restoration`。
- 是否可以继续 C3-A：是，待确认。

### 阶段 C3-A 完成记录

- 完成范围：恢复 In the News 文章首批 10 篇，保留原始文章 slug、标题和本地主图。
- 恢复文章：`Quick Tips About IWF standard Barbell`、`RESISTANCE BAND BENEFITS`、`Resistance Band Exercises that Burn Fat and Build Muscle`、`Reverse Hyper End Your Back Pain`、`Is Rubber Eco Friendly?`、`Cool Kettlebells Design- 3D scanned design`、`The seventh round strict air pollution inspection completed`、`Skull Kettlebell Give you a New Feeling`、`Smart Ways To Get In Shape`、`Starting a CrossFit Box? Get Help From These 10 Kickass Tips`。
- 内容处理：使用本地解析源整理为符合 Astro 文章集合 schema 的 Markdown；保留原始事实与规格，历史新闻明确标注其时间属性；未把旧站共享缩略图混入文章主图。
- 清单状态：C3-A 的 10 条标为 `done`；固定 96 条基线中已恢复 53 条，剩余 43 条，全部为文章。
- URL 覆盖：已保留旧路径 547 条；当前预期遗漏为 43 条（产品 0、文章 43），未解释遗漏为 0。
- 验证：Node 22 公开模式构建成功，生成 558 页；`check:dist` 0 问题，`check:seo` 0 问题，10 条原始文章路径均已生成。
- 提交说明：`Restore first C3 article batch`。
- 是否可以继续 C3-B：是，待确认。

### 阶段 C3-B 完成记录

- 完成范围：恢复 In the News 文章第二批 10 篇，保留原始文章 slug、标题和本地主图。
- 恢复文章：`Stay home thin! plastic fitness accessories 6 "small" Accessories`、`The strong is the new beautiful`、`Synergy 360 Circuit Functional Training System From China`、`Synrgy 360 Circuit Functional Training System From China`、`An Innovative Flooring Solution for Gym - Affordable, Durable`、`Thank you!`、`The 5 Best Squat Alternatives can Build Muscle`、`The 5 Best Ways to Break Into CrossFit`、`The 6 keys to keeping you fit all your life`、`The 36th China International Sporting Goods Show 2018`。
- 内容处理：使用本地解析源整理为符合 Astro 文章集合 schema 的 Markdown；保留两个 SYNRGY 原始 slug，历史展会文章保留其历史属性，`Thank you!` 仅恢复静态感谢内容，不新增联系表单交互。
- 清单状态：C3-B 的 10 条标为 `done`；固定 96 条基线中已恢复 63 条，剩余 33 条，全部为文章。
- URL 覆盖：已保留旧路径 557 条；当前预期遗漏为 33 条（产品 0、文章 33），未解释遗漏为 0。
- 验证：Node 22 公开模式构建成功，生成 568 页；`check:dist` 0 问题，`check:seo` 0 问题，10 条原始文章路径均已生成。
- 提交说明：`Restore second C3 article batch`。
- 是否可以继续 C3-C：是，待确认。

### 阶段 C3-C 完成记录

- 完成范围：恢复 In the News 文章第三批 10 篇，保留原始文章 slug、标题和本地主图。
- 恢复文章：`The Benefits of Crossfit Kettlebell Training.`、`The best home-gym equipment Worth Owning for every type of workout`、`The Best Kettlebell for Home Fitness COVID-19 STOCK SHORTAGES`、`The Best Strength Training Equipment to Buy in 2019`、`The super effective workout you need when you don't have time to train`、`Top 5 Exercise Products help Release Tight Muscles`、`Top 6 Benefits of Kettlebell Training`、`Top 9 Best Stability Ball Exercises`、`How to Train with a Weight Vest`、`Vibrating rollers offer Two Times More Effective than Ordinary Foam Roller`。
- 内容处理：使用本地解析源整理为符合 Astro 文章集合 schema 的 Markdown；历史疫情文章保留其历史属性，训练与健康内容补充了安全边界说明，不新增联系表单交互。
- 清单状态：C3-C 的 10 条标为 `done`；固定 96 条基线中已恢复 73 条，剩余 23 条，全部为文章。
- URL 覆盖：已保留旧路径 567 条；当前预期遗漏为 23 条（产品 0、文章 23），未解释遗漏为 0。
- 验证：Node 22 公开模式构建成功，生成 578 页；`check:dist` 0 问题，`check:seo` 0 问题，10 条原始文章路径均已生成。
- 提交说明：`Restore third C3 article batch`。
- 是否可以继续 C3-D：是，待确认。

### 阶段 C3-D 完成记录

- 完成范围：恢复 In the News 文章第四批 10 篇，保留原始文章 slug、标题和本地主图。
- 恢复文章：`Welcome to the world of CrossFit`、`What are the benefits of HIIT workouts?`、`what crossfit athletes eat`、`What Is Functional Training and How Can It Benefit You?`、`What is HIIT?`、`What is Powder Coating Kettlebell?`、`What kind of people train CrossFit?`、`What should I eat after a CrossFit workout?`、`What You Need to Know About CrossFit`、`What’s difference TPU versus CPU Polyurethane ?`。
- 内容处理：使用本地解析源整理为符合 Astro 文章集合 schema 的 Markdown；健康、训练与营养内容保留适度安全边界，材料文章保留 TPU/CPU 工艺差异，不新增联系表单交互。
- 清单状态：C3-D 的 10 条标为 `done`；固定 96 条基线中已恢复 83 条，剩余 13 条，全部为文章。
- URL 覆盖：已保留旧路径 577 条；当前预期遗漏为 13 条（产品 0、文章 13），未解释遗漏为 0。
- 验证：Node 22 公开模式构建成功，生成 588 页；`check:dist` 0 问题，`check:seo` 0 问题，10 条原始文章路径均已生成。
- 提交说明：`Restore fourth C3 article batch`。
- 是否可以继续 C3-E：是，待确认。

### 阶段 C3-E 完成记录

- 完成范围：恢复 In the News 最后一批 13 篇文章，至此固定内容差距基线全部完成。
- 恢复文章：`What's EPDM Rubber?`、`What's SBR Rubber?`、`when crossfit games 2018`、`Why Are People Wearing This Terrifying Mask to the Gym?`、`Why can't you do push ups? This is what your body is telling you`、`Why competition kettlebell is more popular in kettlebell work exercise?`、`Why CrossFit For MMA, Jiu-Jitsu, Muay Thai, Boxing`、`Why More and More Crossfitters choose The 5.11 Weighted Vest?`、`Why Should You Consider Adding a Curved Treadmill to Your Gym?`、`Why use a gym sled in your training?`、`Why We Love HOW PROPERTIES LIKE CROSSFIT ARE CHANGING SPORTS SPONSORSHIPS (And You Should, Too!)`、`Why you should include medicine ball in your workout?`、`With CrossFit, fitness is pushed to a whole different level In Malaysia`。
- 内容处理：使用本地解析源整理为符合 Astro 文章集合 schema 的 Markdown；历史赛事、材料和行业报道保留其时间或技术属性，健康与训练内容补充适度安全边界，不新增联系表单交互。
- 清单状态：C3-E 的 13 条标为 `done`；固定 96 条基线中已恢复 96 条，剩余 0 条（产品 0、文章 0）。
- URL 覆盖：已保留旧路径 590 条；当前预期遗漏为 0 条，未解释遗漏为 0。
- 验证：Node 22 公开模式构建成功，生成 601 页；`check:dist` 0 问题，`check:seo` 0 问题，13 条原始文章路径均已生成。
- 提交说明：`Complete C3 article restoration`。
- 是否可以继续 C4-A：是，待确认。

### 阶段 C4-A 完成记录

- 完成范围：新增可复用 `ProductGallery` 与 `RelatedProducts` 组件，并接入所有产品详情页。
- 图库处理：图库展示层会去重并过滤 `66x66`、`150x150`、`300x300` 等共享缩略图；没有可用多图时仍保持单图布局。
- 交互处理：缩略图采用按钮语义、`aria-label`、`aria-pressed` 和键盘可聚焦状态；主图使用稳定比例容器，避免切换时布局跳动。
- 相关推荐：按当前产品分类排除自身后取最多 4 条，全部链接到已存在的产品详情路径；内容不足时不渲染区块。
- 验证：Node 22 公开模式构建成功，生成 601 页；`check:dist` 0 问题，`check:seo` 0 问题；抽查产品详情页确认图库和相关推荐出现，展示 HTML 中无 `66x66` 缩略图。
- 提交说明：`Add reusable product gallery and related products`。
- 是否可以继续 C4-B：是，待确认。

### 阶段 C4-B 完成记录

- 完成范围：清理产品 frontmatter 中首批 12 个产品的共享缩略图候选媒体。
- 处理产品：`10 PAIR 2 TIER DUMBBELL RACK`、`10 PAIRS DUMBBELL RACK 2 LAYERS`、`10 PAIRS VERTICAL HEX DUMBBELL RACK`、`10KG HARDEN CHROME OLYMPIC BAR`、`12 SIDED RUBBER ENCASED DUMBBELL`、`12 SIDES OLYMPIC RUBBER COATED GRIP PLATE`、`15KG WOMENS CERAKOTE OLYMPIC BARBELL`、`15LB TECHNIQUE TRAINING BAR`、`16 Crossfit Monkey Bar Rig Jungle Rig`、`1LB MINI FIBERGLASS PLASTIC KETTLEBELL`、`2 Aluminum Barbell Collar`、`2 Chrome Olympic Spring Collar Pair`。
- 媒体处理：每条记录移除 `66x66` 共享缩略图，只保留已验证的原始大图；未重新下载或热链任何外部图片。
- 当前媒体状态：408 个产品记录中，已有 55 个不含这些共享缩略图，仍有 353 个待后续批次筛选。
- 验证：Node 22 公开模式构建成功，生成 601 页；`check:dist` 0 问题，`check:seo` 0 问题；首批 12 条详情页 gallery 均无 `66x66` 媒体。
- 提交说明：`Curate first product gallery batch`。
- 是否可以继续 C4-C：是，待确认。

### 阶段 C4-C 完成记录

- 完成范围：清理产品 frontmatter 中下一批 12 个产品的共享缩略图候选媒体。
- 处理产品：`2 Lock Jaw Olympic Locking Collars`、`2 Olympic Bar Muscle Clamp`、`2 Olympic Competition Rubber Bumper Plates Color`、`2 Tier Kettlebell Storage Rack`、`20 Crossfit Monkey Bar Rig Jungle Rig`、`20KG Men's Cerakote Olympic Barbell`、`2inch Olympic Tri-Grip Rubber Weight Plate`、`2 Olympic Cast Iron Tri-Grip Weight Plates`、`3-1 Foam Roller`、`3-1 Wooden Plyometric Box 12x14x16`、`3-1 Wooden Plyometric Box 12x16x18`、`3-in-1 Wood Plyo Box 16-20-24`。
- 媒体处理：每条记录移除 `66x66`、`150x150`、`300x300` 共享缩略图，只保留已验证的原始大图；未重新下载或热链外部图片。
- 当前媒体状态：408 个产品记录中，已有 67 个不含这些共享缩略图，仍有 341 个待后续批次筛选。
- 验证：Node 22 公开模式构建成功，生成 601 页；`check:seo` 0 问题；本批 12 条详情页 gallery 均无共享缩略图媒体。`check:dist` 当前仍报告 601 条既有 legacy Fitmus host 链接告警，与本批媒体变更无关。
- 提交说明：`Curate second product gallery batch`。
- 是否可以继续 C4-D：是，待确认。

### 阶段 C4-D 完成记录

- 完成范围：清理产品 frontmatter 中下一批 12 个产品的共享缩略图候选媒体。
- 处理产品：`3-in-1 Wooden Plyometric Box`、`3 Layer Kettlebell Rack New`、`3 Layer Kettlebell Storage Rack`、`3 Layer Wall Ball Rack`、`3 Tier Dumbbell Storage Rack`、`3 Tier Tray Hex Professional Dumbbell Rack`、`30 Crossfit Monkey Bar Rig Jungle Rig`、`40LB Adjustable Kettlebell`、`5.11 Tactical Plate Carrier Weight Vest`、`56 Olympic Combo Hex Bar`、`70 Dirty South Bar`、`Ab Carver Pro`。
- 媒体处理：每条记录移除 `66x66`、`150x150`、`300x300` 共享缩略图，只保留已验证的原始大图；未重新下载或热链外部图片。
- 当前媒体状态：408 个产品记录中，已有 79 个不含这些共享缩略图，仍有 329 个待后续批次筛选。
- 验证：Node 22 公开模式构建成功，生成 601 页；`check:seo` 0 问题；本批 12 条详情页 gallery 均无共享缩略图媒体。`check:dist` 仍报告既有 legacy Fitmus host 链接告警，与本批媒体变更无关。
- 提交说明：`Curate third product gallery batch`。
- 是否可以继续 C4-E：是，待确认。

### 阶段 C4-E 完成记录

- 完成范围：清理产品 frontmatter 中下一批 12 个产品的共享缩略图候选媒体。
- 处理产品：`Ab Wheel Pro Double Roller`、`Abdominal Workout Ab Mat`、`Abram GHD 2.0 Glute Ham Developer 2.0`、`Adjustable Bearing Speed Fitness Rope`、`Adjustable Bench Heavy Duty`、`Adjustable Boxing Mitts`、`Adjustable Equalizer Rack`、`Adjustable Fitness Parallettes`、`Adjustable Handle Exercise Grip`、`Adjustable Squat Rack 2`、`Adjustable Squat Rack`、`Adjustable Steel Plyometric Box`。
- 媒体处理：每条记录移除 `66x66`、`150x150`、`300x300` 共享缩略图，只保留已验证的原始大图；未重新下载或热链外部图片。
- 当前媒体状态：408 个产品记录中，已有 91 个不含这些共享缩略图，仍有 317 个待后续批次筛选。
- 验证：Node 22 公开模式构建成功，生成 601 页；`check:seo` 0 问题；本批 12 条详情页 gallery 均无共享缩略图媒体。`check:dist` 仍报告既有 legacy Fitmus host 链接告警，与本批媒体变更无关。
- 提交说明：`Curate fourth product gallery batch`。
- 是否可以继续 C4-F：是，待确认。

### 阶段 C4-F 完成记录

- 完成范围：清理产品 frontmatter 中下一批 12 个产品的共享缩略图候选媒体。
- 处理产品：`Aerobic Exercise Flooring`、`Aerobic Step Box 2`、`Aerobic Step Box`、`Agility Training Sled Harness`、`Air Bike`、`Aluminium Speed Rope with Dual Bearing`、`Aqua Bag`、`Barbell 6.6 Olympic Women Training Weight Bar`、`Barbell 7ft Man Training Olympic Weight Bar`、`Barbell Olympic 1-inch Spring Clips Collars Rubber Handle`、`Barbell Olympic Solid Chromed 47 EZ Curl Bar`、`Barbell Pad`。
- 媒体处理：每条记录移除 `66x66`、`150x150`、`300x300` 共享缩略图，只保留已验证的原始大图；未重新下载或热链外部图片。
- 当前媒体状态：408 个产品记录中，已有 103 个不含这些共享缩略图，仍有 305 个待后续批次筛选。
- 验证：Node 22 公开模式构建成功，生成 601 页；`check:seo` 0 问题；本批 12 条详情页 gallery 均无共享缩略图媒体。`check:dist` 仍报告既有 legacy Fitmus host 链接告警，与本批媒体变更无关。
- 提交说明：`Curate fifth product gallery batch`。
- 是否可以继续 C4-G：是，待确认。

### 阶段 C4-G 完成记录

- 完成范围：清理产品 frontmatter 中下一批 12 个产品的共享缩略图候选媒体。
- 处理产品：`Barbell Rack 10pcs`、`Barbell Storage Gun Racks`、`Barbells 6.6ft Elite Women Bar 15kg`、`Battle Rope Storage Hook`、`Black Battle Rope with Nylon Cover`、`Body Conditioning Battle Rope`、`Body Pump Barbell Set 20kg`、`Body Pump Set Storage Rack`、`BOSU Ball Balance Trainer`、`Boxing Sandbag Support`、`Build Your Own Rig`、`Bumble Roller`。
- 媒体处理：每条记录移除 `66x66`、`150x150`、`300x300` 共享缩略图，只保留已验证的原始大图；未重新下载或热链外部图片。
- 当前媒体状态：408 个产品记录中，已有 115 个不含这些共享缩略图，仍有 293 个待后续批次筛选。
- 验证：Node 22 公开模式构建成功，生成 601 页；`check:seo` 0 问题；本批 12 条详情页 gallery 均无共享缩略图媒体。`check:dist` 仍报告既有 legacy Fitmus host 链接告警，与本批媒体变更无关。
- 提交说明：`Curate sixth product gallery batch`。
- 是否可以继续 C4-H：是，待确认。

### 阶段 C4-H 完成记录

- 完成范围：清理产品 frontmatter 中下一批 12 个产品的共享缩略图候选媒体。
- 处理产品：`Bumper Plate Rack Transport Wheels`、`Camo Bag Sandbag`、`Captain America Fixed Straight Curl PU Barbell`、`Captain America Shield Urethane Barbell Plates`、`Cardio Rowing Machine`、`Chalk Ball 2`、`Chalk Stand Rack`、`Color Vinyl Dipped Kettlebell`、`Commercial Grade 3 Tier Dumbbell Rack`、`Commercial Grade Incline Decline Super Bench`、`Commercial Half Power Rack`、`Commercial Power Rack`。
- 媒体处理：每条记录移除 `66x66`、`150x150`、`300x300` 共享缩略图，只保留已验证的原始大图；未重新下载或热链外部图片。
- 当前媒体状态：408 个产品记录中，已有 127 个不含这些共享缩略图，仍有 281 个待后续批次筛选。
- 验证：Node 22 公开模式构建成功，生成 601 页；`check:seo` 0 问题；本批 12 条详情页 gallery 均无共享缩略图媒体。`check:dist` 仍报告既有 legacy Fitmus host 链接告警，与本批媒体变更无关。
- 提交说明：`Curate seventh product gallery batch`。
- 是否可以继续 C4-I：是，待确认。

### 阶段 C4-I 完成记录

- 完成范围：清理产品 frontmatter 中下一批 12 个产品的共享缩略图候选媒体。
- 处理产品：`Commercial Squat Stand`、`Commercial Treadmill LED Display`、`Commercial Treadmill with Mitsubishi Inverter`、`Competition Fractional Plates`、`Competition Kettlebell New Shape`、`Compression Yoga Tights Custom Fitness Gym Leggings for Women 2`、`CPU Captain America Polyurethane Tasteless Dumbbell`、`CPU Olympic Grip Plates`、`CPU Plate`、`Cross Fit Rig Safety Pin`、`Cross Interval Timer 6 Digit Blue Red`、`Cross Interval Timer 6 Digit Red Red`。
- 媒体处理：每条记录移除 `66x66`、`150x150`、`300x300` 共享缩略图，只保留已验证的原始大图；未重新下载或热链外部图片。
- 当前媒体状态：408 个产品记录中，已有 139 个不含这些共享缩略图，仍有 269 个待后续批次筛选。
- 验证：Node 22 公开模式构建成功，生成 601 页；`check:seo` 0 问题；本批 12 条详情页 gallery 均无共享缩略图媒体。`check:dist` 仍报告既有 legacy Fitmus host 链接告警，与本批媒体变更无关。
- 提交说明：`Curate eighth product gallery batch`。
- 是否可以继续 C4-J：是，待确认。

### 阶段 C4-J 完成记录

- 完成范围：清理产品 frontmatter 中下一批 12 个产品的共享缩略图候选媒体。
- 处理产品：`Cross Interval Timer 8 Digit`、`Cross Training Bar Bumper Storage Rack`、`Cross Training Rig Step Platform`、`CrossFit Elite J Cups J Hooks Pair`、`CrossFit Functional Training Rig`、`CrossFit Interval Timer 4 Digit Red Red`、`CrossFit Interval Timer 6 Digit Double Side`、`CrossFit Reverse Hypers Machine`、`CrossFit Rig Brace`、`CrossFit Rig Component Chin Bar Kids`、`CrossFit Rig Component Iron Ball`、`CrossFit Rig Component Iron Barrel`。
- 媒体处理：每条记录移除 `66x66`、`150x150`、`300x300` 共享缩略图，只保留已验证的原始大图；未重新下载或热链外部图片。
- 当前媒体状态：408 个产品记录中，已有 151 个不含这些共享缩略图，仍有 257 个待后续批次筛选。
- 验证：Node 22 公开模式构建成功，生成 601 页；`check:seo` 0 问题；本批 12 条详情页 gallery 均无共享缩略图媒体。`check:dist` 仍报告既有 legacy Fitmus host 链接告警，与本批媒体变更无关。
- 提交说明：`Curate ninth product gallery batch`。
- 是否可以继续 C4-K：是，待确认。

### 阶段 C4-K 完成记录

- 完成范围：清理产品 frontmatter 中下一批 12 个产品的共享缩略图候选媒体。
- 处理产品：`CrossFit Rig Component Multi-Grip Chin Bar`、`CrossFit Rig J Cups J Hooks`、`CrossFit Rig Upright Bar`、`CrossFit Squat Rack`、`Curved Manual Treadmill 2`、`Curved Manual Treadmill`、`Dead Lift Bar Jack`、`Dip Handle Matador`、`Dog Training Sled`、`Double Ab Roller Wheel`、`Double Cross Beam 2`、`Double Side Wall Ball Standing Rack`。
- 媒体处理：每条记录移除 `66x66`、`150x150`、`300x300` 共享缩略图，只保留已验证的原始大图；未重新下载或热链外部图片。
- 当前媒体状态：408 个产品记录中，已有 163 个不含这些共享缩略图，仍有 245 个待后续批次筛选。
- 验证：Node 22 公开模式构建成功，生成 601 页；`check:seo` 0 问题；本批 12 条详情页 gallery 均无共享缩略图媒体。`check:dist` 仍报告既有 legacy Fitmus host 链接告警，与本批媒体变更无关。
- 提交说明：`Curate tenth product gallery batch`。
- 是否可以继续 C4-L：是，待确认。

### 阶段 C4-L 完成记录

- 完成范围：清理产品 frontmatter 中下一批 12 个产品的共享缩略图候选媒体。
- 处理产品：`Double Torsonator Core Trainer`、`Dual Handle Strongman Steel Log`、`Dumbbell Rack Round Two Layer 10 Pairs`、`Dumbbell`、`E360 Synergy Functional Station for Training`、`Elite Commercial Power Rack`、`Elite CrossFit Speed Jump Rope`、`Elite Free Standing Rig`、`Elite Massage Roller Stick`、`Elite Sled Harness`、`Elite Yoke Walk`、`EPE Foam Roller`。
- 媒体处理：每条记录移除 `66x66`、`150x150`、`300x300` 共享缩略图，只保留已验证的原始大图；未重新下载或热链外部图片。
- 当前媒体状态：408 个产品记录中，已有 175 个不含这些共享缩略图，仍有 233 个待后续批次筛选。
- 验证：Node 22 公开模式构建成功，生成 601 页；`check:seo` 0 问题；本批 12 条详情页 gallery 均无共享缩略图媒体。`check:dist` 仍报告既有 legacy Fitmus host 链接告警，与本批媒体变更无关。
- 提交说明：`Curate eleventh product gallery batch`。
- 是否可以继续 C4-M：是，待确认。

### 阶段 C4-M 完成记录

- 完成范围：清理产品 frontmatter 中下一批 12 个产品的共享缩略图候选媒体。
- 处理产品：`EVA Foam Roller Massage`、`EVA Foam Sit Mat`、`EVA Smoothy Surface Foam Roller`、`Exercise Body Bar`、`Exercise BOSU Ball Storage Rack`、`Extreme Core Trainer`、`Farmers Walk Handles Pair 2`、`Farmers Walk Handles`、`Fashion Design Ladies Fitness Compressed Exercise Running Pants`、`Fat Gripz Extreme`、`Fitmus Barbells 7 Feet Men's Bars`、`Fitness Gym Chalk Block`。
- 媒体处理：每条记录移除 `66x66`、`150x150`、`300x300` 共享缩略图，只保留已验证的原始大图；未重新下载或热链外部图片。
- 当前媒体状态：408 个产品记录中，已有 187 个不含这些共享缩略图，仍有 221 个待后续批次筛选。
- 验证：Node 22 公开模式构建成功，生成 601 页；`check:seo` 0 问题；本批 12 条详情页 gallery 均无共享缩略图媒体。`check:dist` 仍报告既有 legacy Fitmus host 链接告警，与本批媒体变更无关。
- 提交说明：`Curate twelfth product gallery batch`。
- 是否可以继续 C4-N：是，待确认。

### 阶段 C4-N 完成记录

- 完成范围：清理产品 frontmatter 中下一批 12 个产品的共享缩略图候选媒体。
- 处理产品：`Fitness Magic Circle Pilates`、`Fitness Muscle Roller Stick 18`、`Fitness Resistance Bands`、`Fitness Shorts CrossFit Custom Black Men's Gym Shorts`、`Fitness Steel Sledgehammer 2`、`Fitness Steel Sledgehammer`、`Fitness Stretch Bands`、`Fitness Yoga Balance Board`、`Flying Pull Up Ladder`、`Foam Roller Storage Rack with Wheel`、`Foam Roller Storage Rack`、`Foot Massage Balance Ball`。
- 媒体处理：每条记录移除 `66x66`、`150x150`、`300x300` 共享缩略图，只保留已验证的原始大图；未重新下载或热链外部图片。
- 当前媒体状态：408 个产品记录中，已有 199 个不含这些共享缩略图，仍有 209 个待后续批次筛选。
- 验证：Node 22 公开模式构建成功，生成 601 页；`check:seo` 0 问题；本批 12 条详情页 gallery 均无共享缩略图媒体。`check:dist` 仍报告既有 legacy Fitmus host 链接告警，与本批媒体变更无关。
- 提交说明：`Curate thirteenth product gallery batch`。
- 是否可以继续 C4-O：是，待确认。

### 阶段 C4-O 完成记录

- 完成范围：清理产品 frontmatter 中下一批 12 个产品的共享缩略图候选媒体。
- 处理产品：`Football Bar`、`Football Soccer Traffic Cone`、`Four Sided Vertical Dumbbell Rack`、`Free Standing CrossFit Rig`、`Free Standing Rig 2`、`Free Standing Rig`、`Free Standing Weightlifting Chalk Bowl`、`Functional Pull Up Rigs`、`Gliding Discs`、`Globe Gripz`、`Glute Ham Raised Developer Machine`、`Gravity Boots Inversion Boots`。
- 媒体处理：每条记录移除 `66x66`、`150x150`、`300x300` 共享缩略图，只保留已验证的原始大图；未重新下载或热链外部图片。
- 当前媒体状态：408 个产品记录中，已有 211 个不含这些共享缩略图，仍有 197 个待后续批次筛选。
- 验证：Node 22 公开模式构建成功，生成 601 页；`check:seo` 0 问题；本批 12 条详情页 gallery 均无共享缩略图媒体。`check:dist` 仍报告既有 legacy Fitmus host 链接告警，与本批媒体变更无关。
- 提交说明：`Curate fourteenth product gallery batch`。
- 是否可以继续 C4-P：是，待确认。

### 阶段 C4-P 完成记录

- 完成范围：清理产品 frontmatter 中下一批 12 个产品的共享缩略图候选媒体。
- 处理产品：`Group Training CrossFit Free Standing Rig`、`Gym Artificial Grass`、`Gym Ball Storage Rack`、`Gym Exercise Ball`、`Gym Fitness Training Custom Jogger Pants Men`、`Gym Rubber Flooring Tile`、`Gymnastic Competition Roll Mat XPE`、`Handheld Percussion Massagers Gun`、`Hanging Ab Straps Pair`、`Heavy Duty Commercial Power Cage`、`Heavy Duty Commercial Power Rack Cage`、`Heavy Duty Weight Bench Flat Incline Adjustable`。
- 媒体处理：每条记录移除 `66x66`、`150x150`、`300x300` 共享缩略图，只保留已验证的原始大图；未重新下载或热链外部图片。
- 当前媒体状态：按 `gallery` 区块统计，408 个产品记录中已有 223 个不含这些共享缩略图，仍有 185 个待后续批次筛选；产品描述中的尺寸文本不计入图库媒体统计。
- 验证：Node 22 公开模式构建成功，生成 601 页；`check:seo` 0 问题；本批 12 条详情页 gallery 均无共享缩略图媒体。`check:dist` 仍报告既有 legacy Fitmus host 链接告警，与本批媒体变更无关。
- 提交说明：`Curate fifteenth product gallery batch`。
- 是否可以继续 C4-Q：是，待确认。

### 阶段 C4-Q 完成记录

- 完成范围：清理产品 frontmatter 中下一批 12 个产品的共享缩略图候选媒体。
- 处理产品：`Heavy Power Rack`、`Hi-Temp Crumb Bumper Plate Black`、`Hi-Temp Crumb Bumper Plate`、`High Fly Pull Up Bar`、`High Speed Steel Wire Skipping Adjustable Jump Rope`、`Hollow Texture Muscle Massage Foam Roller`、`Home Gym Abdominal Roller Wheel`、`Horizontal Weight Plate Rack`、`Infinity Shackle`、`Landmine Sleeve`、`Les Mills Smartbar Set`、`Lower Resistance Band Pegs 4 Pack`。
- 媒体处理：每条记录移除 `66x66`、`150x150`、`300x300` 共享缩略图，只保留已验证的原始大图；未重新下载或热链外部图片。
- 当前媒体状态：按 `gallery` 区块统计，408 个产品记录中已有 235 个不含这些共享缩略图，仍有 173 个待后续批次筛选。
- 验证：Node 22 公开模式构建成功，生成 601 页；`check:seo` 0 问题；本批 12 条详情页 gallery 均无共享缩略图媒体。`check:dist` 仍报告既有 legacy Fitmus host 链接告警，与本批媒体变更无关。
- 提交说明：`Curate sixteenth product gallery batch`。
- 是否可以继续 C4-R：是，待确认。

### 阶段 C4-R 完成记录

- 完成范围：清理产品 frontmatter 中下一批 12 个产品的共享缩略图候选媒体。
- 处理产品：`Magnesium Liquid Gym Chalk`、`Magnetic Fitness Spinning Bike`、`Massage Lacrosse Ball`、`Massage Muscle Stick`、`Massage Peanut Lacrosse Ball`、`Medicine Ball Rebounder Trampoline`、`Medicine Ball Standing Rack`、`Metal Training Plates`、`Mini Kettlebell 1 lb`、`Mini Massage Ball`、`Mini Speed Hurdle`、`Monkey Bar Rod`。
- 媒体处理：每条记录移除 `66x66`、`150x150`、`300x300` 共享缩略图，只保留已验证的原始大图；未重新下载或热链外部图片。
- 当前媒体状态：按 `gallery` 区块统计，408 个产品记录中已有 247 个不含这些共享缩略图，仍有 161 个待后续批次筛选。
- 验证：Node 22 公开模式构建成功，生成 601 页；`check:seo` 0 问题；本批 12 条详情页 gallery 均无共享缩略图媒体。`check:dist` 仍报告既有 legacy Fitmus host 链接告警，与本批媒体变更无关。
- 提交说明：`Curate seventeenth product gallery batch`。
- 是否可以继续 C4-S：是，待确认。

### 阶段 C4-S 完成记录

- 完成范围：清理产品 frontmatter 中下一批 12 个产品的共享缩略图候选媒体。
- 处理产品：`Multi-Sided Solid Steel Urethane Encased Dumbbells`、`Multifunctional Beam`、`Muscle Massage Body Stick`、`Muscle Roller Stick 2`、`Muscle Roller Stick 3`、`Muscle Roller Stick`、`NBR Yoga Mat Eco Friendly Anti Slip`、`New Custom Hot Sexy Fitness Yoga Ladies Womens Plain Sport Yoga Bra`、`New Design Wholesale Girl Sport Womens Sports Bra Custom`、`New Pattern Custom Logo Dry Fit Women Fitness Wear Yoga Clothes`、`Newest Comfortable Short Sleeve Printing Mens Cotton Gym Wear`、`No Bouncing Slam Balls`。
- 媒体处理：每条记录移除 `66x66`、`150x150`、`300x300` 共享缩略图，只保留已验证的原始大图；未重新下载或热链外部图片。
- 当前媒体状态：按 `gallery` 区块统计，408 个产品记录中已有 259 个不含这些共享缩略图，仍有 149 个待后续批次筛选。
- 验证：Node 22 公开模式构建成功，生成 601 页；`check:seo` 0 问题；本批 12 条详情页 gallery 均无共享缩略图媒体。`check:dist` 仍报告既有 legacy Fitmus host 链接告警，与本批媒体变更无关。
- 提交说明：`Curate eighteenth product gallery batch`。
- 是否可以继续 C4-T：是，待确认。

### 阶段 C4-T 完成记录

- 完成范围：清理产品 frontmatter 中下一批 12 个产品的共享缩略图候选媒体。
- 处理产品：`Nylon Fitness Sandbag`、`OEM Custom Men Fabric Polyester Gym Sport Fitness Plain T-Shirts`、`OEM Private Label Exercise Air Bike`、`Olympic 9 Hole Vertical Barbell Holder`、`Olympic Bumper Plate Black`、`Olympic Lifting Platform`、`Olympic Plate Holder`、`Olympic Weightlifting Platform`、`Olympic Weightlifting Screw Star Collars`、`Parallel Bar`、`Parallette Bars Pairs`、`Parallettes`。
- 媒体处理：每条记录移除 `66x66`、`150x150`、`300x300` 共享缩略图，只保留已验证的原始大图；未重新下载或热链外部图片。
- 当前媒体状态：按 `gallery` 区块统计，408 个产品记录中已有 271 个不含这些共享缩略图，仍有 137 个待后续批次筛选。
- 验证：Node 22 公开模式构建成功，生成 601 页；`check:seo` 0 问题；本批 12 条详情页 gallery 均无共享缩略图媒体。`check:dist` 仍报告既有 legacy Fitmus host 链接告警，与本批媒体变更无关。
- 提交说明：`Curate nineteenth product gallery batch`。
- 是否可以继续 C4-U：是，待确认。

### 阶段 C4-U 完成记录

- 完成范围：清理产品 frontmatter 中下一批 12 个产品的共享缩略图候选媒体。
- 处理产品：`Plastic Gymnastic Rings Straps`、`Plastic Gymnastics Rings Straps`、`Plate Storage Pin`、`Polyurethane Dumbbell`、`Portable Gym Workout Timer`、`Post Landmine`、`Powder Coat Cast Iron Kettlebell`、`Power Bag`、`Power Cage 2`、`Power Rack 2`、`Power Rack`、`Power Resistance Training Belt`。
- 媒体处理：每条记录移除 `66x66`、`150x150`、`300x300` 共享缩略图，只保留已验证的原始大图；未重新下载或热链外部图片。
- 当前媒体状态：按 `gallery` 区块统计，408 个产品记录中已有 283 个不含这些共享缩略图，仍有 125 个待后续批次筛选。
- 验证：Node 22 公开模式构建成功，生成 601 页；`check:seo` 0 问题；本批 12 条详情页 gallery 均无共享缩略图媒体。`check:dist` 仍报告既有 legacy Fitmus host 链接告警，与本批媒体变更无关。
- 提交说明：`Curate twentieth product gallery batch`。
- 是否可以继续 C4-V：是，待确认。

### 阶段 C4-V 完成记录

- 完成范围：清理产品 frontmatter 中下一批 12 个产品的共享缩略图候选媒体。
- 处理产品：`Power Sled Harness`、`Power Weight Lifting Hooks`、`Precision Casted Steel Competition Kettlebell`、`Premium Color Olympic Rubber Bumper Plates`、`Premium High Quality Abdominal Mat`、`Premium Rubber Round Dumbbells`、`Premium Skull Kettlebell`、`Premium Speed Cable Jump Rope`、`Premium Wall Ball`、`Pro Elite Precision Competition Kettlebells`、`Pro Grade Adjustable Kettlebell 32kg`、`Pro Polyurethane Olympic Plate`。
- 媒体处理：每条记录移除 `66x66`、`150x150`、`300x300` 共享缩略图，只保留已验证的原始大图；未重新下载或热链外部图片。
- 当前媒体状态：按 `gallery` 区块统计，408 个产品记录中已有 295 个不含这些共享缩略图，仍有 113 个待后续批次筛选。
- 验证：Node 22 公开模式构建成功，生成 601 页；`check:seo` 0 问题；本批 12 条详情页 gallery 均无共享缩略图媒体。`check:dist` 仍报告既有 legacy Fitmus host 链接告警，与本批媒体变更无关。
- 提交说明：`Curate twenty-first product gallery batch`。
- 是否可以继续 C4-W：是，待确认。

### 阶段 C4-W 完成记录

- 完成范围：清理产品 frontmatter 中下一批 12 个产品的共享缩略图候选媒体。
- 处理产品：`Pro Rubber Olympic Tri-Grip Plate`、`Prowler Sled&Harness`、`Pull-up Rig J-Cup Pair & Bolt Set`、`Pull up DIP Station`、`Pulling Sled`、`Push Up Bars`、`Racerback Training GYM Dry Fit Tank Tops For Women`、`reaction ball`、`Rig three pull up bar`、`Recycled Rubber Flooring`、`Resistance Band Set`、`Resistance Loop Bands`。
- 媒体处理：每条记录移除 `66x66`、`150x150`、`300x300` 共享缩略图，只保留已验证的原始大图；未重新下载或热链外部图片。
- 当前媒体状态：按 `gallery` 区块统计，408 个产品记录中已有 307 个不含这些共享缩略图，仍有 101 个待后续批次筛选。
- 验证：Node 22 公开模式构建成功，生成 601 页；`check:seo` 0 问题；本批 12 条详情页 gallery 均无共享缩略图媒体。`check:dist` 仍报告既有 legacy Fitmus host 链接告警，与本批媒体变更无关。
- 提交说明：`Curate twenty-second product gallery batch`。
- 是否可以继续 C4-X：是，待确认。

### 阶段 C4-X 完成记录

- 完成范围：清理产品 frontmatter 中下一批 12 个产品的共享缩略图候选媒体。
- 处理产品：`3 cell Free standing Rig`、`RIP 60 Training Kit`、`Rod & Pipe Safety Bar`、`Rolling Bumper Storage Rack`、`Rope Attachment Anchor`、`Round Rubber Dumbbells Fixed Weight Dumbbell`、`Round Urethane Staight Barbells (New)`、`Round Urethane Steel Dumbbells`、`Rubber Coated Hex Dumbbells`、`Rubber Coated Kettlebell With Chrome Handle`、`Rubber Flooring Rolls`、`Natural Rubber Medicine Ball`。
- 媒体处理：每条记录移除 `66x66`、`150x150`、`300x300` 共享缩略图，只保留已验证的原始大图；未重新下载或热链外部图片。
- 当前媒体状态：按 `gallery` 区块统计，408 个产品记录中已有 319 个不含这些共享缩略图，仍有 89 个待后续批次筛选。
- 验证：Node 22 公开模式构建成功，生成 601 页；`check:seo` 0 问题；本批 12 条详情页 gallery 均无共享缩略图媒体。`check:dist` 仍报告既有 legacy Fitmus host 链接告警，与本批媒体变更无关。
- 提交说明：`Curate twenty-third product gallery batch`。
- 是否可以继续 C4-Y：是，待确认。

### 阶段 C4-Y 完成记录

- 完成范围：清理产品 frontmatter 中下一批 12 个产品的共享缩略图候选媒体。
- 处理产品：`Dual Grip Rubber Medicine Balls`、`medicine Ball`、`Rubber Straight Curl Fixed Barbell Set`、`Grid Rumble Roller`、`Safety Squat Bar-SPECIALTY BAR TRAINING FOR ATHLETES`、`Safety Squat Bars`、`SALMON LADDER`、`Single Cross Beam`、`SISAL CLIMBING ROPE WITH EYELET`、`SkiErg Indoor Skiing Machine`、`Skipping speed Rope`、`Slosh Ball`。
- 媒体处理：每条记录移除 `66x66`、`150x150`、`300x300` 共享缩略图，只保留已验证的原始大图；未重新下载或热链外部图片。
- 当前媒体状态：按 `gallery` 区块统计，408 个产品记录中已有 331 个不含这些共享缩略图，仍有 77 个待后续批次筛选。
- 验证：Node 22 公开模式构建成功，生成 601 页；`check:seo` 0 问题；本批 12 条详情页 gallery 均无共享缩略图媒体。`check:dist` 仍报告既有 legacy Fitmus host 链接告警，与本批媒体变更无关。
- 提交说明：`Curate twenty-fourth product gallery batch`。
- 是否可以继续 C4-Z：是，待确认。

### 阶段 C4-Z 完成记录

- 完成范围：清理产品 frontmatter 中下一批 12 个产品的共享缩略图候选媒体。
- 处理产品：`Small Storage Rack for BOSU`、`Soccer Disc Cones - Set of 60`、`soft 3-in-1 Foam Plyo Box`、`Soft Kettlebell`、`Soft Plyo Box Set (3"6"12"18")`、`Soft Plyo Box Set`、`Solid Urethane Dumbbells`、`Solid Urethane Fixed Barbells`、`Solid urethane PU Plate`、`Spare Remote for Crossfit Interval Timer`、`Speed and Agility Ladder`、`Speed Super Fast 10-Feet Adjustable Cable Jump Rope for Bearings`。
- 媒体处理：每条记录移除 `66x66`、`150x150`、`300x300` 共享缩略图，只保留已验证的原始大图；未重新下载或热链外部图片。
- 当前媒体状态：按 `gallery` 区块统计，408 个产品记录中已有 343 个不含这些共享缩略图，仍有 65 个待后续批次筛选。
- 验证：Node 22 公开模式构建成功，生成 601 页；`check:seo` 0 问题；本批 12 条详情页 gallery 均无共享缩略图媒体。`check:dist` 仍报告既有 legacy Fitmus host 链接告警，与本批媒体变更无关。
- 提交说明：`Curate twenty-fifth product gallery batch`。
- 是否可以继续 C4-AA：是，待确认。

### 阶段 C4-AA 完成记录

- 完成范围：清理产品 frontmatter 中下一批 12 个产品的共享缩略图候选媒体。
- 处理产品：`Spotting Arm`、`Stackable Plyo Box`、`Steel Cast Competition Kettlebell`、`Steel Cast Competition Kettlebells`、`Steel Club bell`、`Steel Mace Bell`、`Steel Plyo Box Set`、`Steel Swedish Bars`、`strength bulgarian bag`、`Strength Leather Sandbag`、`Strength Sandbag's Belt Leather`、`Strongman Sandbag`。
- 媒体处理：每条记录移除 `66x66`、`150x150`、`300x300` 共享缩略图，只保留已验证的原始大图；未重新下载或热链外部图片。
- 当前媒体状态：按 `gallery` 区块统计，408 个产品记录中已有 355 个不含这些共享缩略图，仍有 53 个待后续批次筛选。
- 验证：Node 22 公开模式构建成功，生成 601 页；`check:seo` 0 问题；本批 12 条详情页 gallery 均无共享缩略图媒体。`check:dist` 仍报告既有 legacy Fitmus host 链接告警，与本批媒体变更无关。
- 提交说明：`Curate twenty-sixth product gallery batch`。
- 是否可以继续 C4-AB：是，待确认。
