import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../app/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  displayedColumns: string[] = ['username', 'actions'];
  users: Array<{ username: string; isAdmin?: boolean }> = [];

  private auth = inject(AuthService);

  ngOnInit() {
    this.auth.getAllUsers().subscribe({
      next: (users) => {
        // Map users to include isAdmin property for type safety
        const mappedUsers = users.map(u => ({ ...u, isAdmin: (u as any).isAdmin }));
        // Filter out admin users and remove duplicates by username
        const uniqueUsers = mappedUsers.filter(u => !u.isAdmin)
          .filter((user, index, self) =>
            index === self.findIndex(u => u.username === user.username)
          );
        this.users = uniqueUsers;
      },
      error: (err) => console.error('Failed to fetch users:', err)
    });
  }

  deleteUser(username: string) {
    this.auth.deleteUser(username).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.username !== username);
      },
      error: (err) => console.error('Failed to delete user:', err)
    });
  }
}
