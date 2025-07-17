import { Component, Output, EventEmitter, ViewChild, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../app/auth.service';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../app/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  @Output() loginSuccess = new EventEmitter<string>();
  errorMsg = '';
  @ViewChild('loginForm') loginForm?: NgForm;

  private auth = inject(AuthService);
  private router = inject(Router);
  private userService = inject(UserService);

  ngOnInit() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = localStorage.getItem('authToken');
      const username = localStorage.getItem('username');
      if (token && username) {
        this.auth.validateToken(token).subscribe({
          next: (res) => {
            if (res.valid) {
              this.loginSuccess.emit(username);
            }
          },
          error: () => {
            localStorage.removeItem('authToken');
            localStorage.removeItem('username');
          }
        });
      }
    }
  }

  onLogin() {
    if (this.loginForm) {
      this.loginForm.control.markAllAsTouched();
    }
    if (!this.username || !this.password) {
      this.errorMsg = '';
      return;
    }
    this.auth.login(this.username, this.password).subscribe({
      next: (res) => {
        this.errorMsg = '';
        this.userService.setUser({ username: this.username, isAdmin: !!res.isAdmin, isLoggedIn: true });
        this.loginSuccess.emit(this.username);
        localStorage.setItem('authToken', res.token);
        localStorage.setItem('username', this.username);
        localStorage.setItem('isAdmin', res.isAdmin ? 'true' : 'false');
        this.router.navigate(['/']);
      },
      error: () => {
        this.errorMsg = 'Invalid username or password.';
      }
    });
  }
  
  goToSignup() {
    this.router.navigate(['/signup']);
  }
}
