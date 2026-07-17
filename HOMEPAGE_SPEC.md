# Homepage Specification — fitmus-sport.com

> 像素级还原规范。原站：https://www.fitmus-sport.com/
> 本地：http://127.0.0.1:4322/ (Astro preview)

## 1. 全局设计令牌（Design Tokens）

| 令牌 | 值 | 用途 |
| --- | --- | --- |
| 品牌红 | `#e03420` | 主色、CTA、强调、链接 hover |
| 品牌红 hover | `#c0291b` | 按钮悬停 |
| 深蓝 | `#0e1b2c` | Diverse Product Chain 背景叠层 |
| 黑 | `#222` | Sidebar/旧 Header 背景（非首页） |
| 灰-900 | `#1a1a1a` / `gray-900` | Footer 背景、深色卡片 |
| 字体 | Oxygen (Google Fonts) 300/400/700 | 全站 |
| 图标 | Font Awesome 6.5.0 (CDN) | 全站 |
| 容器宽度 | `max-w-7xl` (1280px) + `px-6` | 内容区 |
| Sidebar 宽度 | 260px (固定) | 首页左侧 |
| 圆角 | 无（原站为直角设计） | 全站 |

## 2. 首页布局结构（从上到下）

首页采用 **sidebar + content** 双栏布局：

```
┌──────────┬──────────────────────────────────┐
│          │  Hero (640px 满高)                │
│          ├──────────────────────────────────┤
│ Sidebar  │  Highlights (3 栏)                │
│ (260px   ├──────────────────────────────────┤
│  固定)   │  DiverseProductChain              │
│          ├──────────────────────────────────┤
│          │  Categories (4 大图)              │
│          ├──────────────────────────────────┤
│          │  FeaturedProducts (横向滚动)       │
│          ├──────────────────────────────────┤
│          │  ProfessionalSection              │
│          ├──────────────────────────────────┤
│          │  ReadyForNew (红底 3 栏)          │
│          ├──────────────────────────────────┤
│          │  LatestProducts + News           │
│          ├──────────────────────────────────┤
│          │  Footer (4 栏)                    │
└──────────┴──────────────────────────────────┘
```

### 2.1 Sidebar（可复用组件）✅
- **文件**：`src/components/Sidebar.astro`
- **复用范围**：首页
- **结构**：logo → 8 分类导航（divide-y）→ 次级导航（About/Product/News/Contact）
- **宽度**：260px 固定，`hidden lg:flex`（移动端隐藏）
- **可复用性**：已独立成组件，可通过 props 传入 `activeCategory` 高亮当前分类

### 2.2 Hero
- **文件**：`src/components/Hero.astro`
- **Props**：`image`, `title`, `subtitle`
- **高度**：640px
- **背景**：`Background-1.jpg` + 右侧红渐变 `linear-gradient(90deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 45%, rgba(226,52,32,0.85) 100%)`
- **文字框**：左上偏移 `ml-[110px] mt-[-160px]`，白边 `border-white/80`，`p-7`，`max-w-[640px]`
- **标题**：`text-[30px]` 白色 semibold + drop-shadow
- **副标题**：`text-[17px]` 白色
- **CTA 按钮**：底部居中 `bottom-16`，两个按钮 gap-8
  - 主按钮：红底白字 `bg-[#e03420]` + `tracking-[0.2em]` + `px-10 py-3 text-[13px]`
  - 次按钮：白边白字 `border-2 border-white`

### 2.3 Highlights（3 栏深色卡片）
- **文件**：`src/components/Highlights.astro`
- **结构**：`grid-cols-3`，每栏 `h-[260px]`
- **背景**：box-background 图 + overlay 叠层
  - 第 1 栏：红 overlay `rgba(224,49,37,0.78)`，白字
  - 第 2 栏：白 overlay `rgba(255,255,255,0.7)`，深字
  - 第 3 栏：深灰 overlay `rgba(50,50,50,0.78)`，白字
- **标题**：`text-xl font-semibold mb-3`
- **描述**：`text-sm leading-relaxed`

### 2.4 DiverseProductChain
- **文件**：`src/components/DiverseProductChain.astro`
- **背景**：深蓝 `#0e1b2c` + `Background-2.jpg` 左侧叠层
- **布局**：`grid-cols-2`，左文右图占位
- **内容**：H2 标题 + 红色下划线 `w-16 h-1 bg-[#e03420]` + 4 条产品线列表 + 2 段引导文 + 4 个分类链接（红字，`|` 分隔）

### 2.5 Categories（4 大图横排）
- **文件**：`src/components/Categories.astro`
- **布局**：`grid-cols-4`（Lg），`aspect-[4/5]`
- **每卡**：背景图 + 底部深色渐变（`0→0.45→0.85`）+ 标题 `text-xl` + 描述 `text-sm`
- **Hover**：标题变红 `group-hover:text-[#e03420]`

### 2.6 FeaturedProducts（横向滚动轮播）
- **文件**：`src/components/FeaturedProducts.astro`
- **结构**：`overflow-x-auto` + `snap-x snap-mandatory` + 20 张产品卡 `w-72`
- **导航**：左右箭头按钮（`absolute` 定位）
- **每卡**：`aspect-square` 图 + 标题 `line-clamp-2`

### 2.7 ProfessionalSection
- **文件**：`src/components/ProfessionalSection.astro`
- **布局**：`grid-cols-2`，左图 `h-96 object-cover` + 右文
- **计数器**：3 个 `text-5xl font-bold text-[#e03420]` + 标签
  - `4` Main Production Lines
  - `6` Years Industry Experience
  - `200` Ranges Of Fitness Products
- **Bullet 列表**：5 条，`fas` 图标 + `text-sm`

### 2.8 ReadyForNew（红底 3 栏）
- **文件**：`src/components/ReadyForNew.astro`
- **背景**：`bg-[#e03420] text-white`
- **布局**：`grid-cols-3`
- **每栏**：`bg-white/10 backdrop-blur-sm rounded-lg p-8` + 图标 `text-4xl` + H3 `text-2xl` + 段落

### 2.9 LatestProducts + News
- **文件**：`src/components/LatestProducts.astro`
- **布局**：`grid-cols-3`（左 2 + 右 1）
- **左侧**：`Latest Products` H2 + `grid-cols-3` 6 张产品卡
- **右侧**：`In the News` H2 + 3 条新闻（标题 + 日期）

### 2.10 Footer（可复用组件）✅
- **文件**：`src/components/Footer.astro`
- **复用范围**：全站
- **背景**：`bg-gray-900 text-white`
- **布局**：`grid-cols-4`
  1. **Recent Works**：10 张缩略图 `grid-cols-5`
  2. **In the News**：5 条新闻列表（`fa-chevron-right` + 标题 + 日期）
  3. **Product Category**：8 个分类链接
  4. **公司信息**：logo + 地址/电话/邮箱 + YouTube CTA 按钮
- **底部栏**：版权 `Copyright 2026 Fitmus | All Rights Reserved` + 4 个社交图标圆形按钮
- **可复用性**：已独立成组件，全站共用

## 3. 可复用组件清单

| 组件 | 当前状态 | 复用范围 | 备注 |
| --- | --- | --- | --- |
| **Layout.astro** | ✅ 已复用 | 全站 | head + 字体 + 图标 |
| **Sidebar.astro** | ✅ 已组件化 | 首页 | 可加 `activeCategory` prop |
| **Footer.astro** | ✅ 已复用 | 全站 | 4 栏 + 底部栏 |
| **Header.astro** | ✅ 已组件化 | 非首页 | 顶部横条 mega-menu |
| **Hero.astro** | ✅ 已组件化 | 首页 | 可通过 props 复用到其他 landing 页 |
| **ProductCard.astro** | ✅ 已组件化 | 分类页/列表页 | 图+标题+分类 |
| **Share.astro** | ✅ 已组件化 | 产品/文章详情 | FB/Twitter/LinkedIn |
| **PageContent.astro** | ✅ 已复用 | 静态页 | `set:html` 容器 |
| Highlights | 🔶 首页专用 | 首页 | 数据硬编码 |
| DiverseProductChain | 🔶 首页专用 | 首页 | 数据硬编码 |
| Categories | 🔶 首页专用 | 首页 | 数据硬编码 |
| FeaturedProducts | 🔶 首页专用 | 首页 | 数据硬编码 |
| ProfessionalSection | 🔶 首页专用 | 首页 | 数据硬编码 |
| ReadyForNew | 🔶 首页专用 | 首页 | 数据硬编码 |
| LatestProducts | 🔶 首页专用 | 首页 | 数据硬编码 |

> ✅ = 已复用 / 🔶 = 首页专用（数据硬编码，需提取 props 才能复用）

## 4. 像素级差距与待办（TODO）

| # | 区域 | 差距 | 优先级 |
| --- | --- | --- | --- |
| 1 | Hero | 原站是 LayerSlider 多幻灯片，当前单图 | 高 |
| 2 | Highlights | 用 300×201 小图放大，需大裁剪 | 中 |
| 3 | Categories | 用通用产品图，需原站精确 4 张生活照 | 中 |
| 4 | 全站 | 字体粗细/大小/字间距需逐项核对 | 中 |
| 5 | 全站 | section 间距/卡片 padding 需像素级核对 | 中 |
| 6 | 全站 | Avada 精确色值需从原站 CSS 提取 | 中 |
| 7 | 全站 | Hover 效果/过渡时长需匹配 | 低 |
| 8 | 全站 | 移动端断点行为需匹配 | 低 |

## 5. 构建与验证

```bash
cd site
npm run build      # 600 页，零错误
npm run preview    # http://127.0.0.1:4322/
```

验证清单：
- [ ] `dist/` 无 `<form>` / `<input>`（grep 验证）
- [ ] 控制台无错误
- [ ] 无 404 图片
- [ ] Sidebar / Hero / Highlights / DiverseProductChain / Categories / FeaturedProducts / ProfessionalSection / ReadyForNew / LatestProducts / Footer 全部可见
