import { Component, OnInit, signal, computed, input } from '@angular/core';
import { FloatWindow } from '../float-window/float-window.component';
import { DraggableDirective } from '../../../directives/draggable.directive';
import { CommonModule } from '@angular/common';
import { PixelIconComponent } from '../../shared/pixel-icon/pixel-icon.component';

interface LeaderboardEntry {
  rank: number;
  playerName: string | null;
  walletAddress: string;
  score: number;
  createdAt?: string;
}

interface GameLeaderboard {
  game: string;
  entries: LeaderboardEntry[];
}

type GameName = 'tetris' | 'snake' | 'memory_match' | 'pong' | 'minesweeper' | '2048' | 'breakout' | 'flappy_raven' | 'slot_machine';

interface GameConfig {
  name: GameName;
  displayName: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-leaderboard-window',
  imports: [CommonModule, DraggableDirective, PixelIconComponent],
  templateUrl: 'leaderboard-window.component.html',
  styleUrls: ['leaderboard-window.component.scss']
})
export class LeaderboardWindowComponent extends FloatWindow implements OnInit {
  walletAddress = input<string | null>(null);

  // State
  leaderboards = signal<GameLeaderboard[]>([]);
  selectedGame = signal<GameName>('flappy_raven');
  isLoading = signal(false);
  error = signal<string | null>(null);
  userRank = signal<number | null>(null);
  userBestScore = signal<number | null>(null);

  games: GameConfig[] = [
    { name: 'flappy_raven', displayName: 'Flappy Raven', icon: 'flutter_dash', color: '#1F2937' },
    { name: 'tetris', displayName: 'Tetris', icon: 'videogame_asset', color: '#95E1D3' },
    { name: 'snake', displayName: 'Snake', icon: 'pest_control', color: '#22C55E' },
    { name: 'memory_match', displayName: 'Memory', icon: 'grid_view', color: '#EC4899' },
    { name: 'pong', displayName: 'Pong', icon: 'sports_esports', color: '#6366F1' },
    { name: 'minesweeper', displayName: 'Minesweeper', icon: 'grid_3x3', color: '#64748B' },
    { name: '2048', displayName: '2048', icon: 'filter_2', color: '#EAB308' },
    { name: 'breakout', displayName: 'Breakout', icon: 'sports_tennis', color: '#EF4444' },
    { name: 'slot_machine', displayName: 'Slots', icon: 'casino', color: '#F59E0B' }
  ];

  currentGameConfig = computed(() => {
    return this.games.find(g => g.name === this.selectedGame()) || this.games[0];
  });

  currentLeaderboard = computed(() => {
    const lb = this.leaderboards().find(l => l.game === this.selectedGame());
    return lb?.entries || [];
  });

  constructor() {
    super();
    this.title = 'Leaderboard';
    this.width.set(500);
    this.height.set(500);
  }

  ngOnInit(): void {
    this.loadLeaderboard(this.selectedGame());
  }

  async loadLeaderboard(game: GameName): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const response = await fetch(`/api/v1/leaderboard/${game}?limit=50`);

      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      const data = await response.json();

      // Update leaderboards signal
      const current = this.leaderboards();
      const existing = current.findIndex(l => l.game === game);

      if (existing >= 0) {
        current[existing] = { game, entries: data.entries };
        this.leaderboards.set([...current]);
      } else {
        this.leaderboards.set([...current, { game, entries: data.entries }]);
      }

      // Update user stats if available
      if (data.userRank) this.userRank.set(data.userRank);
      if (data.userBestScore) this.userBestScore.set(data.userBestScore);

    } catch (err) {
      this.error.set('Failed to load leaderboard. Showing demo data.');
      this.loadDemoLeaderboard(game);
    } finally {
      this.isLoading.set(false);
    }
  }

  loadDemoLeaderboard(game: GameName): void {
    // Generate demo data
    const demoEntries: LeaderboardEntry[] = [
      { rank: 1, playerName: 'RavenMaster', walletAddress: 'DEMO1...ABC', score: 9999 },
      { rank: 2, playerName: 'NevermoreNinja', walletAddress: 'DEMO2...DEF', score: 8750 },
      { rank: 3, playerName: 'CryptoKing', walletAddress: 'DEMO3...GHI', score: 7500 },
      { rank: 4, playerName: 'AlgoWhale', walletAddress: 'DEMO4...JKL', score: 6200 },
      { rank: 5, playerName: 'BlockchainBird', walletAddress: 'DEMO5...MNO', score: 5100 },
      { rank: 6, playerName: null, walletAddress: 'DEMO6...PQR', score: 4800 },
      { rank: 7, playerName: 'NFTCollector', walletAddress: 'DEMO7...STU', score: 4200 },
      { rank: 8, playerName: 'PixelPioneer', walletAddress: 'DEMO8...VWX', score: 3900 },
      { rank: 9, playerName: null, walletAddress: 'DEMO9...YZA', score: 3500 },
      { rank: 10, playerName: 'GameOnChain', walletAddress: 'DEMO10...BCD', score: 3100 }
    ];

    const current = this.leaderboards();
    const existing = current.findIndex(l => l.game === game);

    if (existing >= 0) {
      current[existing] = { game, entries: demoEntries };
      this.leaderboards.set([...current]);
    } else {
      this.leaderboards.set([...current, { game, entries: demoEntries }]);
    }
  }

  selectGame(game: GameName): void {
    this.selectedGame.set(game);

    // Check if we already have data for this game
    const existing = this.leaderboards().find(l => l.game === game);
    if (!existing) {
      this.loadLeaderboard(game);
    }
  }

  refresh(): void {
    this.loadLeaderboard(this.selectedGame());
  }

  formatAddress(address: string): string {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  formatScore(score: number): string {
    return score.toLocaleString();
  }

  getRankEmoji(rank: number): string {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '';
    }
  }

  isCurrentUser(entry: LeaderboardEntry): boolean {
    const wallet = this.walletAddress();
    return wallet !== null && entry.walletAddress === wallet;
  }
}
