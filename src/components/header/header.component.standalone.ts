import { Component, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CommonDialogComponent } from '../common-dialog/common-dialog.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { NgIf } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UserService } from '../../app/user.service';
import { AuthService } from '../../app/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [MatMenuModule, MatButtonModule, MatTabsModule, NgIf, RouterLink, RouterLinkActive, CommonDialogComponent]
})
export class HeaderComponent implements OnInit {
  public isLoggedIn = false;
  public username: string | null = null;
  public isAdmin: boolean = false;
  private userService = inject(UserService);
  private dialog = inject(MatDialog);
  private authService = inject(AuthService);
  
  openChangePasswordDialog() {
    const dialogRef = this.dialog.open(CommonDialogComponent, {
      data: {
        title: 'Change Password',
        fields: [
          { label: 'Old Password', value: '', type: 'password' },
          { label: 'New Password', value: '', type: 'password' }
        ]
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && this.username) {
        const oldPassword = result[0].value;
        const newPassword = result[1].value;
        this.authService.changePassword(this.username, oldPassword, newPassword).subscribe({
          next: (res) => {
            alert('Password changed successfully!');
          },
          error: (err) => {
            alert(err.error?.error || 'Failed to change password');
          }
        });
      }
    });
  }
  private sub?: Subscription;

  @Output() signOut = new EventEmitter<void>();

  ngOnInit() {
    // Restore user state from localStorage on page refresh
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = localStorage.getItem('authToken');
      const username = localStorage.getItem('username');
      const isAdmin = localStorage.getItem('isAdmin') === 'true';
      if (token && username) {
        this.userService.setUser({ username, isAdmin, isLoggedIn: true });
      }
    }
    this.sub = this.userService.userState$.subscribe(state => {
      this.isLoggedIn = state.isLoggedIn;
      this.username = state.username;
      this.isAdmin = state.isAdmin;
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  onSignOut() {
    this.userService.clearUser();
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    localStorage.removeItem('isAdmin');
    this.signOut.emit();
  }
}
