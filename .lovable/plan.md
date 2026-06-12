# Fix Chat: Send, Call, Video buttons

The buttons in `src/pages/student/Chat.tsx` are wired to nothing — Send doesn't append a message, and Phone/Video have no `onClick`. This is a UI-only prototype (no telephony backend), so I'll add local, presentational behavior.

## Changes (single file: `src/pages/student/Chat.tsx`)

1. **Send message (text + Enter key)**
   - Add local state `localMessages` (seeded from `chatMessages` for the selected conversation).
   - On Send click or Enter: append `{ id, conversationId, content: message, isOwn: true, time: "agora", read: false }` to `localMessages`, clear input, auto-scroll to bottom.
   - Render from `localMessages` instead of the static filter.

2. **Voice call button (header Phone icon)**
   - On click: open a small "call dialog" (shadcn `Dialog`) showing avatar, contact name, "A chamar…" status, mute/end buttons. Closes on End.
   - Also add a toast confirmation ("A iniciar chamada com {name}").

3. **Video call button (header Video icon)**
   - Same pattern as voice, but dialog labeled "Videochamada" with a placeholder video frame (dark rounded box + camera icon + "A ligar…").
   - Toast confirmation.

4. **Call log Phone/Video icons in sidebar (`tab === "calls"`)**
   - Wire them to the same call/video dialogs so they're consistent.

5. Keep all existing styling/tokens; no new dependencies.

## Out of scope

- Real WebRTC / Twilio / signaling (this is a demo UI).
- Persisting messages across reloads.
- Other roles' chat pages (only the one the user is on).
