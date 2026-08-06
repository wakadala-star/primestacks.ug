import { Component, signal, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { HeaderComponent } from './components/header-component/header/header-component';
import { MainComponent } from './components/main-component/main-component/main-component';
import { LoginComponent } from './pages/login/login-component/login-component';
import { SignupComponent } from './pages/signup/signup-component/signup-component';
import { DashboardComponent } from './pages/dashboard';
import { LoaderComponent } from './components/loader.component';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, LoginComponent, SignupComponent, MainComponent, DashboardComponent, LoaderComponent, NgIf],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  protected readonly title = signal('primestacks_app');
  protected readonly showLogin = signal(false);
  protected readonly showSignup = signal(false);
  protected readonly showDashboard = signal(false);
  protected readonly isLoading = signal(true);

  ngOnInit() {
    // Show loader for at least 2 seconds before displaying home page
    setTimeout(() => {
      this.isLoading.set(false);
    }, 2000);
  }

  protected goHome() {
    this.showLogin.set(false);
    this.showSignup.set(false);
    this.showDashboard.set(false);
  }

  protected openLoginForm() {
    this.showSignup.set(false);
    this.showDashboard.set(false);
    this.showLogin.set(true);
  }

  protected openSignupForm() {
    this.showLogin.set(false);
    this.showDashboard.set(false);
    this.showSignup.set(true);
  }

  protected handleSignIn() {
    this.showLogin.set(false);
    this.showSignup.set(false);
    this.showDashboard.set(true);
  }

  protected handleLogout() {
    this.showDashboard.set(false);
    this.showLogin.set(false);
    this.showSignup.set(false);
  }
}
