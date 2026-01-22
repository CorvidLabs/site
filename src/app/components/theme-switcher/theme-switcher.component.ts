import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ThemeService, type ThemeConfig, type ThemeId } from '../../services/general/theme.service';

@Component({
  selector: 'app-theme-switcher',
  imports: [CommonModule],
  templateUrl: './theme-switcher.component.html',
  styleUrls: ['./theme-switcher.component.scss']
})
export class ThemeSwitcherComponent {
  private themeService = inject(ThemeService);

  protected readonly themes = this.themeService.getAvailableThemes();
  protected readonly darkThemes = this.themes.filter(theme => theme.type === 'dark');
  protected readonly lightThemes = this.themes.filter(theme => theme.type === 'light');

  protected readonly currentThemeId = this.themeService.theme;

  protected switchTheme(themeConfig: ThemeConfig): void {
    this.themeService.setTheme(themeConfig.id as ThemeId);
  }
}
