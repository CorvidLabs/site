import { Component, input, OnInit, signal } from '@angular/core';
import { FloatWindow } from '../float-window/float-window.component';
import { DraggableDirective } from '../../../directives/draggable.directive';
import { ResizableDirective } from '../../../directives/resizable.directive';
import { CommonModule } from '@angular/common';
import { NavbarComponent, NavbarItem } from "../../navbar/navbar.component";

interface monoAppletData {
  id: string;
  name: string;
  description: string;
  icon: string;
  use_case: string;
}

@Component({
  selector: 'cvd-mono-window',
  templateUrl: 'mono-window.component.html',
  styleUrls: ['mono-window.component.scss'],
  imports: [CommonModule, DraggableDirective, ResizableDirective, NavbarComponent],
})
export class MonoWindowComponent extends FloatWindow implements OnInit {
  override title = input<string>('Mono');

  // Track selected applet for details view (desktop)
  selectedApplet = signal<monoAppletData | null>(null);

  navbarItems: NavbarItem[] = [
    {
      label: 'Overview',
      link: '#overview'
    },
    {
      label: 'Design',
      link: '#design'
    },
    {
      label: 'Applets',
      link: '#applets'
    },
    {
      label: 'Contact',
      link: '#contact',
      styling: 'text-accent'
    }
  ];

  appletsData: monoAppletData[] = [
    { id: 'apps', name: 'Apps', description: 'Launch installed apps.', icon: '🚀', use_case: 'Quickly access your most-used apps without navigating a cluttered home screen.' },
    { id: 'audioPlayer', name: 'Audio Player', description: 'Play remote audio.', icon: '🎧', use_case: 'Listen to podcasts or music streams without a complex media player.' },
    { id: 'battery', name: 'Battery', description: 'View current battery status.', icon: '🔋', use_case: 'Check your device power level at a glance.' },
    { id: 'blackjack', name: 'Blackjack', description: 'Minimal card game.', icon: '🃏', use_case: 'A simple game for a quick mental break without distractions.' },
    { id: 'breathe', name: 'Breathe', description: 'Guided breathing.', icon: '🧘', use_case: 'Take a moment to reset and refocus during a busy day.' },
    { id: 'calculator', name: 'Calculator', description: 'Advanced calculations.', icon: '🧮', use_case: 'For when you need more than basic arithmetic, like scientific or programming calculations.' },
    { id: 'calendar', name: 'Calendar', description: 'Calendar / Agenda.', icon: '🗓️', use_case: 'Quickly check your schedule for the day or week.' },
    { id: 'checklist', name: 'Checklist', description: 'Minimal to-dos.', icon: '✅', use_case: 'Jot down and manage daily tasks without a complex project manager.' },
    { id: 'clock', name: 'Clock', description: 'World time / alarms.', icon: '⏰', use_case: 'Coordinate with colleagues or family in other countries.' },
    { id: 'coin.flip', name: 'Coin Flip', description: 'Lightweight randomness.', icon: '🪙', use_case: 'Make a quick, unbiased decision.' },
    { id: 'dictionary', name: 'Dictionary', description: 'Word definitions.', icon: '📖', use_case: 'Quickly find the meaning of a word while reading or writing.' },
    { id: 'directions', name: 'Directions', description: 'Quick map routing.', icon: '🗺️', use_case: 'Find directions without the distractions of a full-featured map app.' },
    { id: 'flashlight', name: 'Flashlight', description: 'LED flashlight.', icon: '🔦', use_case: 'A handy, powerful light source for finding things in the dark.' },
    { id: 'focus.mode', name: 'Focus Mode', description: 'Do-not-disturb timer.', icon: '⏳', use_case: 'Block out distractions and work in timed intervals (Pomodoro technique).' },
    { id: 'habit.tracker', name: 'Habit Tracker', description: 'Daily checkmarks.', icon: '🔃', use_case: 'Build consistency with a simple, satisfying daily checklist.' },
    { id: 'journal', name: 'Journal', description: 'Record daily notes.', icon: '📓', use_case: 'Capture your thoughts privately with a simple, text-focused interface.' },
    { id: 'notifications', name: 'Notifications', description: 'View notifications and activity logs.', icon: '🔔', use_case: 'Stay informed with app notifications and view activity logs in a clean interface.' },
    { id: 'map.pinner', name: 'Map Pinner', description: 'Save simple locations.', icon: '📍', use_case: 'Remember your favorite spots or important locations.' },
    { id: 'notes', name: 'Notes', description: 'Plain text notes.', icon: '🗒️', use_case: 'For capturing quick thoughts and ideas without any formatting overhead.' },
    { id: 'qr.scanner', name: 'QR Scanner', description: 'Scan QR codes.', icon: '📷', use_case: 'Quickly open links or get information from QR codes.' },
    { id: 'quotes', name: 'Quotes', description: 'Daily inspiration.', icon: '💬', use_case: 'Start your day with a moment of inspiration.' },
    { id: 'rss.reader', name: 'RSS Reader', description: 'Follow feeds.', icon: '📰', use_case: 'Stay updated with your favorite sites in a clean, text-only format.' },
    { id: 'settings', name: 'Settings', description: 'App preferences.', icon: '⚙️', use_case: 'Customize Mono to fit your visual preferences and needs.' },
    { id: 'storage', name: 'Storage', description: 'Disk space viewer.', icon: '💾', use_case: 'Check device storage at a glance.' },
    { id: 'stopwatch', name: 'Stopwatch', description: 'Track elapsed time with multiple stopwatches.', icon: '⏱️', use_case: 'Measure the duration of tasks, events, or laps with precision.' },
    { id: 'timer', name: 'Timer', description: 'Manage multiple countdown timers.', icon: '⏱️', use_case: 'Set countdowns for cooking, workouts, or any timed activity.' },
    { id: 'tic.tac.toe', name: 'Tic Tac Toe', description: 'Simple grid game.', icon: '👾', use_case: 'Play a quick, classic game against a friend or the app.' },
    { id: 'vault', name: 'Vault', description: 'Secure notes w/ Face ID.', icon: '🔒', use_case: 'Keep sensitive information like passwords or private keys secure.' },
    { id: 'weather', name: 'Weather', description: 'Current conditions.', icon: '☀️', use_case: 'Check the weather without opening a complex, ad-filled app.' },
    { id: 'wiki', name: 'Wiki', description: 'Lightweight Wikipedia viewer.', icon: '🌐', use_case: 'Read and research topics without visual clutter.' }
  ];

  constructor() {
    super();

    this.width.set(865);
    this.height.set(600);
  }

  ngOnInit() {
    // Set first applet as selected for initial desktop view
    if (this.appletsData.length > 0) {
      this.selectedApplet.set(this.appletsData[0]);
    }
  }

  // Check if a specific applet is selected (desktop)
  isSelected(appletId: string): boolean {
    return this.selectedApplet()?.id === appletId;
  }

  // Set selected applet for desktop details panel
  selectApplet(applet: monoAppletData): void {
    this.selectedApplet.set(applet);
  }

  // Handle card click
  handleCardClick(applet: monoAppletData): void {
    this.selectApplet(applet);
  }
}