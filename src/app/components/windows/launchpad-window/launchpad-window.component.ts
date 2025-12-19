import { Component, input, signal, output, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PixelIconComponent } from '../../shared/pixel-icon/pixel-icon.component';
import { WindowTypes } from '../../../enums/window-types.enum';
import { environment } from '../../../../environments/environment.local';

interface AppIcon {
  type: WindowTypes;
  icon: string;
  label: string;
  color?: string;
}

@Component({
  selector: 'app-launchpad-window',
  imports: [CommonModule, PixelIconComponent],
  templateUrl: 'launchpad-window.component.html',
  styleUrls: ['launchpad-window.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LaunchpadWindowComponent {
  // Inputs/Outputs
  title = input<string>('Launch Pad');
  closeEvent = output<WindowTypes | void>();

  // State
  isOpen = signal<boolean>(false);

  apps: AppIcon[] = [
    {
      type: WindowTypes.GALLERY,
      icon: 'photo',
      label: 'Gallery',
      color: '#FF6B6B'
    },
    {
      type: WindowTypes.NOTEPAD,
      icon: 'description',
      label: 'Notepad',
      color: '#4ECDC4'
    },
    {
      type: WindowTypes.TETRIS,
      icon: 'videogame_asset',
      label: 'Tetris',
      color: '#95E1D3'
    },
    {
      type: WindowTypes.ABOUT,
      icon: 'info',
      label: 'About',
      color: '#FFD93D'
    },
    {
      type: WindowTypes.BREAKOUT,
      icon: 'sports_esports',
      label: 'Breakout',
      color: '#6A4C93'
    },
    {
      type: WindowTypes.ROADMAP,
      icon: 'map',
      label: 'Roadmap',
      color: '#FF8C00'
    },
    {
      type: WindowTypes.MONO,
      icon: 'grid', // DO AN SVG FOR MONO LATER
      label: 'Mono',
      color: '#000000'
    },

    // Conditionally add Style Guide in development mode
    ...(environment.production ? [] : [{
      type: WindowTypes.STYLE_GUIDE,
      icon: 'colors-swatch',
      label: 'Styles',
      color: '#FFB6C1'
    }])
  ];

  // Handle Escape key to close drawer
  @HostListener('document:keydown.escape')
  onEscapeKey() {
    if (this.isOpen()) {
      this.close();
    }
  }

  onAppClick(appType: WindowTypes) {
    // Emit the app type through the close event emitter
    this.closeEvent.emit(appType);
  }

  close() {
    this.closeEvent.emit();
  }
}
