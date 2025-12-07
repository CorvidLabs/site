import { Component, signal, ChangeDetectionStrategy, HostListener, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { FloatWindow } from '../float-window/float-window.component';
import { DraggableDirective } from '../../../directives/draggable.directive';
import { CommonModule } from '@angular/common';
import { PixelIconComponent } from '../../shared/pixel-icon/pixel-icon.component';

type GameState = 'ready' | 'playing' | 'lost';

interface Pipe {
  x: number;
  gapY: number;
  passed: boolean;
}

const STORAGE_KEY = 'corvid_flappy_best';
const CANVAS_WIDTH = 320;
const CANVAS_HEIGHT = 480;
const RAVEN_SIZE = 30;
const RAVEN_X = 60;
const GRAVITY = 0.5;
const FLAP_STRENGTH = -8;
const PIPE_WIDTH = 50;
const PIPE_GAP = 140;
const PIPE_SPEED = 3;
const PIPE_SPAWN_INTERVAL = 100;

@Component({
  selector: 'app-flappy-raven-window',
  imports: [CommonModule, DraggableDirective, PixelIconComponent],
  templateUrl: 'flappy-raven-window.component.html',
  styleUrls: ['flappy-raven-window.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlappyRavenWindowComponent extends FloatWindow implements AfterViewInit, OnDestroy {
  @ViewChild('gameCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  gameState = signal<GameState>('ready');
  score = signal(0);
  bestScore = signal(0);

  private ctx!: CanvasRenderingContext2D;
  private animationId: number | null = null;

  private ravenY = 0;
  private ravenVelocity = 0;
  private ravenRotation = 0;
  private pipes: Pipe[] = [];
  private frameCount = 0;
  private flapAnimation = 0;

  constructor() {
    super();
    this.title = 'Flappy Raven';
    this.width.set(370);
    this.height.set(600);
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
    this.ravenY = CANVAS_HEIGHT / 2 - RAVEN_SIZE / 2;
    this.ravenVelocity = 0;
    this.ravenRotation = 0;
    this.pipes = [];
    this.frameCount = 0;
    this.score.set(0);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === ' ' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.flap();
    }
  }

  onCanvasClick(): void {
    this.flap();
  }

  private flap(): void {
    if (this.gameState() === 'ready') {
      this.startGame();
    } else if (this.gameState() === 'playing') {
      this.ravenVelocity = FLAP_STRENGTH;
      this.flapAnimation = 10;
    } else if (this.gameState() === 'lost') {
      this.resetGame();
      this.gameState.set('ready');
      this.draw();
    }
  }

  startGame(): void {
    this.resetGame();
    this.gameState.set('playing');
    this.gameLoop();
  }

  private stopGame(): void {
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
    this.frameCount++;
    if (this.flapAnimation > 0) this.flapAnimation--;

    // Apply gravity
    this.ravenVelocity += GRAVITY;
    this.ravenY += this.ravenVelocity;

    // Calculate rotation based on velocity
    this.ravenRotation = Math.min(Math.max(this.ravenVelocity * 3, -30), 90);

    // Spawn pipes
    if (this.frameCount % PIPE_SPAWN_INTERVAL === 0) {
      const minGapY = 80;
      const maxGapY = CANVAS_HEIGHT - PIPE_GAP - 80;
      const gapY = Math.random() * (maxGapY - minGapY) + minGapY;
      this.pipes.push({
        x: CANVAS_WIDTH,
        gapY,
        passed: false
      });
    }

    // Update pipes
    for (let i = this.pipes.length - 1; i >= 0; i--) {
      const pipe = this.pipes[i];
      pipe.x -= PIPE_SPEED;

      // Check if passed
      if (!pipe.passed && pipe.x + PIPE_WIDTH < RAVEN_X) {
        pipe.passed = true;
        this.score.update(s => s + 1);
      }

      // Remove off-screen pipes
      if (pipe.x + PIPE_WIDTH < 0) {
        this.pipes.splice(i, 1);
      }
    }

    // Check collisions
    if (this.checkCollision()) {
      this.gameOver();
    }
  }

  private checkCollision(): boolean {
    // Floor and ceiling
    if (this.ravenY < 0 || this.ravenY + RAVEN_SIZE > CANVAS_HEIGHT) {
      return true;
    }

    // Pipes
    const ravenLeft = RAVEN_X;
    const ravenRight = RAVEN_X + RAVEN_SIZE;
    const ravenTop = this.ravenY;
    const ravenBottom = this.ravenY + RAVEN_SIZE;

    for (const pipe of this.pipes) {
      const pipeLeft = pipe.x;
      const pipeRight = pipe.x + PIPE_WIDTH;

      // Check if raven is horizontally aligned with pipe
      if (ravenRight > pipeLeft && ravenLeft < pipeRight) {
        // Check collision with top pipe
        if (ravenTop < pipe.gapY) {
          return true;
        }
        // Check collision with bottom pipe
        if (ravenBottom > pipe.gapY + PIPE_GAP) {
          return true;
        }
      }
    }

    return false;
  }

  private gameOver(): void {
    this.stopGame();
    this.gameState.set('lost');
    this.saveBestScore(this.score());
    this.draw();
  }

  private draw(): void {
    if (!this.ctx) return;

    // Sky gradient
    const skyGradient = this.ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    skyGradient.addColorStop(0, '#1e3a5f');
    skyGradient.addColorStop(1, '#0f172a');
    this.ctx.fillStyle = skyGradient;
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw pipes
    for (const pipe of this.pipes) {
      this.drawPipe(pipe);
    }

    // Draw raven
    this.drawRaven();

    // Draw score
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 36px system-ui';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(this.score().toString(), CANVAS_WIDTH / 2, 60);
  }

  private drawPipe(pipe: Pipe): void {
    const gradient = this.ctx.createLinearGradient(pipe.x, 0, pipe.x + PIPE_WIDTH, 0);
    gradient.addColorStop(0, '#22c55e');
    gradient.addColorStop(0.5, '#16a34a');
    gradient.addColorStop(1, '#15803d');

    // Top pipe
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.gapY);

    // Top pipe cap
    this.ctx.fillRect(pipe.x - 3, pipe.gapY - 25, PIPE_WIDTH + 6, 25);

    // Bottom pipe
    this.ctx.fillRect(pipe.x, pipe.gapY + PIPE_GAP, PIPE_WIDTH, CANVAS_HEIGHT - pipe.gapY - PIPE_GAP);

    // Bottom pipe cap
    this.ctx.fillRect(pipe.x - 3, pipe.gapY + PIPE_GAP, PIPE_WIDTH + 6, 25);

    // Pipe highlights
    this.ctx.fillStyle = 'rgba(255,255,255,0.2)';
    this.ctx.fillRect(pipe.x + 3, 0, 8, pipe.gapY - 25);
    this.ctx.fillRect(pipe.x + 3, pipe.gapY + PIPE_GAP + 25, 8, CANVAS_HEIGHT);
  }

  private drawRaven(): void {
    this.ctx.save();
    this.ctx.translate(RAVEN_X + RAVEN_SIZE / 2, this.ravenY + RAVEN_SIZE / 2);
    this.ctx.rotate((this.ravenRotation * Math.PI) / 180);

    // Body
    this.ctx.fillStyle = '#1f2937';
    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, RAVEN_SIZE / 2, RAVEN_SIZE / 2.5, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Wing
    this.ctx.fillStyle = '#374151';
    const wingOffset = this.flapAnimation > 5 ? -5 : 3;
    this.ctx.beginPath();
    this.ctx.ellipse(-3, wingOffset, RAVEN_SIZE / 3, RAVEN_SIZE / 4, -0.3, 0, Math.PI * 2);
    this.ctx.fill();

    // Head
    this.ctx.fillStyle = '#1f2937';
    this.ctx.beginPath();
    this.ctx.arc(RAVEN_SIZE / 3, -RAVEN_SIZE / 6, RAVEN_SIZE / 3.5, 0, Math.PI * 2);
    this.ctx.fill();

    // Beak
    this.ctx.fillStyle = '#f59e0b';
    this.ctx.beginPath();
    this.ctx.moveTo(RAVEN_SIZE / 2, -RAVEN_SIZE / 6);
    this.ctx.lineTo(RAVEN_SIZE / 2 + 10, -RAVEN_SIZE / 8);
    this.ctx.lineTo(RAVEN_SIZE / 2, -RAVEN_SIZE / 12);
    this.ctx.closePath();
    this.ctx.fill();

    // Eye
    this.ctx.fillStyle = '#fff';
    this.ctx.beginPath();
    this.ctx.arc(RAVEN_SIZE / 3 + 3, -RAVEN_SIZE / 5, 4, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#000';
    this.ctx.beginPath();
    this.ctx.arc(RAVEN_SIZE / 3 + 4, -RAVEN_SIZE / 5, 2, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }
}
