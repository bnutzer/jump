# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A Chrome browser extension (Manifest V3) called "Jump!" that provides quick URL navigation via:
- **Omnibox**: Type `j <shortcut>` in the address bar to navigate to a configured URL
- **Popup**: Click the extension icon to see all configured jump targets as clickable links (with a first-run onboarding guide)
- **Options page**: Full CRUD management of jump targets, import/export, theme toggle

## Build & Dev

This is a React 19 + TypeScript + Vite project. Chrome loads the built output from `dist/`.

```bash
npm install          # install dependencies
npm run build        # generate icons + typecheck + production build → dist/
npm run dev          # build in watch mode (rebuild on change)
npm run typecheck    # run TypeScript type checking only
npm run test         # run Vitest test suite
npm run test:watch   # run Vitest in watch mode
npm run lint         # run ESLint on src/
npm run lint:fix     # auto-fix ESLint issues
npm run format       # format with Prettier
npm run format:check # check Prettier formatting
```

After building, load the extension in Chrome:
1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `dist/` directory
4. After code changes, run `npm run build` (or use `npm run dev`) and click the refresh icon on the extension card

## Architecture

### Data layer

**`src/data/jumpMap.ts`** — Type definitions (`JumpTarget`, `SortedJumpTarget`) and re-export of `defaultJumpMap` from the JSON file.

**`src/data/defaultJumpMap.json`** — Built-in default targets (generic examples: DuckDuckGo, Jump! GitHub, Jump! website). Seeded into `chrome.storage.sync` on first install.

**`src/data/storage.ts`** — Async helpers for Chrome storage: `loadJumpMap()`, `saveJumpMap()`, `loadSortedTargets()` use `chrome.storage.sync`. Onboarding state (`hasSeenOnboarding`, `markOnboardingSeen`, `resetOnboardingSeen`) uses `chrome.storage.local`.

### Hooks

**`src/hooks/useJumpMap.ts`** — Shared React hook that loads sorted jump targets from storage. Returns `{ targets, loading }`.

**`src/hooks/useEditableJumpMap.ts`** — React hook for the options page with CRUD operations. All mutations are optimistic with rollback on storage failure. Returns `{ targets, map, loading, addTarget, updateTarget, deleteTarget, resetToDefaults, importMap }`.

**`src/hooks/useOnboarding.ts`** — Hook managing onboarding visibility state (first-run detection, dismiss, re-show). Returns `{ showOnboarding, loading, dismiss, reshow }`.

### Services

**`src/services/jumpTargetValidation.ts`** — Synchronous validation for target fields (`validateTarget`) and new-target fields including key uniqueness (`validateNewTarget`).

**`src/services/jumpMapImport.ts`** — Parses and validates a JSON string as a jump map (`parseAndValidateJumpMap`). Returns a typed `ImportResult`.

**`src/services/jumpMapExport.ts`** — Downloads the current jump map as a JSON file (`downloadJumpMapAsJson`).

### Shared UI

**`src/shared/ToastContext.tsx`** — React context provider for toast notifications (success/error) with auto-dismiss.

**`src/shared/DialogContext.tsx`** — React context provider for modal confirm/alert dialogs using the `<dialog>` element.

**`src/shared/useTheme.ts`** — Theme hook supporting system/light/dark via `localStorage` and `data-theme` attribute.

**`src/shared/ThemeToggle.tsx`** — Three-button theme switcher component (Auto/Light/Dark).

**`src/shared/theme.css`** — CSS custom properties for light/dark theming.

### Utils

**`src/utils/isValidUrl.ts`** — URL validation helper using the `URL` constructor.

### i18n

**`src/i18n.ts`** — Thin wrapper around `chrome.i18n.getMessage()`. All user-facing strings go through this.

**`public/_locales/en/messages.json`** / **`public/_locales/de/messages.json`** — Chrome i18n message files (English and German).

### Background

**`src/background/service-worker.ts`** — ES module service worker. Seeds `defaultJumpMap` into storage on first install (`chrome.runtime.onInstalled`), and handles omnibox input by looking up targets asynchronously from storage. Supports `currentTab`, `newForegroundTab`, and `newBackgroundTab` dispositions.

### Popup

**`src/popup/`** — React app for the popup:
- `main.tsx` — mounts React root
- `App.tsx` — renders jump target list with onboarding support; uses `useJumpMap`, `useOnboarding`, and `useTheme`
- `Onboarding.tsx` — first-run onboarding guide explaining the `j <key>` omnibox workflow; dismissible with "Got it!", re-triggerable via "How to use" footer link
- `popup.css` — popup styles

### Options

**`src/options/`** — React app for the options page:
- `main.tsx` — mounts React root (wrapped in `ToastProvider` and `DialogProvider`)
- `App.tsx` — editable jump table with add/edit/delete, import/export, reset, and theme toggle; uses `useEditableJumpMap`, `useDialog`, `useToast`, and `useTheme`
- `JumpTableRow.tsx` — editable row component for existing targets
- `AddTargetRow.tsx` — row component for adding new targets
- `options.css` — options page styles

### Entry points & config

**`popup.html` / `options.html`** — Vite HTML entry points at project root.

**`public/manifest.json`** — Extension manifest (MV3). Uses `__MSG_*__` placeholders for i18n.

**`public/img/`** — Icon PNGs, copied to `dist/img/` by Vite.

**`public/fonts/`** — Bungee font for branding, copied to `dist/fonts/`.

**`logo/`** — Icon generation script (`create-logo.ts`) and source SVG.

**`docs/`** — Landing page for jump-shortcuts.click (static HTML/CSS with screenshots).

**`vite.config.js`** — Multi-page Vite config with `@vitejs/plugin-react`. Builds popup, options, and service worker entry points. Service worker output has no hash for a stable manifest reference.

**`vitest.config.ts`** — Vitest configuration.

**`eslint.config.js`** — ESLint flat config with TypeScript and Prettier support.

## Testing

Tests use Vitest and live alongside source files (`*.test.ts`). Run with `npm test`. Current test files:

- `src/data/storage.test.ts` — storage helpers
- `src/services/jumpMapImport.test.ts` — import parsing/validation
- `src/services/jumpTargetValidation.test.ts` — field validation
- `src/utils/isValidUrl.test.ts` — URL validation

## Adding or Changing Jump Targets

Jump targets are stored in `chrome.storage.sync` and seeded from `src/data/defaultJumpMap.json` on first install. To change the **defaults** for new installs, edit that JSON file. To change targets at runtime, use the options page. Each target follows this shape:

```ts
'shortcut': {
  url: 'https://example.com',
  description: 'Human-readable label'
}
```

## Key Files

| File | Purpose |
|------|---------|
| `public/manifest.json` | Extension manifest (MV3), declares omnibox keyword `j`, permissions, popup, options page, i18n |
| `src/data/defaultJumpMap.json` | Default jump targets (generic examples for new installs) |
| `src/data/jumpMap.ts` | Type definitions (`JumpTarget`, `SortedJumpTarget`) and `defaultJumpMap` re-export |
| `src/data/storage.ts` | Async read/write helpers for `chrome.storage.sync` and onboarding state in `chrome.storage.local` |
| `src/hooks/useJumpMap.ts` | Shared React hook for loading jump targets from storage |
| `src/hooks/useEditableJumpMap.ts` | React hook with CRUD operations (optimistic + rollback) for the options page |
| `src/hooks/useOnboarding.ts` | Hook for first-run onboarding state |
| `src/services/jumpTargetValidation.ts` | Synchronous validation for target fields |
| `src/services/jumpMapImport.ts` | JSON import parsing and validation |
| `src/services/jumpMapExport.ts` | JSON export (file download) |
| `src/shared/ToastContext.tsx` | Toast notification provider |
| `src/shared/DialogContext.tsx` | Confirm/alert dialog provider |
| `src/shared/useTheme.ts` | Theme management hook (system/light/dark) |
| `src/shared/ThemeToggle.tsx` | Theme switcher component |
| `src/i18n.ts` | i18n wrapper around `chrome.i18n.getMessage()` |
| `src/utils/isValidUrl.ts` | URL validation utility |
| `src/background/service-worker.ts` | Service worker; seeds defaults on install, handles omnibox input |
| `src/popup/App.tsx` | Popup React component; renders jump table with onboarding |
| `src/popup/Onboarding.tsx` | First-run onboarding guide component |
| `src/options/App.tsx` | Options React component; editable jump target list with import/export and theme toggle |
| `src/options/JumpTableRow.tsx` | Editable row component for existing targets |
| `src/options/AddTargetRow.tsx` | Row component for adding new targets |
| `popup.html` | Vite entry for popup |
| `options.html` | Vite entry for options page |
| `vite.config.js` | Vite build configuration |
| `vitest.config.ts` | Vitest test configuration |
| `docs/` | Landing page for jump-shortcuts.click |