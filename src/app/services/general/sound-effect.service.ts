import { DOCUMENT } from '@angular/common';
import { Injectable, RendererFactory2, inject, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SoundEffectService {
  // Public state - signal for reactive click sound enabled/disabled
  clickSoundEnabled = signal<boolean>(true);

  // Private state
  private soundFiles = [
    '/sfx/Mouse_Hit.mp3',
    '/sfx/Click_Interaction.mp3'
  ];
  private audioPool: HTMLAudioElement[] = [];
  private currentPoolIndex = 0;
  private readonly POOL_SIZE = 3;
  private readonly VOLUME = 0.3; // 30% volume for comfortable listening

  // Dependencies
  private renderer = inject(RendererFactory2).createRenderer(null, null);
  private document = inject(DOCUMENT);

  // Event listener reference for cleanup
  private clickListener: ((e: MouseEvent) => void) | null = null;

  constructor() {
    this.initializeAudioPool();
    this.loadSettingsFromStorage();
    this.setupGlobalClickListener();
  }

  /**
   * Toggle click sound on/off
   */
  toggleClickSound(): void {
    this.setClickSoundEnabled(!this.clickSoundEnabled());
  }

  /**
   * Set click sound enabled state and persist to localStorage
   */
  setClickSoundEnabled(enabled: boolean): void {
    this.clickSoundEnabled.set(enabled);
    localStorage.setItem('click-sound-enabled', enabled.toString());
  }

  /**
   * Initialize the audio pool with HTMLAudioElement instances
   * @private
   */
  private initializeAudioPool(): void {
    for (let i = 0; i < this.POOL_SIZE; i++) {
      const audio = new Audio();
      audio.volume = this.VOLUME;
      
      audio.onerror = () => {
        console.warn(`Failed to load click sound effect`);
      };

      this.audioPool.push(audio);
    }
  }

  /**
   * Load click sound enabled setting from localStorage
   * @private
   */
  private loadSettingsFromStorage(): void {
    const saved = localStorage.getItem('click-sound-enabled');
    if (saved !== null) {
      this.clickSoundEnabled.set(saved === 'true');
    }
    
    // Default is true (already set in signal initialization)
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
