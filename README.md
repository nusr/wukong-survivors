# Wukong Survivors

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/github/actions/workflow/status/nusr/survivor-game/deploy.yml?branch=main)](https://github.com/nusr/survivor-game/actions/workflows/deploy.yml)

English | [中文](./README_ZH.md)

## 🎮 Project Overview

Wukong Survivors is a roguelike survivor game inspired by _Black Myth: Wukong_ and _Vampire Survivors_, built with Phaser.js, React, and Vite. Embark on an epic journey through legendary chapters from the Journey to the West, unlock powerful characters, and survive against endless waves of enemies.

The game supports PC, mobile, and tablet devices.

![GIF](./public/assets/demo.gif)

[Onlnie Demo](https://nusr.github.io/wukong-survivors/)

Mobile users can scan the QR Code below to play instantly.

![Mobile](./public/assets/mobile.png)

### ✨ Key Features

- 🐵 **24 Playable Characters** - Unlock iconic characters from Journey to the West, including the Destined One, Black Bear Guai, Bull King, Erlang Shen, and more
- 🗺️ **6 Unique Chapters** - Explore diverse maps from Black Wind Mountain to Mount Sumeru
- ⚔️ **15 Legendary Weapons** - Collect and upgrade powerful weapons like the Golden Staff, Fire-Tipped Spear, and Plantain Fan
- 🎯 **Roguelike Progression** - Each run offers different upgrades and elixirs to create unique builds
- 💪 **Permanent Upgrades** - Spend gold to permanently enhance attack, health, armor, luck, and speed
- 🌍 **Multi-language Support** - Available in 10 languages: English, 中文, 日本語, 한국어, Français, Deutsch, Español, Português, Русский, 繁體中文
- 🤖 **Auto-Play Mode** - Automatically control your character to attack enemies and collect items
- 🔓 **One-Click Unlock** - Instantly unlock all chapters with a single click
- 🔊 **Volume Control** - Adjust the game's music volume to your preference
- ⏱️ **Chapter Time Setting** - Customize the duration of each chapter level

## 🚀 Installation Instructions

### Prerequisites

- Node.js (version 18 or higher)
- npm

### Installation Steps

```bash
# Clone the repository
git clone https://github.com/nusr/survivor-game.git
cd survivor-game

# Install dependencies
npm install

# Start development server
npm start
```

The game will open at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

### Run with Preview

```bash
npm run preview
```

## 🎯 Usage Examples

### Basic Gameplay

1. **Character Selection** - Choose your character at the home screen. Each character has unique stats and starting weapons
2. **Map Selection** - Select a chapter/map to begin your journey
3. **Survive** - Move with WASD or Arrow keys, automatically attack nearby enemies
4. **Level Up** - Gain experience from defeated enemies, level up to choose new weapons or upgrades
5. **Collect Rewards** - Every 10 kills, select from powerful elixirs or new weapons
6. **Permanent Progress** - Use collected gold in the Shop to purchase permanent upgrades

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage

# Run end-to-end tests
npm run test:e2e
```

### Linting and Formatting

```bash
# Run ESLint
npm run lint

# Fix linting issues
npm run lint:fix
```

### Game Systems

#### Character System

```typescript
// Character definition example
const characters: Character[] = [
  {
    id: 'destined-one',
    name: 'Destined One',
    description: 'The chosen one with balanced stats',
    stats: {
      health: 100,
      speed: 100,
      damage: 100,
      armor: 100,
      luck: 100,
    },
    startingWeapons: ['golden-staff'],
    unlockCondition: { chapter: 0, kills: 0 },
  },
];
```

#### Weapon System

Weapons can be upgraded up to level 5, with each level improving damage, projectile count, or special effects.

#### Elixir System

10 types of elixirs with different effects, including health restoration, stat boosts, and special abilities.

## 🏗️ Tech Stack

- **Game Engine**: [Phaser.js 3.90](https://phaser.io/) - HTML5 game framework
- **Frontend Framework**: [React 19](https://react.dev/) - UI components
- **Build Tool**: [Vite 7](https://vitejs.dev/) - Fast development and builds
- **State Management**: [Zustand 5](https://github.com/pmndrs/zustand) - Lightweight state management
- **Language**: TypeScript - Type-safe development
- **i18n**: [react-i18next](https://react.i18next.com/) - Internationalization
- **Testing**: [Vitest](https://vitest.dev/) - Unit testing

## 🙏 Acknowledgments

- Inspired by _Black Myth: Wukong_, _Vampire Survivors_
