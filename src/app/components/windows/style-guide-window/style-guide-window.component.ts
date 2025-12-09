import { CommonModule } from '@angular/common';
import { Component, input, signal } from '@angular/core';
import { DraggableDirective } from '../../../directives/draggable.directive';
import { CvdCheckboxComponent } from "../../shared/corvid-checkbox/corvid-checkbox.component";
import { PixelIconComponent } from '../../shared/pixel-icon/pixel-icon.component';
import { FloatWindow } from '../float-window/float-window.component';

@Component({
  selector: 'app-style-guide-window',
  imports: [CommonModule, DraggableDirective, PixelIconComponent, CvdCheckboxComponent],
  templateUrl: 'style-guide-window.component.html',
  styleUrls: ['style-guide-window.component.scss']
})
export class StyleGuideWindowComponent extends FloatWindow {
  override title = input<string>('Style Guide');

  myValue = signal<boolean>(false);

  // Sample icons to showcase
  sampleIcons = [
    'home', 'settings', 'search', 'close', 'check', 'add', 'delete', 'edit',
    'photo', 'description', 'videogame_asset', 'apps', 'logout', 'login',
    'palette', 'music_note', 'favorite', 'star', 'folder'
  ];

  constructor() {
    super();
    this.width.set(700);
    this.height.set(600);
  }
}
