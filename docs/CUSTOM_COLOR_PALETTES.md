# Creating Custom Material Color Palettes

This guide explains how to create custom color palettes for Angular Material themes instead of using the built-in palettes.

## Table of Contents
- [Understanding Material Color Palettes](#understanding-material-color-palettes)
- [Creating a Custom Palette](#creating-a-custom-palette)
- [Using Your Custom Palette](#using-your-custom-palette)
- [Palette File Structure](#palette-file-structure)
- [Examples](#examples)

## Understanding Material Color Palettes

Angular Material uses color palettes to generate consistent color schemes across components. A palette consists of multiple shades of a base color, from very light to very dark.

### Built-in Palettes
Angular Material provides these built-in palettes:
- `mat.$red-palette`, `mat.$pink-palette`, `mat.$purple-palette`
- `mat.$violet-palette`, `mat.$blue-palette`, `mat.$cyan-palette`
- `mat.$teal-palette`, `mat.$green-palette`, `mat.$yellow-palette`
- `mat.$orange-palette`, `mat.$magenta-palette`, `mat.$rose-palette`
- And more...

## Creating a Custom Palette

### Method 1: Using `mat.define-palette()` with Custom Colors

You can create a custom palette by defining a Sass map with specific color values for different shades.

```scss
@use '@angular/material' as mat;

// Define your custom color palette
$my-custom-palette: (
  '0': #000000,
  '10': #1a0033,
  '20': #330066,
  '25': #400080,
  '30': #4d0099,
  '35': #5900b3,
  '40': #6600cc,
  '50': #8000ff,
  '60': #9933ff,
  '70': #b366ff,
  '80': #cc99ff,
  '90': #e6ccff,
  '95': #f2e6ff,
  '98': #faf5ff,
  '99': #fefbff,
  '100': #ffffff,
);

// Use the palette in your theme
$my-theme: mat.define-theme((
  color: (
    theme-type: dark,
    primary: $my-custom-palette,
    tertiary: mat.$cyan-palette,
  ),
  // ... rest of theme config
));
```

### Method 2: Creating a Reusable Palette File

For better organization, create palette files in `src/themes/palettes/`:

**File: `src/themes/palettes/my-palette.scss`**
```scss
@use 'sass:map';

// Define the palette map with all shades
// IMPORTANT: Keys must be strings (quoted)
$palette: (
  '0': #000000,
  '10': #1a0033,
  '20': #330066,
  '25': #400080,
  '30': #4d0099,
  '35': #5900b3,
  '40': #6600cc,
  '50': #8000ff,
  '60': #9933ff,
  '70': #b366ff,
  '80': #cc99ff,
  '90': #e6ccff,
  '95': #f2e6ff,
  '98': #faf5ff,
  '99': #fefbff,
  '100': #ffffff,
);
```

Then import and use it in your theme:

```scss
@use '@angular/material' as mat;
@use 'palettes/my-palette';

$my-theme: mat.define-theme((
  color: (
    theme-type: dark,
    primary: my-palette.$palette,
    tertiary: mat.$cyan-palette,
  ),
));
```

## Palette Color Keys

Material Design 3 uses a tonal palette system with these key values:

| Key | Usage | Light Theme | Dark Theme |
|-----|-------|-------------|------------|
| **0** | Darkest shade | Shadows | Pure black |
| **10** | Very dark | Text | Very dark backgrounds |
| **20-40** | Dark shades | Contrast elements | Primary colors |
| **50** | Base color | Primary color | Mid-tone |
| **60-80** | Light shades | Backgrounds | Light text |
| **90-95** | Very light | Light backgrounds | Accent highlights |
| **98-99** | Nearly white | Surface colors | Light surfaces |
| **100** | Pure white | Pure white | Lightest shade |

### Required Keys

At minimum, you should define these keys (as quoted strings):
- `'0'`, `'10'`, `'20'`, `'30'`, `'40'`, `'50'`, `'60'`, `'70'`, `'80'`, `'90'`, `'95'`, `'98'`, `'99'`, `'100'`

**Important:** Keys must be strings (quoted). Angular Material requires this format.

Material will interpolate between values if some are missing, but providing all keys gives you the most control.

## Color Palette Tools

### Online Tools to Generate Palettes

1. **Material Theme Builder**
   - URL: https://material-foundation.github.io/material-theme-builder/
   - Official Material Design tool
   - Input a base color, get a full palette

2. **Material Color Tool**
   - URL: https://m2.material.io/design/color/the-color-system.html
   - Generate harmonious color palettes
   - Export as CSS/SCSS

3. **Coolors.co**
   - URL: https://coolors.co/
   - Generate color schemes
   - Export palettes

### Manual Color Generation

From a base color (e.g., `#6600cc`), create shades:

- **Darker shades (0-40)**: Mix with black
- **Base (50)**: Your main color
- **Lighter shades (60-100)**: Mix with white

Use tools like:
- Sass `darken()` and `lighten()` functions
- Online color mixers
- Design tools (Figma, Adobe Color)

## Using Your Custom Palette

### In a Theme File

```scss
@use '@angular/material' as mat;
@use 'palettes/my-custom-palette';

$my-theme: mat.define-theme((
  color: (
    theme-type: dark,
    primary: my-custom-palette.$palette,
    tertiary: mat.$rose-palette,  // Mix custom with built-in
  ),
  typography: (
    brand-family: 'Inter',
    plain-family: 'Inter',
  ),
  density: (scale: 0)
));

@mixin theme() {
  @include mat.all-component-themes($my-theme);
  
  // Your custom CSS variables
  --theme-primary-bg: #11111b;
  --theme-secondary-bg: #1f2937;
  // ...
}
```

### Multiple Custom Palettes

You can use different custom palettes for primary, secondary, and tertiary:

```scss
@use 'palettes/purple-palette';
@use 'palettes/teal-palette';
@use 'palettes/orange-palette';

$my-theme: mat.define-theme((
  color: (
    theme-type: dark,
    primary: purple-palette.$palette,
    secondary: teal-palette.$palette,
    tertiary: orange-palette.$palette,
  ),
));
```

## Best Practices

### 1. Maintain Sufficient Contrast
Ensure text remains readable on backgrounds:
- Light text on dark: contrast ratio ≥ 4.5:1
- Dark text on light: contrast ratio ≥ 4.5:1
- Use tools like WebAIM Contrast Checker

### 2. Follow Material Design Guidelines
- Use the tonal palette system
- Maintain semantic meaning (error = red tones, success = green tones)
- Test in both light and dark themes

### 3. Organize Your Palettes
```
src/themes/palettes/
  ├── brand-primary.scss      # Your main brand color
  ├── brand-secondary.scss    # Secondary brand color
  ├── custom-error.scss       # Custom error palette
  └── custom-success.scss     # Custom success palette
```

### 4. Document Your Colors
Add comments to your palette files:

```scss
// Brand Purple Palette
// Base color: #6600cc (Royal Purple)
// Used for: Primary actions, links, emphasis
$palette: (
  0: #000000,    // Pure black
  10: #1a0033,   // Very dark purple
  // ...
  50: #6600cc,   // Base brand color
  // ...
  100: #ffffff,  // Pure white
);
```

## Testing Your Palette

1. **Test with Material Components**
   ```html
   <button mat-raised-button color="primary">Primary Button</button>
   <mat-slider color="primary"></mat-slider>
   <mat-checkbox color="primary">Check me</mat-checkbox>
   ```

2. **Test Theme Switching**
   - Switch between light and dark themes
   - Ensure colors work in both contexts
   - Check contrast ratios

3. **Test Accessibility**
   - Use browser dev tools accessibility checker
   - Test with screen readers
   - Verify WCAG compliance

## Common Issues

### Issue: Colors Look Wrong
**Solution**: Ensure all required palette keys (0-100) are defined.

### Issue: Poor Contrast
**Solution**: Adjust your palette values to increase contrast between adjacent shades.

### Issue: Palette Not Loading
**Solution**: Check your `@use` import path is correct relative to your theme file.

### Issue: Inconsistent Colors
**Solution**: Make sure you're using the palette consistently across all components.

## Example: Converting a Brand Color

Let's say your brand color is `#FF6B35` (orange). Here's how to create a full palette:

```scss
// src/themes/palettes/brand-orange.scss
$palette: (
  '0': #000000,
  '10': #330d00,
  '20': #661a00,
  '25': #802100,
  '30': #992700,
  '35': #b32d00,
  '40': #cc3400,
  '50': #ff6b35,   // Your brand color
  '60': #ff8558,
  '70': #ff9e7a,
  '80': #ffb89d,
  '90': #ffd1bf,
  '95': #ffe8df,
  '98': #fff5f2,
  '99': #fffbf9,
  '100': #ffffff,
);
```

## Additional Resources

- [Material Design 3 Color System](https://m3.material.io/styles/color/system/overview)
- [Angular Material Theming Guide](https://material.angular.dev/guide/theming)
- [Material Theme Builder](https://material-foundation.github.io/material-theme-builder/)
- [WCAG Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)

## See Also

- `/docs/THEMING.md` - Main theming guide
- `/docs/THEME_EXAMPLES.md` - Code examples
- `/docs/THEME_COLORS.md` - Color reference
- Example palette: `/src/themes/palettes/example-palette.scss`
- Example theme using palette: `/src/themes/example-theme.scss`
