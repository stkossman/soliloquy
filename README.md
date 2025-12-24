<div align="center">
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
- **Deployment:** Cloudflare Pages

## 🗺️ Roadmap

### Phase 1: Foundation (MVP) ✅
- [x] **Project Setup:** Astro + Bun integration.
- [x] **Database:** `Chats` and `Messages` schema with indexing.
- [x] **Core UI:** Sidebar & Chat Interface.
- [x] **Smart Sorting:** Auto-sort by modification date.

### Phase 2: Chat Management ✅
- [x] **Refactoring:** Migration from Svelte to React.
- [x] **Search:** Real-time chat filtering.
- [x] **CRUD:** Create, Rename, Delete (Cascading), Pin chats.
- [x] **System Chat:** Read-only "About" chat seeded on first load.

### Phase 3: Message Interactions ✅
- [x] **Actions:** Edit, Delete, Copy messages.
- [x] **Advanced Pinning:** Pinned Bar, Carousel Navigation, Pinned View Mode.
- [x] **Rich Text:** Markdown rendering (`react-markdown`).

### Phase 4: Optimization & Refactoring 🛠️
- [ ] **Code Splitting:** Extract huge components (`ChatWindow`, `Sidebar`).
- [ ] **Performance:** Memoization and custom hooks (`useChatLogic`).
- [ ] **CI/CD:** Automated deployment to Cloudflare Pages.

### Phase 5: Advanced Features 🔮
- [ ] **Chat Actions:** Clear History, Export Chat (`.md`/`.json`).
- [ ] **Customization:** Chat Avatars & Theme Toggle.
- [ ] **Persistence:** Global Backup/Restore.

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
