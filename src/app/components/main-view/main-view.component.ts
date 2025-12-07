import { Component, ComponentRef, ViewChild, ViewContainerRef, signal, isDevMode } from '@angular/core';
import { PixelIconComponent } from '../shared/pixel-icon/pixel-icon.component';
import { WindowTypes } from '../../enums/window-types.enum';
import { FloatWindow } from '../windows/float-window/float-window.component';
import { GalleryWindowComponent } from '../windows/gallery-window/gallery-window.component';
import { PlayerWindowComponent } from '../windows/player-window/player-window.component';
import { SettingsWindowComponent } from '../windows/settings-window/settings-window.component';
import { NotepadWindowComponent } from '../windows/notepad-window/notepad-window.component';
import { TetrisWindowComponent } from '../windows/tetris-window/tetris-window.component';
import { LaunchpadWindowComponent } from '../windows/launchpad-window/launchpad-window.component';
import { WalletWindowComponent } from '../windows/wallet-window/wallet-window.component';
import { MintCtaWindowComponent } from '../windows/mint-cta-window/mint-cta-window.component';
import { CalculatorWindowComponent } from '../windows/calculator-window/calculator-window.component';
import { MemoryMatchWindowComponent } from '../windows/memory-match-window/memory-match-window.component';
import { SnakeWindowComponent } from '../windows/snake-window/snake-window.component';
import { PollWindowComponent } from '../windows/poll-window/poll-window.component';
import { SlotMachineWindowComponent } from '../windows/slot-machine-window/slot-machine-window.component';
import { PongWindowComponent } from '../windows/pong-window/pong-window.component';
import { MinesweeperWindowComponent } from '../windows/minesweeper-window/minesweeper-window.component';
import { Game2048WindowComponent } from '../windows/game-2048-window/game-2048-window.component';
import { BreakoutWindowComponent } from '../windows/breakout-window/breakout-window.component';
import { FlappyRavenWindowComponent } from '../windows/flappy-raven-window/flappy-raven-window.component';
import { NftShowcaseWindowComponent } from '../windows/nft-showcase-window/nft-showcase-window.component';
import { LeaderboardWindowComponent } from '../windows/leaderboard-window/leaderboard-window.component';
import { RarityCheckerWindowComponent } from '../windows/rarity-checker-window/rarity-checker-window.component';
import { StyleguideWindowComponent } from '../windows/styleguide-window/styleguide-window.component';
import { LoginPromptComponent } from '../login-prompt/login-prompt.component';
import { PeraWalletConnect } from '@perawallet/connect';
import { AlgorandChainIDs, PeraWalletConnectOptions } from '../../interfaces/pera-wallet-connect-options';
import { CommonModule } from '@angular/common';

interface DockItem {
  type: WindowTypes;
  icon: string;
  label: string;
}

@Component({
  selector: 'app-main-view',
  templateUrl: 'main-view.component.html',
  styleUrls: ['main-view.component.scss'],
  imports: [PixelIconComponent, LoginPromptComponent, CommonModule]
})
export class MainViewComponent {
  // 1. Get a reference to the template element where we will host our dynamic components.
  @ViewChild('windowHost', { read: ViewContainerRef, static: false }) windowHost!: ViewContainerRef;

  openedWindows: ComponentRef<FloatWindow>[] = [];

  // Dock items - starts with only LaunchPad and Settings (+ Style Guide in dev mode)
  dockItems = signal<DockItem[]>([
    { type: WindowTypes.LAUNCHPAD, icon: 'grid_view', label: 'Launch Pad' },
    { type: WindowTypes.SETTINGS, icon: 'settings', label: 'Settings' },
    ...(isDevMode() ? [{ type: WindowTypes.STYLEGUIDE, icon: 'sliders', label: 'Style Guide' }] : [])
  ]);
  
  // Pera Wallet Connect Setup
  peraWalletConnectOptions: PeraWalletConnectOptions = {
    shouldShowSignTxnToast: true,
    chainId: AlgorandChainIDs.TestNet // Using TestNet for development
  };
  
  peraWalletConnect: PeraWalletConnect = new PeraWalletConnect(this.peraWalletConnectOptions);
  userAccountAddress = signal<string | null>(null);
  isAuthenticated = signal(false);
  // End Pera Wallet Connect Setup

  constructor() {}

  onLoginSuccess(accountAddress: string | null): void {
    if (!accountAddress) {
      this.isAuthenticated.set(false);
      return;
    }

    this.isAuthenticated.set(true);
    this.userAccountAddress.set(accountAddress);
  }

  handleDisconnectWallet(event: Event): void {
    event?.preventDefault();

    this.peraWalletConnect.disconnect().catch(error => {
      console.error('Error disconnecting wallet:', error);
    });

    this.userAccountAddress.set(null);
    this.isAuthenticated.set(false);
  }

  // MARK: - Window Management
  openWindow() {
    // For a real desktop, you'd want to manage multiple windows.

    // 2. Create an instance of the component you want to show.
    const componentRef = this.windowHost.createComponent(FloatWindow);

    // 3. Subscribe to the close event to destroy the component when requested.
    const closeSub = componentRef.instance.closeEvent.subscribe(() => {
      this.closeWindow(componentRef);
      closeSub.unsubscribe();
    });

    // 4. Keep track of the created component.
    this.openedWindows.push(componentRef);
  }

  closeWindow(componentRef: ComponentRef<FloatWindow>) {
    const index = this.openedWindows.indexOf(componentRef);
    if (index > -1) {
      this.openedWindows.splice(index, 1);
      componentRef.destroy();

      // Remove from dock if it's not LaunchPad or Settings
      this.updateDockItems();
    }
  }

  private updateDockItems() {
    const currentDockItems = this.dockItems();
    const updatedDockItems: DockItem[] = [
      { type: WindowTypes.LAUNCHPAD, icon: 'grid_view', label: 'Launch Pad' },
      { type: WindowTypes.SETTINGS, icon: 'settings', label: 'Settings' },
      ...(isDevMode() ? [{ type: WindowTypes.STYLEGUIDE, icon: 'sliders', label: 'Style Guide' }] : [])
    ];

    // Add items for currently open windows (except LaunchPad and Settings which are always shown)
    this.openedWindows.forEach(windowRef => {
      const windowType = this.getWindowType(windowRef);
      if (windowType && windowType !== WindowTypes.LAUNCHPAD && windowType !== WindowTypes.SETTINGS) {
        const dockItem = this.getDockItemForType(windowType);
        if (dockItem && !updatedDockItems.find(item => item.type === windowType)) {
          updatedDockItems.push(dockItem);
        }
      }
    });

    this.dockItems.set(updatedDockItems);
  }

  private getWindowType(componentRef: ComponentRef<FloatWindow>): WindowTypes | null {
    if (componentRef.instance instanceof GalleryWindowComponent) return WindowTypes.GALLERY;
    if (componentRef.instance instanceof NotepadWindowComponent) return WindowTypes.NOTEPAD;
    if (componentRef.instance instanceof TetrisWindowComponent) return WindowTypes.TETRIS;
    if (componentRef.instance instanceof SettingsWindowComponent) return WindowTypes.SETTINGS;
    if (componentRef.instance instanceof LaunchpadWindowComponent) return WindowTypes.LAUNCHPAD;
    if (componentRef.instance instanceof WalletWindowComponent) return WindowTypes.WALLET;
    if (componentRef.instance instanceof MintCtaWindowComponent) return WindowTypes.MINT_CTA;
    if (componentRef.instance instanceof CalculatorWindowComponent) return WindowTypes.CALCULATOR;
    if (componentRef.instance instanceof MemoryMatchWindowComponent) return WindowTypes.MEMORY_MATCH;
    if (componentRef.instance instanceof SnakeWindowComponent) return WindowTypes.SNAKE;
    if (componentRef.instance instanceof PollWindowComponent) return WindowTypes.POLL;
    if (componentRef.instance instanceof SlotMachineWindowComponent) return WindowTypes.SLOT_MACHINE;
    if (componentRef.instance instanceof PongWindowComponent) return WindowTypes.PONG;
    if (componentRef.instance instanceof MinesweeperWindowComponent) return WindowTypes.MINESWEEPER;
    if (componentRef.instance instanceof Game2048WindowComponent) return WindowTypes.GAME_2048;
    if (componentRef.instance instanceof BreakoutWindowComponent) return WindowTypes.BREAKOUT;
    if (componentRef.instance instanceof FlappyRavenWindowComponent) return WindowTypes.FLAPPY_RAVEN;
    if (componentRef.instance instanceof NftShowcaseWindowComponent) return WindowTypes.NFT_SHOWCASE;
    if (componentRef.instance instanceof LeaderboardWindowComponent) return WindowTypes.LEADERBOARD;
    if (componentRef.instance instanceof RarityCheckerWindowComponent) return WindowTypes.RARITY_CHECKER;
    if (componentRef.instance instanceof StyleguideWindowComponent) return WindowTypes.STYLEGUIDE;
    return null;
  }

  private getDockItemForType(type: WindowTypes): DockItem | null {
    const iconMap: Record<WindowTypes, { icon: string, label: string }> = {
      [WindowTypes.LAUNCHPAD]: { icon: 'grid_view', label: 'Launch Pad' },
      [WindowTypes.GALLERY]: { icon: 'photo', label: 'Gallery' },
      [WindowTypes.NOTEPAD]: { icon: 'description', label: 'Notepad' },
      [WindowTypes.TETRIS]: { icon: 'videogame_asset', label: 'Tetris' },
      [WindowTypes.SETTINGS]: { icon: 'settings', label: 'Settings' },
      [WindowTypes.SOUNDCLOUD_PLAYER]: { icon: 'music_note', label: 'Music' },
      [WindowTypes.ABOUT]: { icon: 'info', label: 'About' },
      [WindowTypes.WALLET]: { icon: 'account_balance_wallet', label: 'Wallet' },
      [WindowTypes.MINT_CTA]: { icon: 'shopping_cart', label: 'Get NFT' },
      [WindowTypes.CALCULATOR]: { icon: 'calculate', label: 'Calculator' },
      [WindowTypes.MEMORY_MATCH]: { icon: 'grid_view', label: 'Memory' },
      [WindowTypes.SNAKE]: { icon: 'pest_control', label: 'Snake' },
      [WindowTypes.POLL]: { icon: 'how_to_vote', label: 'Poll' },
      [WindowTypes.SLOT_MACHINE]: { icon: 'casino', label: 'Slots' },
      [WindowTypes.PONG]: { icon: 'sports_esports', label: 'Pong' },
      [WindowTypes.MINESWEEPER]: { icon: 'grid_3x3', label: 'Minesweeper' },
      [WindowTypes.GAME_2048]: { icon: 'filter_2', label: '2048' },
      [WindowTypes.BREAKOUT]: { icon: 'sports_tennis', label: 'Breakout' },
      [WindowTypes.FLAPPY_RAVEN]: { icon: 'flutter_dash', label: 'Flappy Raven' },
      [WindowTypes.NFT_SHOWCASE]: { icon: 'collections', label: 'NFT Showcase' },
      [WindowTypes.LEADERBOARD]: { icon: 'leaderboard', label: 'Leaderboard' },
      [WindowTypes.RARITY_CHECKER]: { icon: 'star_rate', label: 'Rarity' },
      [WindowTypes.STYLEGUIDE]: { icon: 'sliders', label: 'Style Guide' }
    };

    const config = iconMap[type];
    return config ? { type, icon: config.icon, label: config.label } : null;
  }

  openOrCreateWindowAdvanced<T extends FloatWindow>(component: { new (...args: any[]): T}): ComponentRef<T> {
    console.log('Opening or creating window of type:', component.name);
    const existingComponentRef = this.openedWindows.find(ref => ref.instance instanceof component) as ComponentRef<T>;

    const componentRef = existingComponentRef ?? this.windowHost.createComponent(component);

    // If its an existing window, just bring it to front
    if (existingComponentRef) {
      componentRef.instance.bringWindowToFront();
      return componentRef;
    }

    // Set a cascading initial position for new windows
    const offset = this.openedWindows.length * 30;
    componentRef.instance.initialPosition = { x: 50 + offset, y: 50 + offset };

    const closeSub = componentRef.instance.closeEvent.subscribe(() => {
      this.closeWindow(componentRef);
      closeSub.unsubscribe();
    });

    this.openedWindows.push(componentRef);

    // Update dock to show this window
    this.updateDockItems();

    return componentRef;
  }

  // Advanced version with generics
  openWindowAdvanced<T extends FloatWindow>(component: { new (...args: any[]): T }): ComponentRef<T> {
    console.log('Opening window of type:', component.name);

    const componentRef = this.windowHost.createComponent(component);

    // Set a cascading initial position for new windows
    const offset = this.openedWindows.length * 30;
    componentRef.instance.initialPosition = { x: 50 + offset, y: 50 + offset };

    const closeSub = componentRef.instance.closeEvent.subscribe(() => {
      this.closeWindow(componentRef);
      closeSub.unsubscribe();
    });

    this.openedWindows.push(componentRef);

    // Update dock to show this window
    this.updateDockItems();

    return componentRef;
  }

  openWindowByType(type: string) {
    switch (type) {
      case WindowTypes.LAUNCHPAD:
        const launchpadRef = this.openOrCreateWindowAdvanced<LaunchpadWindowComponent>(LaunchpadWindowComponent);
        // Handle app selection from the Launch Pad
        // We need to hook into the event emitter differently since LaunchPad emits app types
        launchpadRef.instance.closeEvent.subscribe((appType: any) => {
          if (appType && typeof appType === 'string') {
            // This is an app selection event from LaunchPad
            this.openWindowByType(appType);
          }
        });
        break;
      case WindowTypes.GALLERY:
        this.openOrCreateWindowAdvanced<GalleryWindowComponent>(GalleryWindowComponent);
        break;
      case WindowTypes.SETTINGS:
        this.openOrCreateWindowAdvanced<SettingsWindowComponent>(SettingsWindowComponent);
        break;
      case WindowTypes.NOTEPAD:
        this.openWindowAdvanced<NotepadWindowComponent>(NotepadWindowComponent);
        break;
      case WindowTypes.TETRIS:
        this.openWindowAdvanced<TetrisWindowComponent>(TetrisWindowComponent);
        break;
      case WindowTypes.WALLET:
        this.openWalletWindow();
        break;
      case WindowTypes.MINT_CTA:
        this.openOrCreateWindowAdvanced<MintCtaWindowComponent>(MintCtaWindowComponent);
        break;
      case WindowTypes.CALCULATOR:
        this.openOrCreateWindowAdvanced<CalculatorWindowComponent>(CalculatorWindowComponent);
        break;
      case WindowTypes.MEMORY_MATCH:
        this.openWindowAdvanced<MemoryMatchWindowComponent>(MemoryMatchWindowComponent);
        break;
      case WindowTypes.SNAKE:
        this.openWindowAdvanced<SnakeWindowComponent>(SnakeWindowComponent);
        break;
      case WindowTypes.POLL:
        this.openOrCreateWindowAdvanced<PollWindowComponent>(PollWindowComponent);
        break;
      case WindowTypes.SLOT_MACHINE:
        this.openWindowAdvanced<SlotMachineWindowComponent>(SlotMachineWindowComponent);
        break;
      case WindowTypes.PONG:
        this.openWindowAdvanced<PongWindowComponent>(PongWindowComponent);
        break;
      case WindowTypes.MINESWEEPER:
        this.openWindowAdvanced<MinesweeperWindowComponent>(MinesweeperWindowComponent);
        break;
      case WindowTypes.GAME_2048:
        this.openWindowAdvanced<Game2048WindowComponent>(Game2048WindowComponent);
        break;
      case WindowTypes.BREAKOUT:
        this.openWindowAdvanced<BreakoutWindowComponent>(BreakoutWindowComponent);
        break;
      case WindowTypes.FLAPPY_RAVEN:
        this.openWindowAdvanced<FlappyRavenWindowComponent>(FlappyRavenWindowComponent);
        break;
      case WindowTypes.NFT_SHOWCASE:
        this.openNftShowcaseWindow();
        break;
      case WindowTypes.LEADERBOARD:
        this.openLeaderboardWindow();
        break;
      case WindowTypes.RARITY_CHECKER:
        this.openOrCreateWindowAdvanced<RarityCheckerWindowComponent>(RarityCheckerWindowComponent);
        break;
      case WindowTypes.STYLEGUIDE:
        this.openOrCreateWindowAdvanced<StyleguideWindowComponent>(StyleguideWindowComponent);
        break;

      // case WindowTypes.ABOUT:
      //   this.openWindowAdvanced(AboutWindowComponent);
      //   break;
      // case WindowTypes.SOUNDCLOUD_PLAYER:  // NOTE: Removed till a new music api is implemented
      //   this.openOrCreateWindowAdvanced<PlayerWindowComponent>(PlayerWindowComponent);
      //   break;
    }
  }

  private openWalletWindow(): void {
    const existingRef = this.openedWindows.find(ref => ref.instance instanceof WalletWindowComponent);

    if (existingRef) {
      existingRef.instance.bringWindowToFront();
      return;
    }

    const componentRef = this.windowHost.createComponent(WalletWindowComponent);

    // Pass the current wallet address to the component
    componentRef.setInput('walletAddress', this.userAccountAddress());

    const offset = this.openedWindows.length * 30;
    componentRef.instance.initialPosition = { x: 50 + offset, y: 50 + offset };

    const closeSub = componentRef.instance.closeEvent.subscribe(() => {
      this.closeWindow(componentRef);
      closeSub.unsubscribe();
    });

    this.openedWindows.push(componentRef);
    this.updateDockItems();
  }

  private openNftShowcaseWindow(): void {
    const existingRef = this.openedWindows.find(ref => ref.instance instanceof NftShowcaseWindowComponent);

    if (existingRef) {
      existingRef.instance.bringWindowToFront();
      return;
    }

    const componentRef = this.windowHost.createComponent(NftShowcaseWindowComponent);

    // Pass the current wallet address to the component
    componentRef.setInput('walletAddress', this.userAccountAddress());

    const offset = this.openedWindows.length * 30;
    componentRef.instance.initialPosition = { x: 50 + offset, y: 50 + offset };

    const closeSub = componentRef.instance.closeEvent.subscribe(() => {
      this.closeWindow(componentRef);
      closeSub.unsubscribe();
    });

    this.openedWindows.push(componentRef);
    this.updateDockItems();
  }

  private openLeaderboardWindow(): void {
    const existingRef = this.openedWindows.find(ref => ref.instance instanceof LeaderboardWindowComponent);

    if (existingRef) {
      existingRef.instance.bringWindowToFront();
      return;
    }

    const componentRef = this.windowHost.createComponent(LeaderboardWindowComponent);

    // Pass the current wallet address to the component
    componentRef.setInput('walletAddress', this.userAccountAddress());

    const offset = this.openedWindows.length * 30;
    componentRef.instance.initialPosition = { x: 50 + offset, y: 50 + offset };

    const closeSub = componentRef.instance.closeEvent.subscribe(() => {
      this.closeWindow(componentRef);
      closeSub.unsubscribe();
    });

    this.openedWindows.push(componentRef);
    this.updateDockItems();
  }
}