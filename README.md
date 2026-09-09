# TalkClip

Voice to clipboard in seconds. Press a global hotkey, speak, and the cleaned-up text is on your clipboard.

This application was generated end to end by the [Nolan](https://github.com/mikelm20/nolan-v1) pipeline, and the git history shows the loop: fifteen `feat(spec): add product spec` commits by the `nolan-wizard` agent, one `feat: Implement TalkClip voice-to-clipboard desktop app` commit, a `feat(spec): add PO feedback - Recognition error: network` round, and finally `Merge code for idea` and `Merge spec for idea`. The product spec the agents worked from is kept at `.nolan/ideas/idea-19bd35fb0d6-0/spec.md`.

## What it does

- `Ctrl+Shift+V` (`Cmd+Shift+V` on macOS) toggles a small always-on-top, frameless window from anywhere.
- Recording uses the browser Web Speech API inside Electron, with a live waveform driven by the Web Audio API.
- The raw transcript is cleaned (punctuation, capitalisation, filler words) by a local Ollama model (`llama3.2:1b`) when Ollama is running on `localhost:11434`. If it is not, the transcript is copied as is.
- The result is written to the system clipboard through a preload bridge; the renderer has no Node access.

## Stack

Electron 28, React 18, TypeScript, Vite 5, electron-builder. No cloud services.

## Layout

```
src/main/main.ts                 Electron main process: window, global shortcut, clipboard IPC
src/preload/preload.ts           contextBridge API exposed to the renderer
src/renderer/                    React UI
  hooks/useSpeechRecognition.ts  Web Speech API wrapper with audio level analysis
  services/grammarCleanup.ts     optional Ollama post-processing
.nolan/                          Nolan pipeline state (only the spec is tracked)
```

## Run

```bash
npm install
npm run dev        # Vite dev server plus Electron with devtools
npm run build      # compiles main, preload and renderer into dist/
npm run package    # electron-builder: AppImage and deb on Linux, dmg on macOS, nsis on Windows
```

Speech recognition depends on the Chromium build inside Electron having a speech backend available. On some Linux setups it reports `network` errors; that was the product-owner feedback round recorded in the history.

## Status

A working prototype and a test fixture for Nolan. Not maintained.
