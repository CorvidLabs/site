import { Component, signal, computed, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { FloatWindow } from '../float-window/float-window.component';
import { DraggableDirective } from '../../../directives/draggable.directive';
import { CommonModule } from '@angular/common';
import { PixelIconComponent } from '../../shared/pixel-icon/pixel-icon.component';

type GameState = 'playing' | 'won' | 'lost';

const STORAGE_KEY = 'corvid_2048_best';
const GRID_SIZE = 4;

@Component({
  selector: 'app-game-2048-window',
  imports: [CommonModule, DraggableDirective, PixelIconComponent],
  templateUrl: 'game-2048-window.component.html',
  styleUrls: ['game-2048-window.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Game2048WindowComponent extends FloatWindow {
  gameState = signal<GameState>('playing');
  grid = signal<number[][]>([]);
  score = signal(0);
  bestScore = signal(0);
  hasWon = signal(false);

  gridSize = GRID_SIZE;

  constructor() {
    super();
    this.title = '2048';
    this.width.set(380);
    this.height.set(520);
    this.loadBestScore();
    this.initGame();
  }

  private loadBestScore(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.bestScore.set(parseInt(stored, 10));
      }
    } catch {
      // Ignore
    }
  }

  private saveBestScore(score: number): void {
    if (score > this.bestScore()) {
      this.bestScore.set(score);
      try {
        localStorage.setItem(STORAGE_KEY, score.toString());
      } catch {
        // Ignore
      }
    }
  }

  initGame(): void {
    const newGrid: number[][] = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      newGrid.push(new Array(GRID_SIZE).fill(0));
    }
    this.grid.set(newGrid);
    this.score.set(0);
    this.gameState.set('playing');
    this.hasWon.set(false);
    this.addRandomTile();
    this.addRandomTile();
  }

  private addRandomTile(): void {
    const grid = this.grid();
    const emptyCells: { row: number; col: number }[] = [];

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c] === 0) {
          emptyCells.push({ row: r, col: c });
        }
      }
    }

    if (emptyCells.length > 0) {
      const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      grid[row][col] = Math.random() < 0.9 ? 2 : 4;
      this.grid.set([...grid.map(row => [...row])]);
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (this.gameState() !== 'playing') return;

    let moved = false;
    switch (event.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        event.preventDefault();
        moved = this.move('up');
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        event.preventDefault();
        moved = this.move('down');
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        event.preventDefault();
        moved = this.move('left');
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        event.preventDefault();
        moved = this.move('right');
        break;
    }

    if (moved) {
      this.addRandomTile();
      this.checkGameState();
    }
  }

  private move(direction: 'up' | 'down' | 'left' | 'right'): boolean {
    const grid = this.grid();
    let moved = false;
    let scoreGained = 0;

    const rotatedGrid = this.rotateGrid(grid, direction);

    for (let r = 0; r < GRID_SIZE; r++) {
      const result = this.slideAndMergeRow(rotatedGrid[r]);
      if (result.moved) {
        moved = true;
      }
      scoreGained += result.score;
      rotatedGrid[r] = result.row;
    }

    const finalGrid = this.unrotateGrid(rotatedGrid, direction);

    if (moved) {
      this.grid.set(finalGrid);
      this.score.update(s => s + scoreGained);
      this.saveBestScore(this.score());
    }

    return moved;
  }

  private rotateGrid(grid: number[][], direction: 'up' | 'down' | 'left' | 'right'): number[][] {
    const newGrid: number[][] = [];

    switch (direction) {
      case 'left':
        return grid.map(row => [...row]);
      case 'right':
        return grid.map(row => [...row].reverse());
      case 'up':
        for (let c = 0; c < GRID_SIZE; c++) {
          const row: number[] = [];
          for (let r = 0; r < GRID_SIZE; r++) {
            row.push(grid[r][c]);
          }
          newGrid.push(row);
        }
        return newGrid;
      case 'down':
        for (let c = 0; c < GRID_SIZE; c++) {
          const row: number[] = [];
          for (let r = GRID_SIZE - 1; r >= 0; r--) {
            row.push(grid[r][c]);
          }
          newGrid.push(row);
        }
        return newGrid;
    }
  }

  private unrotateGrid(grid: number[][], direction: 'up' | 'down' | 'left' | 'right'): number[][] {
    switch (direction) {
      case 'left':
        return grid.map(row => [...row]);
      case 'right':
        return grid.map(row => [...row].reverse());
      case 'up':
        const upGrid: number[][] = [];
        for (let r = 0; r < GRID_SIZE; r++) {
          const row: number[] = [];
          for (let c = 0; c < GRID_SIZE; c++) {
            row.push(grid[c][r]);
          }
          upGrid.push(row);
        }
        return upGrid;
      case 'down':
        const downGrid: number[][] = [];
        for (let r = 0; r < GRID_SIZE; r++) {
          const row: number[] = [];
          for (let c = 0; c < GRID_SIZE; c++) {
            row.push(grid[c][GRID_SIZE - 1 - r]);
          }
          downGrid.push(row);
        }
        return downGrid;
    }
  }

  private slideAndMergeRow(row: number[]): { row: number[]; moved: boolean; score: number } {
    const original = [...row];
    let score = 0;

    // Remove zeros and slide left
    const nonZero = row.filter(val => val !== 0);

    // Merge adjacent equal tiles
    const merged: number[] = [];
    let i = 0;
    while (i < nonZero.length) {
      if (i + 1 < nonZero.length && nonZero[i] === nonZero[i + 1]) {
        const mergedValue = nonZero[i] * 2;
        merged.push(mergedValue);
        score += mergedValue;

        // Check for win condition
        if (mergedValue === 2048 && !this.hasWon()) {
          this.hasWon.set(true);
        }
        i += 2;
      } else {
        merged.push(nonZero[i]);
        i++;
      }
    }

    // Pad with zeros
    while (merged.length < GRID_SIZE) {
      merged.push(0);
    }

    const moved = !original.every((val, idx) => val === merged[idx]);

    return { row: merged, moved, score };
  }

  private checkGameState(): void {
    // Check if 2048 was reached
    if (this.hasWon() && this.gameState() === 'playing') {
      this.gameState.set('won');
      return;
    }

    // Check if any moves are possible
    const grid = this.grid();

    // Check for empty cells
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c] === 0) return;
      }
    }

    // Check for possible merges
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const val = grid[r][c];
        // Check right
        if (c < GRID_SIZE - 1 && grid[r][c + 1] === val) return;
        // Check down
        if (r < GRID_SIZE - 1 && grid[r + 1][c] === val) return;
      }
    }

    // No moves possible - game over
    this.gameState.set('lost');
    this.saveBestScore(this.score());
  }

  continueGame(): void {
    this.gameState.set('playing');
    this.hasWon.set(false);
  }

  getTileClass(value: number): string {
    if (value === 0) return 'tile-empty';
    if (value <= 2048) return `tile-${value}`;
    return 'tile-super';
  }
}
