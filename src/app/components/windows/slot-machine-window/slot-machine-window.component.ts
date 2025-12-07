import { Component, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { FloatWindow } from '../float-window/float-window.component';
import { DraggableDirective } from '../../../directives/draggable.directive';
import { CommonModule } from '@angular/common';
import { PixelIconComponent } from '../../shared/pixel-icon/pixel-icon.component';

interface SlotSymbol {
  id: string;
  icon: string;
  name: string;
  color: string;
  value: number;
}

const SYMBOLS: SlotSymbol[] = [
  { id: 'raven', icon: '🐦‍⬛', name: 'Raven', color: '#8b5cf6', value: 100 },
  { id: 'diamond', icon: '💎', name: 'Diamond', color: '#3b82f6', value: 50 },
  { id: 'coin', icon: '🪙', name: 'Coin', color: '#f59e0b', value: 25 },
  { id: 'star', icon: '⭐', name: 'Star', color: '#eab308', value: 15 },
  { id: 'heart', icon: '❤️', name: 'Heart', color: '#ef4444', value: 10 },
  { id: 'clover', icon: '🍀', name: 'Clover', color: '#22c55e', value: 5 }
];

const STORAGE_KEY = 'corvid_slots_credits';

@Component({
  selector: 'app-slot-machine-window',
  imports: [CommonModule, DraggableDirective, PixelIconComponent],
  templateUrl: 'slot-machine-window.component.html',
  styleUrls: ['slot-machine-window.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SlotMachineWindowComponent extends FloatWindow {
  credits = signal(100);
  betAmount = signal(10);
  isSpinning = signal(false);
  lastWin = signal(0);
  jackpot = signal(false);

  // Each reel shows 3 symbols (top, middle, bottom) - middle is the "win" line
  reel1 = signal<SlotSymbol[]>([SYMBOLS[0], SYMBOLS[1], SYMBOLS[2]]);
  reel2 = signal<SlotSymbol[]>([SYMBOLS[1], SYMBOLS[2], SYMBOLS[3]]);
  reel3 = signal<SlotSymbol[]>([SYMBOLS[2], SYMBOLS[3], SYMBOLS[4]]);

  // Animation states
  reel1Spinning = signal(false);
  reel2Spinning = signal(false);
  reel3Spinning = signal(false);

  canSpin = computed(() => !this.isSpinning() && this.credits() >= this.betAmount());

  constructor() {
    super();
    this.title = 'Slot Machine';
    this.width.set(420);
    this.height.set(480);
    this.loadCredits();
  }

  private loadCredits(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const credits = parseInt(stored, 10);
        if (!isNaN(credits) && credits > 0) {
          this.credits.set(credits);
        }
      }
    } catch {
      // Ignore
    }
  }

  private saveCredits(): void {
    try {
      localStorage.setItem(STORAGE_KEY, this.credits().toString());
    } catch {
      // Ignore
    }
  }

  setBet(amount: number): void {
    if (!this.isSpinning() && amount >= 5 && amount <= this.credits()) {
      this.betAmount.set(amount);
    }
  }

  spin(): void {
    if (!this.canSpin()) return;

    // Deduct bet
    this.credits.update(c => c - this.betAmount());
    this.isSpinning.set(true);
    this.lastWin.set(0);
    this.jackpot.set(false);

    // Start spinning animation for all reels
    this.reel1Spinning.set(true);
    this.reel2Spinning.set(true);
    this.reel3Spinning.set(true);

    // Generate random results
    const result1 = this.getRandomSymbols();
    const result2 = this.getRandomSymbols();
    const result3 = this.getRandomSymbols();

    // Stop reels sequentially
    setTimeout(() => {
      this.reel1.set(result1);
      this.reel1Spinning.set(false);
    }, 800);

    setTimeout(() => {
      this.reel2.set(result2);
      this.reel2Spinning.set(false);
    }, 1200);

    setTimeout(() => {
      this.reel3.set(result3);
      this.reel3Spinning.set(false);
      this.checkWin(result1[1], result2[1], result3[1]);
      this.isSpinning.set(false);
      this.saveCredits();
    }, 1600);
  }

  private getRandomSymbols(): SlotSymbol[] {
    const symbols: SlotSymbol[] = [];
    for (let i = 0; i < 3; i++) {
      const randomIndex = Math.floor(Math.random() * SYMBOLS.length);
      symbols.push(SYMBOLS[randomIndex]);
    }
    return symbols;
  }

  private checkWin(s1: SlotSymbol, s2: SlotSymbol, s3: SlotSymbol): void {
    // Three of a kind - jackpot!
    if (s1.id === s2.id && s2.id === s3.id) {
      const winAmount = s1.value * this.betAmount() / 5;
      this.lastWin.set(winAmount);
      this.credits.update(c => c + winAmount);

      // Raven jackpot is special
      if (s1.id === 'raven') {
        this.jackpot.set(true);
      }
      return;
    }

    // Two of a kind
    if (s1.id === s2.id || s2.id === s3.id || s1.id === s3.id) {
      let matchedSymbol: SlotSymbol;
      if (s1.id === s2.id) matchedSymbol = s1;
      else if (s2.id === s3.id) matchedSymbol = s2;
      else matchedSymbol = s1;

      const winAmount = Math.floor(matchedSymbol.value * this.betAmount() / 20);
      if (winAmount > 0) {
        this.lastWin.set(winAmount);
        this.credits.update(c => c + winAmount);
      }
    }
  }

  addFreeCredits(): void {
    if (this.credits() < 10) {
      this.credits.set(50);
      this.saveCredits();
    }
  }
}
