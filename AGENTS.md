# AGENTS.md

Guidance for AI agents working in the Soliloquy repository.

## Project Context

- Soliloquy is a local-first personal notes app presented as a messenger where the only contact is the user.
- The app stores chats and messages in the browser with IndexedDB through Dexie. There is no login flow or server-side data store in the current code.
- The main UI is an Astro page that mounts a React messenger experience from `src/pages/index.astro`.
- The README describes the project as privacy-focused, local-first, distraction-free, and deployed with Vercel.

## Tech Stack

- Runtime/package manager: Bun. The repository has `bun.lock`; use Bun for installs and scripts.
- App framework: Astro with `@astrojs/react`.
- UI runtime: React 19 and TypeScript.
- Database: Dexie over IndexedDB, with `dexie-react-hooks` for live queries.
- Styling: Tailwind CSS via `@tailwindcss/vite`, CSS variables in `src/styles/global.css`, and shadcn-style Radix UI primitives in `src/lib/components/ui/`.
- Icons: `lucide-react`.
- Drag and drop: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`.
- Markdown: `react-markdown` and `remark-gfm`.
- Formatting/linting: Biome. There is no ESLint config in the repository.
- Deployment adapter: `@astrojs/vercel` in `astro.config.mjs`.

## File Structure

Important current paths:

```text
src/pages/
  index.astro
src/styles/
  global.css
src/lib/
  constants.ts
  utils.ts
  db/
    index.ts
  types/
    index.ts
  services/
    chatService.ts
    messageService.ts
    importExportService.ts
  hooks/
    useChatWindow.ts
    useSidebar.ts
    chat/
    sidebar/
  components/
    messenger/
      MessengerLayout.tsx
      Sidebar.tsx
      ChatWindow.tsx
      MessageBubble.tsx
      chat/
      sidebar/
    shared/
      MarkdownRenderer.tsx
    ui/
  utils/
    sidebarChats.ts
```

Root configuration and documentation:

```text
package.json
bun.lock
astro.config.mjs
tsconfig.json
biome.json
components.json
wrangler.jsonc
README.md
CONTRIBUTING.md
ROADMAP.md
```

## Architecture

- `src/pages/index.astro` imports global styles, defines metadata, and renders `MessengerLayout` with `client:only='react'`.
- `MessengerLayout` owns the active chat id and renders `Sidebar` plus `ChatWindow`.
- `Sidebar` is the shell for sidebar UI state such as toasts and dialogs. It delegates chat list rendering to sidebar subcomponents.
- `ChatWindow` is the shell for an active chat. It composes chat header, pinned/search regions, message list, scroll affordance, and input.
- `src/lib/hooks/useChatWindow.ts` and `src/lib/hooks/useSidebar.ts` are composition facades. Keep them thin; put new responsibility-specific logic in focused hooks.
- Focused chat hooks live under `src/lib/hooks/chat/`, for example `useChatState`, `usePinnedMessages`, `useMessageSearch`, `useScrollBehavior`, `useZoomControl`, and `useKeyboardShortcuts`.
- Focused sidebar hooks live under `src/lib/hooks/sidebar/`, for example `useChatList`, `useChatSelection`, and `useChatOperations`.
- Dexie access is centralized in service files. Components and hooks should call services, not `db` directly.

## Data Model

The current domain types are in `src/lib/types/index.ts`.

- `Chat`: `id`, `title`, `isPinned`, `createdAt`, `lastModified`, optional `previewText`, `draft`, `isSystem`, `order`, `icon`, and `color`.
- `Message`: `id`, `chatId`, `content`, `createdAt`, `isEdited`, and optional `isPinned`.

The database is defined in `src/lib/db/index.ts` as `SoliloquyDB` with:

- `chats`: `++id, title, isPinned, order, draft, lastModified, icon, color`
- `messages`: `++id, chatId, createdAt`

The populate hook seeds a pinned system chat named `Soliloquy Info` and a regular `Notes` chat.

## Service Layer

Allowed Dexie entry points:

```text
src/lib/services/chatService.ts
src/lib/services/messageService.ts
src/lib/services/importExportService.ts
```

Rules:

- Do not import `db` in components or hooks.
- If UI code needs new data, add or extend a service method first.
- Keep Dexie query details and transactions inside services.
- Preserve local-first behavior unless the user explicitly asks for a different persistence model.

## Code Style & Conventions

- TypeScript is strict through `astro/tsconfigs/strict`.
- Use tabs, single quotes, no semicolons, and Biome import organization as configured in `biome.json`.
- Use `$lib/*` for imports from `src/lib/*`. The `@/*` alias maps to `src/*`.
- Prefer local relative imports between sibling component files.
- Use `cn` from `src/lib/utils.ts` for conditional class names.
- UI primitives belong in `src/lib/components/ui/`; messenger-specific components belong in `src/lib/components/messenger/`.
- Keep hook responsibilities narrow. If a hook grows beyond one responsibility, split it under `src/lib/hooks/chat/` or `src/lib/hooks/sidebar/`.
- Keep pure transforms/helpers in `src/lib/utils/` or near the component boundary when they are tightly scoped and tested there.
- Use `React.memo` only where stable props make it useful. Stabilize callbacks with `useCallback` when passing them to memoized children or long-lived effects.

## Common Patterns

- Live IndexedDB reads use `useLiveQuery` from `dexie-react-hooks` inside hooks/facades, with service methods as the query source.
- Sidebar chat sorting is handled by `getVisibleSidebarChats` in `src/lib/utils/sidebarChats.ts`.
- Sidebar grouping is handled by `getSidebarChatGroups` in `src/lib/components/messenger/sidebar/sidebarChatGroups.ts`.
- Keyboard shortcut detection is separated into pure logic in `src/lib/hooks/chat/keyboardShortcuts.ts` and the React hook `useKeyboardShortcuts`.
- Component-specific conditional state helpers may live next to the component, for example `src/lib/components/messenger/chat/chatWindowState.ts`.
- Chat icons and preset colors are defined in `src/lib/constants.ts`.
- Dates in chat UI currently use Ukrainian locale formatting (`uk-UA`) in `formatChatDate`.

## Development Workflows

- Install dependencies with Bun after cloning or after lockfile changes.
- Use the Astro dev server for local development.
- Run Biome before handing off formatting or lint-sensitive changes.
- Run a production build when changing routes, Astro config, bundling, or core UI composition.
- For IndexedDB schema or service changes, test with a clean browser IndexedDB state as requested in `CONTRIBUTING.md`.
- Do not create commits unless the user explicitly asks.

## Commands

Use only Bun commands in this project.

```bash
bun install
bun run dev
bun run build
bun run preview
bun run astro
bun run format
bun run lint
bun run check
```

Notes:

- `package.json` does not currently define `test` or `typecheck` scripts.
- Existing focused tests are `.test.ts` files using `node:test`-style APIs. If you run them manually with Bun, document the exact command and result.
- Do not use `npm`, `yarn`, or `pnpm` commands in instructions, scripts, or final reports for this repository.

## Testing Requirements

- Add focused tests for new pure helpers and boundary logic when practical.
- Keep tests close to the logic they cover, following current examples:
  - `src/lib/utils/sidebarChats.test.ts`
  - `src/lib/hooks/sidebar/selectionState.test.ts`
  - `src/lib/hooks/chat/keyboardShortcuts.test.ts`
  - `src/lib/components/messenger/chat/chatWindowState.test.ts`
  - `src/lib/components/messenger/sidebar/sidebarChatGroups.test.ts`
- There is no configured coverage threshold.
- There is no React Testing Library setup in `package.json`; prefer pure helpers for logic that should be testable without DOM.
- When tests cannot be run cleanly in the current environment, state that clearly and still run `bun run lint` and `bun run build` when relevant.

## Important Rules: DO

- Use Bun and `bun run` for project workflows.
- Preserve local-first behavior and browser-only data storage.
- Keep Dexie access inside service files.
- Keep `useChatWindow.ts` and `useSidebar.ts` as thin composition facades.
- Place new chat-specific hooks in `src/lib/hooks/chat/`.
- Place new sidebar-specific hooks in `src/lib/hooks/sidebar/`.
- Reuse existing Radix UI primitives, Lucide icons, utilities, constants, and component patterns.
- Keep public component APIs stable unless the change requires otherwise.
- Prefer behavior-neutral refactors when working in active refactor areas.
- Document verification results honestly, including warnings.

## Important Rules: DON'T

- Do not add direct `db` queries to components or hooks.
- Do not add new business logic to `useChatWindow.ts` or `useSidebar.ts` when it can live in a focused hook/helper.
- Do not replace Bun workflow commands with npm/yarn/pnpm.
- Do not introduce server persistence, analytics, tracking, authentication, or network sync without explicit user direction.
- Do not change IndexedDB schema casually. Schema changes require careful migration thinking and manual testing.
- Do not move UI primitives out of `src/lib/components/ui/` or mix generic primitives with messenger-specific components.
- Do not commit changes unless explicitly requested.

## Security Guidelines

- Treat notes and messages as private local user data.
- Keep import/export behavior explicit and user-triggered.
- Be careful with JSON/Markdown import changes in `importExportService`; avoid broad parsing behavior that can corrupt local data.
- Do not add remote data transmission for chats, messages, drafts, icons, colors, or exports unless the user explicitly asks.
- Do not add secrets to the repository. No environment variable contract is currently documented in code.

## Domain-Specific Terms

- Chat: a note space shown in the sidebar.
- Message: a note entry inside a chat.
- System chat: read-only seeded chat (`Soliloquy Info`) used for app information and guidance.
- Pinned chat: chat displayed before regular chats and sortable within the pinned group.
- Pinned message: message shown through the pinned bar/navigation in `ChatWindow`.
- Draft: unsent input stored on the chat record.
- Preview text: chat sidebar snippet derived from recent message content.
- Selection mode: sidebar multi-select mode for batch pin, unpin, and delete.
- Order: numeric chat ordering used by drag-and-drop and sorting.

## Key Dependencies & Tools

- `astro`: app framework and build pipeline.
- `@astrojs/react`: React integration for Astro.
- `@astrojs/vercel`: Vercel server output adapter.
- `react`, `react-dom`: interactive UI.
- `dexie`, `dexie-react-hooks`: IndexedDB storage and live queries.
- `@dnd-kit/*`: sidebar drag-and-drop sorting.
- `@radix-ui/react-*`: dialog, alert dialog, avatar, checkbox, context menu, dropdown menu, input-related primitives.
- `lucide-react`: icons.
- `react-markdown`, `remark-gfm`: Markdown rendering.
- `tailwindcss`, `@tailwindcss/vite`, `tw-animate-css`: styling and animations.
- `@biomejs/biome`: formatting, linting, import organization.

## Key File References

- App route: `src/pages/index.astro`
- Main layout: `src/lib/components/messenger/MessengerLayout.tsx`
- Sidebar shell: `src/lib/components/messenger/Sidebar.tsx`
- Chat window shell: `src/lib/components/messenger/ChatWindow.tsx`
- Message bubble: `src/lib/components/messenger/MessageBubble.tsx`
- Sidebar item: `src/lib/components/messenger/sidebar/SidebarItem.tsx`
- Chat facade hook: `src/lib/hooks/useChatWindow.ts`
- Sidebar facade hook: `src/lib/hooks/useSidebar.ts`
- Database schema: `src/lib/db/index.ts`
- Domain types: `src/lib/types/index.ts`
- Services: `src/lib/services/*.ts`
- Global styles and theme tokens: `src/styles/global.css`
- Astro/Vite config: `astro.config.mjs`
- Biome config: `biome.json`
- TypeScript config: `tsconfig.json`

## Agent Behavior

- Read the relevant code before making changes; the codebase is small enough that local context matters.
- Prefer narrow, behavior-preserving edits.
- Update this document when architecture, commands, or file locations change.
- When modifying UI, check existing component composition before adding new abstractions.
- When modifying data logic, start at the service layer and keep Dexie details there.
- When adding tests, keep them focused and runnable without a browser unless a DOM setup is added to the project.
- Report command results using Bun command names and mention any warnings that remain.
