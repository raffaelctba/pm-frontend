# Chat Module

Lightweight guide for the `src/app/chat` feature module.

## Public Exports

Use the root barrel whenever importing chat functionality from outside this module:

```ts
import { ChatComponent, ChatService } from './chat';
```

Root barrel file:
- `src/app/chat/index.ts`

It re-exports:
- `components/` via `src/app/chat/components/index.ts`
- `models/` via `src/app/chat/models/index.ts`
- `services/` via `src/app/chat/services/index.ts`

## Service Responsibilities

- `ChatConversationService`
  - Conversation discovery/creation APIs
  - `getMyConversations`
  - `getOrCreateUnitConversation`
  - `getOrCreatePropertyConversation`

- `ChatMessageService`
  - Message HTTP APIs
  - `getConversationMessages`
  - `sendMessage`

- `ChatWebSocketService`
  - STOMP/SockJS lifecycle and realtime events
  - `connectWebSocket`
  - `publishMessage`
  - `disconnectWebSocket`

- `ChatService` (facade)
  - Backward-compatible surface for components
  - Delegates to conversation/message/websocket services
  - Prefer this in UI components unless fine-grained injection is needed

## Import Conventions

- App-level imports: use root barrel `.../chat`
  - Example: route lazy load in `src/app/app.routes.ts`
    - `loadComponent: () => import('./chat').then(m => m.ChatComponent)`

- Internal imports (inside `src/app/chat/**`):
  - Use local barrels (`../models`, `../services`) or relative paths as needed

## Quick Maintenance Checklist

When adding new chat public types/services/components:

1. Export symbol in its folder barrel (`models/index.ts`, `services/index.ts`, or `components/index.ts`)
2. Ensure it is reachable from `src/app/chat/index.ts`
3. Keep this README section in sync

