import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'dashboard-component',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent {
  @Output() readonly logout = new EventEmitter<void>();

  protected onLogout(event: MouseEvent) {
    event.preventDefault();
    this.logout.emit();
  }
}
