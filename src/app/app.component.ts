import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HomeComponent } from "../components/home/home.component";
import { HeaderComponent } from '../components/header/header.component.standalone';
import { FooterComponent } from '../components/footer/footer.component';
import { LoginComponent } from '../components/login/login.component';
import { NgIf } from '@angular/common';
import { PicturesComponent } from "../components/pictures/pictures.component";
import { VideosComponent } from "../components/videos/videos.component";
import { HelpComponent } from '../components/help/help.component';
import { MenuComponent } from '../components/menu/menu.component';
import { UserService } from './user.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    HomeComponent,
    HeaderComponent, 
    FooterComponent, 
    LoginComponent, 
    NgIf, 
    PicturesComponent, 
    VideosComponent, 
    HelpComponent, 
    MenuComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'mySite';

  constructor(private router: Router, private userService: UserService) {}

  ngOnInit() {
    this.userService.restoreFromLocalStorage();
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = localStorage.getItem('authToken');
      if (!token) {
        this.router.navigate(['/login']);
      }
    }
  }

  onSignOut() {
    this.userService.clearUser();
    localStorage.removeItem('authToken');
    this.router.navigate(['/login']);
  }
}
