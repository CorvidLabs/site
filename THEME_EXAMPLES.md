# Theme Switching - Quick Examples

## Example 1: Switch to a Specific Theme on Component Init

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { ThemeService } from './services/general/theme.service';

@Component({
  selector: 'app-landing',
  template: `<h1>Landing Page</h1>`
})
export class LandingComponent implements OnInit {
  private themeService = inject(ThemeService);

  ngOnInit() {
    // Always use corvid-theme on this page
    this.themeService.setTheme('corvid-theme');
  }
}
```

## Example 2: Use the Theme Switcher Component

Simply import and add the component to your template:

```typescript
import { Component } from '@angular/core';
import { ThemeSwitcherComponent } from './components/theme-switcher/theme-switcher.component';

@Component({
  selector: 'app-settings',
  imports: [ThemeSwitcherComponent],
  template: `
    <div class="settings-page">
      <h1>Settings</h1>
      <app-theme-switcher />
    </div>
  `
})
export class SettingsComponent {}
```

## Example 3: Set Default Theme to Corvid Theme

Edit `src/app/services/general/theme.service.ts`:

```typescript
private initializeTheme(): void {
  const savedTheme = localStorage.getItem('preferred-theme') as ThemeName | null;
  
  // Change this line to default to 'corvid-theme'
  const initialTheme: ThemeName = savedTheme || 'corvid-theme';
  this.setTheme(initialTheme);
}
```

## Example 4: Toggle Between Two Themes

```typescript
import { Component, inject } from '@angular/core';
import { ThemeService } from './services/general/theme.service';

@Component({
  selector: 'app-header',
  template: `
    <button (click)="toggleTheme()">
      {{ currentTheme() === 'dark-theme' ? '☀️ Light' : '🌙 Dark' }}
    </button>
  `
})
export class HeaderComponent {
  private themeService = inject(ThemeService);
  protected currentTheme = this.themeService.theme;

  protected toggleTheme() {
    const newTheme = this.currentTheme() === 'dark-theme' ? 'light-theme' : 'dark-theme';
    this.themeService.setTheme(newTheme);
  }
}
```

## Example 5: Change Theme Based on Route

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ThemeService } from './services/general/theme.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  template: `<router-outlet />`
})
export class App implements OnInit {
  private router = inject(Router);
  private themeService = inject(ThemeService);

  ngOnInit() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // Use corvid-theme on home page, dark-theme elsewhere
        if (event.url === '/' || event.url === '/home') {
          this.themeService.setTheme('corvid-theme');
        } else {
          this.themeService.setTheme('dark-theme');
        }
      });
  }
}
```

## To Change the Default Theme for Your Site

**Option 1: Hard-code the default theme**

In `src/app/services/general/theme.service.ts`, change:

```typescript
const initialTheme: ThemeName = savedTheme || 'corvid-theme'; // Changed from 'dark-theme'
```

**Option 2: Set it in app initialization**

In `src/app/app.ts`:

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { ThemeService } from './services/general/theme.service';

export class App implements OnInit {
  private themeService = inject(ThemeService);

  ngOnInit() {
    // Set corvid-theme as default
    if (!localStorage.getItem('preferred-theme')) {
      this.themeService.setTheme('corvid-theme');
    }
  }
}
```
