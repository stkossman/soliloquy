# Soliloquy Specification

This is the living product and architecture reference for Soliloquy. It
describes implemented behavior and agreed constraints, not a backlog. Code is
the source of truth when this document is stale.

## 1. Product Vision

Soliloquy is a private personal notes workspace presented as a conversation
with oneself. It serves people who want a calm messenger-like space for notes
without accounts, cloud sync, or tracking. Success means that a user can
capture, organize, find, and move their notes while retaining local ownership
of their data.

## 2. Current Capabilities

- A local chat workspace with chat creation, rename, deletion, pinning,
  multi-selection, search, and drag-and-drop ordering.
- Messages with editing, deletion, pinned-message navigation, drafts, and
  Markdown rendering/formatting.
- A seeded, read-only `Soliloquy Info` system chat. It can be hidden from the
  sidebar without deleting its chat or messages.
- Chat personalization through preset icons and colors.
- Single-chat export as JSON or Markdown and import from JSON or Markdown.
  Markdown exports include title, icon, and color frontmatter.
- Full workspace JSON backup containing chats and messages, with validation,
  export timestamp, merge restore, replace restore, explicit replace
  confirmation, and operation feedback.
- A Settings modal with General, Data, and About pages. It exposes system-chat
  visibility, data transfer actions, version, author, and source-code link.
- Browser-local persistence through IndexedDB and a localStorage preference for
  system-chat visibility.

## 3. Product Principles

- Local-first and private by default.
- A simple personal-messenger experience with a minimal, calm interface.
- Portable user data through explicit import and export.
- No unnecessary backend dependency, tracking, or account requirement.
- Maintainable, focused implementation over speculative abstraction.

## 4. Technical Architecture

Astro renders the route and mounts a React client-only messenger. `MessengerLayout`
owns the active chat. `Sidebar` coordinates sidebar interactions, dialogs,
workspace restore confirmation, and Settings; `ChatWindow` coordinates the
active conversation.

Dexie provides browser IndexedDB persistence. Focused hooks use live queries
through `dexie-react-hooks`, while services own all direct database work and
transactions. Pure import/export transforms are isolated under
`src/lib/services/import-export/`; `importExportService` connects them to file
handling and persistence. Generic UI primitives are in `components/ui`, while
messenger and Settings UI remain feature-local.

Settings navigation is component-local. The system-chat visibility flag uses
localStorage and filters only the sidebar list, not database queries or records.

## 5. Data Model

The `SoliloquyDB` IndexedDB database currently has two tables:

| Table | Indexed fields | Key records |
| --- | --- | --- |
| `chats` | `++id, title, isPinned, order, draft, lastModified, icon, color` | `id`, `title`, `isPinned`, `createdAt`, `lastModified`, optional `previewText`, `draft`, `isSystem`, `order`, `icon`, `color` |
| `messages` | `++id, chatId, createdAt` | `id`, `chatId`, `content`, `createdAt`, `isEdited`, optional `isPinned` |

New schema work requires a migration plan, backward-compatibility analysis, and
a review of backup/import compatibility before implementation.

## 6. Key User Journeys

1. Create a chat with the sidebar `+` action, select it, and write Markdown
   messages; messages update the chat preview and modification time.
2. Open Settings from the sidebar gear, navigate to General, and hide or show
   the system chat. Reloading preserves the preference and retained content.
3. In Settings > Data, import one JSON or Markdown chat. It becomes a new
   regular chat and is selected.
4. In Settings > Data, export the workspace to a timestamped JSON backup.
5. Restore a workspace backup in **Merge** mode to add non-system backup chats
   and remapped messages while retaining a single local system chat.
6. Restore in **Replace** mode only after explicit confirmation; local chats
   and messages are then replaced by validated backup data.
7. Open Settings > About Soliloquy to view current version, author, and source
   code link.

## 7. Functional Boundaries

**Current scope:** local chats/messages, personalization, Markdown,
single-chat transfer, workspace backups, and Settings described above.

**Planned, not implemented:** profiles, profile switching, profile-scoped data,
theme controls, and accent-color preferences.

**Out of scope unless explicitly approved:** server storage/sync, accounts,
analytics, onboarding, a new backup format, and changes to Markdown transfer
semantics.

## 8. Quality Requirements

- Strict TypeScript and focused component responsibilities.
- Accessible controls, dialogs, labels, focus states, keyboard interactions,
  and responsive UI.
- Predictable local persistence and no silent data loss.
- Structural validation and clear errors for imports.
- Explicit confirmation before destructive workspace replacement.
- Reuse of services and UI primitives; no business-logic duplication in UI.

## 9. Testing And Acceptance

Primary automated checks are focused `bun test` files, `bun run lint`, manual
`bunx tsc --noEmit`, and `bun run build`. Critical manual flows cover chat and
message editing, system-chat visibility persistence, JSON/Markdown chat
transfer, workspace export, merge restore, replace confirmation, error/loading
states, and Settings navigation.

A feature is done when its acceptance criteria are met, relevant automated
checks pass, manual flows have been verified, and the implementation is checked
against this specification. Remaining warnings or unverified areas must be
reported.

## 10. Change Workflow

1. Analyze the relevant implementation and this specification.
2. Specify behavior and acceptance criteria when they are not already clear.
3. Plan the smallest compatible change.
4. Break larger work into focused, reviewable tasks with only necessary context.
5. Implement one task at a time.
6. Test the changed boundaries and browser flow.
7. Review the result against `SPEC.md` and report deviations or risks.
8. Update documentation when behavior, architecture, data model, or constraints
   change.

## 11. Living Document Rules

- Update this file when product behavior, architecture, the data model, or key
  constraints change.
- Do not update it for internal refactors that preserve behavior.
- Do not present planned work as implemented.
- Use Git history to understand and record meaningful changes.
