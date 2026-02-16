[English](README.md) | [中文](README-zh.md)

# Chinese Checkers（跳棋）

基于浏览器的跳棋游戏，使用 Vite + Svelte + TypeScript 构建，采用拟物化（skeuomorphic）视觉风格——木质棋盘与玻璃弹珠棋子。

## 功能亮点

- 🎮 **多种对局模式**：本地多人与 AI 对战
- 👥 **2–6 名玩家**：完整星形棋盘，共 121 个格位
- 🎨 **拟物化设计**：木纹棋盘与玻璃/弹珠棋子外观
- 🤖 **AI 引擎**：使用 Minimax 算法并带 Alpha-Beta 剪枝
- ⏪ **悔棋支持**：可在对局中撤销操作
- 📱 **响应式**：兼容桌面与平板屏幕

## 技术栈

- **框架**：Svelte 5（TypeScript）
- **构建工具**：Vite 8
- **渲染**：HTML5 Canvas
- **测试**：Vitest
- **包管理**：pnpm

## 快速开始

### 前置要求

- Node.js 18+
- pnpm（推荐）或 npm

### 安装与运行

```bash
# 克隆仓库
git clone https://github.com/zym9863/chinese-checkers.git
cd chinese-checkers

# 安装依赖
pnpm install

# 启动开发服务
pnpm dev
```

### 可用脚本

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 生产构建 |
| `pnpm preview` | 预览生产构建 |
| `pnpm check` | 使用 svelte-check 进行类型检查 |
| `pnpm test` | 运行测试 |
| `pnpm test:watch` | 测试监听模式 |

## 游戏规则

跳棋是一种策略棋类游戏，目标是将所有棋子从起始三角移动到对角的目标三角。

### 移动方式

1. **相邻移动**：移动到相邻的空格（6 个方向）
2. **连跳**：跳过相邻的棋子到达空位，可在一次回合中连续跳跃

### 取胜条件

第一个把 10 个棋子全部移动到目标三角的玩家获胜。

### 玩家配置

| 玩家数 | 起始位置 |
|--------|----------|
| 2 | 对角的两端（三角：顶部/底部） |
| 3 | 交替放置在角上 |
| 4 | 两对对角角落 |
| 6 | 所有角落 |

## 架构

### 组件结构

```
src/
├── App.svelte              # 主容器
├── components/
│   ├── MenuScreen.svelte   # 启动界面（玩家数、模式选择）
│   ├── GameScreen.svelte   # 主游戏界面
│   ├── BoardCanvas.svelte  # Canvas 棋盘渲染
│   ├── PlayerInfo.svelte   # 玩家信息侧栏
│   ├── GameControls.svelte # 撤销/重玩 等控制
│   └── GameOverModal.svelte# 游戏结束对话框
└── lib/
    ├── board.ts            # 棋盘生成与工具函数
    ├── rules.ts            # 游戏规则与合法移动判定
    ├── ai.ts               # AI 引擎（Minimax + Alpha-Beta）
    ├── renderer.ts         # Canvas 渲染逻辑
    ├── stores.ts           # Svelte 状态管理
    └── types.ts            # TypeScript 类型定义
```

### 棋盘模型

棋盘使用 **立方坐标（cube coordinates）** (q, r, s)，满足 q + r + s = 0：

- 共 121 个有效位置的六角星棋盘
- 6 个起始三角，每个三角 10 个棋子起始位置
- 高效的相邻计算和距离度量

### AI 引擎

- **算法**：Minimax + Alpha-Beta 剪枝
- **评估函数**：统计每个棋子到目标位置的距离之和
- **搜索深度**：通常 2–3 层以保证响应速度
- **执行**：当前为同步实现（计划支持 Web Worker）

## 开发

### 类型检查

```bash
pnpm check
```

### 运行测试

```bash
# 单次运行
pnpm test

# 监听模式
pnpm test:watch
```

### 构建生产版本

```bash
pnpm build
```

构建产物会放在 `dist/` 目录下。

## IDE 配置

推荐使用 VS Code 并安装 Svelte 扩展。

## 许可证

MIT

## 致谢

- 游戏设计基于经典跳棋
- 使用了优秀的 Svelte 框架
