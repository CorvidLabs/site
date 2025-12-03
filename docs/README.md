# Documentation Index

Welcome to the Corvid Site theming documentation! This folder contains comprehensive guides for working with Angular Material themes and custom color palettes.

## 📚 Documentation Files

### Getting Started
1. **[THEMING.md](./THEMING.md)** - Complete theming guide
   - How to set up themes
   - Using Material Design 3
   - Theme structure and organization
   - Creating and modifying themes

2. **[THEME_SETUP_SUMMARY.md](./THEME_SETUP_SUMMARY.md)** - Quick reference
   - What was set up
   - How to use themes
   - Quick start guide
   - Common tasks

### Color Palettes
3. **[CUSTOM_COLOR_PALETTES.md](./CUSTOM_COLOR_PALETTES.md)** ⭐
   - Creating custom color palettes
   - Understanding Material color system
   - Palette structure and requirements
   - Tools and resources
   - Best practices

4. **[MATERIAL_TOKENS_EXPLAINED.md](./MATERIAL_TOKENS_EXPLAINED.md)** ⭐ NEW
   - What are Material system tokens (`--mat-sys-*`)
   - Where they're defined and how they work
   - Custom variables vs. Material tokens
   - Contrast and accessibility
   - Troubleshooting token issues

5. **[THEME_COLORS.md](./THEME_COLORS.md)** - Color reference
   - All theme color values
   - Material palette options
   - Color usage guide

### Examples & Code
6. **[THEME_EXAMPLES.md](./THEME_EXAMPLES.md)** - Code examples
   - How to switch themes
   - Default theme configuration
   - Route-based theming
   - Programmatic examples

7. **[THEME_FILE_STRUCTURE.md](./THEME_FILE_STRUCTURE.md)** - Project structure
   - File organization
   - Theme file anatomy
   - Build configuration
   - Integration points

### Fixes & Troubleshooting
8. **[FLOAT_WINDOW_FIX.md](./FLOAT_WINDOW_FIX.md)** - Background transparency fix
   - Common theming issues
   - Component background fixes
   - Material token usage

9. **[THEME_SWITCHER_CONTRAST_FIX.md](./THEME_SWITCHER_CONTRAST_FIX.md)** - Contrast fix
   - Theme switcher text visibility
   - Contrast ratio solutions
   - Material token vs. custom variables

10. **[PALETTE_SETUP_COMPLETE.md](./PALETTE_SETUP_COMPLETE.md)** - Setup summary
    - Custom palette setup overview
    - Integration guide
    - Key learnings

11. **[BLACK_ORANGE_THEME.md](./BLACK_ORANGE_THEME.md)** ⭐ NEW
    - Black & Orange theme guide
    - Color palette and usage
    - Design guidelines
    - Customization options

## 🎨 Example Files

### Live Examples in the Project

**Custom Color Palette:**
- Location: `/src/themes/palettes/example-palette.scss`
- Description: Forest green palette example
- Shows: Complete palette structure with all required keys

**Example Theme:**
- Location: `/src/themes/example-theme.scss`
- Description: Theme using the custom forest green palette
- Shows: How to integrate custom palettes into themes

## 🚀 Quick Links

### I want to...

#### Create a custom color palette
1. Read: [CUSTOM_COLOR_PALETTES.md](./CUSTOM_COLOR_PALETTES.md)
2. Copy: `/src/themes/palettes/example-palette.scss`
3. Modify: Change colors to match your brand
4. Use: Import in your theme file

#### Create a new theme
1. Read: [THEMING.md](./THEMING.md) - "Creating a New Custom Theme" section
2. Copy: `/src/themes/example-theme.scss`
3. Modify: Adjust colors and variables
4. Integrate: Add to `styles.scss` and `theme.service.ts`

#### Switch between themes
1. Read: [THEME_EXAMPLES.md](./THEME_EXAMPLES.md)
2. Use: `ThemeService.setTheme('theme-name')`
3. See: Example code in the documentation

#### Change the default theme
1. Open: `/src/app/services/general/theme.service.ts`
2. Edit: Line ~23, change the default theme name
3. Save: Changes will apply on next app load

## 📁 File Structure

```
docs/
├── README.md                      # This file
├── THEMING.md                     # Main theming guide
├── CUSTOM_COLOR_PALETTES.md       # Palette creation guide ⭐
├── THEME_COLORS.md                # Color reference
├── THEME_EXAMPLES.md              # Code examples
├── THEME_SETUP_SUMMARY.md         # Quick reference
├── THEME_FILE_STRUCTURE.md        # Project structure
└── FLOAT_WINDOW_FIX.md            # Troubleshooting

src/themes/
├── palettes/
│   └── example-palette.scss       # Example custom palette ⭐
├── dark-theme.scss                # Built-in dark theme
├── light-theme.scss               # Built-in light theme
├── corvid-theme.scss              # Custom Corvid theme
└── example-theme.scss             # Example using custom palette ⭐
```

## 🎯 Available Themes

| Theme | Type | Primary Color | Status |
|-------|------|---------------|--------|
| `dark-theme` | Dark | Violet | ✅ Default |
| `light-theme` | Light | Violet | ✅ Built-in |
| `corvid-theme` | Dark | Violet/Cyan | ✅ Custom |
| `example-theme` | Dark | Forest Green | ✅ Example |
| `black-orange-theme` | Dark | Orange | ✅ New ⭐ |

## 🛠️ Tools & Resources

### Online Tools
- [Material Theme Builder](https://material-foundation.github.io/material-theme-builder/) - Official palette generator
- [Material Color Tool](https://m2.material.io/design/color/) - Color system guide
- [Coolors.co](https://coolors.co/) - Color scheme generator
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) - Accessibility testing

### Official Documentation
- [Angular Material Theming](https://material.angular.dev/guide/theming)
- [Material Design 3](https://m3.material.io/)
- [Material Color System](https://m3.material.io/styles/color/system/overview)

## 🔍 Common Tasks

### Change Website Theme
```typescript
// In any component
import { inject } from '@angular/core';
import { ThemeService } from './services/general/theme.service';

export class MyComponent {
  private themeService = inject(ThemeService);
  
  switchToExampleTheme() {
    this.themeService.setTheme('example-theme');
  }
}
```

### Use Custom Palette in New Theme
```scss
// 1. Create palette file
@use 'palettes/my-palette';

// 2. Use in theme
$my-theme: mat.define-theme((
  color: (
    theme-type: dark,
    primary: my-palette.$palette,
  ),
));
```

### Access Theme Colors in Components
```scss
.my-component {
  background: var(--theme-primary-bg);
  color: var(--theme-primary-text);
  border: 1px solid var(--theme-border-color);
}
```

## 📝 Contributing

When adding new themes or palettes:
1. Follow the structure in example files
2. Document color choices and use cases
3. Test in both light and dark environments
4. Verify accessibility (contrast ratios)
5. Update this README with new themes

## ❓ Need Help?

1. Check the relevant documentation file above
2. Look at the example files in `/src/themes/`
3. Review [THEME_EXAMPLES.md](./THEME_EXAMPLES.md) for code samples

---

**Last Updated:** November 2025  
**Version:** 1.0  
**Project:** Corvid Labs Site
