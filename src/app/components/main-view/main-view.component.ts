import { Component, ComponentRef, ViewChild, ViewContainerRef, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { WindowTypes } from '../../enums/window-types.enum';
import { FloatWindow } from '../windows/float-window/float-window.component';
import { GalleryWindowComponent } from '../windows/gallery-window/gallery-window.component';
import { PlayerWindowComponent } from '../windows/player-window/player-window.component';
import { SettingsWindowComponent } from '../windows/settings-window/settings-window.component';
import { NotepadWindowComponent } from '../windows/notepad-window/notepad-window.component';
import { TetrisWindowComponent } from '../windows/tetris-window/tetris-window.component';
import { LaunchpadWindowComponent } from '../windows/launchpad-window/launchpad-window.component';
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
  imports: [MatIconModule, LoginPromptComponent, CommonModule]
})
export class MainViewComponent {
  // 1. Get a reference to the template element where we will host our dynamic components.
  @ViewChild('windowHost', { read: ViewContainerRef, static: false }) windowHost!: ViewContainerRef;

  openedWindows: ComponentRef<FloatWindow>[] = [];

  // Dock items - starts with only LaunchPad and Settings
  dockItems = signal<DockItem[]>([
    { type: WindowTypes.LAUNCHPAD, icon: 'apps', label: 'Launch Pad' },
    { type: WindowTypes.SETTINGS, icon: 'settings', label: 'Settings' }
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
    if (componentRef.instance instanceof LaunchpadWindowComponent) return WindowTypes.LAUNCHPAD;
    return null;
  }

  private getDockItemForType(type: WindowTypes): DockItem | null {
    const iconMap: Record<WindowTypes, { icon: string, label: string }> = {
      [WindowTypes.LAUNCHPAD]: { icon: 'apps', label: 'Launch Pad' },
      [WindowTypes.GALLERY]: { icon: 'photo', label: 'Gallery' },
      [WindowTypes.NOTEPAD]: { icon: 'description', label: 'Notepad' },
      [WindowTypes.TETRIS]: { icon: 'videogame_asset', label: 'Tetris' },
      [WindowTypes.SETTINGS]: { icon: 'settings', label: 'Settings' },
      [WindowTypes.SOUNDCLOUD_PLAYER]: { icon: 'music_note', label: 'Music' },
      [WindowTypes.ABOUT]: { icon: 'info', label: 'About' }
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

      // case WindowTypes.ABOUT:
      //   this.openWindowAdvanced(AboutWindowComponent);
      //   break;
      // case WindowTypes.SOUNDCLOUD_PLAYER:  // NOTE: Removed till a new music api is implemented
      //   this.openOrCreateWindowAdvanced<PlayerWindowComponent>(PlayerWindowComponent);
      //   break;
    }
  }
}