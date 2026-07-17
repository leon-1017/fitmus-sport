# Fitmus Sport Codex 接管与修复计划

> 状态：阶段 2 已完成，等待阶段 3
> 基于审计日期：2026-07-17
> 项目：WordPress/Avada 迁移至 Astro + Tailwind 的静态站点
> 当前内容基线：365 个产品、123 篇文章、6 个静态页面

## 1. 目标与执行原则

本计划用于 Codex 后续分阶段接管项目。最终目标是让项目达到以下状态：

- Git 工作区和分支状态清晰，没有未完成的 rebase。
- 在约定的 Node.js 版本上可以从全新依赖安装稳定构建。
- 新站不依赖旧 WordPress 站点提供内部链接、图片或页面资源。
- 原 WordPress URL 尽可能保持不变，站内链接无 404。
- canonical、sitemap、robots、404 页面等 SEO 基线完整。
- 桌面端和移动端均具备可用导航，首页交互真实有效。
- 迁移 HTML 经过可重复的链接重写和安全清理。
- 有自动化检查、接管文档和明确的部署前验收结果。

执行时遵循以下原则：

1. 每个阶段单独验证，通过后再进入下一阶段。
2. 不覆盖不明来源的用户改动；提交前逐项确认文件范围。
3. 优先修复生成脚本，再重新生成内容，避免只修改生成产物。
4. 每个阶段使用小而清晰的提交，便于定位和回退。
5. 在构建、链接和资源检查全部通过前不部署、不切换正式域名。

## 2. 当前已知问题基线

| 编号 | 严重度 | 问题 | 当前证据 |
| --- | --- | --- | --- |
| B-01 | P0 | 生产构建失败 | Node 24.18.0 下执行 `npm run build`，`astro sync` 报 `require is not defined`，调用链涉及 Vite 和 `picomatch` |
| B-02 | P0 | Git rebase 未完成 | `main` 正在基于 `82444ce` 执行交互式 rebase，当前 HEAD detached，等待 `git rebase --continue` |
| B-03 | P0 | 文件未纳入版本控制 | 根目录 `HOMEPAGE_SPEC.md` 未跟踪 |
| B-04 | P1 | 旧域名引用大量残留 | `src/content` 与 `src/data` 中检测到 7,517 处 `fitmus-sport.com` 绝对 URL；需进一步分类为链接、图片和元数据 |
| B-05 | P1 | 首页存在死链 | `wall-mount-rig`、`wall-mounted-rig-for-crossfit-3-3` 等硬编码 slug 没有对应静态产品路由 |
| B-06 | P1 | 首页存在坏图 | Featured Products 中一张图片使用 Unicode 破折号，而本地文件名使用编码后的 `_E2_80_93` |
| B-07 | P1 | SEO 发布基线缺失 | 未配置 Astro `site`，页面未实际传入 canonical；缺少 `sitemap.xml`、`robots.txt` 和自定义 404 页面 |
| B-08 | P2 | 移动端导航不可用 | Header 和 Sidebar 的导航在小屏均隐藏，未提供移动端替代菜单 |
| B-09 | P2 | 首页轮播箭头无行为 | Featured Products 的前后按钮没有事件处理或原生滚动逻辑 |
| B-10 | P2 | HTML 清理不足 | 迁移脚本仅移除表单控件，页面通过 `set:html` 输出，未系统过滤脚本、事件属性和危险 URL |
| B-11 | P3 | 文档过时 | `site/README.md` 仍是 Astro Starter Kit 模板，交接文档中的数量和构建结果与当前状态不一致 |

## 3. 分阶段执行计划

### 阶段 0：稳定 Git 接管状态

目标：结束当前不完整的 Git 操作，建立清晰、可追踪的接管起点。

执行内容：

- 重新检查 `git status`、rebase 的 `done`/`todo` 和当前提交差异。
- 确认 `HOMEPAGE_SPEC.md` 是否应加入首页提交，或作为独立文档提交。
- 检查 rebase 后提交内容，仅在文件范围明确后执行 `git rebase --continue`。
- 确认 `main` 指向最终提交，并保留 `origin/main` 作为可比较基线。
- 记录接管前提交哈希和 rebase 完成后的提交哈希。

验证命令：

```powershell
git status
git branch --show-current
git log --oneline --decorate -5
git diff --check
git diff origin/main...HEAD --stat
```

完成标准：

- 当前分支为 `main`，不再显示 rebase 进行中。
- 工作区只包含明确保留的未提交文件。
- `git diff --check` 无空白错误。

回退点：保留 rebase 前的 `orig-head` 哈希；如内容不符合预期，停止并由用户决定是否中止或重做 rebase。

---

### 阶段 1：恢复可重复构建

目标：确定受支持的 Node/Astro/Vite 组合，并保证全新安装可以构建。

执行内容：

- 先在 Node 22 LTS（项目声明的最低大版本）上使用锁文件复测。
- 对比 Node 22 与 Node 24 的构建结果，确认是运行时兼容问题还是依赖组合问题。
- 检查 Astro 7.0.4、Vite 8.1.2、Tailwind 4.3.2 和 `picomatch` 的解析关系。
- 选择经过验证的依赖组合，使用精确版本或受控版本范围；通过包管理命令更新锁文件，不手工编辑锁文件。
- 增加明确的 Node 版本约束文件，例如 `.nvmrc` 或 `.node-version`，并同步 `engines.node`。
- 保持 `npm ci` 为 CI/部署安装方式。

建议验证命令：

```powershell
node --version
npm --version
npm ci
npm run build
npm ls astro vite picomatch tailwindcss
```

完成标准：

- 删除依赖目录后执行 `npm ci && npm run build` 成功。
- 构建过程中无内容集合错误、缺少模块或未处理异常。
- Node 版本约束与实际验证版本一致。
- 记录实际生成页面总数，不再引用旧文档中的“600 页”。

提交建议：`Fix reproducible Astro build environment`

---

### 阶段 2：修复迁移数据管线和旧域名依赖

目标：让内容生成过程自动产生适合静态新站的链接和资源引用。

执行内容：

- 对 7,517 处旧域名引用分类统计：
  - 站内页面 `href`
  - 图片 `src`、`srcset`、`data-src`、`data-srcset`
  - canonical/开放图谱等元数据
  - 确实需要保留的外部引用
- 在迁移脚本中增加统一的 `rewriteInternalUrl()`，将同域页面链接转换为根相对 URL，并保留 query/hash。
- 将已下载图片统一重写到 `/images/...`；对于未下载的 `srcset` 衍生图，生成本地映射或移除无效候选，确保主 `src` 可用。
- 清除 Avada 懒加载遗留的占位 SVG、`data-srcset` 和无效主题属性。
- 对 YouTube 等确需外链的嵌入建立明确白名单。
- 重新生成 `src/content/products`、`src/content/posts` 和 `src/data/pages.json`。
- 生成前备份统计，生成后比较产品、文章、页面数量，防止静默丢失内容。

涉及文件：

- `site/scripts/parse-html.mjs`
- `site/scripts/download-images.mjs`
- `site/scripts/to-collections.mjs`
- `site/src/content/**`
- `site/src/data/pages.json`

验证命令：

```powershell
rg -n "https?://(www\.)?fitmus-sport\.com/" site/src/content site/src/data
rg -n "data-src=|data-srcset=|javascript:" site/src/content site/src/data
npm run build
```

完成标准：

- 站内 `href` 不再跳转到旧 WordPress 域名。
- 页面不再依赖旧域名加载主图片或响应式图片。
- 所有保留的旧域名 URL 都有书面原因。
- 内容数量与阶段开始时一致，或差异经过人工确认。

提交建议：`Rewrite migrated links and localize content assets`

---

### 阶段 3：修复路由、坏链和缺失资源

目标：所有可点击的站内链接和本地资源都能在构建产物中解析。

执行内容：

- 将首页、Footer 和 Latest Products 中的硬编码产品列表改为从内容集合派生，或对每个手工条目增加构建期存在性校验。
- 修正 Featured Products 的错误图片文件名，统一 Unicode 和 URL 编码策略。
- 检查产品分类 slug、产品 slug、文章 slug 与实际生成目录一致。
- 增加一个只读的站内链接与本地资源检查脚本，扫描 `dist` 中的 HTML：
  - 内部 `href` 是否对应页面
  - `src`/`srcset` 是否对应本地文件
  - 是否存在空链接、`javascript:` URL 和意外旧域链接
- 明确处理 WordPress 遗留路径和必要重定向。

完成标准：

- 已知 4 处产品死链归零。
- 已知 Featured Products 坏图归零。
- 自动链接检查无未豁免 404。
- 本地资源检查无未豁免缺失文件。

提交建议：`Fix internal routes and asset integrity`

---

### 阶段 4：补齐 SEO 迁移基线

目标：新静态站具备可部署、可索引且 URL 一致的 SEO 输出。

执行内容：

- 在 `astro.config.mjs` 设置正式 `site`，正式域名未确认前使用环境配置并禁止误发布错误 canonical。
- Layout 自动基于 `Astro.url.pathname` 生成 canonical，避免依赖每个页面手工传参。
- 使用 Astro sitemap 集成或等价构建脚本生成 sitemap。
- 添加 `public/robots.txt`，并确保 sitemap 地址与正式域名一致。
- 添加 `src/pages/404.astro`。
- 补齐基础 Open Graph/Twitter 元数据、绝对图片 URL 和默认分享图。
- 检查 title 是否因 Layout 自动追加品牌名而重复。
- 为产品和文章详情增加合适的结构化数据；内容不足时不伪造价格、库存或评价。
- 对原 URL 清单与新 sitemap 做集合对比，输出缺失、增加和重定向建议。

完成标准：

- 每个可索引页面只有一个正确的 canonical。
- sitemap 覆盖所有目标产品、文章、分类和静态页面。
- `robots.txt` 可访问且引用正确 sitemap。
- 自定义 404 页面构建成功。
- 原 URL 对比报告中没有未解释的缺失页面。

提交建议：`Add migration-safe SEO foundations`

---

### 阶段 5：恢复移动端导航和首页交互

目标：关键导航和首页控件在触屏、键盘和桌面环境均可使用。

执行内容：

- 为 Header 增加移动端菜单按钮、展开面板、焦点状态和 `aria-expanded`。
- 为首页提供移动端品牌栏与分类入口，不依赖隐藏的 Sidebar。
- 让 Featured Products 前后按钮真正滚动列表；优先使用少量原生 JavaScript 和 `scrollBy()`，保留触摸横向滚动。
- 按钮在到达边界时更新禁用状态，并支持键盘操作。
- 检查 mega-menu 的键盘访问；不能只依赖 CSS hover。
- 检查 360、768、1024、1440 px 关键宽度下的溢出和布局。

完成标准：

- 手机尺寸可以访问全部一级导航和产品分类。
- 首页轮播箭头点击后有可观察的滚动行为。
- 键盘能够打开菜单、移动焦点并关闭菜单。
- 页面无横向布局溢出。

提交建议：`Restore responsive navigation and carousel controls`

---

### 阶段 6：强化迁移 HTML 安全边界

目标：确保重新抓取 WordPress 内容时不会把危险 HTML 直接带入静态站。

执行内容：

- 使用明确的 HTML 白名单清理内容，而不是只用正则删除表单。
- 移除 `script`、`object`、`embed`、危险 iframe、内联 `on*` 事件和 `javascript:` URL。
- iframe 仅允许明确的视频域名，并设置合理的 `sandbox`、`loading`、`referrerpolicy` 和 `allow`。
- 检查内联 style 是否必须保留；能由站点 CSS 替代的 Avada 样式应移除。
- 在生成后增加危险标记扫描，并把失败作为构建阻塞条件。

完成标准：

- 内容输出中不存在脚本、事件处理属性和危险协议。
- 所有 iframe 都符合白名单和限制属性。
- 再次运行迁移管线能够稳定复现相同安全结果。

提交建议：`Sanitize imported WordPress HTML`

---

### 阶段 7：自动化质量检查与文档接管

目标：让后续维护者不依赖历史对话即可正确安装、生成、验证和部署。

执行内容：

- 用真实项目说明替换 `site/README.md` Starter Kit 内容。
- 更新 `CONVERSATION_NOTES.md` 中过时的内容数量、构建结果和已完成/未完成事项。
- 将本计划中的最终状态同步为完成记录，但保留历史问题和决策原因。
- 增加统一质量命令，例如：
  - `npm run check`
  - `npm run build`
  - `npm run check:links`
  - `npm run check:assets`
  - `npm run check:content`
- 增加 GitHub Actions，在固定 Node 版本上执行 `npm ci` 和全部质量检查。
- 确认大文件、迁移中间数据和截图继续遵循 `.gitignore`，不误提交本地工作产物。

完成标准：

- 新环境只按 README 即可完成安装、构建和验证。
- CI 在全新 checkout 上全部通过。
- README、项目脚本和 CI 使用相同 Node 版本与命令。
- Git 工作区干净，生成物没有意外进入版本控制。

提交建议：`Add project documentation and automated quality gates`

---

### 阶段 8：部署前验收

目标：形成可以交给部署阶段的明确结论；本阶段不默认执行正式域名切换。

执行内容：

- 从干净 checkout 执行完整安装和构建。
- 本地预览并抽检首页、静态页、分类页、产品页、文章页和 404。
- 执行链接、资源、安全和 SEO 检查。
- 对关键页面进行桌面端与移动端截图对比。
- 如目标是 Cloudflare Pages，再单独确认构建目录、Node 版本、缓存头和重定向规则。
- 输出部署清单、已知豁免和回退方案。

最终放行条件：

- `npm ci`、所有检查命令和 `npm run build` 全部通过。
- 站内链接与本地资源无未解释错误。
- canonical、sitemap、robots、404 均验证通过。
- 移动端导航与首页主要交互可用。
- 没有依赖旧 WordPress 可用性的关键资源。
- 正式部署和 DNS 切换已获得用户明确授权。

## 4. 推荐提交顺序

1. `Fix reproducible Astro build environment`
2. `Rewrite migrated links and localize content assets`
3. `Fix internal routes and asset integrity`
4. `Add migration-safe SEO foundations`
5. `Restore responsive navigation and carousel controls`
6. `Sanitize imported WordPress HTML`
7. `Add project documentation and automated quality gates`

如单阶段改动过大，应继续拆分提交；不要把依赖升级、内容批量重生成和 UI 改造混入同一个提交。

## 5. 每阶段汇报模板

后续执行时，每完成一个阶段按以下格式记录：

```markdown
### 阶段 N 完成记录

- 日期：
- 执行提交：
- 修改范围：
- 验证命令及结果：
- 数量变化：
- 剩余问题：
- 是否可以进入下一阶段：是 / 否
```

## 6. 当前下一步

### 阶段 1 完成记录

- 日期：2026-07-17
- 执行提交：`Rewrite migrated links and localize content assets`
- 修改范围：将 Astro 固定为 7.1.0，Tailwind 构建依赖固定为 4.3.3；新增 `.nvmrc` 和构建前 Node 版本检查。
- 验证命令及结果：使用 Node 22.23.1 执行 `npm ci` 后，`npm run build` 成功，生成 504 个静态页面；依赖审计结果为 0 个漏洞。
- 环境结论：当前 Node 24.18.0 会触发 Vite 模块运行器的 `require is not defined`。项目暂时锁定在 Node 22.12 至 23 以下，使用 `.nvmrc` 指定经验证的 22.23.1。
- 是否可以进入下一阶段：是

### 阶段 2 完成记录

- 日期：2026-07-17
- 执行提交：待提交
- 修改范围：新增可复用 URL 重写工具；更新图片下载和内容集合生成管线；新增针对当前受版本控制内容的安全原地转换脚本。
- 数据保护：发现 `data/parsed-local.json` 仍含 408 产品和 176 篇文章，与当前 365/123 基线不一致，因此没有重跑会清空内容目录的旧生成步骤。
- 验证命令及结果：488 个内容文件和 6 个页面数据完成转换；7,511 处旧域名引用降至 0；构建产物的 504 个 HTML 文件中旧域名、WordPress 上传路径、`data-src`、`data-srcset` 与远程 `srcset` 均为 0；Node 22 构建通过。
- 是否可以进入下一阶段：是

下一步执行“阶段 3：修复路由、坏链和缺失资源”。执行前重新检查工作区，确保没有新的用户改动。
