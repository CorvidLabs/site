import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-boot-overlay',
  imports: [CommonModule],
  templateUrl: './boot-overlay.component.html',
  styleUrls: ['./boot-overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BootOverlayComponent implements OnInit {
  // Visibility state
  isOpen = signal<boolean>(false);

  // Progress state (0-100)
  progress = signal<number>(0);

  // Configurable boot duration in milliseconds
  bootDuration = input<number>(1500);

  // Lifecycle event
  closeEvent = output<void>();

  ngOnInit(): void {
    // Start boot sequence automatically
    this.startBootSequence();
  }

  private startBootSequence(): void {
    const duration = this.bootDuration();
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const rawProgress = Math.min(elapsed / duration, 1); // 0 to 1

      // Apply ease-out cubic easing for polished animation
      const easedProgress = this.easeOutCubic(rawProgress);

      // Convert to percentage (0-100)
      this.progress.set(Math.round(easedProgress * 100));

      if (rawProgress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Boot complete
        this.completeBootSequence();
      }
    };

    requestAnimationFrame(animate);
  }

  private easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
  }

  private completeBootSequence(): void {
    // Wait a moment at 100% before closing
    setTimeout(() => {
      this.close();
    }, 300);
  }

  private close(): void {
    this.closeEvent.emit();
  }
}
