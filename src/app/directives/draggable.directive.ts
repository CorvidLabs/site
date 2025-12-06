import { Directive, ElementRef, inject, Input, OnInit, OnDestroy } from '@angular/core';
import { ZIndexManagerService } from '../services/general/z-index-manager.service';

@Directive({
  selector: '[appDraggable]',
  standalone: true,
  host: {
    '(mousedown)': 'onMouseDown($event)'
  }
})
export class DraggableDirective implements OnInit, OnDestroy {
  @Input('appDraggableInitialPosition') initialPosition?: { x: number; y: number };

  private isDragging = false;
  private startX = 0;
  private startY = 0;
  private initialX = 0;
  private initialY = 0;

  // Viewport containing the draggable element
  private viewport: HTMLElement;

  // The element that will be dragged
  private draggableElement: HTMLElement;

  // Event listeners for cleanup
  private mouseMoveListener: ((e: MouseEvent) => void) | null = null;
  private mouseUpListener: (() => void) | null = null;

  constructor(
    private zIndexManager: ZIndexManagerService,
    private el: ElementRef
  ) {
    this.draggableElement = this.el.nativeElement;
    this.viewport = document.querySelector('.main-view-content') as HTMLElement;
  }

  ngOnInit() {
    // Use 'absolute' to remove the element from the normal document flow.
    // This prevents other elements from shifting when one is closed.
    this.draggableElement.style.position = 'absolute';
    
    // Set a default transform if none exists
    if (!this.draggableElement.style.transform) {
      const x = this.initialPosition?.x ?? 0;
      const y = this.initialPosition?.y ?? 0;
      this.draggableElement.style.transform = `translate(${x}px, ${y}px)`;
      this.initialX = x;
      this.initialY = y;
    }

    this.increaseZIndex()
  }

  onMouseDown(event: MouseEvent) {
    // Check if the mousedown event is on a resize handle - if so, don't drag
    const target = event.target as HTMLElement;
    if (target.className && typeof target.className === 'string' && target.className.includes('resize-handle')) {
      return; // Don't drag if clicking on a resize handle
    }

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

    // Set up document-level event listeners
    this.mouseMoveListener = (e: MouseEvent) => this.onMouseMove(e);
    this.mouseUpListener = () => this.onMouseUp();

    document.addEventListener('mousemove', this.mouseMoveListener);
    document.addEventListener('mouseup', this.mouseUpListener);

    // this.draggableElement.style.cursor = 'grabbing';
    event.preventDefault();
  }

  onMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;

    const dx = event.clientX - this.startX;
    const dy = event.clientY - this.startY;
    this.draggableElement.style.transform = `translate(${this.initialX + dx}px, ${this.initialY + dy}px)`;
  }

  // Called when mouse is released anywhere in the document
  onMouseUp() {
    if (this.isDragging) {
      this.constrainToViewport();
    }

    this.isDragging = false;
    // this.draggableElement.style.cursor = 'grab';

    // Clean up event listeners
    this.removeEventListeners();
  }

  /**
   * Ensures the draggable element stays within viewport bounds.
   * Keeps the drag handle (header) fully visible and accessible.
   */
  private constrainToViewport() {
    const rect = this.draggableElement.getBoundingClientRect();
    const dragHandle = this.draggableElement.querySelector('.drag-handle') as HTMLElement;

    // Get the drag handle height, or use a default if not found
    const handleHeight = dragHandle?.offsetHeight ?? 40;

    // Get current position of the element relative to the viewport
    let x = rect.x;
    let y = rect.y;

    const viewportWidth = this.viewport.clientWidth;
    const viewportHeight = this.viewport.clientHeight;
    const elementWidth = rect.width;

    // Constrain horizontally - keep at least some of the window visible
    const minVisibleWidth = Math.min(elementWidth * 0.3, 100); // 30% or 100px, whichever is smaller
    if (x + elementWidth < minVisibleWidth) {
      x = minVisibleWidth - elementWidth;
    } else if (x > viewportWidth - minVisibleWidth) {
      x = viewportWidth - minVisibleWidth;
    }

    // Constrain vertically
    // Top: drag handle must stay below the top edge (by some reason, the y=0 point is slightly offset downwards)
    if (y < -10) {
      y = -10;
    }

    // Bottom: drag handle must stay above the dock
    const maxY = viewportHeight - handleHeight;
    if (y > maxY) {
      y = maxY;
    }

    // Apply the constrained position only if it changed
    // Calculate the transform vector (delta from initial position)
    const originalX = rect.x;
    const originalY = rect.y;

    if (x !== originalX || y !== originalY) {
      // Convert absolute position to transform vector
      const deltaX = x - (originalX - this.initialX);
      const deltaY = y - (originalY - this.initialY);
      this.draggableElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    }
  }

  increaseZIndex() {
    this.draggableElement.style.zIndex = this.zIndexManager.getNextZIndex().toString();
  }

  ngOnDestroy() {
    this.removeEventListeners();
  }

  private removeEventListeners() {
    if (this.mouseMoveListener) {
      document.removeEventListener('mousemove', this.mouseMoveListener);
      this.mouseMoveListener = null;
    }
    if (this.mouseUpListener) {
      document.removeEventListener('mouseup', this.mouseUpListener);
      this.mouseUpListener = null;
    }
  }
}