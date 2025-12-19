import { Directive, ElementRef, input, OnChanges, OnDestroy, OnInit, output, SimpleChanges } from '@angular/core';

export interface ResizeEvent {
  width: number;
  height: number;
  // Absolute position for west/north resizing (optional for backwards compat)
  // These are the new translate values, not deltas to add
  deltaX?: number;  // New absolute X position (for west resize)
  deltaY?: number;  // New absolute Y position (for north resize)
}

@Directive({
  selector: '[appResizable]',
  standalone: true
})
export class ResizableDirective implements OnInit, OnDestroy {
  windowResize = output<ResizeEvent>();

  minimalWidth = input<number>(300);
  minimalHeight = input<number>(200);

  private resizing = false;
  private startX = 0;
  private startY = 0;
  private startWidth = 0;
  private startHeight = 0;
  private startPositionX = 0;  // Starting position when resize begins
  private startPositionY = 0;  // Starting position when resize begins
  private minWidth = this.minimalWidth;
  private minHeight = this.minimalHeight;
  private currentHandle: string | null = null;

  private mouseMoveListener: ((e: MouseEvent) => void) | null = null;
  private mouseUpListener: ((e: MouseEvent) => void) | null = null;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    this.createResizeHandles();
  }

  /**
   * Calculate dynamic offset for resize handles based on border width and pixel shadow
   * @returns offset in pixels to position handles outside the visual border
   */
  private calculateHandleOffset(): number {
    // Get border width from element's computed styles
    const computedStyle = window.getComputedStyle(this.el.nativeElement);
    const borderWidth = parseInt(computedStyle.borderWidth) || 4;

    // Get pixel size from CSS variable
    const pixelSize = parseInt(
      computedStyle.getPropertyValue('--nes-pixel-size').trim()
    ) || 3;

    // Total offset = border + pixel shadow + small buffer (1px)
    return borderWidth + pixelSize + 1.5;
  }

  ngOnDestroy(): void {
    this.removeEventListeners();
    this.removeResizeHandles();
  }

  private createResizeHandles(): void {
    const element = this.el.nativeElement;

    // TODO: Inconsistent approach - handles should be created as child elements but need higher z-index than content
    // Consider using a wrapper div or CSS-only approach with ::after/::before pseudo-elements

    // Create handles for all 8 resize positions
    const handles = [
      { class: 'resize-handle-n', cursor: 'ns-resize', position: 'n' },
      { class: 'resize-handle-s', cursor: 'ns-resize', position: 's' },
      { class: 'resize-handle-e', cursor: 'ew-resize', position: 'e' },
      { class: 'resize-handle-w', cursor: 'ew-resize', position: 'w' },
      { class: 'resize-handle-ne', cursor: 'nesw-resize', position: 'ne' },
      { class: 'resize-handle-nw', cursor: 'nwse-resize', position: 'nw' },
      { class: 'resize-handle-se', cursor: 'nwse-resize', position: 'se' },
      { class: 'resize-handle-sw', cursor: 'nesw-resize', position: 'sw' }
    ];

    handles.forEach(({ class: className, cursor, position }) => {
      const handle = document.createElement('div');
      handle.className = className;
      handle.style.cursor = cursor;
      handle.style.position = 'absolute';
      handle.dataset['resizePosition'] = position;

      // Style the handles
      this.styleHandle(handle, position);

      handle.addEventListener('mousedown', (e) => this.onMouseDown(e, position));
      element.appendChild(handle);
    });
  }

  private styleHandle(handle: HTMLElement, position: string): void {
    const handleSize = 3; // Base handle size in pixels
    const cornerSize = 20; // Base corner size in pixels
    const offset = this.calculateHandleOffset(); // Dynamic offset based on border + shadow

    // Common styles - CRITICAL: position must be absolute!
    handle.style.position = 'absolute';
    handle.style.zIndex = '99999'; // Very high z-index to be above EVERYTHING
    handle.style.pointerEvents = 'auto'; // Ensure handles can receive mouse events
    handle.style.background = 'transparent';
    handle.style.border = 'none';

    switch (position) {
      case 'n':
        handle.style.top = `-${offset}px`;
        handle.style.left = `${cornerSize + offset}px`;
        handle.style.right = `${cornerSize + offset}px`;
        handle.style.height = `${handleSize + offset}px`;
        break;
      case 's':
        handle.style.bottom = `-${offset}px`;
        handle.style.left = `${cornerSize + offset}px`;
        handle.style.right = `${cornerSize + offset}px`;
        handle.style.height = `${handleSize + offset}px`;
        break;
      case 'e':
        handle.style.right = `-${offset}px`;
        handle.style.top = `${cornerSize + offset}px`;
        handle.style.bottom = `${cornerSize + offset}px`;
        handle.style.width = `${handleSize + offset}px`;
        break;
      case 'w':
        handle.style.left = `-${offset}px`;
        handle.style.top = `${cornerSize + offset}px`;
        handle.style.bottom = `${cornerSize + offset}px`;
        handle.style.width = `${handleSize + offset}px`;
        break;
      case 'ne':
        handle.style.top = `-${offset}px`;
        handle.style.right = `-${offset}px`;
        handle.style.width = `${cornerSize + offset}px`;
        handle.style.height = `${cornerSize + offset}px`;
        break;
      case 'nw':
        handle.style.top = `-${offset}px`;
        handle.style.left = `-${offset}px`;
        handle.style.width = `${cornerSize + offset}px`;
        handle.style.height = `${cornerSize + offset}px`;
        break;
      case 'se':
        handle.style.bottom = `-${offset}px`;
        handle.style.right = `-${offset}px`;
        handle.style.width = `${cornerSize + offset}px`;
        handle.style.height = `${cornerSize + offset}px`;
        break;
      case 'sw':
        handle.style.bottom = `-${offset}px`;
        handle.style.left = `-${offset}px`;
        handle.style.width = `${cornerSize + offset}px`;
        handle.style.height = `${cornerSize + offset}px`;
        break;
    }
  }

  private onMouseDown(event: MouseEvent, position: string): void {
    console.log(`Resize mousedown on position: ${position}`); // Debug
    event.preventDefault();
    event.stopPropagation();

    this.resizing = true;
    this.currentHandle = position;
    this.startX = event.clientX;
    this.startY = event.clientY;

    const element = this.el.nativeElement;
    this.startWidth = element.offsetWidth;
    this.startHeight = element.offsetHeight;

    // Store starting position by parsing transform
    const transform = element.style.transform;
    const translateMatch = transform.match(/translate\(([^,]+)px, ([^,]+)px\)/);
    if (translateMatch) {
      this.startPositionX = parseInt(translateMatch[1], 10);
      this.startPositionY = parseInt(translateMatch[2], 10);
    } else {
      this.startPositionX = 0;
      this.startPositionY = 0;
    }

    this.mouseMoveListener = (e: MouseEvent) => this.onMouseMove(e);
    this.mouseUpListener = (e: MouseEvent) => this.onMouseUp(e);

    document.addEventListener('mousemove', this.mouseMoveListener);
    document.addEventListener('mouseup', this.mouseUpListener);
  }

  private onMouseMove(event: MouseEvent): void {
    if (!this.resizing || !this.currentHandle) return;

    const deltaX = event.clientX - this.startX;
    const deltaY = event.clientY - this.startY;

    let newWidth = this.startWidth;
    let newHeight = this.startHeight;
    let newPositionX: number | undefined;
    let newPositionY: number | undefined;

    const position = this.currentHandle;

    // Calculate new dimensions based on handle position
    if (position.includes('e')) {
      newWidth = Math.max(this.minWidth(), this.startWidth + deltaX);
    }
    if (position.includes('w')) {
      // Calculate new width
      const calculatedWidth = this.startWidth - deltaX;
      newWidth = Math.max(this.minWidth(), calculatedWidth);

      // Calculate new ABSOLUTE position (startPosition + delta)
      // When dragging left (deltaX negative), position moves left (decreases)
      if (calculatedWidth >= this.minWidth()) {
        newPositionX = this.startPositionX + deltaX;
      } else {
        // Hit minimum width - position moves by how much width actually changed
        newPositionX = this.startPositionX - (newWidth - this.startWidth);
      }
    }
    if (position.includes('s')) {
      newHeight = Math.max(this.minHeight(), this.startHeight + deltaY);
    }
    if (position.includes('n')) {
      // Calculate new height
      const calculatedHeight = this.startHeight - deltaY;
      newHeight = Math.max(this.minHeight(), calculatedHeight);

      // Calculate new ABSOLUTE position (startPosition + delta)
      // When dragging up (deltaY negative), position moves up (decreases)
      if (calculatedHeight >= this.minHeight()) {
        newPositionY = this.startPositionY + deltaY;
      } else {
        // Hit minimum height - position moves by how much height actually changed
        newPositionY = this.startPositionY - (newHeight - this.startHeight);
      }
    }

    // Emit resize event with absolute positions
    this.windowResize.emit({
      width: newWidth,
      height: newHeight,
      deltaX: newPositionX,
      deltaY: newPositionY
    });
  }

  private onMouseUp(event: MouseEvent): void {
    this.resizing = false;
    this.currentHandle = null;
    this.removeEventListeners();
  }

  private removeEventListeners(): void {
    if (this.mouseMoveListener) {
      document.removeEventListener('mousemove', this.mouseMoveListener);
      this.mouseMoveListener = null;
    }
    if (this.mouseUpListener) {
      document.removeEventListener('mouseup', this.mouseUpListener);
      this.mouseUpListener = null;
    }
  }

  private removeResizeHandles(): void {
    const element = this.el.nativeElement;
    const handles = element.querySelectorAll('[class^="resize-handle-"]');
    handles.forEach(handle => handle.remove());
  }
}
