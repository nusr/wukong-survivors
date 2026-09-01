# 悟空幸存者

[![许可证：MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![构建状态](https://img.shields.io/github/actions/workflow/status/nusr/survivor-game/deploy.yml?branch=main)](https://github.com/nusr/survivor-game/actions/workflows/deploy.yml)
[![codecov](https://codecov.io/gh/nusr/wukong-survivors/graph/badge.svg?token=oDuxZ0od7n)](https://codecov.io/gh/nusr/wukong-survivors)

[English](./README.md) | 中文

## 🎮 项目概述

悟空幸存者是一款受《黑神话：悟空》和《吸血鬼幸存者》启发的肉鸽幸存者游戏，使用 Phaser.js、React 和 Vite 构建。穿越西游记的传奇章节，解锁强大角色，在无尽的敌人浪潮中生存下来。

游戏支持 PC、移动设备和平板电脑。

![GIF](./public/assets/demo.gif)

[在线试玩](https://nusr.github.io/wukong-survivors/)

移动端设备扫描下面的二维码即可开始游戏。

![Mobile](./public/assets/mobile.png)

### ✨ 关键特性

- 🐵 **24个可玩角色** - 解锁西游记中的标志性角色，包括天命人、黑熊精、牛魔王、二郎神等
- 🗺️ **6个独特章节** - 探索从黑风山到须弥山的多样化地图
- ⚔️ **15种传奇武器** - 收集并升级强大的武器，如金箍棒、火尖枪、芭蕉扇等
- 🎯 **肉鸽式进程** - 每次游戏都提供不同的升级和丹药，创造独特的构建
- 💪 **永久升级** - 消耗金币永久增强攻击、生命、护甲、幸运和速度
- 🌍 **多语言支持** - 支持10种语言：English、中文、日本語、한국어、Français、Deutsch、Español、Português、Русский、繁體中文
- 🤖 **自动托管模式** - 自动控制角色攻击敌人和收集物品
- 🔓 **一键解锁所有章节** - 点击一次即可解锁所有章节
- 🔊 **音量设置** - 根据个人喜好调整游戏音乐音量
- ⏱️ **章节关卡时间设置** - 自定义每个章节关卡的时长

## 🚀 安装说明

### 环境要求

- Node.js（版本 20 或更高）
- npm

### 安装步骤

```bash
# 克隆仓库
git clone https://github.com/nusr/survivor-game.git
cd survivor-game

# 安装依赖
npm i -g yarn
yarn

# 启动开发服务器
npm start
```

游戏将在 `http://localhost:3000` 打开

### 生产构建

```bash
npm run build
```

### 预览构建

```bash
npm run preview
```

### 测试

```bash
# 运行所有测试
npm test

# 在监听模式下运行测试
npm run test:watch

# 使用 UI 运行测试
npm run test:ui

# 生成覆盖率报告
npm run test:coverage

# 运行端到端测试
npm run test:e2e
```

## 🏗️ 技术栈

- **游戏引擎**: [Phaser.js](https://phaser.io/) - HTML5 游戏框架
- **前端框架**: [React](https://react.dev/) - UI 组件
- **构建工具**: [Vite](https://vitejs.dev/) - 快速开发和构建
- **状态管理**: [Zustand](https://github.com/pmndrs/zustand) - 轻量级状态管理
- **开发语言**: TypeScript - 类型安全开发
- **国际化**: [react-i18next](https://react.i18next.com/) - 多语言支持
- **测试**: [Vitest](https://vitest.dev/) - 单元测试

## 🙏 致谢

- 灵感来自《黑神话：悟空》、《吸血鬼幸存者》
