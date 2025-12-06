import { CommonModule } from '@angular/common';
import { Component, ViewChild, signal, effect, input, output } from '@angular/core';
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

  // Use signals for reactive width and height
  width = signal<number>(400);
  height = signal<number>(300);

  // Modern input/output functions (Angular 20 best practice)
  title = input<string>('Floating Window');
  initialPosition = input<{ x: number; y: number } | undefined>(undefined);
  initialWidth = input<number | undefined>(undefined);
  initialHeight = input<number | undefined>(undefined);

  closeEvent = output<void>();

  isDragging = false; // Track dragging state for cursor style

  constructor() {
    // Set dimensions if provided via inputs
    effect(() => {
      const width = this.initialWidth();
      if (width !== undefined) {
        this.width.set(width);
      }
    });

    effect(() => {
      const height = this.initialHeight();
      if (height !== undefined) {
        this.height.set(height);
      }
    });
  }

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
