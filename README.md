# Soliloquy

> ***Soliloquy** - a speech in a play that the character speaks to himself or herself or to the people watching rather than to the other characters*

**Soliloquy** is a local-first note-taking application designed with the familiar UX of a modern messenger. It reimagines the concept of "Saved Messages" by turning your notes into a private dialogue with yourself.

Built with a focus on privacy, and speed, Soliloquy stores all data directly in your browser using IndexedDB. No servers, no tracking - just your thoughts.

## Tech Stack

This project leverages a modern, performance-oriented stack:

- **Runtime:** [Bun](https://bun.sh) (Fast all-in-one JavaScript runtime)
- **Core Framework:** [Astro](https://astro.build) (Server-first architecture)
- **UI Logic:** [React](https://react.dev) + [dexie-react-hooks](https://dexie.org/docs/dexie-react-hooks) (Real-time reactivity)
- **Database:** [Dexie.js](https://dexie.org) (Wrapper for IndexedDB)
- **Styling:** [TailwindCSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- **Deployment:** Cloudflare Pages (via `@astrojs/cloudflare` adapter)

## Roadmap

The development is divided into phases. Below is the current status of features.

### Phase 1: Core Foundation (MVP) ✅
- [x] **Project Setup:** Astro + Svelte + Bun integration.
- [x] **Database Schema:** Designed `Chats` and `Messages` tables with indexing.
- [x] **Sidebar:** Real-time chat list fetching with `liveQuery`.
- [x] **Messaging:** Sending and storing messages locally.
- [x] **Smart Sorting:** Auto-sort chats by `lastModified` date.

### Phase 2: Chat Management ✅
- [x] **Transfer from Svelte to React:** Including lucide, shadcn, dexie-react-hooks
- [x] **Search:** Filter chats by title in real-time.
- [x] **Pinning System:**
    - [x] Database logic for pinned chats.
    - [x] Sorting logic (Pinned chats always on top).
    - [x] UI for pinning/unpinning chats (Context Menu).
- [x] **Chat CRUD:**
    - [x] Edit chat title.
    - [x] Delete chat (with confirmation).

### Phase 3: Message Interactions (Current focus)
- [x] **Message Management:**
    - [x] **Edit:** Modify sent messages (with "edited" label).
    - [x] **Delete:** Remove messages from history.
    - [x] **Pin:** Pin important messages within a chat context (Pinned Bar, Carousel Navigation, Pinned View Mode).
    - [x] **Copy:** One-click copy to clipboard.
- [ ] **Search within Chat:** `Ctrl+F` logic to find specific text inside a conversation.
- [ ] **Formatting:** Markdown support for rich text notes.
- [ ] **Scroll Logic:** "Scroll to bottom" button when reading history.

### Phase 4: Data & Settings
- [ ] **Data Persistence:** JSON Export/Import for backups (since data is local-only).
- [ ] **Keyboard Shortcuts:** Navigation and actions via hotkeys (e.g., `Ctrl+N` for new chat).
- [ ] **Theme:** Toggle between Dark/Light modes (Default: Dark).

## Getting Started

### Prerequisites
Make sure you have **Bun** installed.

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

*Developed by [Kossman](https://github.com/stkossman)*
