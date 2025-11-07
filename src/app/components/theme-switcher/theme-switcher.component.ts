import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ThemeService, type ThemeName } from '../../services/general/theme.service';

@Component({
  selector: 'app-theme-switcher',
  imports: [CommonModule],
  template: `
    <div class="theme-switcher">
      <h3>Theme Switcher</h3>
      <div class="theme-buttons">
        @for (theme of themes; track theme) {
          <button 
            (click)="switchTheme(theme)"
            [class.active]="currentTheme() === theme">
            {{ formatThemeName(theme) }}
          </button>
        }
      </div>
      <p class="current-theme">Current theme: {{ formatThemeName(currentTheme()) }}</p>
    </div>
  `,
  styles: [`
    .theme-switcher {
      padding: 1rem;
      background-color: var(--theme-section-bg, var(--mat-sys-surface-container));
      border-radius: 0.5rem;
      border: 1px solid var(--theme-border-color, var(--mat-sys-outline-variant));
      
      h3 {
        margin-top: 0;
        color: var(--theme-primary-text, var(--mat-sys-on-surface));
      }
    }

    .theme-buttons {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    button {
      padding: 0.5rem 1rem;
      border: 1px solid var(--theme-border-color, var(--mat-sys-outline));
      background-color: var(--theme-secondary-bg, var(--mat-sys-surface));
      color: var(--theme-primary-text, var(--mat-sys-on-surface));
      border-radius: 0.25rem;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background-color: var(--theme-primary-accent, var(--mat-sys-primary));
        color: var(--mat-sys-on-primary);
      }

      &.active {
        background-color: var(--theme-primary-accent, var(--mat-sys-primary));
        color: var(--mat-sys-on-primary);
        font-weight: bold;
      }
    }

    .current-theme {
      margin-top: 1rem;
      margin-bottom: 0;
      color: var(--theme-secondary-text, var(--mat-sys-on-surface-variant));
      font-size: 0.875rem;
    }
  `]
})
export class ThemeSwitcherComponent {
  private themeService = inject(ThemeService);
  
  protected readonly themes = this.themeService.getAvailableThemes();
  protected readonly currentTheme = this.themeService.theme;

  protected switchTheme(theme: ThemeName): void {
    this.themeService.setTheme(theme);
  }

  protected formatThemeName(theme: ThemeName): string {
    return theme
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
