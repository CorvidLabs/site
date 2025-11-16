import { Component, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login-prompt',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './login-prompt.component.html',
  styleUrl: './login-prompt.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginPromptComponent {
  loginSuccess = output<boolean>();
  hidePassword = signal(true);

  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  });

  onSubmit(): void {
    if (this.loginForm.valid) {
      // Mock authentication - always succeeds if form is valid
      this.loginSuccess.emit(true);
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword.update(value => !value);
  }
}
