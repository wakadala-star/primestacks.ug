import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'header-component',
  imports: [],
  templateUrl: './header-component.html',
  styleUrl: './header-component.css',
})
export class HeaderComponent {
  @Output() readonly openLogin = new EventEmitter<void>();
  @Output() readonly openSignup = new EventEmitter<void>();
  @Output() readonly goHome = new EventEmitter<void>();

  protected showMobileMenu = false;

  protected toggleMenu() {
    this.showMobileMenu = !this.showMobileMenu;
  }

  protected closeMenu() {
    this.showMobileMenu = false;
  }

  protected onHomeClick(event: MouseEvent) {
    event.preventDefault();
    this.goHome.emit();
    this.closeMenu();
  }

  protected onLoginClick(event: MouseEvent) {
    event.preventDefault();
    this.openLogin.emit();
    this.closeMenu();
  }

  protected onSignupClick(event: MouseEvent) {
    event.preventDefault();
    this.openSignup.emit();
    this.closeMenu();
  }
}
