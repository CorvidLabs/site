import { CommonModule } from '@angular/common';
import { Component, OnInit, input } from '@angular/core';
import { DraggableDirective } from '../../../directives/draggable.directive';
import { FloatWindow } from '../float-window/float-window.component';
import { SoundcloudPlayerComponent } from "../../soundcloud-player/soundcloud-player.component";

@Component({
  selector: 'app-player-window',
  templateUrl: './player-window.component.html',
  imports: [CommonModule, DraggableDirective, SoundcloudPlayerComponent],
  styleUrls: ['./player-window.component.scss']
})
export class PlayerWindowComponent extends FloatWindow implements OnInit {
  override title = input<string>('ASMR Radio');

  constructor() {
    super();

    this.width.set(600);
    this.height.set(400);


    // if (window.innerWidth >= 1920) { // Assuming 1920px is a common "bigger" screen width
    //   this.width.set(1000);
    //   this.height.set(700);
    // }
  }

  ngOnInit() { }
}