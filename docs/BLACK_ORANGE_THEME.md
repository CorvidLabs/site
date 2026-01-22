# Black & Orange Theme

## Overview

A bold, high-contrast theme featuring:
- **Black backgrounds** with subtle gray variations
- **White text** for maximum readability
- **Vibrant orange** as the primary accent color

Perfect for modern, energetic designs that demand attention.

## Theme Details

### Color Palette

| Element | Color | Hex Code | Usage |
|---------|-------|----------|-------|
| **Primary Background** | Pure Black | `#000000` | Main background |
| **Secondary Background** | Very Dark Gray | `#1a1a1a` | Cards, panels, windows |
| **Section Background** | Dark Gray | `#2a2a2a` | Sections, headers |
| **Primary Text** | Pure White | `#ffffff` | Main text, headings |
| **Secondary Text** | Light Gray | `#b3b3b3` | Secondary text, descriptions |
| **Primary Accent** | Vibrant Orange | `#ff6b35` | Buttons, links, highlights |
| **Secondary Accent** | Lighter Orange | `#ff8c61` | Hover states, secondary actions |
| **Border Color** | Medium Gray | `#404040` | Borders, dividers |
| **Player Background** | Very Dark Gray | `#1a1a1a` | Media player backgrounds |

### Accessibility (WCAG Contrast Ratios)

✅ **Excellent Accessibility:**
- White on Black: **21:1** (AAA - Maximum possible!)
- Orange on Black: **7.6:1** (AAA - Excellent!)
- Light Gray on Black: **9.6:1** (AAA - Excellent!)

⚠️ **Use with Caution:**
- White on Orange: **2.8:1** (Fails AA for normal text)
  - If you need white on orange, use larger text (18pt+) or bold text

## How to Use

### Switch to This Theme

```typescript
import { inject } from '@angular/core';
import { ThemeService } from './services/general/theme.service';

export class MyComponent {
  private themeService = inject(ThemeService);
  
  switchToBlackOrange() {
    this.themeService.setTheme('black-orange-theme');
  }
}
```

### Set as Default Theme

Edit `/src/app/services/general/theme.service.ts`, line ~26:

```typescript
const initialTheme: ThemeName = savedTheme || 'black-orange-theme';
```

### Use Theme Colors in Your Components

```scss
.my-component {
  background-color: var(--theme-secondary-bg);  // Dark gray
  color: var(--theme-primary-text);             // White
  border: 1px solid var(--theme-border-color);  // Medium gray
  
  .highlight {
    color: var(--theme-primary-accent);         // Orange
  }
  
  button {
    background-color: var(--theme-primary-accent);  // Orange
    color: var(--theme-primary-bg);                 // Black (for contrast)
    
    &:hover {
      background-color: var(--theme-secondary-accent);  // Lighter orange
    }
  }
}
```

## Design Guidelines

### When to Use This Theme

✅ **Great for:**
- Bold, modern applications
- Tech/gaming interfaces
- High-energy brands
- Content that needs to stand out
- Dark mode enthusiasts

❌ **Maybe not for:**
- Traditional/conservative brands
- Reading-heavy applications (pure black can cause eye strain for extended reading)
- Accessibility-first applications (consider using `#121212` instead of pure black)

### Best Practices

1. **Use Orange Sparingly**
   - Orange is powerful - use it for important actions and highlights
   - Don't overuse or it loses impact

2. **Consider Softer Black**
   - Pure black (`#000000`) can be harsh on OLED screens
   - Consider using `#0a0a0a` or `#121212` for primary background instead
   - Current theme uses `#1a1a1a` for secondary surfaces (good compromise)

3. **Text Readability**
   - White on black is high contrast but can cause eye strain
   - The theme uses `#b3b3b3` for secondary text to reduce intensity
   - Add proper line-height and spacing for readability

4. **Orange Variations**
   - Primary: `#ff6b35` - Use for primary actions
   - Secondary: `#ff8c61` - Use for hover states
   - Consider darker orange (`#e55a2b`) for pressed states

## Customization

### Modify the Theme

Edit `/src/themes/black-orange-theme.scss`:

```scss
@mixin theme() {
  @include mat.all-component-themes($black-orange-theme);
  
  // Customize these values
  --theme-primary-bg: #000000;        // Try #0a0a0a for softer black
  --theme-primary-accent: #ff6b35;    // Try #ff5722 for Material orange
  // ...
}
```

### Alternative Orange Colors

If you want to try different orange shades:

| Orange Type | Hex Code | Description |
|-------------|----------|-------------|
| Current (Vibrant) | `#ff6b35` | Bright, energetic |
| Material Orange | `#ff5722` | Google's Material Design orange |
| Warm Orange | `#ff6f00` | Warmer, more amber |
| Dark Orange | `#e64a19` | Deeper, more serious |
| Neon Orange | `#ff4500` | Very bright, "OrangeRed" |

### Using Different Material Palette

To change the Material components' colors:

```scss
$black-orange-theme: mat.define-theme((
  color: (
    theme-type: dark,
    primary: mat.$deep-orange-palette,  // Instead of mat.$orange-palette
    tertiary: mat.$amber-palette,       // Complementary warm color
  ),
));
```

## Visual Examples

### Buttons
```
┌──────────────┐
│   Click Me   │  ← White text on orange (#ff6b35) background
└──────────────┘

┌──────────────┐
│   Disabled   │  ← Gray text on dark gray background
└──────────────┘
```

### Cards
```
┌─────────────────────────────────┐
│  Card Title              (White)│
│                                 │
│  Card content goes here with   │
│  white primary text and light   │
│  gray for secondary text.       │
│                                 │
│  ● Orange accent for icons      │
└─────────────────────────────────┘
  Dark gray (#1a1a1a) background
```

### Float Windows
```
┌─────────────────────────────────┐
│  Window Title   [Orange accent] │  ← Black header
├─────────────────────────────────┤
│                                 │
│  Content with white text        │
│  on dark gray background        │
│                                 │
└─────────────────────────────────┘
```

## Theme Variables Reference

All available CSS variables for this theme:

```scss
--theme-primary-bg: #000000;        // Pure black
--theme-secondary-bg: #1a1a1a;      // Very dark gray
--theme-section-bg: #2a2a2a;        // Dark gray
--theme-primary-text: #ffffff;      // Pure white
--theme-secondary-text: #b3b3b3;    // Light gray
--theme-primary-accent: #ff6b35;    // Vibrant orange
--theme-secondary-accent: #ff8c61;  // Lighter orange
--theme-border-color: #404040;      // Medium gray
--theme-player-bg: #1a1a1a;         // Very dark gray
```

## Related Themes

Compare with other available themes:

| Theme | Background | Text | Accent |
|-------|------------|------|--------|
| **black-orange-theme** | Black | White | Orange |
| dark-theme | Dark Gray | Off-white | Violet |
| light-theme | White | Dark Gray | Violet |
| corvid-theme | Deep Space Black | Cream | Cream |
| example-theme | Forest Dark | Light Green | Green |

## Files

- **Theme File:** `/src/themes/black-orange-theme.scss`
- **Global Styles:** `/src/styles.scss`
- **Theme Service:** `/src/app/services/general/theme.service.ts`

## Testing

✅ Theme builds successfully
✅ Integrated into app
✅ Available in theme switcher
✅ WCAG AAA contrast for main text
✅ High visual impact

Try it now:
```typescript
this.themeService.setTheme('black-orange-theme');
```

---

**Theme Name:** black-orange-theme  
**Type:** Dark  
**Primary Color:** Orange  
**Created:** November 9, 2025  
**Status:** ✅ Ready to use
