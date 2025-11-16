import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ThemeService, type ThemeName } from '../../services/general/theme.service';

@Component({
  selector: 'app-theme-switcher',
  imports: [CommonModule],
  templateUrl: './theme-switcher.component.html',
  styleUrls: ['./theme-switcher.component.scss']
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
