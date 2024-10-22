import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { LoginComponent } from './pages/login/login.component';
import { EditComponent } from './pages/edit/edit.component';
import { GalleryPageComponent } from './pages/gallery-page/gallery-page.component';
import { SignupComponent } from './pages/signup/signup.component';

export const routes: Routes = [
  {path:"", component: LandingComponent},
  {path:"login", component: LoginComponent},
  {path:"gallery", component: GalleryPageComponent},
  {path:"signup", component: SignupComponent},
  {path:"my-images", component: EditComponent}
];
