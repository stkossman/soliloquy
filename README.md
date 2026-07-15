<div align="center">
  <img src="./public/logo.svg" alt="Soliloquy Logo" width="120" height="120"/>

  <h1>Soliloquy</h1>
  <p>
    <strong>A private dialogue with yourself.</strong><br>
    Local-first. Distraction-free. Secure.
  </p>

  <p>
    <img src="https://img.shields.io/badge/Status-Active-brightgreen?style=flat-square" alt="Status: Active" />
    <img src="https://img.shields.io/badge/Version-v0.1.0-blue?style=flat-square" alt="Version: v0.1.0" />
    <img src="https://img.shields.io/badge/Stack-Astro_•_React_•_Dexie-blue?style=flat-square" alt="Tech Stack" />
    <img src="https://img.shields.io/badge/Privacy-100%25_Local-gray?style=flat-square" alt="Privacy" />
    <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License" /></a>
  </p>
</div>

> ***Soliloquy** - a speech in a play that the character speaks to himself or herself or to the people watching rather than to the other characters.*

**Soliloquy** is a local-first personal notes app presented as a messenger where
the only contact is **you**. Chats and messages stay in your browser through
IndexedDB: no account, server, or tracking is required.

## Key Features

| Feature | Description |
| :--- | :--- |
| **Local workspace** | Chats and messages persist locally in IndexedDB through Dexie. |
| **Messenger-style notes** | Create, edit, pin, delete, search, reorder, and organize chats and messages. |
| **Markdown writing** | Markdown rendering, visual formatting controls, pinned messages, and spoiler syntax. |
| **Chat personalization** | Choose a preset icon and color for every chat. |
| **Data portability** | Import one chat from JSON or Markdown, or export it in either format. |
| **Workspace backup** | Export all chats and messages to JSON; restore through Merge or Replace with validation and confirmation. |
| **Settings** | Manage system chat visibility, data actions, release notes, version, author, and source code. |
| **System chat** | Keep the read-only Soliloquy Info chat available, or hide it from the sidebar without deleting its content. |

## Release Notes

Soliloquy `v0.1.0` is the first formal release. Read the current release notes
at [**/changelog**](/changelog).

## Tech Stack

<div align="center">
  <img src="https://skillicons.dev/icons?i=astro,react,ts,tailwind,bun" alt="Astro, React, TypeScript, Tailwind CSS, and Bun" />
</div>

- **Runtime:** [Bun](https://bun.sh)
- **Framework:** [Astro](https://astro.build) + [React](https://react.dev)
- **Database:** [Dexie.js](https://dexie.org) over IndexedDB
- **Styling:** [Tailwind CSS](https://tailwindcss.com) with Radix UI primitives
- **UI:** [Lucide](https://lucide.dev) icons and dnd-kit drag and drop
- **Formatting and linting:** [Biome](https://biomejs.dev/)
- **Deployment:** [Vercel](https://vercel.com/)

## Getting Started

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
   bun run dev
   ```

4. Open `http://localhost:4321`.

### Useful Commands

```bash
bun run dev
bun run build
bun run preview
bun run lint
bun run format
```

## Roadmap

Planned next steps include media support and theme controls. Workspace backup,
restore, and chat personalization are already available.

👉 [View the full roadmap](ROADMAP.md)

## Contributing

Contributions are welcome. Read the [Contributing Guide](CONTRIBUTING.md)
(English and Ukrainian) to get started.

---

<div align="center">
  <p>Developed with ❤️ by <a href="https://github.com/stkossman">Kossman</a> 🇺🇦</p>
</div>
