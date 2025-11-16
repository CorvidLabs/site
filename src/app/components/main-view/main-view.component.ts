import { Component, ComponentRef, ViewChild, ViewContainerRef, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { WindowTypes } from '../../enums/window-types.enum';
import { FloatWindow } from '../windows/float-window/float-window.component';
import { GalleryWindowComponent } from '../windows/gallery-window/gallery-window.component';
import { PlayerWindowComponent } from '../windows/player-window/player-window.component';
import { SettingsWindowComponent } from '../windows/settings-window/settings-window.component';
import { LoginPromptComponent } from '../login-prompt/login-prompt.component';

@Component({
  selector: 'app-main-view',
  templateUrl: 'main-view.component.html',
  styleUrls: ['main-view.component.scss'],
  imports: [MatIconModule, LoginPromptComponent]
})
export class MainViewComponent {
  // 1. Get a reference to the template element where we will host our dynamic components.
  @ViewChild('windowHost', { read: ViewContainerRef, static: false }) windowHost!: ViewContainerRef;

  openedWindows: ComponentRef<FloatWindow>[] = [];
  isAuthenticated = signal(false);

  constructor() {}

  onLoginSuccess(success: boolean): void {
    if (success) {
      this.isAuthenticated.set(true);
      // this.windowHost.get(0);
    }
  }

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
    }
  }

  openOrCreateWindowAdvanced<T extends FloatWindow>(component: { new (...args: any[]): T}): ComponentRef<T> {
    console.log('Opening or creating window of type:', component.name);
    const existingComponentRef = this.openedWindows.find(ref => ref.instance instanceof component) as ComponentRef<T>;

    const componentRef = existingComponentRef ?? this.windowHost.createComponent(component);

    // If its an existing window, just bring it to front
    existingComponentRef? componentRef.instance.bringWindowToFront() : null;

    // Set a cascading initial position for new windows
    const offset = this.openedWindows.length * 30;
    componentRef.instance.initialPosition = { x: 50 + offset, y: 50 + offset };

    const closeSub = componentRef.instance.closeEvent.subscribe(() => {
      this.closeWindow(componentRef);
      closeSub.unsubscribe();
    });

    this.openedWindows.push(componentRef);

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

    return componentRef;
  }

  openWindowByType(type: string) {
    switch (type) {
      case WindowTypes.GALLERY:
        this.openOrCreateWindowAdvanced<GalleryWindowComponent>(GalleryWindowComponent);
        break;
      case WindowTypes.SETTINGS:
        this.openOrCreateWindowAdvanced<SettingsWindowComponent>(SettingsWindowComponent);
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