import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DraggableDirective } from '../../directives/draggable.directive';


@Component({
  selector: 'app-float-window',
  imports: [CommonModule, DraggableDirective],
  templateUrl: './float-window.component.html',
  styleUrls: ['./float-window.component.scss']
})
export class FloatWindow {

  @Input() width: number = 400;
  @Input() height: number = 300;
  @Input() title: string = 'Floating Window';
  @Input() initialPosition?: { x: number; y: number };

  isDragging = false; // Track dragging state for cursor style

  @Output() closeEvent = new EventEmitter<void>();

  constructor() {}

  close() {
    // Logic to close the window, e.g., emit an event to the parent component
    this.closeEvent.emit();
  }
}
