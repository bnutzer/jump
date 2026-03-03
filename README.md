# Jump!

**URL shortcuts at your fingertips.**

Jump! is a Chrome extension that lets you navigate to your favorite URLs instantly -- from the address bar or with a single click.

## What it does

- **Omnibox:** Type `j` followed by a space and a shortcut key to jump straight to a URL. For example, `j g` takes you to GitHub.
- **Popup:** Click the extension icon to see all your shortcuts as a clickable list.
- **Options page:** Add, edit, delete, import, and export your shortcuts.

## Install

### Chrome Web Store

*Coming soon* — [jump-shortcuts.click](https://jump-shortcuts.click)

### Build from source

```bash
git clone https://github.com/bnutzer/jump.git
cd jump
npm clean-install
npm run build
```

Then load the extension in Chrome:

1. Go to `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked** and select the `dist/` directory

## Usage

1. Click the address bar (or press `Ctrl+L` / `Cmd+L`).
2. Type `j` and press **Space** — the address bar switches to Jump! mode.
3. Type a shortcut key (e.g. `gh`) and press **Enter** to navigate.

To manage your shortcuts, click the extension icon and select **Edit targets**, right-click the extension icon and
select **Options**, or go to `chrome://extensions` and click **Details > Extension options**.

## Background

Jump! started as a personal tool I built for myself and have been using daily for over five years. When I decided to
release it publicly, I used [Claude Code](https://claude.ai/code) to turn it from a rough personal tool into something
with a decent user experience for everyone. The [`CLAUDE.md`](CLAUDE.md) file in this repository documents the project
structure and conventions used during that process.

## Contributing

Contributions are welcome! Please [open an issue](https://github.com/bnutzer/jump/issues) to report bugs or suggest
features, or submit a pull request.

## Privacy

Jump! does not collect any data. See the full [Privacy Policy](PRIVACY.md).

## License

[MIT](LICENSE)
