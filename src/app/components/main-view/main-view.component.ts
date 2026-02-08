import { CommonModule } from '@angular/common';
import { Component, ComponentRef, ViewChild, ViewContainerRef, inject, signal } from '@angular/core';
import { PeraWalletConnect } from '@perawallet/connect';
import { WindowTypes } from '../../enums/window-types.enum';
import { AlgorandChainIDs, PeraWalletConnectOptions } from '../../interfaces/pera-wallet-connect-options';
import { LoginOverlayComponent } from '../overlays/login-overlay/login-overlay.component';
import { PixelIconComponent } from '../shared/pixel-icon/pixel-icon.component';
import { AboutWindowComponent } from '../windows/about-window/about-window.component';
import { BreakoutWindowComponent } from '../windows/breakout-window/breakout-window.component';
import { FloatWindow } from '../windows/float-window/float-window.component';
import { GalleryWindowComponent } from '../windows/gallery-window/gallery-window.component';
import { LaunchpadWindowComponent } from '../windows/launchpad-window/launchpad-window.component';
import { MonoWindowComponent } from '../windows/mono-window/mono-window.component';
import { NotepadWindowComponent } from '../windows/notepad-window/notepad-window.component';
import { RoadmapWindowComponent } from '../windows/roadmap-window/roadmap-window.component';
import { SettingsWindowComponent } from '../windows/settings-window/settings-window.component';
import { StyleGuideWindowComponent } from '../windows/style-guide-window/style-guide-window.component';
import { TetrisWindowComponent } from '../windows/tetris-window/tetris-window.component';
import { AssetService } from '../../services/asset.service';

interface DockItem {
  type: WindowTypes;
  icon: string;
  imgIcon?: string;
  label: string;
}

@Component({
  selector: 'app-main-view',
  templateUrl: 'main-view.component.html',
  styleUrls: ['main-view.component.scss'],
  imports: [PixelIconComponent, CommonModule]
})
export class MainViewComponent {
  // 1. Get a reference to the template element where we will host our dynamic components.
  @ViewChild('windowHost', { read: ViewContainerRef, static: false }) windowHost!: ViewContainerRef;
  @ViewChild('launchpadDrawerHost', { read: ViewContainerRef, static: false }) launchpadDrawerHost!: ViewContainerRef;
  @ViewChild('loginOverlayHost', { read: ViewContainerRef, static: false }) loginOverlayHost!: ViewContainerRef;

  openedWindows: ComponentRef<FloatWindow>[] = [];

  // Launchpad drawer state
  launchpadDrawerOpen = signal<boolean>(false);
  launchpadDrawerRef: ComponentRef<LaunchpadWindowComponent> | null = null;

  // Login overlay state
  loginOverlayRef: ComponentRef<LoginOverlayComponent> | null = null;

  // Settings window state
  settingsWindowRef: ComponentRef<SettingsWindowComponent> | null = null;

  // Dock items - starts with only LaunchPad and Settings
  dockItems = signal<DockItem[]>([
    { type: WindowTypes.LAUNCHPAD, icon: 'apps', label: 'Launch Pad' },
    { type: WindowTypes.SETTINGS, icon: 'settings', label: 'Settings' }
  ]);

  iconMap: Record<WindowTypes, { icon: string, label: string, imgIcon?: string }>;
  
  // Pera Wallet Connect Setup
  peraWalletConnectOptions: PeraWalletConnectOptions = {
    shouldShowSignTxnToast: true,
    chainId: AlgorandChainIDs.TestNet // Using TestNet for development
  };
  
  peraWalletConnect: PeraWalletConnect = new PeraWalletConnect(this.peraWalletConnectOptions);
  userAccountAddress = signal<string | null>(null);
  isAuthenticated = signal(false);
  // End Pera Wallet Connect Setup

  assetService: AssetService = inject(AssetService);

  constructor() {
    this.iconMap = {
      [WindowTypes.LAUNCHPAD]: { icon: 'apps', label: 'Launch Pad' },
      [WindowTypes.GALLERY]: { icon: 'photo', label: 'Gallery' },
      [WindowTypes.NOTEPAD]: { icon: 'description', label: 'Notepad' },
      [WindowTypes.TETRIS]: { icon: 'videogame_asset', label: 'Tetris' },
      [WindowTypes.SETTINGS]: { icon: 'settings', label: 'Settings' },
      [WindowTypes.SOUNDCLOUD_PLAYER]: { icon: 'music_note', label: 'Music' },
      [WindowTypes.ABOUT]: { icon: 'info', label: 'About' },
      [WindowTypes.STYLE_GUIDE]: { icon: 'colors-swatch', label: 'Styles Guide' },
      [WindowTypes.LOGIN]: { icon: 'login', label: 'Login' },
      [WindowTypes.MINT_CTA]: { icon: 'diamond', label: 'Mint' },
      [WindowTypes.CALCULATOR]: { icon: 'calculate', label: 'Calculator' },
      [WindowTypes.MEMORY_MATCH]: { icon: 'memory', label: 'Memory Match' },
      [WindowTypes.SNAKE]: { icon: 'snake', label: 'Snake' },
      [WindowTypes.POLL]: { icon: 'poll', label: 'Poll' },
      [WindowTypes.SLOT_MACHINE]: { icon: 'casino', label: 'Slot Machine' },
      [WindowTypes.PONG]: { icon: 'sports_esports', label: 'Pong' },
      [WindowTypes.MINESWEEPER]: { icon: 'grid_on', label: 'Minesweeper' },
      [WindowTypes.GAME_2048]: { icon: 'view_module', label: '2048' },
      [WindowTypes.BREAKOUT]: { icon: 'videogame_asset', label: 'Breakout' },
      [WindowTypes.FLAPPY_RAVEN]: { icon: 'flight', label: 'Flappy Raven' },
      [WindowTypes.NFT_SHOWCASE]: { icon: 'collections', label: 'NFT Showcase' },
      [WindowTypes.LEADERBOARD]: { icon: 'leaderboard', label: 'Leaderboard' },
      [WindowTypes.RARITY_CHECKER]: { icon: 'star_rate', label: 'Rarity Checker' },
      [WindowTypes.ROADMAP]: { icon: 'map', label: 'Roadmap' },
      [WindowTypes.MONO]: { icon: 'work_outline', label: 'Mono', imgIcon: 'icons/mono-icon.png' },
    };
  }

  onLoginSuccess(accountAddress: string | null): void {
    if (!accountAddress) {
      this.isAuthenticated.set(false);
      this.userAccountAddress.set(null);

      // Update settings window if open
      if (this.settingsWindowRef) {
        this.settingsWindowRef.setInput('isAuthenticated', false);
        this.settingsWindowRef.setInput('userAccountAddress', null);
      }
      return;
    }

    this.isAuthenticated.set(true);
    this.userAccountAddress.set(accountAddress);

    // Update settings window if open
    if (this.settingsWindowRef) {
      this.settingsWindowRef.setInput('isAuthenticated', true);
      this.settingsWindowRef.setInput('userAccountAddress', accountAddress);
    }
  }

  handleDisconnectWallet(): void {
    this.userAccountAddress.set(null);
    this.isAuthenticated.set(false);

    // Update settings window inputs if it's open
    if (this.settingsWindowRef) {
      this.settingsWindowRef.setInput('isAuthenticated', false);
      this.settingsWindowRef.setInput('userAccountAddress', null);
    }
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
      // Clear settings reference if closing settings window
      if (componentRef.instance instanceof SettingsWindowComponent) {
        this.settingsWindowRef = null;
      }

      this.openedWindows.splice(index, 1);
      componentRef.destroy();

      // Remove from dock if it's not LaunchPad or Settings
      this.updateDockItems();
    }
  }

  private updateDockItems() {
    const currentDockItems = this.dockItems();
    const updatedDockItems: DockItem[] = [
      { type: WindowTypes.LAUNCHPAD, icon: 'apps', label: 'Launch Pad' },
      { type: WindowTypes.SETTINGS, icon: 'settings', label: 'Settings' }
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
    if (componentRef.instance instanceof BreakoutWindowComponent) return WindowTypes.BREAKOUT;
    if (componentRef.instance instanceof AboutWindowComponent) return WindowTypes.ABOUT;
    if (componentRef.instance instanceof RoadmapWindowComponent) return WindowTypes.ROADMAP;
    if (componentRef.instance instanceof MonoWindowComponent) return WindowTypes.MONO;
    // LAUNCHPAD is now a drawer, not a window
    if (componentRef.instance instanceof StyleGuideWindowComponent) return WindowTypes.STYLE_GUIDE;
    // LOGIN is now an overlay, not a window
    return null;
  }

  private getDockItemForType(type: WindowTypes): DockItem | null {
    const config = this.iconMap[type];
    return config ? { type, icon: config.icon, label: config.label, imgIcon: config.imgIcon } : null;
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
    componentRef.setInput('initialPosition', { x: 50 + offset, y: 50 + offset });

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
    componentRef.setInput('initialPosition', { x: 50 + offset, y: 50 + offset });

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
    // TODO: Check if I should hide the dock intead when the drawer is openned
    // If launchpad drawer opened, close it
    this.closeLaunchpadDrawer();

    switch (type) {
      case WindowTypes.LAUNCHPAD:
        this.toggleLaunchpadDrawer();
        break;
      case WindowTypes.GALLERY:
        this.openOrCreateWindowAdvanced<GalleryWindowComponent>(GalleryWindowComponent);
        break;
      case WindowTypes.SETTINGS:
        this.setupSettingsWindow();
        break;
      case WindowTypes.NOTEPAD:
        this.openWindowAdvanced(NotepadWindowComponent);
        break;
      case WindowTypes.TETRIS:
        this.openWindowAdvanced(TetrisWindowComponent);
        break;
      case WindowTypes.STYLE_GUIDE:
        this.openOrCreateWindowAdvanced(StyleGuideWindowComponent);
        break;
      case WindowTypes.LOGIN:
        this.showLoginOverlay();
        break;
      case WindowTypes.BREAKOUT:
        this.openOrCreateWindowAdvanced(BreakoutWindowComponent);
        break;
      case WindowTypes.ABOUT:
        this.openWindowAdvanced(AboutWindowComponent);
        break;
      case WindowTypes.ROADMAP:
        this.openWindowAdvanced(RoadmapWindowComponent);
        break;
      case WindowTypes.MONO:
        this.openOrCreateWindowAdvanced(MonoWindowComponent);
        break;
      // case WindowTypes.SOUNDCLOUD_PLAYER:  // NOTE: Removed till a new music api is implemented
      //   this.openOrCreateWindowAdvanced<PlayerWindowComponent>(PlayerWindowComponent);
      //   break;
    }
  }

  // MARK: - Launchpad Drawer Management
  toggleLaunchpadDrawer() {
    if (!this.launchpadDrawerRef) {
      // Create the drawer component
      this.launchpadDrawerRef = this.launchpadDrawerHost.createComponent(LaunchpadWindowComponent);

      // Subscribe to close events
      this.launchpadDrawerRef.instance.closeEvent.subscribe((appType?: WindowTypes | void) => {
        if (appType && typeof appType === 'string') {
          // User selected an app - close drawer and open the app window
          this.closeLaunchpadDrawer();
          setTimeout(() => {
            this.openWindowByType(appType);
          }, 100); // Small delay to allow drawer to close first
        } else {
          // User clicked close button or pressed Escape
          this.closeLaunchpadDrawer();
        }
      });

      // Open the drawer with a small delay to trigger animation
      setTimeout(() => {
        if (this.launchpadDrawerRef) {
          this.launchpadDrawerRef.instance.isOpen.set(true);
          this.launchpadDrawerOpen.set(true);
        }
      }, 10);
    } else {
      // Drawer exists - toggle its state
      const currentState = this.launchpadDrawerRef.instance.isOpen();
      this.launchpadDrawerRef.instance.isOpen.set(!currentState);
      this.launchpadDrawerOpen.set(!currentState);
    }
  }

  closeLaunchpadDrawer() {
    if (this.launchpadDrawerRef) {
      // Set isOpen to false to trigger slide-down animation
      this.launchpadDrawerRef.instance.isOpen.set(false);
      this.launchpadDrawerOpen.set(false);

      // Destroy the component after animation completes (300ms)
      setTimeout(() => {
        if (this.launchpadDrawerRef) {
          this.launchpadDrawerRef.destroy();
          this.launchpadDrawerRef = null;
        }
      }, 300);
    }
  }

  setupSettingsWindow() {
    const settingsRef = this.openOrCreateWindowAdvanced<SettingsWindowComponent>(SettingsWindowComponent);

    // Store reference for later updates
    this.settingsWindowRef = settingsRef;

    // Set inputs
    settingsRef.setInput('peraInstance', this.peraWalletConnect);

    // Pass login state to settings window
    settingsRef.setInput('isAuthenticated', this.isAuthenticated());
    settingsRef.setInput('userAccountAddress', this.userAccountAddress());

    // Handle Change User button from Settings
    settingsRef.instance.closeEvent.subscribe((windowType: any) => {
      if (windowType && typeof windowType === 'string' && windowType === WindowTypes.LOGIN) {
        this.openWindowByType(windowType);
      }
    });

    // Handle logout request from Settings
    settingsRef.instance.logoutRequested.subscribe(() => {
      this.handleDisconnectWallet();
    });
  }

  // MARK: - Login Overlay Management
  showLoginOverlay() {
    // Check for existing instance (prevent duplicates)
    if (this.loginOverlayRef) {
      this.loginOverlayRef.instance.isOpen.set(true);
      return;
    }

    // Create the overlay component
    this.loginOverlayRef = this.loginOverlayHost.createComponent(LoginOverlayComponent);

    // Set inputs
    this.loginOverlayRef.setInput('peraInstance', this.peraWalletConnect);

    // Subscribe to login success
    this.loginOverlayRef.instance.loginSuccess.subscribe((address: string) => {
      this.onLoginSuccess(address);
    });

    // Subscribe to close events
    this.loginOverlayRef.instance.closeEvent.subscribe(() => {
      this.closeLoginOverlay();
    });

    // Open the overlay with a small delay to trigger animation
    setTimeout(() => {
      if (this.loginOverlayRef) {
        this.loginOverlayRef.instance.isOpen.set(true);
      }
    }, 10);
  }

  closeLoginOverlay() {
    if (this.loginOverlayRef) {
      // Set isOpen to false to trigger fade-out animation
      this.loginOverlayRef.instance.isOpen.set(false);

      // Destroy the component after animation completes (300ms)
      setTimeout(() => {
        if (this.loginOverlayRef) {
          this.loginOverlayRef.destroy();
          this.loginOverlayRef = null;
        }
      }, 300);
    }
  }

}