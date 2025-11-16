import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, OnInit, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { PeraWalletConnect } from '@perawallet/connect';
import { UtilsService } from '../../services/general/utils.service';
import { environment } from '../../../environments/environment.local';

@Component({
  selector: 'app-login-prompt',
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule
  ],
  templateUrl: './login-prompt.component.html',
  styleUrl: './login-prompt.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginPromptComponent implements OnInit {
  peraInstance = input.required<PeraWalletConnect>();
  peraWallet!: PeraWalletConnect;

  // loginSuccess = output<boolean>();
  loginError = signal<string | null>(null);
  userAccountAddress = output<string | null>();

  ngOnInit(): void {
    // Call the peraInstance to get the instance from the input signal, should always use ngOnInit cause 
    // input signals are not available in the constructor
    this.peraWallet = this.peraInstance();
  }

  reconnectSession(): void {
    this.peraWallet.reconnectSession().then(accounts => {
      if (accounts.length > 0) {
        this.userAccountAddress.emit(accounts[0]);
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
    }).catch(error => {
      console.error('Error connecting to Pera Wallet:', error);
      this.loginError.set('Failed to connect to Pera Wallet. Please try again.');
    });
  }

  // Temporary method to bypass login for development purposes
  bypassLogin(): void {
    const development = environment.development_wallet;
    this.userAccountAddress.emit(development);
  }
}
