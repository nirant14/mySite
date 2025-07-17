import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  @Output() signOut = new EventEmitter<void>();

  onSignOut() {
    this.signOut.emit();
  }
}
