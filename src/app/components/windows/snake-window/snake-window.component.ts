import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, HostListener, OnDestroy, signal } from '@angular/core';
import { DraggableDirective } from '../../../directives/draggable.directive';
import { ResizableDirective } from '../../../directives/resizable.directive';
import { PixelIconComponent } from '../../shared/pixel-icon/pixel-icon.component';
import { FloatWindow } from '../float-window/float-window.component';

interface Position {
  x: number;
  y: number;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type GameState = 'ready' | 'playing' | 'paused' | 'gameover';

@Component({
  selector: 'app-snake-window',
  imports: [CommonModule, DraggableDirective, ResizableDirective, PixelIconComponent],
  templateUrl: 'snake-window.component.html',
  styleUrls: ['snake-window.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SnakeWindowComponent extends FloatWindow implements OnDestroy {
  private gameLoop?: ReturnType<typeof setInterval>;
  private lastDirection: Direction = 'RIGHT';

  readonly GRID_SIZE = 20;
  readonly CELL_SIZE = 15;

  gameState = signal<GameState>('ready');
  snake = signal<Position[]>([{ x: 10, y: 10 }]);
  food = signal<Position>({ x: 15, y: 10 });
  direction = signal<Direction>('RIGHT');
  score = signal(0);
  highScore = signal(0);
  speed = signal(150); // ms per frame

  gridArray = computed(() => {
    const arr = [];
    for (let i = 0; i < this.GRID_SIZE; i++) {
      arr.push(i);
    }
    return arr;
  });

  constructor() {
    super();
    this.title = 'Snake';
    this.width.set(380);
    this.height.set(480);

    // Load high score from localStorage
    const saved = localStorage.getItem('snake-high-score');
    if (saved) {
      this.highScore.set(parseInt(saved, 10));
    }
  }

  ngOnDestroy(): void {
    this.stopGame();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if (this.gameState() !== 'playing') return;

    const key = event.key;
    const current = this.direction();

    // Prevent 180-degree turns
    if (key === 'ArrowUp' && current !== 'DOWN') {
      this.direction.set('UP');
      event.preventDefault();
    } else if (key === 'ArrowDown' && current !== 'UP') {
      this.direction.set('DOWN');
      event.preventDefault();
    } else if (key === 'ArrowLeft' && current !== 'RIGHT') {
      this.direction.set('LEFT');
      event.preventDefault();
    } else if (key === 'ArrowRight' && current !== 'LEFT') {
      this.direction.set('RIGHT');
      event.preventDefault();
    } else if (key === ' ') {
      this.togglePause();
      event.preventDefault();
    }
  }

  startGame(): void {
    // Reset game state
    this.snake.set([{ x: 10, y: 10 }]);
    this.direction.set('RIGHT');
    this.lastDirection = 'RIGHT';
    this.score.set(0);
    this.spawnFood();
    this.gameState.set('playing');

    // Start game loop
    this.gameLoop = setInterval(() => this.tick(), this.speed());
  }

  togglePause(): void {
    if (this.gameState() === 'playing') {
      this.gameState.set('paused');
      this.stopLoop();
    } else if (this.gameState() === 'paused') {
      this.gameState.set('playing');
      this.gameLoop = setInterval(() => this.tick(), this.speed());
    }
  }

  private stopLoop(): void {
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = undefined;
    }
  }

  private stopGame(): void {
    this.stopLoop();
  }

  private tick(): void {
    const snakeArr = this.snake();
    const head = snakeArr[0];
    const dir = this.direction();
    this.lastDirection = dir;

    // Calculate new head position
    let newHead: Position;
    switch (dir) {
      case 'UP':
        newHead = { x: head.x, y: head.y - 1 };
        break;
      case 'DOWN':
        newHead = { x: head.x, y: head.y + 1 };
        break;
      case 'LEFT':
        newHead = { x: head.x - 1, y: head.y };
        break;
      case 'RIGHT':
        newHead = { x: head.x + 1, y: head.y };
        break;
    }

    // Check wall collision
    if (newHead.x < 0 || newHead.x >= this.GRID_SIZE ||
        newHead.y < 0 || newHead.y >= this.GRID_SIZE) {
      this.endGame();
      return;
    }

    // Check self collision
    if (snakeArr.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
      this.endGame();
      return;
    }

    // Move snake
    const newSnake = [newHead, ...snakeArr];

    // Check food collision
    const foodPos = this.food();
    if (newHead.x === foodPos.x && newHead.y === foodPos.y) {
      // Grow snake (don't remove tail)
      this.score.update(s => s + 10);
      this.spawnFood();

      // Increase speed every 50 points
      if (this.score() % 50 === 0 && this.speed() > 50) {
        this.speed.update(s => s - 10);
        this.stopLoop();
        this.gameLoop = setInterval(() => this.tick(), this.speed());
      }
    } else {
      // Remove tail
      newSnake.pop();
    }

    this.snake.set(newSnake);
  }

  private spawnFood(): void {
    const snakeArr = this.snake();
    let newFood: Position;

    do {
      newFood = {
        x: Math.floor(Math.random() * this.GRID_SIZE),
        y: Math.floor(Math.random() * this.GRID_SIZE)
      };
    } while (snakeArr.some(seg => seg.x === newFood.x && seg.y === newFood.y));

    this.food.set(newFood);
  }

  private endGame(): void {
    this.stopLoop();
    this.gameState.set('gameover');

    // Update high score
    if (this.score() > this.highScore()) {
      this.highScore.set(this.score());
      localStorage.setItem('snake-high-score', this.score().toString());
    }
  }

  isSnakeCell(x: number, y: number): boolean {
    return this.snake().some(seg => seg.x === x && seg.y === y);
  }

  isSnakeHead(x: number, y: number): boolean {
    const head = this.snake()[0];
    return head.x === x && head.y === y;
  }

  isFoodCell(x: number, y: number): boolean {
    const f = this.food();
    return f.x === x && f.y === y;
  }

  // Touch controls
  moveUp(): void {
    if (this.direction() !== 'DOWN') this.direction.set('UP');
  }

  moveDown(): void {
    if (this.direction() !== 'UP') this.direction.set('DOWN');
  }

  moveLeft(): void {
    if (this.direction() !== 'RIGHT') this.direction.set('LEFT');
  }

  moveRight(): void {
    if (this.direction() !== 'LEFT') this.direction.set('RIGHT');
  }
}
