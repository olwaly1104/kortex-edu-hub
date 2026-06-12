## Goal
Make the 😊 (Smile) and a new GIF button in the chat composer actually work, so students can send emojis inline and GIF messages.

## Changes — `src/pages/student/Chat.tsx` only

1. **Emoji picker**
   - Install `emoji-picker-react` (lightweight, no extra config).
   - Wrap the existing Smile button in a Popover. Clicking opens a picker; selecting an emoji appends it to the current `message` input.

2. **GIF picker**
   - Add a new button (Image/Gif icon) next to Paperclip.
   - Use the free Giphy public beta key (`dc6zaTOxFJmzC`) or Tenor's keyless endpoint — Tenor keyless is simpler: `https://tenor.googleapis.com/v2/search` requires a key, so use Giphy's public beta key for the demo.
   - Popover shows a search input + grid of trending/searched GIFs (fetched on open & on query change).
   - Clicking a GIF sends it immediately as a new message of type `gif` (stored locally in component state alongside existing mock messages).

3. **Message rendering**
   - Extend the local message shape with optional `gifUrl`. When present, render an `<img>` inside the bubble instead of text.
   - Keep existing mock messages untouched; new sent messages (text or GIF) are appended to local state so the conversation shows them.

4. **Send flow**
   - Replace the current no-op Enter handler with a real `sendText()` that pushes `{ id, content, isOwn: true, time, read: false }` into local messages and clears the input.
   - `sendGif(url)` pushes a gif message the same way.

## Out of scope
- No backend / persistence — purely local state, matching the rest of the mock chat.
- No changes to other roles or to Email/Contacts pages.

## Technical notes
- New dep: `emoji-picker-react`.
- GIF fetch uses `fetch()` directly, no SDK.
- All UI uses existing shadcn `Popover`, `Input`, `Button`.
