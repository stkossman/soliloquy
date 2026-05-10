## Project Overview

- Soliloquy is a local-first notes/chat UI built with Astro + React 19 + TypeScript, persisting chats/messages via Dexie (IndexedDB).

## Architecture (Active Refactor — Strangler Fig)

- The codebase is mid-refactor: treat existing “God hooks” as legacy boundaries.
- Do not add new logic to the legacy hooks:
  - `src/lib/hooks/useChatWindow.ts`
  - `src/lib/hooks/useSidebar.ts`
- Only extract logic FROM legacy hooks into focused hooks, then re-wire callers to the new hooks.

- useChatWindow → decompose into:
  - `useChatState` – input value, editing state
  - `usePinnedMessages` – pin logic
  - `useMessageSearch` – search toolbar, highlighting
  - `useScrollBehavior` – auto-scroll, scroll-to-bottom
  - `useZoomControl` – zoom state & persistence

- useSidebar → decompose into:
  - `useChatList` – fetch & sort chats
  - `useChatSelection` – multi-select
  - `useChatOperations` – pin, delete, rename

- New hook locations (create these folders; keep hooks small and focused):

```
src/lib/hooks/chat/
src/lib/hooks/sidebar/
```

## Service Layer

- All Dexie/IndexedDB access goes through services; never query `db` from components or hooks.
- Allowed data entrypoints:

```
src/lib/services/chatService.ts
src/lib/services/messageService.ts
src/lib/services/importExportService.ts
```

- If a hook/component needs data:
  - add/extend a service method first
  - call the service from the hook
  - keep Dexie-specific query details inside the service

## Component Rules

- Sidebar refactor target: split `src/lib/components/messenger/Sidebar.tsx` into:
  - `SidebarChatList`
  - `SidebarSelectionBar`
  - `SidebarHeader`
- Chat window refactor target: in `src/lib/components/messenger/ChatWindow.tsx`:
  - extract `useKeyboardShortcuts`
  - isolate conditional renders into small components (one concern each)
- Performance:
  - apply `React.memo` to `src/lib/components/messenger/MessageBubble.tsx`
  - apply `React.memo` to `src/lib/components/messenger/sidebar/SidebarItem.tsx`
- Hook size limit: keep each hook <150 lines; if exceeded, split by responsibility.

## Code Style

- Separate UI state from data/async logic in every hook.
- No “God hooks”: one responsibility per hook; compose multiple hooks in the component.
- Write for testability:
  - hooks must be unit-testable without DOM
  - wrap browser APIs (e.g. `localStorage`, timers) behind injectable adapters/util modules
  - keep pure transforms in helpers under `src/lib/utils/`
- Formatting/linting: use Biome (`npm run format`, `npm run lint`, `npm run check`).

## Folder Structure

- Current layout (scan of `src/`):

```
src/pages/
  index.astro
src/styles/
  global.css
src/lib/
  constants.ts
  utils.ts
  components/
    messenger/
      ChatWindow.tsx
      MessageBubble.tsx
      MessengerLayout.tsx
      Sidebar.tsx
      chat/
      sidebar/
    shared/
      MarkdownRenderer.tsx
    ui/
      (Radix-based primitives)
  db/
    index.ts
  hooks/
    useChatWindow.ts   (legacy; extract-from-only)
    useSidebar.ts      (legacy; extract-from-only)
  services/
    chatService.ts
    messageService.ts
    importExportService.ts
  store/
  types/
  utils/
```

- New (planned/target) folders to add during refactor:

```
src/lib/hooks/chat/
src/lib/hooks/sidebar/
```

## Do Not Touch

- Do not modify `src/lib/hooks/useChatWindow.ts` or `src/lib/hooks/useSidebar.ts` directly (only extract FROM them).
- Do not import Dexie `db` outside `*Service.ts` files.
- Do not add new Dexie queries in components under `src/lib/components/`.
