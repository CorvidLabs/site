import { DOCUMENT } from '@angular/common';
import { Injectable, RendererFactory2, inject, signal } from '@angular/core';

/**
 * Theme configuration interface
 * @property id - Unique identifier for the theme (used in code)
 * @property displayName - User-friendly name shown in UI
 * @property type - Theme type ('light' | 'dark')
 * @property cssClass - CSS class applied to body element
 */
export interface ThemeConfig {
  id: string;
  displayName: string;
  type: 'light' | 'dark';
  cssClass: string;
}

/**
 * Central theme registry - Add new themes here
 * This is the ONLY place you need to modify when adding/removing themes
 */
export const THEME_REGISTRY: readonly ThemeConfig[] = [
  { id: 'light', displayName: 'Light', type: 'light', cssClass: 'light-theme' },
  { id: 'dark', displayName: 'Dark (Default)', type: 'dark', cssClass: 'dark-theme' },
  { id: 'corvid', displayName: 'Cappuccino', type: 'dark', cssClass: 'corvid-theme' },
  { id: 'green', displayName: 'Green Matrix', type: 'dark', cssClass: 'green-theme' },
  { id: 'black-orange', displayName: 'Black & Orange', type: 'dark', cssClass: 'black-orange-theme' },
  { id: 'arcade', displayName: 'Arcade', type: 'dark', cssClass: 'arcade-theme' },
  { id: 'sunset', displayName: 'Sunset Vibes', type: 'light', cssClass: 'sunset-theme' },
  { id: 'cyberpunk', displayName: 'Cyberpunk Neon', type: 'dark', cssClass: 'cyberpunk-theme' },
] as const;

// Auto-generate theme ID type from registry
export type ThemeId = (typeof THEME_REGISTRY)[number]['id'];

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer = inject(RendererFactory2).createRenderer(null, null);
  private document = inject(DOCUMENT);

  // Auto-populated from THEME_REGISTRY
  private readonly themes = THEME_REGISTRY;
  private readonly themeMap = new Map(this.themes.map(theme => [theme.id, theme]));

  // Use a signal to hold the current theme state
  theme = signal<ThemeId>('dark');

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    const savedThemeId = localStorage.getItem('preferred-theme') as ThemeId | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Determine initial theme based on saved preference or system setting
    const initialTheme: ThemeId = savedThemeId && this.themeMap.has(savedThemeId)
      ? savedThemeId
      : (prefersDark ? 'dark' : 'light');

    this.setTheme(initialTheme);

    // Listen for system theme changes if no preference is set
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('preferred-theme')) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  /**
   * Set the active theme
   * @param themeId - The theme ID from THEME_REGISTRY
   */
  setTheme(themeId: ThemeId): void {
    const themeConfig = this.themeMap.get(themeId);

    if (!themeConfig) {
      console.warn(`Theme "${themeId}" is not a valid theme.`);
      return;
    }

    // Remove all possible theme classes from the body
    this.themes.forEach(theme => {
      this.renderer.removeClass(this.document.body, theme.cssClass);
    });

    // Add the new theme class
    this.renderer.addClass(this.document.body, themeConfig.cssClass);

    // Save the user's preference to localStorage
    localStorage.setItem('preferred-theme', themeId);

    // Update the signal's value
    this.theme.set(themeId);
  }

  /**
   * Get all available themes with their display information
   */
  getAvailableThemes(): readonly ThemeConfig[] {
    return this.themes;
  }

  /**
   * Get the current theme configuration
   */
  getCurrentTheme(): ThemeConfig | undefined {
    return this.themeMap.get(this.theme());
  }

  /**
   * Get theme configuration by ID
   */
  getThemeById(themeId: ThemeId): ThemeConfig | undefined {
    return this.themeMap.get(themeId);
  }
}