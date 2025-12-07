import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, OnDestroy, OnInit, signal } from '@angular/core';
import { DraggableDirective } from '../../../directives/draggable.directive';
import { ResizableDirective } from '../../../directives/resizable.directive';
import { CorvidNft } from '../../../interfaces/corvid-nft.interface';
import { NodelyService } from '../../../services/nodely.service';
import { PixelIconComponent } from '../../shared/pixel-icon/pixel-icon.component';
import { FloatWindow } from '../float-window/float-window.component';

interface Card {
  id: number;
  imageUrl: string;
  nftName: string;
  isFlipped: boolean;
  isMatched: boolean;
  pairId: number;
}

type GameState = 'loading' | 'ready' | 'playing' | 'won';

@Component({
  selector: 'app-memory-match-window',
  imports: [CommonModule, DraggableDirective, ResizableDirective, PixelIconComponent],
  templateUrl: 'memory-match-window.component.html',
  styleUrls: ['memory-match-window.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemoryMatchWindowComponent extends FloatWindow implements OnInit, OnDestroy {
  private timerInterval?: ReturnType<typeof setInterval>;
  private flipTimeout?: ReturnType<typeof setTimeout>;

  gameState = signal<GameState>('loading');
  cards = signal<Card[]>([]);
  moves = signal(0);
  matchedPairs = signal(0);
  elapsedTime = signal(0);
  firstFlipped = signal<Card | null>(null);
  isChecking = signal(false);
  error = signal<string | null>(null);

  readonly PAIRS_COUNT = 6; // 6 pairs = 12 cards

  totalPairs = computed(() => this.PAIRS_COUNT);

  formattedTime = computed(() => {
    const time = this.elapsedTime();
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  });

  isGameWon = computed(() => this.matchedPairs() === this.PAIRS_COUNT);

  constructor(private nodelyService: NodelyService) {
    super();
    this.title = 'Memory Match';
    this.width.set(500);
    this.height.set(550);
  }

  ngOnInit(): void {
    this.loadNftsAndSetup();
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }

  private clearTimers(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = undefined;
    }
    if (this.flipTimeout) {
      clearTimeout(this.flipTimeout);
      this.flipTimeout = undefined;
    }
  }

  loadNftsAndSetup(): void {
    this.gameState.set('loading');
    this.error.set(null);

    this.nodelyService.listCreatedAssets(this.PAIRS_COUNT, null).subscribe({
      next: (response) => {
        this.nodelyService.listCorvidNftsFromCreatedAssets(response).subscribe({
          next: (nfts) => {
            if (nfts.length < this.PAIRS_COUNT) {
              this.error.set('Not enough NFTs available');
              return;
            }
            this.setupGame(nfts.slice(0, this.PAIRS_COUNT));
          },
          error: () => {
            this.error.set('Failed to load NFT metadata');
          }
        });
      },
      error: () => {
        this.error.set('Failed to load NFTs');
      }
    });
  }

  private setupGame(nfts: CorvidNft[]): void {
    // Create pairs of cards
    const cardPairs: Card[] = [];
    let id = 0;

    nfts.forEach((nft, pairId) => {
      // Create two cards for each NFT
      for (let i = 0; i < 2; i++) {
        cardPairs.push({
          id: id++,
          imageUrl: nft.imageIpfsUrl ?? '',
          nftName: nft.name,
          isFlipped: false,
          isMatched: false,
          pairId
        });
      }
    });

    // Shuffle cards
    this.cards.set(this.shuffleArray(cardPairs));
    this.gameState.set('ready');
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  startGame(): void {
    this.gameState.set('playing');
    this.moves.set(0);
    this.matchedPairs.set(0);
    this.elapsedTime.set(0);
    this.firstFlipped.set(null);
    this.isChecking.set(false);

    // Reset all cards
    this.cards.update(cards =>
      this.shuffleArray(cards.map(card => ({
        ...card,
        isFlipped: false,
        isMatched: false
      })))
    );

    // Start timer
    this.timerInterval = setInterval(() => {
      this.elapsedTime.update(t => t + 1);
    }, 1000);
  }

  flipCard(card: Card): void {
    // Ignore clicks during checking, on matched cards, or already flipped cards
    if (this.isChecking() || card.isMatched || card.isFlipped || this.gameState() !== 'playing') {
      return;
    }

    // Flip the card
    this.cards.update(cards =>
      cards.map(c => c.id === card.id ? { ...c, isFlipped: true } : c)
    );

    const first = this.firstFlipped();

    if (!first) {
      // First card of the pair
      this.firstFlipped.set({ ...card, isFlipped: true });
    } else {
      // Second card of the pair
      this.moves.update(m => m + 1);
      this.isChecking.set(true);

      if (first.pairId === card.pairId) {
        // Match found!
        this.cards.update(cards =>
          cards.map(c =>
            c.pairId === card.pairId ? { ...c, isMatched: true } : c
          )
        );
        this.matchedPairs.update(m => m + 1);
        this.firstFlipped.set(null);
        this.isChecking.set(false);

        // Check for win
        if (this.matchedPairs() === this.PAIRS_COUNT) {
          this.gameState.set('won');
          this.clearTimers();
        }
      } else {
        // No match - flip both back after delay
        this.flipTimeout = setTimeout(() => {
          this.cards.update(cards =>
            cards.map(c =>
              c.id === first.id || c.id === card.id
                ? { ...c, isFlipped: false }
                : c
            )
          );
          this.firstFlipped.set(null);
          this.isChecking.set(false);
        }, 1000);
      }
    }
  }

  restartGame(): void {
    this.clearTimers();
    this.loadNftsAndSetup();
  }
}
