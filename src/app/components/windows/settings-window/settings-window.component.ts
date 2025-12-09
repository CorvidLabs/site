import { Component, OnInit, input } from '@angular/core';
import { FloatWindow } from '../float-window/float-window.component';
import { DraggableDirective } from '../../../directives/draggable.directive';
import { CommonModule } from '@angular/common';
import { ThemeSwitcherComponent } from "../../theme-switcher/theme-switcher.component";
import { PixelIconComponent } from '../../shared/pixel-icon/pixel-icon.component';
import { WindowTypes } from '../../../enums/window-types.enum';

@Component({
  selector: 'app-settings-window',
  imports: [CommonModule, DraggableDirective, ThemeSwitcherComponent, PixelIconComponent],
  templateUrl: 'settings-window.component.html',
  styleUrls: ['settings-window.component.scss']
})
export class SettingsWindowComponent extends FloatWindow implements OnInit {
  override title = input<string>('Settings');

  constructor() {
    super();

    this.width.set(600);
    this.height.set(400);
  }

  ngOnInit() { }

  onChangeUser() {
    // Emit the LOGIN window type through the close event emitter
    this.closeEvent.emit(WindowTypes.LOGIN as any);
  }
}