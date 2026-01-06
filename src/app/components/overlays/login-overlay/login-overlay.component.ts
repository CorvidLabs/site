import { Component, input, signal, output, ChangeDetectionStrategy, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PeraWalletConnect } from '@perawallet/connect';
import { environment } from '../../../../environments/environment.local';

@Component({
  selector: 'app-login-overlay',
  imports: [CommonModule],
  templateUrl: './login-overlay.component.html',
  styleUrls: ['./login-overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginOverlayComponent implements OnInit {
  // Inputs
  peraInstance = input.required<PeraWalletConnect>();

  // Outputs
  closeEvent = output<void>();
  loginSuccess = output<string>();

  // State
  isOpen = signal<boolean>(false);
  loginError = signal<string | null>(null);
  isLoading = signal<boolean>(false);

  // Environment
  currentEnvironment: string = environment.environment_name;

  // Pera instance
  peraWallet!: PeraWalletConnect;

  ngOnInit(): void {
    this.peraWallet = this.peraInstance();
  }

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    if (this.isOpen()) {
      this.close();
    }
  }

  onSubmit(): void {
    this.loginError.set(null);
    this.isLoading.set(true);

    this.peraWallet.connect().then(accounts => {
      this.isLoading.set(false);

      if (accounts.length === 0) {
        this.loginError.set('No accounts found. Please connect your Pera Wallet.');
        return;
      }

      this.loginSuccess.emit(accounts[0]);
      this.close();
    }).catch(error => {
      console.error('Error connecting to Pera Wallet:', error);
      this.isLoading.set(false);
      this.loginError.set('Failed to connect to Pera Wallet. Please try again.');
    });
  }

  onBypassLogin(): void {
    const development = environment.development_wallet;
    this.loginSuccess.emit(development);
    this.close();
  }

  close(): void {
    this.isOpen.set(false);
    // Emit close event after animation completes
    setTimeout(() => {
      this.closeEvent.emit();
    }, 300);
  }
}
