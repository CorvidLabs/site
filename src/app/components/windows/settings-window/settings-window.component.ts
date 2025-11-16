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

    this.title = 'Gallery';
    this.width = 600;
    this.height = 400;
  }

  ngOnInit() { }
}