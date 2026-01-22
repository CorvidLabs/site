import { DOCUMENT } from '@angular/common';
import { Injectable, RendererFactory2, computed, inject, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SoundEffectService {
  // Public state - volume level (0 to 1)
  volume = signal<number>(0.3); // Default 30%

  // Computed for backward compatibility - sound is enabled when volume > 0
  clickSoundEnabled = computed(() => this.volume() > 0);

  // Private state
  private soundFiles = [
    '/sfx/Mouse_Hit.mp3',
    '/sfx/Click_Interaction.mp3'
  ];
  private audioPool: HTMLAudioElement[] = [];
  private currentPoolIndex = 0;
  private readonly POOL_SIZE = 3;
  private readonly DEFAULT_VOLUME = 0.3; // Default 30% volume

  // Dependencies
  private renderer = inject(RendererFactory2).createRenderer(null, null);
  private document = inject(DOCUMENT);

  // Event listener reference for cleanup
  private clickListener: ((e: MouseEvent) => void) | null = null;

  constructor() {
    this.loadSettingsFromStorage();
    this.initializeAudioPool();
    this.setupGlobalClickListener();
  }

  /**
   * Toggle click sound on/off (toggles between 0 and default volume)
   */
  toggleClickSound(): void {
    if (this.volume() > 0) {
      this.setVolume(0);
    } else {
      this.setVolume(this.DEFAULT_VOLUME);
    }
  }

  /**
   * Set click sound enabled state (for backward compatibility)
   * @deprecated Use setVolume instead
   */
  setClickSoundEnabled(enabled: boolean): void {
    this.setVolume(enabled ? this.DEFAULT_VOLUME : 0);
  }

  /**
   * Set the volume for all audio elements
   * @param volume The volume level (0 to 1)
   */
  setVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.volume.set(clampedVolume);
    localStorage.setItem('sound-volume', clampedVolume.toString());

    // Update all audio elements in pool
    this.audioPool.forEach(audio => {
      audio.volume = clampedVolume;
    });
  }

  /**
   * Initialize the audio pool with HTMLAudioElement instances
   * @private
   */
  private initializeAudioPool(): void {
    for (let i = 0; i < this.POOL_SIZE; i++) {
      const audio = new Audio();
      audio.volume = this.volume();

      audio.onerror = () => {
        console.warn(`Failed to load click sound effect`);
      };

      this.audioPool.push(audio);
    }
  }

  /**
   * Load volume setting from localStorage
   * @private
   */
  private loadSettingsFromStorage(): void {
    // Try to load new volume setting first
    const savedVolume = localStorage.getItem('sound-volume');
    if (savedVolume !== null) {
      const parsed = parseFloat(savedVolume);
      if (!isNaN(parsed)) {
        this.volume.set(Math.max(0, Math.min(1, parsed)));
        return;
      }
    }

    // Backward compatibility: migrate from old click-sound-enabled setting
    const savedEnabled = localStorage.getItem('click-sound-enabled');
    if (savedEnabled !== null) {
      this.volume.set(savedEnabled === 'true' ? this.DEFAULT_VOLUME : 0);
      // Migrate to new format
      localStorage.setItem('sound-volume', this.volume().toString());
      localStorage.removeItem('click-sound-enabled');
    }
    // Default volume is already set in signal initialization (0.3)
  }

  /**
   * Set up global click listener on the document
   * @private
   */
  private setupGlobalClickListener(): void {
    this.clickListener = (event: MouseEvent) => {
      if (this.shouldPlaySound(event)) {
        this.playClickSound();
      }
    };

    this.renderer.listen(this.document, 'click', this.clickListener);
  }

  /**
   * Determine if a click sound should be played
   * @private
   */
  private shouldPlaySound(event: MouseEvent): boolean {
    if (!this.clickSoundEnabled()) {
      return false;
    }

    // Don't play sound if clicking on drag handles to prevent spam during dragging or resizing
    const target = event.target as HTMLElement;

    if (
      target.closest('.drag-handle') || target.closest('.resize-handle-n') || target.closest('.resize-handle-s') || 
      target.closest('.resize-handle-e') || target.closest('.resize-handle-w') || target.closest('.resize-handle-ne') || 
      target.closest('.resize-handle-nw') || target.closest('.resize-handle-se') || target.closest('.resize-handle-sw')
    ) {
      return false;
    }

    return true;
  }

  /**
   * Play a click sound with random pitch variation and random sound file
   * @private
   */
  private playClickSound(): void {
    const audio = this.audioPool[this.currentPoolIndex];

    // Set random sound file
    audio.src = this.getRandomSoundFile();

    // Set random pitch variation (±15%)
    audio.playbackRate = this.getRandomPitch();

    // Play from start (will auto-restart if already playing)
    audio.currentTime = 0;
    audio.play().catch(err => {
      // Silently fail if browser prevents autoplay (shouldn't happen with user clicks)
      console.debug('Audio play prevented:', err);
    });

    // Rotate to next audio instance in pool
    this.currentPoolIndex = (this.currentPoolIndex + 1) % this.POOL_SIZE;
  }

  /**
   * Get a random pitch value between 0.85 and 1.15 (±15% variation)
   * @private
   */
  private getRandomPitch(): number {
    return 0.85 + (Math.random() * 0.3);
  }

  /**
   * Get a random sound file from the available sound files
   * @private
   */
  private getRandomSoundFile(): string {
    const randomIndex = Math.floor(Math.random() * this.soundFiles.length);
    return this.soundFiles[randomIndex];
  }
}
