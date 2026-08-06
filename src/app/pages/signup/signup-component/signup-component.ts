import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'signup-component',
  imports: [],
  templateUrl: './signup-component.html',
  styleUrl: './signup-component.css',
})
export class SignupComponent {
  @Output() readonly openLogin = new EventEmitter<void>();

  protected onLoginClick(event: MouseEvent) {
    event.preventDefault();
    this.openLogin.emit();
  }
}
