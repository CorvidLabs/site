import { Directive, ElementRef, HostListener, OnInit, inject } from '@angular/core';
import { ZIndexManagerService } from '../services/z-index-manager.service';

@Directive({
  selector: '[appDraggable]',
  standalone: true,
})
export class DraggableDirective implements OnInit {
  private isDragging = false;
  private startX = 0;
  private startY = 0;
  private initialX = 0;
  private initialY = 0;

  // The element that will be dragged
  private draggableElement: HTMLElement;

  private zIndexManager = inject(ZIndexManagerService);

  constructor(private el: ElementRef) {
    this.draggableElement = this.el.nativeElement;
  }

  ngOnInit() {
    // Use 'absolute' to remove the element from the normal document flow.
    // This prevents other elements from shifting when one is closed.
    this.draggableElement.style.position = 'absolute';
    // Set a default transform if none exists
    if (!this.draggableElement.style.transform) {
      this.draggableElement.style.transform = 'translate(0px, 0px)';
    }
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    // Check if the mousedown event is on the drag handle (the header)
    const handle = this.draggableElement.querySelector('.drag-handle');
    if (handle && !handle.contains(event.target as Node)) {
      return; // Don't drag if the click is not on the handle
    }

    // Bring the window to the front by setting a new z-index.
    this.draggableElement.style.zIndex = this.zIndexManager.getNextZIndex().toString();

    this.isDragging = true;
    this.startX = event.clientX;
    this.startY = event.clientY;

    const transform = this.draggableElement.style.transform;
    const translateMatch = transform.match(/translate\(([^,]+)px, ([^,]+)px\)/);
    if (translateMatch) {
      this.initialX = parseInt(translateMatch[1], 10);
      this.initialY = parseInt(translateMatch[2], 10);
    }

    // this.draggableElement.style.cursor = 'grabbing';
    event.preventDefault();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;

    const dx = event.clientX - this.startX;
    const dy = event.clientY - this.startY;
    this.draggableElement.style.transform = `translate(${this.initialX + dx}px, ${this.initialY + dy}px)`;
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    this.isDragging = false;
    // this.draggableElement.style.cursor = 'grab';
  }
}