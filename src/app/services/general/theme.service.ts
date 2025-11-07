import { DOCUMENT } from '@angular/common';
import { Injectable, RendererFactory2, inject, signal } from '@angular/core';

export type ThemeName = 'light-theme' | 'dark-theme' | 'corvid-theme';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer = inject(RendererFactory2).createRenderer(null, null);
  private document = inject(DOCUMENT);

  // Available themes for the application
  private readonly availableThemes: ThemeName[] = ['light-theme', 'dark-theme', 'corvid-theme'];
  
  // Use a signal to hold the current theme state
  theme = signal<ThemeName>('dark-theme');

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    const savedTheme = localStorage.getItem('preferred-theme') as ThemeName | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Determine initial theme based on saved preference or system setting
    const initialTheme: ThemeName = savedTheme || (prefersDark ? 'dark-theme' : 'light-theme');
    this.setTheme(initialTheme);

    // Listen for system theme changes if no preference is set
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('preferred-theme')) {
        this.setTheme(e.matches ? 'dark-theme' : 'light-theme');
      }
    });
  }

  setTheme(themeName: ThemeName): void {
    if (!this.availableThemes.includes(themeName)) {
      console.warn(`Theme "${themeName}" is not a valid theme.`);
      return;
    }

    // Remove all possible theme classes from the body
    this.availableThemes.forEach(theme => {
      this.renderer.removeClass(this.document.body, theme);
    });

    // Add the new theme class
    this.renderer.addClass(this.document.body, themeName);
    
    // Save the user's preference to localStorage
    localStorage.setItem('preferred-theme', themeName);
    
    // Update the signal's value
    this.theme.set(themeName);
  }

  getAvailableThemes(): ThemeName[] {
    return [...this.availableThemes];
  }
}