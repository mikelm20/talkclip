# TalkClip

## Overview
TalkClip is a lightweight desktop utility that turns spoken words into clipboard-ready text in seconds. Press a global hotkey, speak your thoughts, and the app automatically transcribes, cleans up grammar and punctuation, and copies the result to your clipboard—ready to paste anywhere without any manual steps.

## Problem
Ideas vanish faster than you can type them. Whether it's a quick thought you need to capture before it slips away or a lengthy message that would take forever to type out, the friction between thinking and documenting kills productivity. Existing voice tools require navigating menus, reviewing text, and manually copying—TalkClip eliminates all of that overhead.

## Target User
People who think faster than they type and paste into multiple destinations throughout their day—note-takers dropping ideas into Obsidian or Notion, professionals firing off Slack messages and emails, anyone who wants their voice to become text without breaking their workflow.

## Core Features

### Feature 1: Global Hotkey Activation
**Description**: Launch the recorder from anywhere on your desktop with a single keyboard shortcut (default: Cmd+Shift+V or equivalent). No need to switch windows or click through menus—the recorder appears instantly as a small overlay.

**Acceptance Criteria**:
- [ ] Pressing the configured hotkey launches the recorder overlay from any application
- [ ] Recorder appears within 200ms of hotkey press
- [ ] Overlay does not steal focus from the current application beyond what's necessary
- [ ] Hotkey is configurable in settings

**Priority**: P0

### Feature 2: Real-Time Speech Transcription
**Description**: As you speak, text appears live in the recorder window. This immediate visual feedback confirms the app is capturing your words and helps you track your thoughts as they flow.

**Acceptance Criteria**:
- [ ] Transcribed text appears in the UI as words are spoken, not after completion
- [ ] Transcription latency is under 500ms from speech to displayed text
- [ ] Works for recordings of any length (quick one-liners to multi-minute explanations)
- [ ] Uses free speech-to-text engine (Web Speech API via Chromium/WebKit or local Whisper model)

**Priority**: P0

### Feature 3: Automatic Stop Detection
**Description**: The app detects when you've finished speaking and automatically ends the recording—no button press required. This enables truly hands-free operation: speak and walk away.

**Acceptance Criteria**:
- [ ] Recording stops automatically after detecting 1.5-2 seconds of silence
- [ ] User can also manually stop by pressing the hotkey again or clicking a stop button
- [ ] Visual indicator shows the app recognized speech has ended
- [ ] No accidental stops during natural pauses within sentences

**Priority**: P0

### Feature 4: Grammar and Punctuation Auto-Fix
**Description**: Raw speech transcription often lacks proper punctuation and contains grammatical quirks. TalkClip automatically cleans up the text—adding periods, commas, and fixing common errors—so the output is paste-ready without manual editing.

**Acceptance Criteria**:
- [ ] Periods and commas are added at appropriate sentence boundaries
- [ ] Common transcription errors are corrected (e.g., "gonna" → "going to" where appropriate)
- [ ] Capitalization is applied correctly for sentence starts and proper nouns
- [ ] Processing happens automatically before clipboard copy, with no user intervention

**Priority**: P0

### Feature 5: Instant Clipboard Copy
**Description**: The moment transcription and cleanup complete, the text is automatically copied to your system clipboard. No review screen, no confirmation dialog—just immediate availability for pasting.

**Acceptance Criteria**:
- [ ] Text is copied to clipboard within 100ms of processing completion
- [ ] Visual confirmation (brief flash or indicator) shows copy succeeded
- [ ] Recorder overlay auto-dismisses after successful copy
- [ ] Clipboard contains only the final processed text (not intermediate transcription)

**Priority**: P0

### Feature 6: Minimal Recorder UI
**Description**: A compact, unobtrusive overlay showing a waveform or recording indicator plus the live transcription text. Appears when activated, disappears when done—designed to stay out of your way.

**Acceptance Criteria**:
- [ ] Overlay is small enough to not obstruct primary work area
- [ ] Shows clear recording state (recording, processing, complete)
- [ ] Displays live transcription text as it's captured
- [ ] Can be repositioned by dragging (position persists between sessions)

**Priority**: P1

## Technical Constraints
- Must use free speech-to-text solution—no paid API keys required for basic operation
- Primary options: Web Speech API (Chromium/WebKit built-in) or local Whisper model via Ollama
- Accuracy is prioritized over speed when conflicts arise
- Desktop app built with Tauri (given the existing project structure)
- Must support macOS and Linux at minimum

## Out of Scope (v1)
- History of past transcriptions
- Cloud sync or backup
- Multiple language support (English-only for v1)
- Text formatting options (bullet points, markdown)
- Integration with specific apps (direct paste into Notion, etc.)
- Voice commands or wake words
- Review/edit step before clipboard copy
- Custom vocabulary or voice training

## UI Reference
See minimal app preview for UI patterns and interactions. The recorder component should follow the compact overlay pattern with a waveform visualization and text display area as prototyped.