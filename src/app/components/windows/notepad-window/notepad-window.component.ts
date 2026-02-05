import { Component, OnInit, signal, computed, input, inject } from '@angular/core';
import { FloatWindow } from '../float-window/float-window.component';
import { DraggableDirective } from '../../../directives/draggable.directive';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeService } from '../../../services/general/theme.service';
import { PixelIconComponent } from "../../shared/pixel-icon/pixel-icon.component";

@Component({
  selector: 'app-notepad-window',
  imports: [CommonModule, DraggableDirective, FormsModule, MatIconModule, MatButtonModule, MatTooltipModule, PixelIconComponent],
  templateUrl: 'notepad-window.component.html',
  styleUrls: ['notepad-window.component.scss']
})
export class NotepadWindowComponent extends FloatWindow implements OnInit {
  private sanitizer = inject(DomSanitizer);
  private themeService = inject(ThemeService);

  override title = input<string>('Markdown Notepad');
  noteContent = signal<string>('# Welcome to Markdown Notepad\n\nStart typing your markdown here...\n\n## Features\n- **Bold** text with `**text**`\n- *Italic* text with `*text*`\n- Lists and more!');
  isPreviewMode = signal<boolean>(false);

  // Computed property for rendered markdown (depends on theme for color updates)
  renderedMarkdown = computed(() => {
    // Read theme signal to trigger recalculation on theme change
    this.themeService.theme();
    return this.sanitizer.bypassSecurityTrustHtml(this.parseMarkdown(this.noteContent()));
  });

  constructor() {
    super();

    this.width.set(600);
    this.height.set(500);
  }

  ngOnInit() { }

  onContentChange(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    this.noteContent.set(target.value);
  }

  togglePreview() {
    this.isPreviewMode.set(!this.isPreviewMode());
  }

  // Get CSS variable value from computed styles (theme vars are on body)
  private getThemeColor(varName: string, fallback: string): string {
    const value = getComputedStyle(document.body).getPropertyValue(varName).trim();
    return value || fallback;
  }

  // Simple markdown parser with inline styles
  private parseMarkdown(markdown: string): string {
    const accentColor = this.getThemeColor('--theme-primary-accent', '#007bff');
    const primaryText = this.getThemeColor('--theme-primary-text', '#000000');
    const secondaryBg = this.getThemeColor('--theme-secondary-bg', 'rgba(0, 0, 0, 0.05)');
    const codeColor = this.getThemeColor('--theme-secondary-accent', '#e83e8c');
    const linkColor = this.getThemeColor('--theme-primary-accent', accentColor);
    const borderColor = this.getThemeColor('--theme-border-color', '#e0e0e0');

    let html = markdown;

    // Headers
    html = html.replace(/^### (.*$)/gim, `<h3 style="color: ${accentColor}; font-weight: 600; font-size: 1.25em; margin-top: 1em; margin-bottom: 0.5em;">$1</h3>`);
    html = html.replace(/^## (.*$)/gim, `<h2 style="color: ${accentColor}; font-weight: 600; font-size: 1.5em; margin-top: 1em; margin-bottom: 0.5em; border-bottom: 1px solid ${borderColor}; padding-bottom: 0.3em;">$1</h2>`);
    html = html.replace(/^# (.*$)/gim, `<h1 style="color: ${accentColor}; font-weight: 600; font-size: 2em; margin-top: 1em; margin-bottom: 0.5em; border-bottom: 2px solid ${borderColor}; padding-bottom: 0.3em;">$1</h1>`);

    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, `<strong style="color: ${accentColor}; font-weight: 700;">$1</strong>`);

    // Italic
    html = html.replace(/\*(.+?)\*/g, `<em style="font-style: italic; color: ${primaryText};">$1</em>`);

    // Code blocks (must be before inline code)
    html = html.replace(/```([^`]+)```/g, `<pre style="background-color: ${secondaryBg}; padding: 1em; border-radius: 0.25rem; overflow-x: auto; margin: 1em 0;"><code style="color: ${primaryText}; font-family: 'Courier New', Courier, monospace;">$1</code></pre>`);

    // Inline code
    html = html.replace(/`([^`]+)`/g, `<code style="background-color: ${secondaryBg}; padding: 0.2em 0.4em; border-radius: 3px; font-family: 'Courier New', Courier, monospace; font-size: 0.9em; color: ${codeColor};">$1</code>`);

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, `<a href="$2" target="_blank" style="color: ${linkColor}; text-decoration: none;">$1</a>`);

    // Line breaks
    html = html.replace(/\n/g, '<br>');

    // Lists
    html = html.replace(/^\- (.+$)/gim, `<li style="margin-bottom: 0.5em;">$1</li>`);
    html = html.replace(/(<li.*<\/li>)/s, `<ul style="margin-left: 2em; margin-bottom: 1em;">$1</ul>`);

    return html;
  }
}
