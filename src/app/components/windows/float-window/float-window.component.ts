import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild, signal, effect } from '@angular/core';
import { DraggableDirective } from '../../../directives/draggable.directive';
import { ResizableDirective, ResizeEvent } from '../../../directives/resizable.directive';


@Component({
  selector: 'app-float-window',
  imports: [CommonModule, DraggableDirective, ResizableDirective],
  templateUrl: './float-window.component.html',
  styleUrls: ['./float-window.component.scss']
})
export class FloatWindow {

  @ViewChild(DraggableDirective) draggableDirective!: DraggableDirective;

  // TODO: Inconsistent API - mixing @Input decorators with signal-based state
  // Consider migrating to input() function for all inputs for consistency with Angular modern practices

  // Use signals for reactive width and height
  width = signal<number>(400);
  height = signal<number>(300);

  @Input() title: string = 'Floating Window';
  @Input() initialPosition?: { x: number; y: number };

  // Input setters to allow parent components to set initial dimensions
  // TODO: These setters aren't used - child components set width/height directly via .set() in constructor
  @Input() set initialWidth(value: number) {
    this.width.set(value);
  }

  @Input() set initialHeight(value: number) {
    this.height.set(value);
  }

  isDragging = false; // Track dragging state for cursor style

  @Output() closeEvent = new EventEmitter<void>();

  constructor() {}

  bringWindowToFront() {
    this.draggableDirective?.increaseZIndex();
  }

  close() {
    // Logic to close the window, e.g., emit an event to the parent component
    this.closeEvent.emit();
  }

  onResize(event: any) {
    // Type assertion since Angular's event binding may not correctly infer the custom event type
    const resizeEvent = event as ResizeEvent;
    this.width.set(resizeEvent.width);
    this.height.set(resizeEvent.height);
  }
}
