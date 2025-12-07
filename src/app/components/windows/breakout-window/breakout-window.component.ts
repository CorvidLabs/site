import { Component, signal, ChangeDetectionStrategy, HostListener, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { FloatWindow } from '../float-window/float-window.component';
import { DraggableDirective } from '../../../directives/draggable.directive';
import { CommonModule } from '@angular/common';
import { PixelIconComponent } from '../../shared/pixel-icon/pixel-icon.component';

type GameState = 'ready' | 'playing' | 'paused' | 'won' | 'lost';

interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  hits: number;
  destroyed: boolean;
}

const STORAGE_KEY = 'corvid_breakout_best';
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 450;
const PADDLE_WIDTH = 80;
const PADDLE_HEIGHT = 12;
const BALL_RADIUS = 8;
const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_WIDTH = 45;
const BRICK_HEIGHT = 18;
const BRICK_PADDING = 4;
const BRICK_OFFSET_TOP = 40;
const BRICK_OFFSET_LEFT = 10;

const BRICK_COLORS = ['#ef4444', '#f59e0b', '#eab308', '#22c55e', '#3b82f6'];

@Component({
  selector: 'app-breakout-window',
  imports: [CommonModule, DraggableDirective, PixelIconComponent],
  templateUrl: 'breakout-window.component.html',
  styleUrls: ['breakout-window.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreakoutWindowComponent extends FloatWindow implements AfterViewInit, OnDestroy {
  @ViewChild('gameCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  gameState = signal<GameState>('ready');
  score = signal(0);
  bestScore = signal(0);
  lives = signal(3);
  level = signal(1);

  private ctx!: CanvasRenderingContext2D;
  private animationId: number | null = null;

  private paddleX = 0;
  private ballX = 0;
  private ballY = 0;
  private ballDX = 0;
  private ballDY = 0;
  private bricks: Brick[] = [];
  private leftPressed = false;
  private rightPressed = false;

  constructor() {
    super();
    this.title = 'Breakout';
    this.width.set(450);
    this.height.set(580);
    this.loadBestScore();
  }

  ngAfterViewInit(): void {
    this.initCanvas();
  }

  ngOnDestroy(): void {
    this.stopGame();
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

  private initCanvas(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    this.ctx = canvas.getContext('2d')!;
    this.resetGame();
    this.draw();
  }

  private resetGame(): void {
    this.paddleX = (CANVAS_WIDTH - PADDLE_WIDTH) / 2;
    this.resetBall();
    this.initBricks();
  }

  private resetBall(): void {
    this.ballX = CANVAS_WIDTH / 2;
    this.ballY = CANVAS_HEIGHT - 50;
    const speed = 4 + (this.level() - 1) * 0.5;
    const angle = (Math.random() * 60 + 60) * (Math.PI / 180);
    this.ballDX = speed * Math.cos(angle) * (Math.random() > 0.5 ? 1 : -1);
    this.ballDY = -speed * Math.sin(angle);
  }

  private initBricks(): void {
    this.bricks = [];
    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        this.bricks.push({
          x: BRICK_OFFSET_LEFT + col * (BRICK_WIDTH + BRICK_PADDING),
          y: BRICK_OFFSET_TOP + row * (BRICK_HEIGHT + BRICK_PADDING),
          width: BRICK_WIDTH,
          height: BRICK_HEIGHT,
          color: BRICK_COLORS[row % BRICK_COLORS.length],
          hits: row < 2 ? 2 : 1,
          destroyed: false
        });
      }
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') {
      this.leftPressed = true;
    }
    if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') {
      this.rightPressed = true;
    }
    if (event.key === ' ' && this.gameState() === 'ready') {
      event.preventDefault();
      this.startGame();
    }
    if (event.key === 'p' || event.key === 'P') {
      this.togglePause();
    }
  }

  @HostListener('window:keyup', ['$event'])
  handleKeyUp(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') {
      this.leftPressed = false;
    }
    if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') {
      this.rightPressed = false;
    }
  }

  startGame(): void {
    if (this.gameState() === 'ready' || this.gameState() === 'won' || this.gameState() === 'lost') {
      this.score.set(0);
      this.lives.set(3);
      this.level.set(1);
      this.resetGame();
    }
    this.gameState.set('playing');
    this.gameLoop();
  }

  togglePause(): void {
    if (this.gameState() === 'playing') {
      this.gameState.set('paused');
      this.stopAnimation();
    } else if (this.gameState() === 'paused') {
      this.gameState.set('playing');
      this.gameLoop();
    }
  }

  private stopGame(): void {
    this.stopAnimation();
  }

  private stopAnimation(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private gameLoop(): void {
    if (this.gameState() !== 'playing') return;

    this.update();
    this.draw();
    this.animationId = requestAnimationFrame(() => this.gameLoop());
  }

  private update(): void {
    // Move paddle
    if (this.leftPressed && this.paddleX > 0) {
      this.paddleX -= 8;
    }
    if (this.rightPressed && this.paddleX < CANVAS_WIDTH - PADDLE_WIDTH) {
      this.paddleX += 8;
    }

    // Move ball
    this.ballX += this.ballDX;
    this.ballY += this.ballDY;

    // Wall collision
    if (this.ballX + BALL_RADIUS > CANVAS_WIDTH || this.ballX - BALL_RADIUS < 0) {
      this.ballDX = -this.ballDX;
    }
    if (this.ballY - BALL_RADIUS < 0) {
      this.ballDY = -this.ballDY;
    }

    // Paddle collision
    if (
      this.ballY + BALL_RADIUS > CANVAS_HEIGHT - PADDLE_HEIGHT - 10 &&
      this.ballX > this.paddleX &&
      this.ballX < this.paddleX + PADDLE_WIDTH
    ) {
      // Calculate angle based on where ball hits paddle
      const hitPos = (this.ballX - this.paddleX) / PADDLE_WIDTH;
      const angle = (hitPos - 0.5) * (Math.PI / 3); // -60 to +60 degrees
      const speed = Math.sqrt(this.ballDX * this.ballDX + this.ballDY * this.ballDY);
      this.ballDX = speed * Math.sin(angle);
      this.ballDY = -Math.abs(speed * Math.cos(angle));
    }

    // Bottom wall (lose life)
    if (this.ballY + BALL_RADIUS > CANVAS_HEIGHT) {
      this.lives.update(l => l - 1);
      if (this.lives() <= 0) {
        this.gameOver();
      } else {
        this.resetBall();
      }
    }

    // Brick collision
    for (const brick of this.bricks) {
      if (brick.destroyed) continue;

      if (
        this.ballX + BALL_RADIUS > brick.x &&
        this.ballX - BALL_RADIUS < brick.x + brick.width &&
        this.ballY + BALL_RADIUS > brick.y &&
        this.ballY - BALL_RADIUS < brick.y + brick.height
      ) {
        this.ballDY = -this.ballDY;
        brick.hits--;
        if (brick.hits <= 0) {
          brick.destroyed = true;
          this.score.update(s => s + 10 * this.level());
        } else {
          brick.color = this.lightenColor(brick.color);
        }
        break;
      }
    }

    // Check win
    if (this.bricks.every(b => b.destroyed)) {
      this.levelUp();
    }
  }

  private lightenColor(color: string): string {
    // Simple color lightening
    const colors: Record<string, string> = {
      '#ef4444': '#fca5a5',
      '#f59e0b': '#fcd34d',
      '#eab308': '#fde047',
      '#22c55e': '#86efac',
      '#3b82f6': '#93c5fd'
    };
    return colors[color] || color;
  }

  private levelUp(): void {
    this.level.update(l => l + 1);
    if (this.level() > 5) {
      this.win();
    } else {
      this.resetBall();
      this.initBricks();
    }
  }

  private gameOver(): void {
    this.stopAnimation();
    this.gameState.set('lost');
    this.saveBestScore(this.score());
    this.draw();
  }

  private win(): void {
    this.stopAnimation();
    this.gameState.set('won');
    this.saveBestScore(this.score());
    this.draw();
  }

  private draw(): void {
    if (!this.ctx) return;

    // Clear canvas
    this.ctx.fillStyle = '#111827';
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw bricks
    for (const brick of this.bricks) {
      if (brick.destroyed) continue;
      this.ctx.fillStyle = brick.color;
      this.ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
      this.ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      this.ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
    }

    // Draw paddle
    this.ctx.fillStyle = '#8b5cf6';
    this.ctx.beginPath();
    this.ctx.roundRect(
      this.paddleX,
      CANVAS_HEIGHT - PADDLE_HEIGHT - 10,
      PADDLE_WIDTH,
      PADDLE_HEIGHT,
      4
    );
    this.ctx.fill();

    // Draw ball
    this.ctx.fillStyle = '#f3f4f6';
    this.ctx.beginPath();
    this.ctx.arc(this.ballX, this.ballY, BALL_RADIUS, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw score
    this.ctx.fillStyle = '#9ca3af';
    this.ctx.font = '14px system-ui';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Score: ${this.score()}`, 10, 25);
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`Level ${this.level()}`, CANVAS_WIDTH / 2, 25);
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`Lives: ${'❤️'.repeat(this.lives())}`, CANVAS_WIDTH - 10, 25);
  }
}
