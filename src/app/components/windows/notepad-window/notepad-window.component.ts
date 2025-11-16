import { Component, OnInit, signal, computed } from '@angular/core';
import { FloatWindow } from '../float-window/float-window.component';
import { DraggableDirective } from '../../../directives/draggable.directive';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-notepad-window',
  imports: [CommonModule, DraggableDirective, FormsModule, MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: 'notepad-window.component.html',
  styleUrls: ['notepad-window.component.scss']
})
export class NotepadWindowComponent extends FloatWindow implements OnInit {
  noteContent = signal<string>('# Welcome to Markdown Notepad\n\nStart typing your markdown here...\n\n## Features\n- **Bold** text with `**text**`\n- *Italic* text with `*text*`\n- Lists and more!');
  isPreviewMode = signal<boolean>(false);

  // Computed property for rendered markdown
  renderedMarkdown = computed(() => {
    return this.sanitizer.bypassSecurityTrustHtml(this.parseMarkdown(this.noteContent()));
  });

  constructor(private sanitizer: DomSanitizer) {
    super();

    this.title = 'Markdown Notepad';
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

  // Simple markdown parser
  private parseMarkdown(markdown: string): string {
    let html = markdown;

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Code blocks
    html = html.replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

    // Line breaks
    html = html.replace(/\n/g, '<br>');

    // Lists
    html = html.replace(/^\- (.+$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    return html;
  }
}
