import { Component, inject, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CommonDialogComponent } from '../common-dialog/common-dialog.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../app/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  username = '';
  password = '';
  message = '';
  @Output() loginSuccess = new EventEmitter<string>();

  private auth = inject(AuthService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  openForgotPasswordDialog() {
    const dialogRef = this.dialog.open(CommonDialogComponent, {
      data: {
        title: 'Forgot Password',
        fields: [
          { label: 'Username', value: '', type: 'text' },
          { label: 'New Password', value: '', type: 'password' }
        ]
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const username = result[0].value;
        const newPassword = result[1].value;
        // Check if username exists
        this.auth.getAllUsers().subscribe(users => {
          const userExists = users.some(u => u.username === username);
          if (!userExists) {
            alert('Username not found.');
            return;
          }
          // Use resetPassword endpoint for forgot password
          this.auth.resetPassword(username, newPassword).subscribe({
            next: () => alert('Password reset successfully!'),
            error: err => alert(err.error?.error || 'Failed to reset password')
          });
        });
      }
    });
  }

  onSignup() {
    this.auth.register(this.username, this.password).subscribe({
      next: () => {
        // Registration successful, now log in
        this.auth.login(this.username, this.password).subscribe({
          next: (res) => {
            localStorage.setItem('authToken', res.token);
            localStorage.setItem('username', this.username);
            this.message = '';
            this.loginSuccess.emit(this.username);
            this.router.navigate(['/']);
          },
          error: (err) => {
            this.message = 'Registration succeeded, but login failed.';
            console.error('Login after registration error:', err);
          }
        });
      },
      error: (err) => {
        this.message = 'Registration failed.';
        console.error('Registration error:', err);
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
