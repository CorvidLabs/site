import { Component, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { FloatWindow } from '../float-window/float-window.component';
import { DraggableDirective } from '../../../directives/draggable.directive';
import { CommonModule } from '@angular/common';
import { PixelIconComponent } from '../../shared/pixel-icon/pixel-icon.component';
import { ResizableDirective } from '../../../directives/resizable.directive';

type GameState = 'ready' | 'playing' | 'won' | 'lost';
type Difficulty = 'easy' | 'medium' | 'hard';

interface Cell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
}

interface DifficultyConfig {
  rows: number;
  cols: number;
  mines: number;
}

const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  easy: { rows: 8, cols: 8, mines: 10 },
  medium: { rows: 12, cols: 12, mines: 30 },
  hard: { rows: 16, cols: 16, mines: 50 }
};

const STORAGE_KEY = 'corvid_minesweeper_best';

@Component({
  selector: 'app-minesweeper-window',
  imports: [CommonModule, DraggableDirective, PixelIconComponent, ResizableDirective],
  templateUrl: 'minesweeper-window.component.html',
  styleUrls: ['minesweeper-window.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MinesweeperWindowComponent extends FloatWindow {
  gameState = signal<GameState>('ready');
  difficulty = signal<Difficulty>('easy');
  grid = signal<Cell[][]>([]);
  timer = signal(0);
  flagsRemaining = signal(0);
  bestTimes = signal<Record<Difficulty, number | null>>({ easy: null, medium: null, hard: null });

  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private firstClick = true;

  config = computed(() => DIFFICULTIES[this.difficulty()]);
  rows = computed(() => this.config().rows);
  cols = computed(() => this.config().cols);

  constructor() {
    super();
    this.title = 'Minesweeper';
    this.width.set(420);
    this.height.set(520);
    this.loadBestTimes();
  }

  private loadBestTimes(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.bestTimes.set(JSON.parse(stored));
      }
    } catch {
      // Ignore
    }
  }

  private saveBestTime(time: number): void {
    const current = this.bestTimes();
    const diff = this.difficulty();
    if (current[diff] === null || time < current[diff]!) {
      const updated = { ...current, [diff]: time };
      this.bestTimes.set(updated);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore
      }
    }
  }

  setDifficulty(diff: Difficulty): void {
    this.difficulty.set(diff);
    this.resetGame();
  }

  startGame(): void {
    this.gameState.set('playing');
    this.initGrid();
  }

  resetGame(): void {
    this.stopTimer();
    this.timer.set(0);
    this.firstClick = true;
    this.gameState.set('ready');
    this.initGrid();
  }

  private initGrid(): void {
    const { rows, cols, mines } = this.config();
    const newGrid: Cell[][] = [];

    for (let r = 0; r < rows; r++) {
      const row: Cell[] = [];
      for (let c = 0; c < cols; c++) {
        row.push({
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          adjacentMines: 0
        });
      }
      newGrid.push(row);
    }

    this.grid.set(newGrid);
    this.flagsRemaining.set(mines);
  }

  private placeMines(excludeRow: number, excludeCol: number): void {
    const { rows, cols, mines } = this.config();
    const grid = this.grid();
    let placed = 0;

    while (placed < mines) {
      const r = Math.floor(Math.random() * rows);
      const c = Math.floor(Math.random() * cols);

      // Don't place mine on first click or adjacent cells
      if (Math.abs(r - excludeRow) <= 1 && Math.abs(c - excludeCol) <= 1) continue;
      if (grid[r][c].isMine) continue;

      grid[r][c].isMine = true;
      placed++;
    }

    // Calculate adjacent mines
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!grid[r][c].isMine) {
          grid[r][c].adjacentMines = this.countAdjacentMines(r, c);
        }
      }
    }

    this.grid.set([...grid]);
  }

  private countAdjacentMines(row: number, col: number): number {
    const grid = this.grid();
    let count = 0;

    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const r = row + dr;
        const c = col + dc;
        if (r >= 0 && r < this.rows() && c >= 0 && c < this.cols()) {
          if (grid[r][c].isMine) count++;
        }
      }
    }

    return count;
  }

  onCellClick(row: number, col: number): void {
    if (this.gameState() !== 'playing' && this.gameState() !== 'ready') return;

    const grid = this.grid();
    const cell = grid[row][col];

    if (cell.isRevealed || cell.isFlagged) return;

    // First click - place mines and start timer
    if (this.firstClick) {
      this.firstClick = false;
      this.gameState.set('playing');
      this.placeMines(row, col);
      this.startTimer();
    }

    if (cell.isMine) {
      this.revealAllMines();
      this.gameState.set('lost');
      this.stopTimer();
      return;
    }

    this.revealCell(row, col);
    this.checkWin();
  }

  onCellRightClick(event: Event, row: number, col: number): void {
    event.preventDefault();
    if (this.gameState() !== 'playing') return;

    const grid = this.grid();
    const cell = grid[row][col];

    if (cell.isRevealed) return;

    cell.isFlagged = !cell.isFlagged;
    this.flagsRemaining.update(f => cell.isFlagged ? f - 1 : f + 1);
    this.grid.set([...grid]);
  }

  private revealCell(row: number, col: number): void {
    const grid = this.grid();
    const cell = grid[row][col];

    if (cell.isRevealed || cell.isFlagged || cell.isMine) return;

    cell.isRevealed = true;

    // If no adjacent mines, reveal neighbors
    if (cell.adjacentMines === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const r = row + dr;
          const c = col + dc;
          if (r >= 0 && r < this.rows() && c >= 0 && c < this.cols()) {
            this.revealCell(r, c);
          }
        }
      }
    }

    this.grid.set([...grid]);
  }

  private revealAllMines(): void {
    const grid = this.grid();
    for (const row of grid) {
      for (const cell of row) {
        if (cell.isMine) {
          cell.isRevealed = true;
        }
      }
    }
    this.grid.set([...grid]);
  }

  private checkWin(): void {
    const grid = this.grid();
    for (const row of grid) {
      for (const cell of row) {
        if (!cell.isMine && !cell.isRevealed) {
          return; // Game not won yet
        }
      }
    }

    // All non-mine cells revealed - win!
    this.gameState.set('won');
    this.stopTimer();
    this.saveBestTime(this.timer());
  }

  private startTimer(): void {
    this.timerInterval = setInterval(() => {
      this.timer.update(t => t + 1);
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  getCellClass(cell: Cell): string {
    if (!cell.isRevealed) {
      return cell.isFlagged ? 'flagged' : 'hidden';
    }
    if (cell.isMine) {
      return 'mine';
    }
    return `revealed n${cell.adjacentMines}`;
  }

  getCellContent(cell: Cell): string {
    if (!cell.isRevealed) {
      return cell.isFlagged ? '🚩' : '';
    }
    if (cell.isMine) {
      return '💀';
    }
    return cell.adjacentMines > 0 ? cell.adjacentMines.toString() : '';
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
