import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'login-component',
  imports: [],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css',
})
export class LoginComponent {
  @Output() readonly openSignup = new EventEmitter<void>();
  @Output() readonly signIn = new EventEmitter<void>();

  protected onSigninClick(event: MouseEvent) {
    event.preventDefault();
    this.signIn.emit();
  }

  protected onSignupClick(event: MouseEvent) {
    event.preventDefault();
    this.openSignup.emit();
  }
}
