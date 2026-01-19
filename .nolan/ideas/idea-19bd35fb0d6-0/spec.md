# TalkClip

## Overview
TalkClip is a lightweight desktop voice recorder that instantly transcribes speech to text and copies it to your clipboard. It's designed for capturing thoughts at the speed of speech—press a hotkey, speak, and your words are ready to paste anywhere within seconds.

## Problem
Ideas slip away when you can't capture them fast enough. Typing long prompts or notes interrupts your flow and breaks concentration. TalkClip eliminates the friction between thinking and capturing by letting you speak naturally while the app handles transcription, grammar cleanup, and clipboard management automatically.

## Target User
Knowledge workers, writers, and anyone who frequently captures quick thoughts or composes messages throughout their day. They work across multiple applications—notes apps like Obsidian and Notion, messaging platforms like Slack and email—and need a universal input method that's faster than typing but produces clean, paste-ready text.

## Core Features

### Feature 1: Global Hotkey Activation
**Description**: Launch TalkClip instantly from anywhere on the desktop with a keyboard shortcut (default: Cmd+Shift+V or equivalent). The app appears as a compact floating window ready to record, minimizing context-switching and keeping you in your workflow.

**Acceptance Criteria**:
- [ ] Hotkey works regardless of which application has focus
- [ ] Window appears within 200ms of hotkey press
- [ ] Window is positioned consistently (centered or near cursor)
- [ ] Pressing hotkey while TalkClip is open focuses the existing window

**Priority**: P0

### Feature 2: Voice Recording with Visual Feedback
**Description**: A simple recorder interface with a prominent microphone button and audio waveform visualization. Users see their audio input is being captured in real-time, providing confidence the recording is working.

**Acceptance Criteria**:
- [ ] Single click/tap starts recording
- [ ] Waveform animates in response to voice input volume
- [ ] Recording duration is displayed
- [ ] Visual indicator clearly distinguishes recording vs idle state

**Priority**: P0

### Feature 3: Automatic Stop Detection
**Description**: TalkClip intelligently detects when you've finished speaking and automatically stops recording. No need to manually press stop—just speak your thought and the app handles the rest, making the capture-to-clipboard flow nearly instantaneous.

**Acceptance Criteria**:
- [ ] Recording stops automatically after detecting 1.5-2 seconds of silence
- [ ] Silence threshold is calibrated to avoid cutting off natural pauses mid-sentence
- [ ] Manual stop button remains available as fallback
- [ ] Auto-stop triggers transcription immediately

**Priority**: P0

### Feature 4: Offline Speech-to-Text Transcription
**Description**: As you speak, your words appear as text in the preview area below the recorder. The transcription uses a local speech recognition model via Ollama (e.g., Whisper) to ensure reliable offline operation without network dependencies. This avoids "network error" failures that occur with browser-based Web Speech API when internet connectivity is unavailable or unreliable.

**Acceptance Criteria**:
- [ ] Text appears progressively during recording (streaming transcription) when supported by the model
- [ ] Transcription completes within 2 seconds of recording end
- [ ] Supports mixed-length recordings from quick phrases to multi-minute explanations
- [ ] Works fully offline using local Ollama model—no network connection required
- [ ] App gracefully handles Ollama service unavailability with clear error messaging and setup instructions
- [ ] No dependency on Web Speech API or other network-based speech recognition services

**Priority**: P0

### Feature 5: Automatic Grammar and Punctuation Cleanup
**Description**: Raw speech-to-text output is automatically polished before copying. The app adds proper punctuation, fixes common grammar issues, and ensures the text is ready for professional contexts without manual editing. Uses local AI models via Ollama (same instance as speech-to-text) or headless coding assistants with free models (Claude Code with Haiku, OpenCode with GLM-4, Grok Fast).

**Acceptance Criteria**:
- [ ] Punctuation (periods, commas, question marks) is added appropriately
- [ ] Capitalization follows standard sentence rules
- [ ] Common filler words ("um", "uh") are removed
- [ ] Grammar corrections don't alter the speaker's intended meaning

**Priority**: P0

### Feature 6: Instant Clipboard Copy
**Description**: Once transcription and cleanup complete, the text is automatically copied to the system clipboard. No review step, no extra clicks—the moment TalkClip finishes processing, you can immediately Cmd+V into any application.

**Acceptance Criteria**:
- [ ] Text is copied to clipboard automatically after processing
- [ ] Visual confirmation shows copy succeeded (brief toast or icon change)
- [ ] Clipboard content is plain text (no formatting artifacts)
- [ ] Works with all standard paste targets (notes, browsers, messaging apps)

**Priority**: P0

### Feature 7: Compact Floating Window UI
**Description**: The interface stays minimal and unobtrusive—a small floating window with just the essential controls. It shows the microphone button, waveform, and transcription preview without overwhelming screen real estate.

**Acceptance Criteria**:
- [ ] Window dimensions are compact (roughly 300-400px wide)
- [ ] Window floats above other applications
- [ ] Window can be dismissed quickly (Escape key or click outside)
- [ ] Transcription text area scrolls for longer recordings

**Priority**: P1

## Technical Constraints
- Must use local Ollama-based speech-to-text (e.g., Whisper model) to ensure offline reliability
- No cloud service subscriptions or API costs
- No dependency on network-based speech recognition (Web Speech API is explicitly excluded due to network reliability issues)
- Must work as desktop app, with a very minimal always on top UI
- Accuracy is prioritized—prefer solutions with good recognition quality over speed alone
- Ollama must be installed and running locally as a prerequisite

## Out of Scope (v1)
- Manual editing of transcribed text before copy
- Multiple language support (English only for v1)
- Custom hotkey configuration UI
- Audio file export or save functionality
- Integration with specific apps (Notion API, Slack API, etc.)
- User accounts or cloud sync
- Browser-based or cloud-based speech recognition (Web Speech API)

## UI Reference
See minimal app preview for UI patterns and interactions. The recorder uses a centered circular microphone button with animated waveform bars, and transcribed text appears in a text area below the controls.