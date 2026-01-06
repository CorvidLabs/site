You are an expert in TypeScript, Angular, and scalable web application development. You write maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection

## Project Architecture

### Window Management System

This application uses a desktop metaphor with floating, draggable, resizable windows.

**Base Component**: `FloatWindowComponent` (`src/app/components/windows/float-window/`)
- All window components extend FloatWindow
- Uses signals for width/height state
- Emits `closeEvent` for lifecycle management

**Window Lifecycle**: Managed by `MainViewComponent`
- Creates windows dynamically via `ViewContainerRef`
- Maintains `openedWindows` array
- Implements singleton-like behavior (one instance per type)

**Custom Directives**:
- `DraggableDirective` - Window dragging with viewport constraints
- `ResizableDirective` - 8 resize handles (n, s, e, w, ne, nw, se, sw)
- Both use `ZIndexManagerService` for window stacking

**Pattern for New Window Components**:
```typescript
export class MyWindowComponent extends FloatWindowComponent {
  constructor() {
    super();
    this.width.set(600);
    this.height.set(400);
  }
}
```

### Theme System

**Central Authority**: `ThemeService` (`src/app/services/general/theme.service.ts`)
- 8 themes defined in `THEME_REGISTRY`
- Persists to localStorage
- Respects system color-scheme preference
- Uses signals: `theme = signal<ThemeId>('corvid')`

**SCSS Implementation**:
- Each theme file in `src/themes/`
- Exports `@mixin theme()` with CSS variables
- Applied via body class (e.g., `body.corvid-theme`)

**CSS Variables Pattern**:
```scss
--theme-primary-bg
--theme-secondary-bg
--theme-primary-text
--theme-primary-accent
```

### State Management

- **Pure signals** - no NgRx/Akita
- Services use `signal()` for reactive state
- Components use `computed()` for derived state

### Blockchain Integration

- **Pera Wallet Connect** for Algorand authentication
- TestNet by default (AlgorandChainIDs.TestNet)
- Managed in `MainViewComponent`
- State: `userAccountAddress = signal<string | null>(null)`

### Code Organization

```
src/app/
├── components/
│   ├── windows/          # Window components (extend FloatWindow)
│   ├── main-view/        # Desktop orchestrator
│   └── [other UI]
├── directives/           # DraggableDirective, ResizableDirective
├── services/general/     # ThemeService, ZIndexManagerService
├── enums/                # WindowTypes
└── interfaces/           # TypeScript interfaces
```

## Development Commands

Run with `bun run <script>`:

```bash
bun run start    # Dev server (http://localhost:4200)
bun run build    # Production build → dist/corvid-site/
bun run watch    # Development build with watch
bun test         # Run tests
```

## Build & Bundle Information

### Bundle Size Budget

**Current production bundle:** ~1.85 MB raw / ~320 KB gzipped
**Budget limits:** 2 MB warning / 2.5 MB error (see `angular.json`)

**Why bundle is large:**
- Blockchain SDKs: `algosdk` (~683 KB chunk), `@perawallet/connect`
- Angular Material + 8 complete theme definitions (~470 KB styles)
- Chart.js, multiformats, and other dependencies

**Performance:** Despite raw size, the 82% compression ratio (1.85 MB → 320 KB) is excellent.

### Future Optimization Option

**Lazy load algosdk** to reduce initial bundle by ~400-600 KB:
- Convert `algosdk` imports to dynamic imports in:
  - `src/app/services/nodely.service.ts`
  - `src/app/components/main-view/main-view.component.ts`
- Trade-off: Slight delay when blockchain features are first used
- Benefit: Faster initial page load for users who don't connect wallets
