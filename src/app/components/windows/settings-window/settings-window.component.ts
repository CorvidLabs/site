import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, input, output, signal } from '@angular/core';
import { PeraWalletConnect } from '@perawallet/connect';
import { DraggableDirective } from '../../../directives/draggable.directive';
import { WindowTypes } from '../../../enums/window-types.enum';
import { SoundEffectService } from '../../../services/general/sound-effect.service';
import { PixelIconComponent } from '../../shared/pixel-icon/pixel-icon.component';
import { ThemeSwitcherComponent } from "../../theme-switcher/theme-switcher.component";
import { FloatWindow } from '../float-window/float-window.component';

@Component({
  selector: 'app-settings-window',
  imports: [CommonModule, DraggableDirective, ThemeSwitcherComponent, PixelIconComponent],
  templateUrl: 'settings-window.component.html',
  styleUrls: ['settings-window.component.scss']
})
export class SettingsWindowComponent extends FloatWindow implements OnInit {
  override title = input<string>('Settings');
  peraInstance = input.required<PeraWalletConnect>();

  userImage = signal<string>("");
  isAuthenticated = input<boolean>(false);
  userAccountAddress = input<string | null>(null);

  logoutRequested = output<void>();

  soundEffectService = inject(SoundEffectService);

  // Pera instance
  peraWallet!: PeraWalletConnect;

  constructor() {
    super();

    this.width.set(600);
    this.height.set(400);
  }

  ngOnInit() {
    this.peraWallet = this.peraInstance();
  }

  onChangeUser() {
    // Emit the LOGIN window type through the close event emitter
    this.closeEvent.emit(WindowTypes.LOGIN as any);
  }

  onChangeProfilePicture() {
    // Placeholder for future profile picture gallery/upload
    console.log('Profile picture change requested');
  }

  onLogout() {
    this.handleDisconnectWallet();
    this.logoutRequested.emit();
  }

  handleDisconnectWallet(event?: Event): void {
    event?.preventDefault();

    this.peraWallet.disconnect().catch(error => {
      console.error('Error disconnecting wallet:', error);
    });
  }
}