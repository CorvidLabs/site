import { Component, OnInit, OnDestroy, signal, HostListener, input, ElementRef, viewChild } from '@angular/core';
import { FloatWindow } from '../float-window/float-window.component';
import { DraggableDirective } from '../../../directives/draggable.directive';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ResizableDirective } from '../../../directives/resizable.directive';
import { PixelIconComponent } from "../../shared/pixel-icon/pixel-icon.component";

interface Position {
  x: number;
  y: number;
}

const TETROMINOS = {
  I: [[1, 1, 1, 1]],
  O: [[1, 1], [1, 1]],
  T: [[0, 1, 0], [1, 1, 1]],
  S: [[0, 1, 1], [1, 1, 0]],
  Z: [[1, 1, 0], [0, 1, 1]],
  J: [[1, 0, 0], [1, 1, 1]],
  L: [[0, 0, 1], [1, 1, 1]]
};

const COLORS = {
  I: '#00f0f0',
  O: '#f0f000',
  T: '#a000f0',
  S: '#00f000',
  Z: '#f00000',
  J: '#0000f0',
  L: '#f0a000'
};

@Component({
  selector: 'app-tetris-window',
  imports: [CommonModule, DraggableDirective, ResizableDirective, MatIconModule, MatButtonModule, PixelIconComponent],
  templateUrl: 'tetris-window.component.html',
  styleUrls: ['tetris-window.component.scss']
})
export class TetrisWindowComponent extends FloatWindow implements OnInit, OnDestroy {
  override title = input<string>('Tetris');
  private readonly BOARD_WIDTH = 10;
  private readonly BOARD_HEIGHT = 20;
  private readonly CELL_SIZE = 25;

  controlsItem = viewChild<ElementRef<HTMLDivElement>>('controlsItem');

  board: (string | null)[][] = [];
  currentPiece: { shape: number[][], color: string, type: string } | null = null;
  currentPosition: Position = { x: 0, y: 0 };
  gameLoop: any;
  score = signal<number>(0);
  level = signal<number>(1);
  lines = signal<number>(0);
  isGameOver = signal<boolean>(false);
  isPaused = signal<boolean>(false);

  constructor() {
    super();
    this.width.set(400);
    this.height.set(850);
    this.initBoard();
  }

  ngOnInit() {
    this.startGame();
  }

  ngOnDestroy() {
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyPress(event: KeyboardEvent) {
    if (this.isGameOver()) return;

    if (event.key === 'p' || event.key === 'P') {
      event.preventDefault();
      this.togglePause();
    }

    if (this.isPaused()) return;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        this.movePiece(-1, 0);
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.movePiece(1, 0);
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.movePiece(0, 1);
        break;
      case 'ArrowUp':
      case ' ':
        event.preventDefault();
        this.rotatePiece();
        break;
    }
  }

  private initBoard() {
    this.board = Array(this.BOARD_HEIGHT).fill(null).map(() =>
      Array(this.BOARD_WIDTH).fill(null)
    );
  }

  private startGame() {
    this.initBoard();
    this.score.set(0);
    this.level.set(1);
    this.lines.set(0);
    this.isGameOver.set(false);
    this.isPaused.set(false);
    this.spawnNewPiece();
    this.startGameLoop();
  }

  private startGameLoop() {
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
    }

    const speed = Math.max(100, 1000 - (this.level() - 1) * 100);
    this.gameLoop = setInterval(() => {
      if (!this.isPaused() && !this.isGameOver()) {
        this.gameStep();
      }
    }, speed);
  }

  private gameStep() {
    if (!this.movePiece(0, 1)) {
      this.mergePiece();
      this.clearLines();
      this.spawnNewPiece();
    }
  }

  private spawnNewPiece() {
    const types = Object.keys(TETROMINOS) as Array<keyof typeof TETROMINOS>;
    const type = types[Math.floor(Math.random() * types.length)];

    this.currentPiece = {
      shape: TETROMINOS[type],
      color: COLORS[type],
      type
    };

    this.currentPosition = {
      x: Math.floor(this.BOARD_WIDTH / 2) - Math.floor(this.currentPiece.shape[0].length / 2),
      y: 0
    };

    // Check for game over
    if (this.checkCollision(this.currentPosition.x, this.currentPosition.y)) {
      this.isGameOver.set(true);
      clearInterval(this.gameLoop);
    }
  }

  private movePiece(dx: number, dy: number): boolean {
    const newX = this.currentPosition.x + dx;
    const newY = this.currentPosition.y + dy;

    if (!this.checkCollision(newX, newY)) {
      this.currentPosition = { x: newX, y: newY };
      return true;
    }
    return false;
  }

  private rotatePiece() {
    if (!this.currentPiece) return;

    const rotated = this.currentPiece.shape[0].map((_, i) =>
      this.currentPiece!.shape.map(row => row[i]).reverse()
    );

    const original = this.currentPiece.shape;
    this.currentPiece.shape = rotated;

    // Wall kick - try to adjust position if rotation causes collision
    if (this.checkCollision(this.currentPosition.x, this.currentPosition.y)) {
      // Try moving left or right
      if (!this.checkCollision(this.currentPosition.x + 1, this.currentPosition.y)) {
        this.currentPosition.x += 1;
      } else if (!this.checkCollision(this.currentPosition.x - 1, this.currentPosition.y)) {
        this.currentPosition.x -= 1;
      } else {
        // Rotation not possible, revert
        this.currentPiece.shape = original;
      }
    }
  }

  private checkCollision(x: number, y: number): boolean {
    if (!this.currentPiece) return true;

    for (let row = 0; row < this.currentPiece.shape.length; row++) {
      for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
        if (this.currentPiece.shape[row][col]) {
          const boardX = x + col;
          const boardY = y + row;

          if (
            boardX < 0 ||
            boardX >= this.BOARD_WIDTH ||
            boardY >= this.BOARD_HEIGHT ||
            (boardY >= 0 && this.board[boardY][boardX])
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private mergePiece() {
    if (!this.currentPiece) return;

    for (let row = 0; row < this.currentPiece.shape.length; row++) {
      for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
        if (this.currentPiece.shape[row][col]) {
          const boardY = this.currentPosition.y + row;
          const boardX = this.currentPosition.x + col;
          if (boardY >= 0) {
            this.board[boardY][boardX] = this.currentPiece.color;
          }
        }
      }
    }
  }

  private clearLines() {
    let linesCleared = 0;

    for (let row = this.BOARD_HEIGHT - 1; row >= 0; row--) {
      if (this.board[row].every(cell => cell !== null)) {
        this.board.splice(row, 1);
        this.board.unshift(Array(this.BOARD_WIDTH).fill(null));
        linesCleared++;
        row++; // Check same row again
      }
    }

    if (linesCleared > 0) {
      this.lines.set(this.lines() + linesCleared);
      // Scoring: 40, 100, 300, 1200 for 1, 2, 3, 4 lines
      const points = [0, 40, 100, 300, 1200][linesCleared] * this.level();
      this.score.set(this.score() + points);

      // Level up every 10 lines
      const newLevel = Math.floor(this.lines() / 10) + 1;
      if (newLevel > this.level()) {
        this.level.set(newLevel);
        this.startGameLoop(); // Increase speed
      }
    }
  }

  getCellColor(row: number, col: number): string | null {
    // Check if current piece occupies this cell
    if (this.currentPiece) {
      const relativeRow = row - this.currentPosition.y;
      const relativeCol = col - this.currentPosition.x;

      if (
        relativeRow >= 0 &&
        relativeRow < this.currentPiece.shape.length &&
        relativeCol >= 0 &&
        relativeCol < this.currentPiece.shape[relativeRow].length &&
        this.currentPiece.shape[relativeRow][relativeCol]
      ) {
        return this.currentPiece.color;
      }
    }

    return this.board[row][col];
  }

  getRows(): number[] {
    return Array(this.BOARD_HEIGHT).fill(0).map((_, i) => i);
  }

  getCols(): number[] {
    return Array(this.BOARD_WIDTH).fill(0).map((_, i) => i);
  }

  restartGame() {
    this.startGame();
  }

  togglePause() {
    this.isPaused.set(!this.isPaused());
  }

  toggleControls() {
    const el = this.controlsItem()?.nativeElement;
    if (!el) return;
    el.classList.toggle('open');
  }
}
