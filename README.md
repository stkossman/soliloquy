<div align="center">
  <img src="./public/logo.svg" alt="Soliloquy Logo" width="120" height="120"/>
  
  <h1>Soliloquy</h1>
  <p>
    <strong>A private dialogue with yourself.</strong><br>
    Local-first. Distraction-free. Secure.
  </p>

  <p>
    <img src="https://img.shields.io/badge/Status-Active_Development-success?style=flat-square" alt="Status" />
    <img src="https://img.shields.io/badge/Stack-Astro_•_React_•_Dexie-blue?style=flat-square" alt="Tech Stack" />
    <img src="https://img.shields.io/badge/Privacy-100%25_Local-gray?style=flat-square" alt="Privacy" />
    <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License" /></a>
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
| **📝 Rich Text** | Visual formatting menu, Markdown support, and code highlighting. |
| **⚡ Blazing Fast** | Powered by **Bun** and **Astro**. Instant load times and reactivity. |
| **🎨 Personalization** | Custom icons and colors for every chat to match your mood. |

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

## 🗺️ Roadmap & Future
I am currently in Phase 6 of development. Here is what I am working on next:

- [ ] **Media Support**:
  - [ ] Image upload via Clipboard (`Ctrl+V`) or Attachment button
  - [ ] Modal preview with caption support before sending
  - [ ] Optimized local storage for blobs
- [ ] **Data Portability**: Global backup (Import/Export full database).
- [ ] **Personalization**: Light/Dark mode toggle.]

👉 [View full Roadmap & History](ROADMAP.md)

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) (English & Ukrainian) to get started.

---

<div align="center"> <p>Developed with ❤️ by <a href="https://github.com/stkossman">Kossman</a> 🇺🇦</p>