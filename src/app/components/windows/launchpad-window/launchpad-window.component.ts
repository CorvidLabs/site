import { Component } from '@angular/core';
import { FloatWindow } from '../float-window/float-window.component';
import { DraggableDirective } from '../../../directives/draggable.directive';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { WindowTypes } from '../../../enums/window-types.enum';

interface AppIcon {
  type: WindowTypes;
  icon: string;
  label: string;
  color?: string;
}

@Component({
  selector: 'app-launchpad-window',
  imports: [CommonModule, DraggableDirective, MatIconModule, MatButtonModule],
  templateUrl: 'launchpad-window.component.html',
  styleUrls: ['launchpad-window.component.scss']
})
export class LaunchpadWindowComponent extends FloatWindow {
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
    }
  ];

  onAppClick(appType: WindowTypes) {
    // Emit the app type through the close event emitter
    this.closeEvent.emit(appType as any);
  }

  constructor() {
    super();
    this.title = 'Launch Pad';
    this.width.set(500);
    this.height.set(400);
  }
}
