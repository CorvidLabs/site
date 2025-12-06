# Corvid Labs - Nevermore NFT Collection Website

An interactive Angular-based whitepaper for the **Nevermore NFT Collection**.

**[Live Site](https://corvidlabs.github.io/site/)** | **[Discord](https://discord.gg/6xMfGZgnf9)**

## About

The Nevermore NFT is a lifetime membership token for the Corvid Labs ecosystem, granting holders pro access to all our iOS apps and a voice in our community-driven development.

This website features a desktop-like interface with draggable windows, multiple themes, and blockchain integration via Pera Wallet.

## Tech Stack

- **Framework**: Angular 20.3.0 (standalone components)
- **Runtime**: Bun
- **Blockchain**: Algorand (via Pera Wallet)
- **Styling**: SCSS + Angular Material + Tailwind CSS
- **Testing**: Karma + Jasmine

## Development

```bash
# Install dependencies
bun install

# Start dev server (http://localhost:4200)
bun run start

# Run tests
bun test

# Build for production
bun run build
```

## Project Structure

- `src/app/components/windows/` - Draggable window components
- `src/app/directives/` - DraggableDirective, ResizableDirective
- `src/app/services/general/` - ThemeService, ZIndexManagerService
- `src/themes/` - 8 available SCSS themes

## Architecture

See [`.claude/CLAUDE.md`](.claude/CLAUDE.md) for detailed architectural patterns and conventions.
