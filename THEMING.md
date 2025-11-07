# Angular Material Theming Guide

This project uses Angular Material's theming system with a simple file-based approach for managing themes.

## Available Themes

The project comes with three pre-configured themes:

1. **dark-theme** - Default dark theme with violet/rose accents
2. **light-theme** - Light theme with violet/rose accents
3. **corvid-theme** - Custom dark theme with space/raven aesthetic and cream highlights

## Theme Files Structure

```
src/themes/
  ├── dark-theme.scss      # Dark theme definition
  ├── light-theme.scss     # Light theme definition
  └── corvid-theme.scss    # Custom Corvid theme
```

## How to Switch Themes

### Programmatically in Code

Use the `ThemeService` to switch themes:

```typescript
import { inject } from '@angular/core';
import { ThemeService } from './services/general/theme.service';

export class YourComponent {
  private themeService = inject(ThemeService);

  switchToLight() {
    this.themeService.setTheme('light-theme');
  }

  switchToDark() {
    this.themeService.setTheme('dark-theme');
  }

  switchToCorvid() {
    this.themeService.setTheme('corvid-theme');
  }

  // Get current theme
  getCurrentTheme() {
    return this.themeService.theme();
  }
}
```

### Default Theme Configuration

To change which theme loads by default, modify the `initializeTheme()` method in `src/app/services/general/theme.service.ts`:

```typescript
private initializeTheme(): void {
  const savedTheme = localStorage.getItem('preferred-theme') as ThemeName | null;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  // Change 'dark-theme' to any available theme name
  const initialTheme: ThemeName = savedTheme || (prefersDark ? 'dark-theme' : 'light-theme');
  this.setTheme(initialTheme);
}
```

Or set a hard-coded default:

```typescript
const initialTheme: ThemeName = savedTheme || 'corvid-theme'; // Always start with corvid-theme
```

## Creating a New Custom Theme

1. **Create a new theme file** in `src/themes/` (e.g., `my-custom-theme.scss`):

```scss
@use '@angular/material' as mat;

// Define your theme
$my-custom-theme: mat.define-theme((
  color: (
    theme-type: dark, // or 'light'
    primary: mat.$blue-palette,
    tertiary: mat.$green-palette,
  ),
  typography: (
    brand-family: 'Inter',
    plain-family: 'Inter',
  ),
  density: (
    scale: 0
  )
));

// Export theme mixin
@mixin theme() {
  @include mat.all-component-themes($my-custom-theme);
  
  // Add custom CSS variables for your theme
  --theme-primary-bg: #your-color;
  --theme-secondary-bg: #your-color;
  --theme-section-bg: #your-color;
  --theme-primary-text: #your-color;
  --theme-secondary-text: #your-color;
  --theme-primary-accent: #your-color;
  --theme-secondary-accent: #your-color;
  --theme-border-color: #your-color;
  --theme-player-bg: #your-color;
}
```

2. **Import the theme** in `src/styles.scss`:

```scss
@use 'themes/my-custom-theme';

// Add the theme class
body.my-custom-theme {
  @include my-custom-theme.theme();
}
```

3. **Add the theme to the service** in `src/app/services/general/theme.service.ts`:

```typescript
export type ThemeName = 'light-theme' | 'dark-theme' | 'corvid-theme' | 'my-custom-theme';

// Update the availableThemes array
private readonly availableThemes: ThemeName[] = ['light-theme', 'dark-theme', 'corvid-theme', 'my-custom-theme'];
```

## Using Custom Theme Variables

The themes define custom CSS variables that you can use in your components:

```scss
.my-component {
  background-color: var(--theme-primary-bg);
  color: var(--theme-primary-text);
  border: 1px solid var(--theme-border-color);
}
```

Available custom variables:
- `--theme-primary-bg`
- `--theme-secondary-bg`
- `--theme-section-bg`
- `--theme-primary-text`
- `--theme-secondary-text`
- `--theme-primary-accent`
- `--theme-secondary-accent`
- `--theme-border-color`
- `--theme-player-bg`

## Material Design Color Palettes

Angular Material provides these built-in color palettes:

- `mat.$red-palette`
- `mat.$pink-palette`
- `mat.$purple-palette`
- `mat.$violet-palette`
- `mat.$blue-palette`
- `mat.$cyan-palette`
- `mat.$teal-palette`
- `mat.$green-palette`
- `mat.$chartreuse-palette`
- `mat.$yellow-palette`
- `mat.$orange-palette`
- `mat.$magenta-palette`
- `mat.$rose-palette`
- `mat.$azure-palette`

Use these in your theme definitions for consistent Material Design colors.

## Theme Persistence

The selected theme is automatically saved to `localStorage` and will persist across browser sessions. The theme service also respects the user's system preference (dark/light mode) if no saved preference exists.

## References

- [Angular Material Theming Guide](https://material.angular.dev/guide/theming)
- [Material Design 3 Colors](https://m3.material.io/styles/color/system/overview)
