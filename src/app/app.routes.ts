import { Routes } from '@angular/router';
import { HomeComponent } from '../components/home/home.component';
import { PicturesComponent } from '../components/pictures/pictures.component';
import { VideosComponent } from '../components/videos/videos.component';
import { MenuComponent } from '../components/menu/menu.component';
import { HelpComponent } from '../components/help/help.component';
import { LoginComponent } from '../components/login/login.component';
import { SignupComponent } from '../components/signup/signup.component';
import { AdminComponent } from '../components/admin/admin.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'pictures', component: PicturesComponent },
  { path: 'videos', component: VideosComponent },
  { path: 'menu', component: MenuComponent },
  { path: 'help', component: HelpComponent },
  { path: 'admin', component: AdminComponent },
  { path: '**', redirectTo: '' }
];
