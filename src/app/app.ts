import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ComponentRef, ViewChild, ViewContainerRef, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BootOverlayComponent } from './components/overlays/boot-overlay/boot-overlay.component';
import { ThemeService } from './services/general/theme.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    CommonModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements AfterViewInit {
  @ViewChild('bootOverlayHost', { read: ViewContainerRef, static: false })
  bootOverlayHost!: ViewContainerRef;

  bootOverlayRef: ComponentRef<BootOverlayComponent> | null = null;

  private themeService = inject(ThemeService);
  protected readonly title = signal('corvid-site');

  // Expose theme service for template use if needed
  protected get currentTheme() {
    return this.themeService.theme();
  }

  ngAfterViewInit(): void {
    // Check if boot already completed this session
    const bootCompleted = sessionStorage.getItem('corvid-boot-completed');

    if (!bootCompleted) {
      // Show boot overlay immediately (no delay)
      this.showBootOverlay();
    }
  }

  showBootOverlay() {
    // Prevent duplicates
    if (this.bootOverlayRef) {
      return;
    }

    // Create the overlay component
    this.bootOverlayRef = this.bootOverlayHost.createComponent(BootOverlayComponent);

    // Subscribe to close event
    this.bootOverlayRef.instance.closeEvent.subscribe(() => {
      this.closeBootOverlay();
    });

    // Trigger open animation
    setTimeout(() => {
      if (this.bootOverlayRef) {
        this.bootOverlayRef.instance.isOpen.set(true);
      }
    }, 10);
  }

  closeBootOverlay() {
    if (this.bootOverlayRef) {
      // Trigger fade-out animation
      this.bootOverlayRef.instance.isOpen.set(false);

      // Destroy after animation completes (300ms)
      setTimeout(() => {
        if (this.bootOverlayRef) {
          this.bootOverlayRef.destroy();
          this.bootOverlayRef = null;

          // Mark boot as completed in session
          sessionStorage.setItem('corvid-boot-completed', 'true');
        }
      }, 300);
    }
  }
}
