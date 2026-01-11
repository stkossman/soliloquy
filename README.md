

<div align="center">
  <img src="./public/logo.svg" alt="logo"/>
  
  <h1>Soliloquy</h1>
  <p>
    <strong>A private dialogue with yourself.</strong><br>
    Local-first. Distraction-free.
  </p>

  <p>
    <img src="https://img.shields.io/badge/Status-Active_Development-success?style=flat-square" alt="Status" />
    <img src="https://img.shields.io/badge/Stack-Astro_•_React_•_Dexie-blue?style=flat-square" alt="Tech Stack" />
    <img src="https://img.shields.io/badge/Privacy-100%25_Local-gray?style=flat-square" alt="Privacy" />
  </p>
</div>

> ***Soliloquy** - a speech in a play that the character speaks to himself or herself or to the people watching rather than to the other characters.*

**Soliloquy** reimagines the concept of "Saved Messages". It's not just a note-taking app; it's a messenger where the only contact is **you**. 

Built with a focus on privacy and speed, Soliloquy stores all data directly in your browser using **IndexedDB**. No servers, no tracking, no login screens. Just open and write.

## 💎 Key Features

| Feature | Description |
| :--- | :--- |
| **🔒 Local-First** | 100% of your data lives in your browser (IndexedDB). Zero cloud dependency. |
| **💬 Messenger UX** | Familiar interface. If you know how to use Telegram, you know Soliloquy. |
| **📌 Power Pinning** | Pin chats and messages. Navigate through pinned messages like a carousel. |
| **📝 Rich Text** | Full **Markdown** support: code blocks, lists, quotes, and links. |
| **⚡ Blazing Fast** | Powered by **Bun** and **Astro**. Instant load times and reactivity. |

## 🛠️ Tech Stack

<div align="center">
  <img src="https://skillicons.dev/icons?i=astro,react,ts,tailwind,bun" />
</div>

- **Runtime:** [Bun](https://bun.sh)
- **Framework:** [Astro](https://astro.build) + [React](https://react.dev)
- **Database:** [Dexie.js](https://dexie.org) (IndexedDB wrapper)
- **Styling:** [TailwindCSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- **Formatter:** [Biome](https://biomejs.dev/)
- **Deployment:** [Vercel](https://vercel.com/)

## 🗺️ Roadmap

### Completed Milestones ✅
- [x] **Core Foundation**: Architecture (Astro/React/Dexie), CRUD, Smart Sorting.
- [x] **Architecture & Performance**: Refactored components, Custom Hooks, Vercel CI/CD.
- [x] **Basic Chat Actions**: Context Menu, Clear History, Export (.md/.json).
- [x] **Rich Text**: Markdown rendering support.

### Phase 5: UX Polish (Current Focus)
- [x] **UX Improvements**:
  - [x] **Fix Sidebar Scroll**: Ensure chat list scrolls correctly when overflowing.
  - [x] **Quick Delete**: Auto-focus "Delete" button in confirmation dialogs (or enable Enter to confirm).
  - [x] **Scroll Logic**: Add "Scroll to Bottom" button in chat view.
- [x] **View Settings**:
  - [x] **Chat Zoom**: Ability to change text size (50% - 150%).
- [ ] **Bulk Actions (Multi-select)**:
  - [ ] **Selection mode in Sidebar** (Select multiple chats).
  - [ ] **Batch Delete & Batch Pin/Unpin** actions.
- [ ] **Drag-and-Drop Reordering**:
  - [ ] Custom order for pinned chats.
  - [ ] Logic to prevent mixing pinned/unpinned items during drag.

### Phase 6: Advanced Functionality
- [ ] **Editor Experience**:
    - [ ] **Visual Formatting Menu**: Custom Context Menu (Right-Click) on text selection to apply formatting (Bold, Italic, Link, Monospace, Spoiler) without typing Markdown syntax manually.
- [ ] **Search**:
  - [ ] **Search within Chat**: Ctrl+F style search to find specific messages inside a conversation.
- [ ] **Data Portability**:
  - [ ] **Import Chat**: Restore chat from exported .json/.md.
  - [ ] **Global Backup**: Full database export/import file.
- [ ] **Personalization**:
  - [ ] **Chat Identity**: Custom Emoji/Avatar for chats.
  - [ ] **Theme Toggle**: Switch between Light/Dark modes.

## 🚀 Getting Started

### Prerequisites
- **Bun** (v1.0+)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/stkossman/soliloquy.git
cd soliloquy
```

2. Install dependencies:
```bash
bun install
```

3. Run the development server:
```bash
bun dev
```

4. Open your browser at `http://localhost:4321`

---

<div align="center"> <p>Developed with ❤️ by <a href="https://github.com/stkossman">Kossman</a> 🇺🇦</p>
