import { Component, ComponentRef, ViewChild, ViewContainerRef } from '@angular/core';
import { FloatWindow } from '../float-window/float-window.component';
import { WindowTypes } from '../../enums/window-types.enum';
import { GalleryWindowComponent } from '../gallery-window/gallery-window.component';
import { MatIconModule } from '@angular/material/icon';
import { PlayerWindowComponent } from '../player-window/player-window.component';

@Component({
  selector: 'main-view',
  templateUrl: 'main-view.component.html',
  styleUrls: ['main-view.component.scss'],
  imports: [MatIconModule]
})
export class MainViewComponent {
  // 1. Get a reference to the template element where we will host our dynamic components.
  @ViewChild('windowHost', { read: ViewContainerRef, static: true })
  windowHost!: ViewContainerRef;

  openedWindows: ComponentRef<FloatWindow>[] = [];

  constructor() {}

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
      case WindowTypes.SOUNDCLOUD_PLAYER:
        this.openOrCreateWindowAdvanced<PlayerWindowComponent>(PlayerWindowComponent);
        break;

      // Add more cases as needed
      // Example:
      // case WindowTypes.SETTINGS:
      //   this.openWindowAdvanced(SettingsWindowComponent);
      //   break;
      // case WindowTypes.ABOUT:
      //   this.openWindowAdvanced(AboutWindowComponent);
      //   break;
    }
  }
}