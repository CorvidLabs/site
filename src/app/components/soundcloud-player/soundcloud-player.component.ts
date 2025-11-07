import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { SoundcloudService } from '../../services/soundcloud.service';
import { environment } from '../../../environments/environment.local';

interface Track {
  title: string;
  artist: string;
  albumArtUrl: string;
  duration: number; // in seconds
}

@Component({
  selector: 'app-soundcloud-player',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './soundcloud-player.component.html',
  styleUrls: ['./soundcloud-player.component.scss']
})
export class SoundcloudPlayerComponent implements OnInit {
  @ViewChild('progressBar') progressBar!: ElementRef<HTMLInputElement>;

  currentTrack: Track | null = null;
  isPlaying = false;
  progress = 0; // 0 to 100
  volume = 75; // 0 to 100
  currentTime = 0; // in seconds

  private progressInterval: any;
  
  constructor(
    private soundcloudService: SoundcloudService
  ) {

  }

  ngOnInit(): void {
    // Placeholder for loading a track
    this.loadTrack({
      title: 'Nevermore',
      artist: 'Corvid Labs',
      albumArtUrl: 'https://placehold.co/100x100/111827/FFF?text=Art', // Placeholder image
      duration: 240 // 4 minutes
    });

    // SoundCloud Test
    // const playlistId = environment.lofi_playlists_royalty_free[0];
    // this.soundcloudService.getPlaylist(playlistId).subscribe({
    //   next: response => {
    //     console.log('SoundCloud Playlist Response:', response);
    //   },
    //   error: err => {
    //     console.error(err);
    //   }
    // });
  }

  ngAfterViewInit(): void {
    this.updateProgressVisuals();
  }

  loadTrack(track: Track): void {
    this.currentTrack = track;
    this.isPlaying = false;
    this.progress = 0;
    this.currentTime = 0;
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
    this.updateProgressVisuals();
  }

  togglePlayPause(): void {
    this.isPlaying = !this.isPlaying;
    if (this.isPlaying) {
      this.progressInterval = setInterval(() => {
        if (this.currentTrack && this.currentTime < this.currentTrack.duration) {
          this.currentTime++;
          this.progress = (this.currentTime / this.currentTrack.duration) * 100;
          this.updateProgressVisuals();
        } else {
          this.isPlaying = false;
          clearInterval(this.progressInterval);
        }
      }, 1000);
    } else {
      clearInterval(this.progressInterval);
    }
  }

  onProgressChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.progress = Number(input.value);
    if (this.currentTrack) {
      this.currentTime = Math.round((this.progress / 100) * this.currentTrack.duration);
      this.updateProgressVisuals();
    }
  }

  onVolumeChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.volume = Number(input.value);
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  private updateProgressVisuals(): void {
    if (this.progressBar) {
      const element = this.progressBar.nativeElement;
      element.style.setProperty('--progress-percent', `${this.progress}%`);
    }
  }
}