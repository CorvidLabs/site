import { Component, signal, computed, ElementRef, ViewChild, AfterViewInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { FloatWindow } from '../float-window/float-window.component';
import { DraggableDirective } from '../../../directives/draggable.directive';
import { CommonModule } from '@angular/common';
import { PixelIconComponent } from '../../shared/pixel-icon/pixel-icon.component';

type GameState = 'ready' | 'playing' | 'paused' | 'gameover';
type GameMode = 'ai' | 'two-player';

const PADDLE_HEIGHT = 60;
const PADDLE_WIDTH = 10;
const BALL_SIZE = 10;
const WINNING_SCORE = 5;

@Component({
  selector: 'app-pong-window',
  imports: [CommonModule, DraggableDirective, PixelIconComponent],
  templateUrl: 'pong-window.component.html',
  styleUrls: ['pong-window.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PongWindowComponent extends FloatWindow implements AfterViewInit, OnDestroy {
  @ViewChild('gameCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  gameState = signal<GameState>('ready');
  gameMode = signal<GameMode>('ai');
  player1Score = signal(0);
  player2Score = signal(0);
  winner = signal<string | null>(null);

  private ctx!: CanvasRenderingContext2D;
  private canvasWidth = 400;
  private canvasHeight = 300;
  private animationId: number | null = null;

  // Ball position and velocity
  private ballX = 0;
  private ballY = 0;
  private ballVX = 4;
  private ballVY = 3;

  // Paddle positions
  private paddle1Y = 0;
  private paddle2Y = 0;
  private paddleSpeed = 6;

  // Input states
  private keysPressed = new Set<string>();
  private boundKeyDown = this.handleKeyDown.bind(this);
  private boundKeyUp = this.handleKeyUp.bind(this);

  constructor() {
    super();
    this.title = 'Pong';
    this.width.set(450);
    this.height.set(420);
  }

  ngAfterViewInit() {
    this.initCanvas();
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);
  }

  ngOnDestroy() {
    this.stopGameLoop();
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
  }

  private initCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    canvas.width = this.canvasWidth;
    canvas.height = this.canvasHeight;
    this.resetGame();
    this.draw();
  }

  private resetGame(): void {
    this.ballX = this.canvasWidth / 2;
    this.ballY = this.canvasHeight / 2;
    this.ballVX = (Math.random() > 0.5 ? 1 : -1) * 4;
    this.ballVY = (Math.random() - 0.5) * 6;
    this.paddle1Y = (this.canvasHeight - PADDLE_HEIGHT) / 2;
    this.paddle2Y = (this.canvasHeight - PADDLE_HEIGHT) / 2;
  }

  setGameMode(mode: GameMode): void {
    this.gameMode.set(mode);
  }

  startGame(): void {
    this.player1Score.set(0);
    this.player2Score.set(0);
    this.winner.set(null);
    this.resetGame();
    this.gameState.set('playing');
    this.startGameLoop();
  }

  togglePause(): void {
    if (this.gameState() === 'playing') {
      this.gameState.set('paused');
      this.stopGameLoop();
    } else if (this.gameState() === 'paused') {
      this.gameState.set('playing');
      this.startGameLoop();
    }
  }

  private startGameLoop(): void {
    const loop = () => {
      this.update();
      this.draw();
      this.animationId = requestAnimationFrame(loop);
    };
    this.animationId = requestAnimationFrame(loop);
  }

  private stopGameLoop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private handleKeyDown(event: KeyboardEvent): void {
    this.keysPressed.add(event.key.toLowerCase());
    if (event.key === 'Escape' && this.gameState() === 'playing') {
      this.togglePause();
    }
  }

  private handleKeyUp(event: KeyboardEvent): void {
    this.keysPressed.delete(event.key.toLowerCase());
  }

  private update(): void {
    if (this.gameState() !== 'playing') return;

    // Move paddles based on input
    this.updatePaddles();

    // Move ball
    this.ballX += this.ballVX;
    this.ballY += this.ballVY;

    // Ball collision with top/bottom walls
    if (this.ballY <= BALL_SIZE / 2 || this.ballY >= this.canvasHeight - BALL_SIZE / 2) {
      this.ballVY = -this.ballVY;
      this.ballY = Math.max(BALL_SIZE / 2, Math.min(this.canvasHeight - BALL_SIZE / 2, this.ballY));
    }

    // Ball collision with paddles
    // Player 1 paddle (left)
    if (this.ballX <= 20 + PADDLE_WIDTH && this.ballX >= 20 &&
        this.ballY >= this.paddle1Y && this.ballY <= this.paddle1Y + PADDLE_HEIGHT) {
      this.ballVX = Math.abs(this.ballVX) * 1.05; // Speed up slightly
      const hitPos = (this.ballY - this.paddle1Y) / PADDLE_HEIGHT;
      this.ballVY = (hitPos - 0.5) * 8;
    }

    // Player 2 paddle (right)
    if (this.ballX >= this.canvasWidth - 20 - PADDLE_WIDTH && this.ballX <= this.canvasWidth - 20 &&
        this.ballY >= this.paddle2Y && this.ballY <= this.paddle2Y + PADDLE_HEIGHT) {
      this.ballVX = -Math.abs(this.ballVX) * 1.05;
      const hitPos = (this.ballY - this.paddle2Y) / PADDLE_HEIGHT;
      this.ballVY = (hitPos - 0.5) * 8;
    }

    // Score detection
    if (this.ballX < 0) {
      this.player2Score.update(s => s + 1);
      this.checkWinCondition();
      this.resetBall();
    } else if (this.ballX > this.canvasWidth) {
      this.player1Score.update(s => s + 1);
      this.checkWinCondition();
      this.resetBall();
    }
  }

  private updatePaddles(): void {
    // Player 1 controls: W/S keys
    if (this.keysPressed.has('w')) {
      this.paddle1Y = Math.max(0, this.paddle1Y - this.paddleSpeed);
    }
    if (this.keysPressed.has('s')) {
      this.paddle1Y = Math.min(this.canvasHeight - PADDLE_HEIGHT, this.paddle1Y + this.paddleSpeed);
    }

    // Player 2 controls: Arrow keys (2-player) or AI
    if (this.gameMode() === 'two-player') {
      if (this.keysPressed.has('arrowup')) {
        this.paddle2Y = Math.max(0, this.paddle2Y - this.paddleSpeed);
      }
      if (this.keysPressed.has('arrowdown')) {
        this.paddle2Y = Math.min(this.canvasHeight - PADDLE_HEIGHT, this.paddle2Y + this.paddleSpeed);
      }
    } else {
      // AI movement
      const paddleCenter = this.paddle2Y + PADDLE_HEIGHT / 2;
      const targetY = this.ballY;
      const diff = targetY - paddleCenter;
      const aiSpeed = this.paddleSpeed * 0.7; // Make AI slightly slower

      if (Math.abs(diff) > 5) {
        if (diff > 0) {
          this.paddle2Y = Math.min(this.canvasHeight - PADDLE_HEIGHT, this.paddle2Y + aiSpeed);
        } else {
          this.paddle2Y = Math.max(0, this.paddle2Y - aiSpeed);
        }
      }
    }
  }

  private resetBall(): void {
    this.ballX = this.canvasWidth / 2;
    this.ballY = this.canvasHeight / 2;
    this.ballVX = (Math.random() > 0.5 ? 1 : -1) * 4;
    this.ballVY = (Math.random() - 0.5) * 6;
  }

  private checkWinCondition(): void {
    if (this.player1Score() >= WINNING_SCORE) {
      this.winner.set('Player 1');
      this.gameState.set('gameover');
      this.stopGameLoop();
    } else if (this.player2Score() >= WINNING_SCORE) {
      this.winner.set(this.gameMode() === 'ai' ? 'Computer' : 'Player 2');
      this.gameState.set('gameover');
      this.stopGameLoop();
    }
  }

  private draw(): void {
    const ctx = this.ctx;
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Draw center line
    ctx.strokeStyle = '#374151';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(this.canvasWidth / 2, 0);
    ctx.lineTo(this.canvasWidth / 2, this.canvasHeight);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw paddles
    ctx.fillStyle = '#8b5cf6';
    ctx.fillRect(20, this.paddle1Y, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillRect(this.canvasWidth - 20 - PADDLE_WIDTH, this.paddle2Y, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Draw ball
    ctx.fillStyle = '#f3f4f6';
    ctx.beginPath();
    ctx.arc(this.ballX, this.ballY, BALL_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Touch/click controls for paddles
  movePaddle1Up(): void {
    this.paddle1Y = Math.max(0, this.paddle1Y - this.paddleSpeed * 3);
  }

  movePaddle1Down(): void {
    this.paddle1Y = Math.min(this.canvasHeight - PADDLE_HEIGHT, this.paddle1Y + this.paddleSpeed * 3);
  }

  movePaddle2Up(): void {
    if (this.gameMode() === 'two-player') {
      this.paddle2Y = Math.max(0, this.paddle2Y - this.paddleSpeed * 3);
    }
  }

  movePaddle2Down(): void {
    if (this.gameMode() === 'two-player') {
      this.paddle2Y = Math.min(this.canvasHeight - PADDLE_HEIGHT, this.paddle2Y + this.paddleSpeed * 3);
    }
  }
}
