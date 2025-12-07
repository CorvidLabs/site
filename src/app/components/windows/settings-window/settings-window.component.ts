import { Component, OnInit } from '@angular/core';
import { FloatWindow } from '../float-window/float-window.component';
import { DraggableDirective } from '../../../directives/draggable.directive';
import { CommonModule } from '@angular/common';
import { ThemeSwitcherComponent } from "../../theme-switcher/theme-switcher.component";

@Component({
  selector: 'app-settings-window',
  imports: [CommonModule, DraggableDirective, ThemeSwitcherComponent],
  templateUrl: 'settings-window.component.html',
  styleUrls: ['settings-window.component.scss']
})
export class SettingsWindowComponent extends FloatWindow implements OnInit {
  constructor() {
    super();

    this.title = 'Settings';
    this.width.set(600);
    this.height.set(400);
  }

  ngOnInit() { }
}