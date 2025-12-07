import { Component } from '@angular/core';
import { FloatWindow } from '../float-window/float-window.component';
import { DraggableDirective } from '../../../directives/draggable.directive';
import { CommonModule } from '@angular/common';
import { PixelIconComponent } from '../../shared/pixel-icon/pixel-icon.component';
import { WindowTypes } from '../../../enums/window-types.enum';

interface AppIcon {
  type: WindowTypes;
  icon: string;
  label: string;
  color?: string;
}

@Component({
  selector: 'app-launchpad-window',
  imports: [CommonModule, DraggableDirective, PixelIconComponent],
  templateUrl: 'launchpad-window.component.html',
  styleUrls: ['launchpad-window.component.scss']
})
export class LaunchpadWindowComponent extends FloatWindow {
  apps: AppIcon[] = [
    {
      type: WindowTypes.WALLET,
      icon: 'account_balance_wallet',
      label: 'Wallet',
      color: '#8B5CF6'
    },
    {
      type: WindowTypes.MINT_CTA,
      icon: 'shopping_cart',
      label: 'Get NFT',
      color: '#F59E0B'
    },
    {
      type: WindowTypes.CALCULATOR,
      icon: 'calculate',
      label: 'Calculator',
      color: '#10B981'
    },
    {
      type: WindowTypes.GALLERY,
      icon: 'photo',
      label: 'Gallery',
      color: '#FF6B6B'
    },
    {
      type: WindowTypes.NOTEPAD,
      icon: 'description',
      label: 'Notepad',
      color: '#4ECDC4'
    },
    {
      type: WindowTypes.TETRIS,
      icon: 'videogame_asset',
      label: 'Tetris',
      color: '#95E1D3'
    },
    {
      type: WindowTypes.MEMORY_MATCH,
      icon: 'grid_view',
      label: 'Memory',
      color: '#EC4899'
    },
    {
      type: WindowTypes.SNAKE,
      icon: 'pest_control',
      label: 'Snake',
      color: '#22C55E'
    },
    {
      type: WindowTypes.POLL,
      icon: 'how_to_vote',
      label: 'Poll',
      color: '#3B82F6'
    },
    {
      type: WindowTypes.SLOT_MACHINE,
      icon: 'casino',
      label: 'Slots',
      color: '#F59E0B'
    },
    {
      type: WindowTypes.PONG,
      icon: 'sports_esports',
      label: 'Pong',
      color: '#6366F1'
    },
    {
      type: WindowTypes.MINESWEEPER,
      icon: 'grid_3x3',
      label: 'Minesweeper',
      color: '#64748B'
    },
    {
      type: WindowTypes.GAME_2048,
      icon: 'filter_2',
      label: '2048',
      color: '#EAB308'
    },
    {
      type: WindowTypes.BREAKOUT,
      icon: 'sports_tennis',
      label: 'Breakout',
      color: '#EF4444'
    },
    {
      type: WindowTypes.FLAPPY_RAVEN,
      icon: 'flutter_dash',
      label: 'Flappy Raven',
      color: '#1F2937'
    },
    {
      type: WindowTypes.NFT_SHOWCASE,
      icon: 'collections',
      label: 'NFT Gallery',
      color: '#8B5CF6'
    },
    {
      type: WindowTypes.LEADERBOARD,
      icon: 'leaderboard',
      label: 'Leaderboard',
      color: '#F59E0B'
    },
    {
      type: WindowTypes.RARITY_CHECKER,
      icon: 'star_rate',
      label: 'Rarity',
      color: '#EC4899'
    }
  ];

  onAppClick(appType: WindowTypes) {
    // Emit the app type through the close event emitter
    this.closeEvent.emit(appType as any);
  }

  constructor() {
    super();
    this.title = 'Launch Pad';
    this.width.set(500);
    this.height.set(400);
  }
}
