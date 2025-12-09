import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, OnInit, output, signal } from '@angular/core';
import { FloatWindow } from '../float-window/float-window.component';
import { DraggableDirective } from '../../../directives/draggable.directive';
import { PeraWalletConnect } from '@perawallet/connect';
import { environment } from '../../../../environments/environment.local';

@Component({
  selector: 'app-login-window',
  imports: [CommonModule, DraggableDirective],
  templateUrl: './login-window.component.html',
  styleUrl: './login-window.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginWindowComponent extends FloatWindow implements OnInit {
  override title = input<string>('Login');
  currentEnvironment: string = environment.environment_name;
  peraInstance = input.required<PeraWalletConnect>();
  peraWallet!: PeraWalletConnect;

  loginError = signal<string | null>(null);
  userAccountAddress = output<string | null>();

  constructor() {
    super();
    this.width.set(450);
    this.height.set(350);
  }

  ngOnInit(): void {
    // Call the peraInstance to get the instance from the input signal
    // input signals are not available in the constructor
    this.peraWallet = this.peraInstance();
  }

  reconnectSession(): void {
    this.peraWallet.reconnectSession().then(accounts => {
      if (accounts.length > 0) {
        this.userAccountAddress.emit(accounts[0]);
        this.close();
      } else {
        this.userAccountAddress.emit(null);
        this.loginError.set('Failed to reconnect to Pera Wallet. Please try again.');
      }
    })
  }

  onSubmit(): void {
    this.loginError.set(null);

    // Use pera connect to authenticate
    this.peraWallet.connect().then(accounts => {
      if (accounts.length == 0) {
        this.loginError.set('No accounts found. Please connect your Pera Wallet.');
        return;
      }

      this.userAccountAddress.emit(accounts[0]);
      this.close();
    }).catch(error => {
      console.error('Error connecting to Pera Wallet:', error);
      this.loginError.set('Failed to connect to Pera Wallet. Please try again.');
    });
  }

  // Temporary method to bypass login for development purposes
  onBypassLogin(): void {
    const development = environment.development_wallet;
    this.userAccountAddress.emit(development);
    this.close();
  }
}
