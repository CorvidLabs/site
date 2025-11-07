# Angular Material Theming - Complete File Structure

## Created Files

```
src/
├── themes/                                    ← NEW: Theme definitions
│   ├── dark-theme.scss                        ← Default dark theme
│   ├── light-theme.scss                       ← Light theme
│   └── corvid-theme.scss                      ← Custom Corvid theme
│
├── app/
│   ├── services/
│   │   └── general/
│   │       └── theme.service.ts               ← UPDATED: Theme switching service
│   │
│   └── components/
│       └── theme-switcher/                    ← NEW: Theme switcher UI component
│           └── theme-switcher.component.ts
│
├── styles.scss                                ← UPDATED: Global styles with themes
└── app.config.ts                              ← UPDATED: Added animations provider

Documentation/
├── THEMING.md                                 ← Complete theming guide
├── THEME_EXAMPLES.md                          ← Code examples
├── THEME_SETUP_SUMMARY.md                     ← Quick reference
└── THEME_COLORS.md                            ← Color palette reference
```

## Modified Files

### `/src/styles.scss`
- Added theme imports
- Configured Material core
- Set up theme class bindings
- Updated global styles to use theme variables

### `/src/app/services/general/theme.service.ts`
- Uncommented and updated service
- Added TypeScript types for themes
- Implemented theme switching logic
- Added localStorage persistence
- Added system preference detection

### `/src/app/app.config.ts`
- Added `provideAnimationsAsync()` for Material animations

### `/src/app/app.ts`
- Integrated ThemeService
- Updated component to use service

### `/package.json`
- Added `@angular/animations@^20.3.0`

### Component SCSS files (cleaned up)
- `/src/app/components/float-window/float-window.component.scss`
- `/src/app/components/gallery-window/gallery-window.component.scss`
- `/src/app/components/main-view/main-view.component.scss`
- Removed duplicate style imports

## Theme Files Explained

### Each theme file contains:

1. **Material Theme Definition**
   ```scss
   $theme-name: mat.define-theme((
     color: (...),
     typography: (...),
     density: (...)
   ));
   ```

2. **Theme Mixin**
   ```scss
   @mixin theme() {
     @include mat.all-component-themes($theme-name);
     // Custom CSS variables
   }
   ```

3. **Custom CSS Variables**
   - Background colors
   - Text colors
   - Accent colors
   - Border colors
   - Component-specific colors

## How Themes Are Applied

1. **Theme Service** initializes on app start
2. **Service** adds theme class to `<body>` element
3. **Global styles** apply theme based on body class
4. **Components** use theme variables automatically
5. **Changes** are persisted to localStorage

## Integration Points

```typescript
// In any component
import { ThemeService } from './services/general/theme.service';

export class MyComponent {
  private themeService = inject(ThemeService);
  
  // Get current theme
  currentTheme = this.themeService.theme();
  
  // Change theme
  changeTheme() {
    this.themeService.setTheme('corvid-theme');
  }
}
```

## Usage in Templates

```scss
// In component SCSS
.my-element {
  background-color: var(--theme-primary-bg);
  color: var(--theme-primary-text);
  border-color: var(--theme-border-color);
}

// Or use Material system tokens
.my-button {
  background-color: var(--mat-sys-primary);
  color: var(--mat-sys-on-primary);
}
```

## Build Output

The themes are compiled into the global `styles.css` bundle:
- Size: ~160 kB uncompressed
- Includes all three themes
- No duplicate Material styles
- Component styles remain separate

## Development Workflow

1. Start dev server: `bun run start`
2. Edit theme files in `/src/themes/`
3. Changes hot-reload automatically
4. Test theme switching in browser
5. Theme preference saved in localStorage

## Production Build

```bash
bun run build
```

All themes are included in the production bundle. The active theme is determined at runtime by the ThemeService based on:
1. User's saved preference (localStorage)
2. System preference (prefers-color-scheme)
3. Default theme (dark-theme)
