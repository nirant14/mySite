import { Component, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { NgIf } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UserService } from '../../app/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [MatMenuModule, MatButtonModule, MatTabsModule, NgIf, RouterLink, RouterLinkActive]
})
export class HeaderComponent implements OnInit {
  public isLoggedIn = false;
  public username: string | null = null;
  public isAdmin: boolean = false;
  private userService = inject(UserService);
  private sub?: Subscription;

  @Output() signOut = new EventEmitter<void>();

  ngOnInit() {
    this.sub = this.userService.userState$.subscribe(state => {
      console.log('Header user state:', state); // Debug log
      this.isLoggedIn = state.isLoggedIn;
      this.username = state.username;
      this.isAdmin = state.isAdmin;
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  onSignOut() {
    this.signOut.emit();
  }
}
